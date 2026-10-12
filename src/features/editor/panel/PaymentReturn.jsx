// Aviso al volver del pago en línea (Wompi agrega ?id=TRANSACCION a la dirección)
import { useEffect, useState } from 'react'
import { verifyPayment, watchPayment } from '@/services/billing.service'
import { formatCOP } from '@/lib/billingCore'

const params = () => new URLSearchParams(window.location.search)

export function clearPaymentParams() {
  const url = new URL(window.location.href)
  url.searchParams.delete('pago'); url.searchParams.delete('id'); url.searchParams.delete('env')
  window.history.replaceState(null, '', url.pathname + url.search + url.hash)
}

export default function PaymentReturn() {
  const [ref] = useState(() => params().get('pago'))
  const [txId] = useState(() => params().get('id'))
  const [payment, setPayment] = useState(null)
  const [checked, setChecked] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!ref) return
    const stop = watchPayment(ref, setPayment, () => {})
    // Respaldo: el servidor confirma con Wompi por si el aviso automático tarda
    if (txId) verifyPayment(txId, ref).catch(() => {}).finally(() => setChecked(true))
    else setChecked(true)
    return stop
  }, [ref, txId])

  if (!ref || hidden) return null
  const status = payment?.status || 'pending'
  const copy = {
    approved: ['🎉', '¡Pago aprobado!', `Recibimos ${formatCOP(payment?.amount)}. Tu plan ya quedó renovado.`],
    pending: ['⏳', checked ? 'Estamos confirmando tu pago' : 'Verificando tu pago…', 'Wompi puede tardar unos minutos. Esta pantalla se actualiza sola.'],
    declined: ['⚠️', 'El pago no se completó', 'No se hizo ningún cobro. Puedes intentarlo de nuevo o pagar por transferencia.'],
    review: ['🔎', 'Pago en revisión', 'Recibimos el pago y lo estamos revisando. Te avisaremos pronto.'],
  }[status] || ['⏳', 'Procesando', '']

  return (
    <section className={`ad-card pl-return pl-return--${status}`} role="status" aria-live="polite">
      <span className="pl-return__icon" aria-hidden="true">{copy[0]}</span>
      <div>
        <h2>{copy[1]}</h2>
        <p className="ad-hint">{copy[2]}</p>
        <p className="ad-hint"><small>Referencia: <code>{ref}</code></small></p>
      </div>
      <button className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => { clearPaymentParams(); setHidden(true) }}>Cerrar aviso</button>
    </section>
  )
}
