// Registro de ventas: anotar a mano o pegar el pedido que llegó por WhatsApp
import { useState } from 'react'
import { useProductsCtx } from '@/features/catalog/data/ProductsProvider'
import { addSale, updateSale, removeSale } from '@/services/business.service'
import { totalsOf, parseOrderMessage, PAYMENT_METHODS } from '@/lib/business'
import { formatPrice } from '@/lib/format'
import LinesEditor from './LinesEditor'
import { TotalsFields, Dialog, todayISO, shortDate } from './parts'

const EMPTY = () => ({ date: todayISO(), customer: '', phone: '', method: 'Efectivo', lines: [], discount: 0, discountType: 'percent', shipping: 0, note: '', status: 'pagada' })

export default function SalesView({ data }) {
  const { sales, tenantId } = data
  const [editing, setEditing] = useState(null) // venta en edición (nueva o existente)
  const [q, setQ] = useState('')
  const list = sales.filter(s => !q.trim() || `${s.customer} ${(s.lines || []).map(l => l.name).join(' ')}`.toLowerCase().includes(q.trim().toLowerCase()))

  return (
    <div className="bz-stack">
      <section className="ad-card">
        <div className="bz-head">
          <div>
            <h2>🧾 Ventas</h2>
            <p className="ad-hint">Anota cada venta para saber cuánto vendes y cuánto ganas de verdad. Puedes pegar el pedido que te llegó por WhatsApp.</p>
          </div>
          <button className="ad-btn ad-btn-primary" onClick={() => setEditing(EMPTY())}>+ Registrar venta</button>
        </div>
        {sales.length > 4 && <input className="ad-input bz-search" type="search" placeholder="Buscar por cliente o producto…" value={q} onChange={e => setQ(e.target.value)} />}
      </section>

      {list.length === 0
        ? <p className="ad-empty">{sales.length ? 'Sin resultados.' : 'Aún no has registrado ventas. ¡Registra la primera!'}</p>
        : (
          <ul className="bz-list">
            {list.map(s => {
              const t = totalsOf(s)
              return (
                <li key={s.id} className={s.status === 'anulada' ? 'is-void' : ''}>
                  <button type="button" className="bz-list__row" onClick={() => setEditing(s)}>
                    <span className="bz-date">{shortDate(s.date)}</span>
                    <span className="bz-list__main">
                      <strong>{s.customer || 'Cliente'}</strong>
                      <small>{(s.lines || []).map(l => `${l.qty}× ${l.name}`).join(', ') || '—'}</small>
                    </span>
                    <span className="bz-list__nums">
                      <strong className="num">{formatPrice(t.total)}</strong>
                      {t.cost > 0 && <small className="num">Ganancia {formatPrice(t.profit)}</small>}
                      {s.status === 'pendiente' && <small className="bz-pill bz-pill--mid">Por cobrar</small>}
                      {s.status === 'anulada' && <small className="bz-pill bz-pill--none">Anulada</small>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

      {editing && <SaleEditor initial={editing} data={data} onClose={() => setEditing(null)} tenantId={tenantId} />}
    </div>
  )
}

export function SaleEditor({ initial, data, onClose, tenantId }) {
  const { products, updateField } = useProductsCtx()
  const [s, setS] = useState(() => ({ ...EMPTY(), ...initial }))
  const [paste, setPaste] = useState('')
  const [showPaste, setShowPaste] = useState(!initial.id && !(initial.lines || []).length)
  const [discountStock, setDiscountStock] = useState(!initial.id)
  const [busy, setBusy] = useState(false)
  const isNew = !initial.id
  const set = (k) => (e) => setS(prev => ({ ...prev, [k]: e.target.value }))
  const hasStock = s.lines.some(l => { const p = products.find(x => x.id === l.productId); return p && p.stock !== '' && p.stock != null })

  const readPaste = () => {
    const r = parseOrderMessage(paste, products, data.costs)
    if (!r.lines.length) return alert('No encontramos productos en ese mensaje. Pega el pedido completo tal como llegó.')
    setS(prev => ({ ...prev, lines: [...prev.lines, ...r.lines], customer: prev.customer || r.customer, ...(r.discount && !prev.discount ? { discount: r.discount, discountType: 'amount' } : {}) }))
    setPaste(''); setShowPaste(false)
  }

  const save = async () => {
    const lines = s.lines.filter(l => l.name.trim())
    if (!lines.length) return alert('Agrega al menos un producto.')
    setBusy(true)
    try {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = s // eslint-disable-line no-unused-vars
      const doc = { ...rest, lines, total: totalsOf({ ...s, lines }).total }
      if (isNew) {
        await addSale(tenantId, doc)
        if (discountStock && hasStock) {
          // Si el mismo producto está en varias líneas (ej. tallas distintas), se suman
          const sold = {}
          lines.forEach(l => { if (l.productId) sold[l.productId] = (sold[l.productId] || 0) + (Number(l.qty) || 0) })
          for (const [pid, qty] of Object.entries(sold)) {
            const p = products.find(x => x.id === pid)
            if (p && p.stock !== '' && p.stock != null) await updateField(p.id, 'stock', Math.max(0, (Number(p.stock) || 0) - qty))
          }
        }
      } else {
        await updateSale(tenantId, id, doc)
      }
      onClose()
    } catch { alert('No se pudo guardar la venta.') } finally { setBusy(false) }
  }

  const del = async () => {
    if (!window.confirm('¿Eliminar esta venta? (Si solo se canceló, mejor márcala como «Anulada»)')) return
    await removeSale(tenantId, initial.id); onClose()
  }

  return (
    <Dialog title={isNew ? 'Registrar venta' : 'Editar venta'} onClose={onClose} wide
      footer={<>
        {!isNew && <button className="ad-btn ad-btn-sm bz-danger" onClick={del}>Eliminar</button>}
        <span className="bz-spacer" />
        <button className="ad-btn ad-btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="ad-btn ad-btn-primary" onClick={save} disabled={busy}>{busy ? 'Guardando…' : 'Guardar venta'}</button>
      </>}>
      {showPaste ? (
        <div className="bz-paste">
          <label className="bz-field">
            <span>¿Te llegó un pedido por WhatsApp? Pégalo aquí</span>
            <textarea className="ad-input" rows={5} value={paste} onChange={e => setPaste(e.target.value)} placeholder={'Hola 👋 Quiero hacer este pedido:\n1. *Ramo de rosas* × 1 — $ 85.000'} />
          </label>
          <div className="bz-row">
            <button type="button" className="ad-btn ad-btn-primary ad-btn-sm" onClick={readPaste} disabled={!paste.trim()}>Leer pedido</button>
            <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setShowPaste(false)}>Anotar a mano</button>
          </div>
        </div>
      ) : isNew && <button type="button" className="bz-link" onClick={() => setShowPaste(true)}>📋 Pegar pedido de WhatsApp</button>}

      <div className="bz-grid">
        <label className="bz-field"><span>Fecha</span><input className="ad-input" type="date" value={s.date} onChange={set('date')} /></label>
        <label className="bz-field"><span>Cliente</span><input className="ad-input" value={s.customer} onChange={set('customer')} placeholder="Nombre" /></label>
        <label className="bz-field"><span>Medio de pago</span>
          <select className="ad-input" value={s.method} onChange={set('method')}>{PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}</select>
        </label>
        <label className="bz-field"><span>Estado</span>
          <select className="ad-input" value={s.status} onChange={set('status')}>
            <option value="pagada">Pagada</option><option value="pendiente">Por cobrar</option><option value="anulada">Anulada</option>
          </select>
        </label>
      </div>

      <h4 className="bz-sub">Productos</h4>
      <LinesEditor lines={s.lines} onChange={lines => setS(p => ({ ...p, lines }))} products={products} costs={data.costs} showCost />
      <TotalsFields doc={s} onChange={setS} showProfit />

      <label className="bz-field"><span>Nota (opcional)</span><input className="ad-input" value={s.note} onChange={set('note')} placeholder="Ej. entrega el sábado" /></label>
      {isNew && hasStock && (
        <label className="pe-check bz-check"><input type="checkbox" checked={discountStock} onChange={e => setDiscountStock(e.target.checked)} /> <span>Descontar estas unidades del inventario</span></label>
      )}
    </Dialog>
  )
}
