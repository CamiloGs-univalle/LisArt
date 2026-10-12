// Cotizaciones: se arman con productos del catálogo, se envían por WhatsApp o se guardan en PDF
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useProductsCtx } from '@/features/catalog/data/ProductsProvider'
import { useTenant } from '@/features/tenant/TenantProvider'
import { addQuote, updateQuote, removeQuote, nextQuoteNumber, addSale } from '@/services/business.service'
import { totalsOf, QUOTE_STATUS } from '@/lib/business'
import { formatPrice, waLink } from '@/lib/format'
import LinesEditor from './LinesEditor'
import { TotalsFields, Dialog, todayISO, shortDate } from './parts'

const EMPTY = () => ({ date: todayISO(), client: '', phone: '', lines: [], discount: 0, discountType: 'percent', shipping: 0, validDays: 15, notes: '', status: 'borrador' })
const quoteNo = (n) => `COT-${String(n || 0).padStart(4, '0')}`
const validUntil = (q) => { const d = new Date(`${/^\d{4}-\d{2}-\d{2}$/.test(q.date || '') ? q.date : todayISO()}T12:00:00`); d.setDate(d.getDate() + (Number(q.validDays) || 0)); return d }
const longDate = (d) => (isNaN(d) ? '—' : d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }))

export function quoteMessage(q, brand) {
  const t = totalsOf(q)
  return [
    `Hola${q.client ? ` ${q.client}` : ''} 👋 Te comparto la cotización *${quoteNo(q.number)}* de *${brand.name}*:`,
    '',
    ...(q.lines || []).map((l, i) => `${i + 1}. ${l.name} × ${l.qty} — ${formatPrice(l.price * l.qty)}`),
    '',
    `Subtotal: ${formatPrice(t.subtotal)}`,
    ...(t.discount ? [`Descuento: −${formatPrice(t.discount)}`] : []),
    ...(t.shipping ? [`Envío: ${formatPrice(t.shipping)}`] : []),
    `*Total: ${formatPrice(t.total)}*`,
    '',
    `Válida hasta el ${longDate(validUntil(q))}.`,
    ...(q.notes ? ['', q.notes] : []),
    '',
    '¿Te la confirmo? 😊',
  ].join('\n')
}

export default function QuotesView({ data }) {
  const { quotes, tenantId } = data
  const { brand } = useTenant()
  const [editing, setEditing] = useState(null)
  const [printing, setPrinting] = useState(null)

  const setStatus = (q, status) => updateQuote(tenantId, q.id, { status })
  const toSale = async (q) => {
    if (!window.confirm(`¿Registrar la cotización ${quoteNo(q.number)} como venta?`)) return
    await addSale(tenantId, { date: todayISO(), customer: q.client, phone: q.phone, method: 'Transferencia', lines: q.lines, discount: q.discount, discountType: q.discountType, shipping: q.shipping, note: `Desde ${quoteNo(q.number)}`, status: 'pagada', total: totalsOf(q).total, quoteId: q.id })
    await updateQuote(tenantId, q.id, { status: 'aceptada', saleRegistered: true })
  }

  return (
    <div className="bz-stack">
      <section className="ad-card">
        <div className="bz-head">
          <div>
            <h2>📄 Cotizaciones</h2>
            <p className="ad-hint">Arma una cotización profesional en segundos, con tu logo. Envíala por WhatsApp o guárdala en PDF.</p>
          </div>
          <button className="ad-btn ad-btn-primary" onClick={() => setEditing(EMPTY())}>+ Nueva cotización</button>
        </div>
      </section>

      {quotes.length === 0
        ? <p className="ad-empty">Aún no tienes cotizaciones.</p>
        : (
          <ul className="bz-list">
            {quotes.map(q => {
              const t = totalsOf(q)
              const expired = q.status !== 'aceptada' && validUntil(q) < new Date()
              return (
                <li key={q.id}>
                  <div className="bz-list__row bz-list__row--static">
                    <span className="bz-date">{shortDate(q.date)}</span>
                    <button type="button" className="bz-list__main bz-list__main--btn" onClick={() => setEditing(q)}>
                      <strong>{quoteNo(q.number)} · {q.client || 'Cliente'}</strong>
                      <small>{(q.lines || []).map(l => `${l.qty}× ${l.name}`).join(', ')}</small>
                    </button>
                    <span className="bz-list__nums">
                      <strong className="num">{formatPrice(t.total)}</strong>
                      <select className={`bz-status bz-status--${expired ? 'vencida' : q.status}`} value={q.status} onChange={e => setStatus(q, e.target.value)} aria-label="Estado">
                        {Object.entries(QUOTE_STATUS).map(([k, v]) => <option key={k} value={k}>{expired && k === q.status ? 'Vencida' : v.label}</option>)}
                      </select>
                    </span>
                  </div>
                  <div className="bz-list__actions">
                    <a className="ad-btn ad-btn-sm ad-btn-ghost" href={waLink(q.phone || '', quoteMessage(q, brand))} target="_blank" rel="noopener noreferrer"
                      onClick={() => q.status === 'borrador' && setStatus(q, 'enviada')}>WhatsApp</a>
                    <button className="ad-btn ad-btn-sm ad-btn-ghost" onClick={() => setPrinting(q)}>PDF / Imprimir</button>
                    {!q.saleRegistered && <button className="ad-btn ad-btn-sm ad-btn-ghost" onClick={() => toSale(q)}>Pasar a venta</button>}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

      {editing && <QuoteEditor initial={editing} data={data} onClose={() => setEditing(null)} onPrint={(q) => { setEditing(null); setPrinting(q) }} />}
      {printing && <QuotePrint q={printing} brand={brand} onDone={() => setPrinting(null)} />}
    </div>
  )
}

function QuoteEditor({ initial, data, onClose, onPrint }) {
  const { products } = useProductsCtx()
  const { tenantId, quoteCounter } = data
  const [q, setQ] = useState(() => ({ ...EMPTY(), ...initial }))
  const [busy, setBusy] = useState(false)
  const isNew = !initial.id
  const set = (k) => (e) => setQ(prev => ({ ...prev, [k]: e.target.value }))

  const save = async (andPrint = false) => {
    const lines = q.lines.filter(l => l.name.trim())
    if (!lines.length) return alert('Agrega al menos un producto.')
    setBusy(true)
    try {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = q // eslint-disable-line no-unused-vars
      let doc = { ...rest, lines, validDays: Number(q.validDays) || 0 }
      if (isNew) {
        // El consecutivo se reserva en una transacción: dos cotizaciones a la vez no repiten número
        const number = await nextQuoteNumber(tenantId, quoteCounter)
        doc = { ...doc, number }
        const newId = await addQuote(tenantId, doc)
        doc.id = newId
      } else {
        await updateQuote(tenantId, id, doc)
        doc.id = id
      }
      andPrint ? onPrint(doc) : onClose()
    } catch { alert('No se pudo guardar la cotización.') } finally { setBusy(false) }
  }

  const del = async () => {
    if (!window.confirm('¿Eliminar esta cotización?')) return
    await removeQuote(tenantId, initial.id); onClose()
  }

  return (
    <Dialog title={isNew ? 'Nueva cotización' : `Cotización ${quoteNo(initial.number)}`} onClose={onClose} wide
      footer={<>
        {!isNew && <button className="ad-btn ad-btn-sm bz-danger" onClick={del}>Eliminar</button>}
        <span className="bz-spacer" />
        <button className="ad-btn ad-btn-ghost" onClick={() => save(true)} disabled={busy}>Guardar y ver PDF</button>
        <button className="ad-btn ad-btn-primary" onClick={() => save(false)} disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
      </>}>
      <div className="bz-grid">
        <label className="bz-field"><span>Cliente</span><input className="ad-input" value={q.client} onChange={set('client')} placeholder="Nombre o empresa" /></label>
        <label className="bz-field"><span>WhatsApp del cliente</span><input className="ad-input" inputMode="tel" value={q.phone} onChange={set('phone')} placeholder="300 123 4567" /></label>
        <label className="bz-field"><span>Fecha</span><input className="ad-input" type="date" value={q.date} onChange={set('date')} /></label>
        <label className="bz-field"><span>Válida por (días)</span><input className="ad-input" type="number" min="1" value={q.validDays} onChange={set('validDays')} /></label>
      </div>
      <h4 className="bz-sub">Productos o servicios</h4>
      <LinesEditor lines={q.lines} onChange={lines => setQ(p => ({ ...p, lines }))} products={products} costs={data.costs} />
      <TotalsFields doc={q} onChange={setQ} showProfit />
      <label className="bz-field"><span>Condiciones o notas (aparecen en la cotización)</span>
        <textarea className="ad-input" rows={3} value={q.notes} onChange={set('notes')} placeholder="Ej. Anticipo del 50% para separar la fecha. Tiempo de entrega: 3 días hábiles." />
      </label>
    </Dialog>
  )
}

// Documento de la cotización listo para imprimir o guardar como PDF
function QuotePrint({ q, brand, onDone }) {
  const t = totalsOf(q)
  useEffect(() => {
    document.documentElement.classList.add('is-printing')
    const done = () => { document.documentElement.classList.remove('is-printing'); onDone() }
    window.addEventListener('afterprint', done)
    const timer = setTimeout(() => window.print(), 250) // deja cargar el logo
    return () => { clearTimeout(timer); window.removeEventListener('afterprint', done); document.documentElement.classList.remove('is-printing') }
  }, [onDone])

  return createPortal(
    <div className="qp-root">
      <div className="qp-toolbar">
        <span>Elige «Guardar como PDF» en la ventana de impresión.</span>
        <button className="ad-btn ad-btn-primary ad-btn-sm" onClick={() => window.print()}>Imprimir / PDF</button>
        <button className="ad-btn ad-btn-ghost ad-btn-sm" onClick={onDone}>Cerrar</button>
      </div>
      <article className="qp">
        <header className="qp__head">
          <div className="qp__brand">
            {brand.logo ? <img src={brand.logo} alt="" /> : <span className="qp__mono">{(brand.name || '?').slice(0, 2).toUpperCase()}</span>}
            <div>
              <h1>{brand.name}</h1>
              <p>{[brand.city, brand.whatsapp && `WhatsApp ${brand.whatsapp}`].filter(Boolean).join(' · ')}</p>
            </div>
          </div>
          <div className="qp__meta">
            <p className="qp__kicker">Cotización</p>
            <p className="qp__no">{quoteNo(q.number)}</p>
            <p>Fecha: {longDate(new Date(`${q.date}T12:00:00`))}</p>
            <p>Válida hasta: {longDate(validUntil(q))}</p>
          </div>
        </header>
        {(q.client || q.phone) && (
          <section className="qp__to"><span>Para</span><strong>{q.client}</strong>{q.phone && <em>{q.phone}</em>}</section>
        )}
        <table className="qp__table">
          <thead><tr><th>#</th><th>Descripción</th><th>Cant.</th><th>Valor unitario</th><th>Total</th></tr></thead>
          <tbody>
            {q.lines.map((l, i) => (
              <tr key={i}><td>{i + 1}</td><td>{l.name}</td><td>{l.qty}</td><td>{formatPrice(l.price)}</td><td>{formatPrice(l.price * l.qty)}</td></tr>
            ))}
          </tbody>
        </table>
        <dl className="qp__totals">
          <div><dt>Subtotal</dt><dd>{formatPrice(t.subtotal)}</dd></div>
          {t.discount > 0 && <div><dt>Descuento</dt><dd>− {formatPrice(t.discount)}</dd></div>}
          {t.shipping > 0 && <div><dt>Envío</dt><dd>{formatPrice(t.shipping)}</dd></div>}
          <div className="qp__grand"><dt>Total</dt><dd>{formatPrice(t.total)}</dd></div>
        </dl>
        {q.notes && <section className="qp__notes"><h2>Condiciones</h2><p>{q.notes}</p></section>}
        <footer className="qp__foot">Gracias por tu confianza · {brand.name}</footer>
      </article>
    </div>,
    document.body,
  )
}
