// Solicitudes de "olvidé mi contraseña" que envían los dueños de catálogo
import { useMemo, useState } from 'react'
import { closeTicket } from '@/services/tickets.service'
import { waLink } from '@/lib/format'

const toDate = (v) => (v?.toDate ? v.toDate() : v ? new Date(v) : null)
const timeAgo = (v) => {
  const d = toDate(v)
  if (!d || isNaN(d)) return 'ahora'
  const m = Math.round((Date.now() - d.getTime()) / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `hace ${m} min`
  const h = Math.round(m / 60)
  if (h < 24) return `hace ${h} h`
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

export default function TicketsPanel({ tickets, tenants, onChangePassword, onToast }) {
  const [showClosed, setShowClosed] = useState(false)
  const byEmail = useMemo(() => Object.fromEntries((tenants || []).filter(t => t.ownerEmail).map(t => [t.ownerEmail.toLowerCase(), t])), [tenants])
  const open = tickets.filter(t => t.status === 'open')
  const closed = tickets.filter(t => t.status !== 'open').slice(0, 10)
  if (!open.length && !closed.length) return null

  const discard = async (t) => {
    if (!window.confirm('¿Descartar esta solicitud?')) return
    await closeTicket(t.id, 'descartada')
    onToast('Solicitud descartada')
  }

  return (
    <section className="sa-tickets" aria-label="Solicitudes">
      <div className="sa-tickets__head">
        <h2 className="display">Solicitudes {open.length > 0 && <span className="sa-count">{open.length}</span>}</h2>
        {closed.length > 0 && (
          <button className="sa-link" onClick={() => setShowClosed(s => !s)}>{showClosed ? 'Ocultar resueltas' : 'Ver resueltas'}</button>
        )}
      </div>

      {!open.length && <p className="pf-muted">No hay solicitudes pendientes. 🎉</p>}

      {open.map(t => {
        const tenant = byEmail[t.email]
        const phone = t.phone || tenant?.whatsapp
        return (
          <article key={t.id} className="sa-ticket">
            <div className="sa-ticket__main">
              <p className="sa-ticket__title">🔑 Olvidó su contraseña</p>
              <p><strong>{tenant?.name || 'Cuenta sin catálogo'}</strong> · {t.email}</p>
              {t.phone && <p className="pf-muted">WhatsApp: {t.phone}</p>}
              {t.message && <p className="sa-ticket__msg">“{t.message}”</p>}
              {!tenant && <p className="pf-alert">⚠️ Este correo no coincide con ningún catálogo. Confirma con la persona antes de cambiar algo.</p>}
              <p className="sa-ticket__time">{timeAgo(t.createdAt)}</p>
            </div>
            <div className="sa-ticket__actions">
              <button className="btn btn--ink" onClick={() => onChangePassword({ email: t.email, name: tenant?.name, phone, ticketId: t.id, tenantId: tenant?.id })}>Asignar contraseña</button>
              {phone && <a className="btn btn--ghost" href={waLink(phone, `Hola 👋 Recibimos tu solicitud para recuperar la contraseña de ${tenant?.name || 'tu catálogo'}.`)} target="_blank" rel="noopener noreferrer">Escribirle</a>}
              <button className="btn btn--ghost" onClick={() => discard(t)}>Descartar</button>
            </div>
          </article>
        )
      })}

      {showClosed && closed.map(t => (
        <article key={t.id} className="sa-ticket is-closed">
          <p>{t.email} · {t.resolution || 'resuelta'} · {timeAgo(t.closedAt || t.createdAt)}</p>
        </article>
      ))}
    </section>
  )
}
