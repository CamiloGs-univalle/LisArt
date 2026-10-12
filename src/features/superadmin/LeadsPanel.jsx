// Solicitudes que llegan desde la página GS Solutions (citas, información y cotizaciones)
import { useState } from 'react'
import { updateLead, removeLead, LEAD_TYPES } from '@/services/leads.service'
import { waLink } from '@/lib/format'

const toDate = (v) => (v?.toDate ? v.toDate() : v ? new Date(v) : null)
const when = (v) => { const d = toDate(v); return d && !isNaN(d) ? d.toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : 'ahora' }
const STATUS = { new: 'Nueva', contacted: 'Contactada', won: 'Cliente', lost: 'Descartada' }

export default function LeadsPanel({ leads, onToast }) {
  const [filter, setFilter] = useState('new')
  const list = leads.filter(l => filter === 'all' || (l.status || 'new') === filter)
  const set = async (l, status) => { await updateLead(l.id, { status }); onToast(`Solicitud marcada: ${STATUS[status]}`) }
  const del = async (l) => { if (window.confirm('¿Borrar esta solicitud?')) { await removeLead(l.id); onToast('Solicitud borrada') } }
  return (
    <section className="sa-tickets sa-leads" aria-label="Solicitudes de la página">
      <div className="sa-tickets__head">
        <h2 className="display">Solicitudes de la página {leads.filter(l => (l.status || 'new') === 'new').length > 0 && <span className="sa-count">{leads.filter(l => (l.status || 'new') === 'new').length}</span>}</h2>
        <div className="sa-filters">
          {[['new', 'Nuevas'], ['contacted', 'Contactadas'], ['won', 'Clientes'], ['all', 'Todas']].map(([k, l]) => (
            <button key={k} className={`sa-chip ${filter === k ? 'is-on' : ''}`} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
      </div>
      {!list.length && <p className="pf-muted">No hay solicitudes en esta lista.</p>}
      <ul className="sa-leads__list">
        {list.map(l => {
          const msg = `Hola ${l.name.split(' ')[0]} 👋 Te escribo de GS Solutions por tu solicitud${l.type === 'cita' && l.date ? ` de charla para el ${l.date} (${l.slot})` : ''}.`
          return (
            <li key={l.id} className="sa-lead">
              <div className="sa-lead__top">
                <span className={`sa-lead__type sa-lead__type--${l.type}`}>{LEAD_TYPES[l.type] || l.type}</span>
                <small>{when(l.createdAt)} · {STATUS[l.status || 'new']}</small>
              </div>
              <strong>{l.name}{l.company && ` · ${l.company}`}</strong>
              <p className="sa-lead__contact">{[l.phone, l.email].filter(Boolean).join(' · ')}</p>
              {l.type === 'cita' && l.date && <p>📅 {l.date} · {l.slot}</p>}
              {l.summary && <pre className="sa-lead__summary">{l.summary}</pre>}
              {l.message && <p className="sa-lead__msg">“{l.message}”</p>}
              <div className="sa-lead__actions">
                {l.phone && <a className="btn btn--primary" href={waLink(l.phone.length === 10 ? `57${l.phone}` : l.phone, msg)} target="_blank" rel="noopener noreferrer" onClick={() => (l.status || 'new') === 'new' && set(l, 'contacted')}>Responder por WhatsApp</a>}
                {l.email && <a className="btn btn--ghost" href={`mailto:${l.email}?subject=${encodeURIComponent('GS Solutions · tu solicitud')}`}>Correo</a>}
                {(l.status || 'new') !== 'won' && <button className="btn btn--ghost" onClick={() => set(l, 'won')}>Ya es cliente</button>}
                {(l.status || 'new') !== 'lost' && <button className="btn btn--ghost" onClick={() => set(l, 'lost')}>Descartar</button>}
                <button className="btn btn--ghost sa-danger" onClick={() => del(l)}>Borrar</button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
