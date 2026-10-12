// Cobros de la plataforma: precios, pagos y estado del plan de cada negocio
import { P } from './paths'
import { watchDoc, watchCollection, watchWhere, writeDoc, patchDoc, now } from './repo'
import { callApi } from './admin.service'
import { extendDate, publicBilling } from '@/lib/billingCore'

export const watchBillingSettings = (cb, onError) => watchDoc(P.billingSettings(), cb, onError)
export const saveBillingSettings = (data) => {
  const { id: _id, ...rest } = data // eslint-disable-line no-unused-vars
  return writeDoc(P.billingSettings(), { ...rest, updatedAt: now() }, { merge: true })
}

export const watchAllPayments = (cb, onError) => watchCollection(P.payments(), cb, onError)
export const watchTenantPayments = (tenantId, cb, onError) => watchWhere(P.payments(), 'tenantId', tenantId, cb, onError)

// Plan de un negocio (solo super): modelo, precio especial y fecha de vencimiento
export async function updateTenantBilling(tenant, patch) {
  const billing = { ...(tenant.billing || {}), ...patch }
  await writeDoc(P.account(tenant.id), { billing, updatedAt: now() })
  await patchDoc(P.tenant(tenant.id), { billing: publicBilling(billing), updatedAt: now() })
}

export const watchAccounts = (cb, onError) => watchCollection(P.accounts(), cb, onError)
export const watchAccount = (tenantId, cb, onError) => watchDoc(P.account(tenantId), cb, onError)

// Pago recibido por transferencia, Nequi, efectivo… (solo super)
export async function recordManualPayment(tenant, { amount, months, method, concepts, note, plan }) {
  const id = `${tenant.id}_m${Date.now().toString(36)}`
  const billing = tenant.billing || {}
  const lines = concepts.map(c => ({ concept: c.concept, label: c.label, amount: c.amount }))
  await writeDoc(P.payment(id), {
    tenantId: tenant.id, tenantName: tenant.name || tenant.id, reference: id,
    amount: Number(amount) || 0, currency: 'COP', months: Number(months) || 1, lines,
    method, status: 'approved', note: note || '', ...(plan ? { plan } : {}), createdAt: new Date().toISOString(), approvedAt: new Date().toISOString(), manual: true,
  }, { merge: false })
  const next = {
    ...billing,
    paidUntil: extendDate(billing.paidUntil, months),
    trial: false,
    setupPaid: billing.setupPaid || lines.some(l => l.concept === 'creacion'),
    lastPaymentAt: new Date().toISOString(),
  }
  await writeDoc(P.account(tenant.id), { billing: next, updatedAt: now() })
  const patch = { billing: publicBilling(next), updatedAt: now() }
  if (plan) patch.plan = plan
  if (tenant.status === 'suspended' && tenant.suspendedReason === 'pago') { patch.status = 'active'; patch.suspendedReason = '' }
  await patchDoc(`tenants/${tenant.id}`, patch)
  return id
}

// Pago en línea (Wompi): el servidor crea el pago y devuelve el enlace seguro
export const startCheckout = (tenantId, months, plan) => callApi('billing/checkout', { tenantId, months, plan })

// Cambiar el plan de un negocio sin pago (solo super)
export const setTenantPlan = (tenantId, plan) => patchDoc(P.tenant(tenantId), { plan, updatedAt: now() })

// Al volver de Wompi: el servidor confirma la transacción directamente con Wompi
export const verifyPayment = (transactionId, reference) => callApi('billing/verify', { transactionId, reference })
export const watchPayment = (id, cb, onError) => watchDoc(P.payment(id), cb, onError)
