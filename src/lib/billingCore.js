// ─────────────────────────────────────────────────────────────
// Reglas de cobro de la plataforma (sin dependencias).
// Lo usan la página (React) y las funciones del servidor (/api),
// así el precio y las fechas se calculan igual en los dos lados.
//
// Modelos por cliente:
//   'mensual' → mensualidad fija
//   'unico'   → pago único de creación + mantenimiento mensual
// ─────────────────────────────────────────────────────────────

export const BILLING_DEFAULTS = {
  currency: 'COP',
  monthlyPrice: 49900,        // modelo mensual
  setupFee: 350000,           // modelo único: creación
  maintenancePrice: 25000,    // modelo único: mantenimiento mensual
  annualDiscount: 15,         // % de descuento al pagar 12 meses
  graceDays: 5,               // días extra después del vencimiento antes de pausar
  warnDays: 5,                // días antes del vencimiento para avisar
  trialDays: 7,               // días gratis al crear un catálogo
  supportWhatsapp: '',        // tu WhatsApp para comprobantes y soporte
  manualInstructions: 'Nequi: 300 000 0000\nBancolombia ahorros: 000-000000-00\nTitular: Tu nombre',
  wompiEnabled: false,
}

export const MODELS = {
  mensual: { label: 'Mensualidad', short: 'Mensual' },
  unico: { label: 'Creación + mantenimiento', short: 'Único + mant.' },
}

export const PAY_MONTHS = [1, 3, 6, 12]

export const withBillingDefaults = (s) => ({ ...BILLING_DEFAULTS, ...(s || {}) })

const DAY = 86400000
const toDate = (v) => {
  if (!v) return null
  if (v instanceof Date) return v
  if (typeof v === 'object' && typeof v.toDate === 'function') return v.toDate()
  if (typeof v === 'object' && 'seconds' in v) return new Date(v.seconds * 1000)
  const d = new Date(v)
  return isNaN(d) ? null : d
}

// Precio de una cuota mensual para este negocio
export function monthlyFor(billing = {}, settings = BILLING_DEFAULTS) {
  const s = withBillingDefaults(settings)
  if (Number(billing.price) > 0) return Number(billing.price)
  return billing.model === 'unico' ? s.maintenancePrice : s.monthlyPrice
}

// Lo que se cobra en el siguiente pago (y por qué)
export function quote(billing = {}, settings = BILLING_DEFAULTS, months = 1) {
  const s = withBillingDefaults(settings)
  const m = PAY_MONTHS.includes(Number(months)) ? Number(months) : 1
  const lines = []
  if (billing.model === 'unico' && !billing.setupPaid) {
    lines.push({ concept: 'creacion', label: 'Creación del catálogo (pago único)', amount: Number(billing.setupFee) > 0 ? Number(billing.setupFee) : s.setupFee })
  }
  const monthly = monthlyFor(billing, s)
  const base = monthly * m
  const discount = m === 12 ? Math.round(base * (s.annualDiscount || 0) / 100) : 0
  lines.push({
    concept: billing.model === 'unico' ? 'mantenimiento' : 'mensualidad',
    label: `${billing.model === 'unico' ? 'Mantenimiento' : 'Mensualidad'} × ${m} ${m === 1 ? 'mes' : 'meses'}`,
    amount: base - discount,
    discount,
  })
  return { months: m, lines, total: lines.reduce((a, l) => a + l.amount, 0) }
}

// Nueva fecha de vencimiento al pagar N meses (desde hoy o desde el vencimiento, lo que sea mayor)
export function extendDate(current, months) {
  const from = toDate(current)
  const start = from && from.getTime() > Date.now() ? from : new Date()
  const d = new Date(start)
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + Number(months || 1))
  // 31 de enero + 1 mes = 28/29 de febrero (no 3 de marzo)
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()))
  return d.toISOString()
}

// Lo único del plan que es público (lo necesita el catálogo para saber si está pausado).
// El resto (precio, modelo, correo del dueño) vive en accounts/{negocio}, que solo ven el dueño y el super.
export const publicBilling = (b) => ({ paidUntil: b?.paidUntil || null, trial: !!b?.trial })

// Une el negocio con su cuenta privada (si existe)
export function withAccount(tenant, account) {
  if (!tenant || !account) return tenant
  return { ...tenant, ownerEmail: account.ownerEmail || tenant.ownerEmail, billing: { ...(tenant.billing || {}), ...(account.billing || {}) } }
}

// Estado del pago de un negocio
//   ok | soon (por vencer) | grace (vencido, en días de gracia) | overdue (pausado) | none (sin plan)
export function billingState(billing, settings = BILLING_DEFAULTS) {
  const s = withBillingDefaults(settings)
  const due = toDate(billing?.paidUntil)
  if (!billing || !due) return { state: 'none', due: null, days: null, label: 'Sin plan' }
  const days = Math.ceil((due.getTime() - Date.now()) / DAY)
  if (days < -s.graceDays) return { state: 'overdue', due, days, label: `Pausado · venció hace ${-days} días` }
  if (days < 0) return { state: 'grace', due, days, label: `Vencido hace ${-days} ${-days === 1 ? 'día' : 'días'}` }
  if (days <= s.warnDays) return { state: 'soon', due, days, label: days === 0 ? 'Vence hoy' : `Vence en ${days} ${days === 1 ? 'día' : 'días'}` }
  return { state: 'ok', due, days, label: billing.trial ? `Prueba · ${days} días` : 'Al día' }
}

export const formatCOP = (n) => `$\u00a0${Math.round(Number(n) || 0).toLocaleString('es-CO')}`
export const formatDay = (v) => {
  const d = toDate(v)
  return d ? d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}
