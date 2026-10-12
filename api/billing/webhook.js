// POST /api/billing/webhook — Wompi avisa aquí cuando cambia el estado de un pago.
// Se verifica la firma del evento antes de tocar nada.
// Configúralo en Wompi → Desarrolladores → URL de eventos: https://TU-DOMINIO/api/billing/webhook
import { wompiConfig, settleTransaction, fetchTransaction, sha256 } from '../_lib/billing.js'

const pick = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })
  try {
    const event = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const { events } = wompiConfig()
    if (!events) return res.status(503).json({ error: 'Falta WOMPI_EVENTS_SECRET' })

    // Firma: concatenar los valores de las propiedades indicadas + timestamp + secreto de eventos
    const props = event?.signature?.properties || []
    const raw = props.map(p => pick(event.data, p)).join('') + event.timestamp + events
    if (!event?.signature?.checksum || sha256(raw).toLowerCase() !== String(event.signature.checksum).toLowerCase()) {
      return res.status(401).json({ error: 'Firma inválida' })
    }

    // Eventos muy viejos (reenvíos de hace más de 3 días) no se procesan
    const ts = Number(event.timestamp) * (String(event.timestamp).length > 11 ? 1 : 1000)
    if (!ts || Math.abs(Date.now() - ts) > 3 * 864e5) return res.status(200).json({ ok: true, ignored: 'viejo' })

    const evTx = event?.data?.transaction
    if (event.event !== 'transaction.updated' || !evTx?.id) return res.status(200).json({ ok: true, ignored: true })
    // No se confía en el contenido del aviso: se consulta la transacción directamente a Wompi
    const tx = await fetchTransaction(evTx.id)
    if (!tx?.reference || (evTx.reference && tx.reference !== evTx.reference)) return res.status(200).json({ ok: true, ignored: 'no coincide' })
    return res.status(200).json(await settleTransaction(tx))
  } catch (e) {
    console.error('[wompi-webhook]', e)
    return res.status(500).json({ error: 'Error procesando el evento' })
  }
}
