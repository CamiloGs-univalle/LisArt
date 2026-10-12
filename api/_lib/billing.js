// Lógica de cobro del lado del servidor (Wompi + Firestore)
import { createHash } from 'node:crypto'
import { getDoc, setFields } from './firestore.js'
import { httpError } from './firebaseAdmin.js'
import { withBillingDefaults, extendDate, publicBilling, PLANS } from '../../src/lib/billingCore.js'

export const sha256 = (s) => createHash('sha256').update(s).digest('hex')

export function wompiConfig() {
  const publicKey = process.env.WOMPI_PUBLIC_KEY || ''
  const integrity = process.env.WOMPI_INTEGRITY_SECRET || ''
  const events = process.env.WOMPI_EVENTS_SECRET || ''
  return { publicKey, integrity, events, ready: !!(publicKey && integrity), test: publicKey.startsWith('pub_test_') }
}

export async function billingSettings() {
  return withBillingDefaults(await getDoc('platform/billing'))
}

// ¿Esta cuenta puede pagar por este negocio? (dueño o super administrador)
export async function assertCanPay(decoded, tenantId, isSuper) {
  const tenant = await getDoc(`tenants/${tenantId}`)
  if (!tenant) throw httpError(404, 'Ese catálogo no existe.')
  const withPlan = await withPrivateBilling(tenant)
  if (isSuper) return withPlan
  if (tenant.ownerUid === decoded.uid) return withPlan
  const profile = await getDoc(`users/${decoded.uid}`)
  if (profile?.tenantId === tenantId) return withPlan
  throw httpError(403, 'Solo el dueño del catálogo puede pagar su plan.')
}

// El plan completo vive en accounts/{negocio}; el negocio solo guarda el vencimiento público
export async function withPrivateBilling(tenant) {
  const account = await getDoc(`accounts/${tenant.id}`)
  return { ...tenant, billing: { ...(tenant.billing || {}), ...(account?.billing || {}) } }
}

// Aplica un pago aprobado al negocio (idempotente: un pago se aplica una sola vez).
// Primero "reclama" el pago con una precondición sobre su versión: si dos avisos
// llegan a la vez (webhook + verificación), solo uno extiende el plan.
export async function applyApprovedPayment(payment, extra = {}) {
  if (payment.status === 'approved') return false
  const raw = await getDoc(`tenants/${payment.tenantId}`)
  if (!raw) return false
  const tenant = await withPrivateBilling(raw)
  const billing = tenant.billing || {}
  const paidSetup = (payment.lines || []).some(l => l.concept === 'creacion')
  const nextBilling = {
    ...billing,
    paidUntil: extendDate(billing.paidUntil, payment.months || 1),
    trial: false,
    setupPaid: billing.setupPaid || paidSetup,
    lastPaymentAt: new Date().toISOString(),
  }
  try {
    await setFields(`payments/${payment.id}`, { status: 'approved', approvedAt: new Date().toISOString(), ...extra }, { updateTime: payment._updateTime })
  } catch (e) {
    if (e.code === 'precondition') return false // otro proceso ya lo aplicó
    throw e
  }
  await setFields(`accounts/${payment.tenantId}`, { billing: nextBilling })
  const patch = { billing: publicBilling(nextBilling) }
  // El pago define el plan (ej. pagó Premium → se activa Premium)
  if (PLANS[payment.plan]) patch.plan = payment.plan
  // Si estaba pausado por falta de pago, se reactiva solo
  if (tenant.status === 'suspended' && tenant.suspendedReason === 'pago') { patch.status = 'active'; patch.suspendedReason = '' }
  await setFields(`tenants/${payment.tenantId}`, patch)
  return true
}

// Aplica el estado de una transacción de Wompi al pago guardado (lo usan el webhook y la verificación)
export async function settleTransaction(tx) {
  if (!tx?.reference) return { ok: true, ignored: true }
  const payment = await getDoc(`payments/${tx.reference}`)
  if (!payment) return { ok: true, ignored: 'sin pago' }
  if (tx.status === 'APPROVED') {
    if (Math.round(payment.amount * 100) !== Number(tx.amount_in_cents)) {
      if (payment.status !== 'approved') await setFields(`payments/${payment.id}`, { status: 'review', note: 'El valor pagado no coincide', wompiId: tx.id })
      return { ok: true, status: 'review' }
    }
    await applyApprovedPayment(payment, { wompiId: tx.id, paymentMethod: tx.payment_method_type || '' })
    return { ok: true, status: 'approved' }
  }
  if (['DECLINED', 'VOIDED', 'ERROR'].includes(tx.status) && payment.status === 'pending') {
    await setFields(`payments/${payment.id}`, { status: 'declined', wompiId: tx.id, wompiStatus: tx.status })
    return { ok: true, status: 'declined' }
  }
  return { ok: true, status: payment.status }
}

// Consulta una transacción directamente a Wompi (fuente de verdad)
export async function fetchTransaction(id) {
  const { test } = wompiConfig()
  const res = await fetch(`https://${test ? 'sandbox' : 'production'}.wompi.co/v1/transactions/${encodeURIComponent(id)}`)
  if (!res.ok) throw httpError(404, 'No encontramos esa transacción en Wompi.')
  const data = await res.json()
  return data?.data
}
