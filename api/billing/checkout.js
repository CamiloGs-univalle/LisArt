// POST /api/billing/checkout  { tenantId, months }
// Crea un pago pendiente y devuelve el enlace seguro de Wompi para pagarlo.
import { verifyIdToken, superEmails, httpError } from '../_lib/firebaseAdmin.js'
import { setFields } from '../_lib/firestore.js'
import { billingSettings, wompiConfig, assertCanPay, sha256 } from '../_lib/billing.js'
import { quote, planOf, PLANS } from '../../src/lib/billingCore.js'
import { originOf } from '../_lib/seo.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })
  try {
    const wompi = wompiConfig()
    if (!wompi.ready) throw httpError(503, 'El pago en línea aún no está activo. Usa el pago por transferencia.')

    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
    if (!token) throw httpError(401, 'Inicia sesión de nuevo.')
    const decoded = await verifyIdToken(token)
    const isSuper = decoded.email_verified === true && superEmails().includes(String(decoded.email || '').toLowerCase())

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const tenantId = String(body.tenantId || '').toLowerCase()
    if (!/^[a-z0-9-]{3,40}$/.test(tenantId)) throw httpError(400, 'Catálogo inválido.')

    const tenant = await assertCanPay(decoded, tenantId, isSuper)
    const settings = await billingSettings()
    // Plan a pagar: el que pidió (para subir a Premium o volver a Básico) o el que ya tiene
    const plan = PLANS[body.plan] ? body.plan : planOf(tenant)
    const q = quote(tenant.billing || {}, settings, body.months, plan)
    if (q.total < 1500) throw httpError(400, 'El valor a pagar es muy bajo para pago en línea.')

    const amountInCents = Math.round(q.total * 100)
    const reference = `${tenantId}_${Date.now().toString(36)}`
    await setFields(`payments/${reference}`, {
      tenantId, tenantName: tenant.name || tenantId, reference,
      amount: q.total, currency: 'COP', months: q.months, lines: q.lines, plan,
      method: 'wompi', status: 'pending', createdAt: new Date().toISOString(), createdBy: decoded.email || decoded.uid,
    })

    const origin = originOf(req)
    const params = new URLSearchParams({
      'public-key': wompi.publicKey,
      currency: 'COP',
      'amount-in-cents': String(amountInCents),
      reference,
      'signature:integrity': sha256(`${reference}${amountInCents}COP${wompi.integrity}`),
      'redirect-url': `${origin}/${tenantId}?pago=${encodeURIComponent(reference)}`,
    })
    return res.status(200).json({ url: `https://checkout.wompi.co/p/?${params}`, reference, total: q.total, test: wompi.test })
  } catch (e) {
    const status = e.status || 500
    if (!e.status) console.error('[checkout]', e)
    return res.status(status).json({ error: e.status ? e.message : 'No se pudo iniciar el pago. Intenta de nuevo.' })
  }
}
