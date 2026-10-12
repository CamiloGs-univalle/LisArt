// POST /api/billing/verify  { transactionId, reference }
// Al volver de Wompi, la página pide confirmar el pago. El servidor consulta
// la transacción directamente a Wompi (no confía en lo que diga el navegador).
// Sirve de respaldo por si el aviso automático (webhook) tarda o no está configurado.
import { wompiConfig, fetchTransaction, settleTransaction } from '../_lib/billing.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })
  try {
    if (!wompiConfig().ready) return res.status(503).json({ error: 'Pago en línea no configurado' })
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const id = String(body.transactionId || '')
    if (!/^[\w-]{4,80}$/.test(id)) return res.status(400).json({ error: 'Transacción inválida' })
    const tx = await fetchTransaction(id)
    if (body.reference && tx?.reference !== body.reference) return res.status(400).json({ error: 'La transacción no corresponde a este pago' })
    const result = await settleTransaction(tx)
    return res.status(200).json({ ...result, wompiStatus: tx?.status })
  } catch (e) {
    if (!e.status) console.error('[verify]', e)
    return res.status(e.status || 500).json({ error: e.status ? e.message : 'No se pudo confirmar el pago.' })
  }
}
