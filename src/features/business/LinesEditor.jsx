// Editor de líneas (productos del catálogo o renglones libres) para ventas y cotizaciones
import { useMemo, useState } from 'react'
import { formatPrice } from '@/lib/format'
import { unitCost } from '@/lib/business'

export default function LinesEditor({ lines, onChange, products, costs, showCost = false }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const matches = useMemo(() => {
    const t = q.trim().toLowerCase()
    return products.filter(p => p.name && (!t || p.name.toLowerCase().includes(t))).slice(0, 8)
  }, [q, products])

  const set = (i, k, v) => onChange(lines.map((l, j) => (j === i ? { ...l, [k]: v } : l)))
  const remove = (i) => onChange(lines.filter((_, j) => j !== i))
  const addProduct = (p) => {
    const at = lines.findIndex(l => l.productId === p.id)
    if (at >= 0) set(at, 'qty', Number(lines[at].qty) + 1)
    else onChange([...lines, { productId: p.id, name: p.name, qty: 1, price: Number(p.price) || 0, cost: unitCost(costs?.[p.id]) }])
    setQ(''); setOpen(false)
  }
  const addFree = () => onChange([...lines, { productId: null, name: '', qty: 1, price: 0, cost: 0 }])

  return (
    <div className="bz-lines">
      {lines.length > 0 && (
        <ul className="bz-lines__list">
          {lines.map((l, i) => (
            <li key={i} className="bz-line">
              <input className="ad-input bz-line__name" value={l.name} placeholder="Descripción" aria-label="Descripción" onChange={e => set(i, 'name', e.target.value)} />
              <label className="bz-line__num"><span>Cant.</span>
                <input className="ad-input" type="number" min="1" inputMode="numeric" value={l.qty} onChange={e => set(i, 'qty', Math.max(1, Number(e.target.value) || 1))} />
              </label>
              <label className="bz-line__num bz-line__num--price"><span>Precio c/u</span>
                <input className="ad-input" type="number" min="0" inputMode="numeric" value={l.price} onChange={e => set(i, 'price', Number(e.target.value) || 0)} />
              </label>
              {showCost && (
                <label className="bz-line__num bz-line__num--price"><span>Costo c/u</span>
                  <input className="ad-input" type="number" min="0" inputMode="numeric" value={l.cost || 0} onChange={e => set(i, 'cost', Number(e.target.value) || 0)} />
                </label>
              )}
              <strong className="bz-line__sub num">{formatPrice((Number(l.price) || 0) * (Number(l.qty) || 0))}</strong>
              <button type="button" className="bz-x" onClick={() => remove(i)} aria-label={`Quitar ${l.name || 'línea'}`}>✕</button>
            </li>
          ))}
        </ul>
      )}

      <div className="bz-lines__add">
        <div className="bz-pick">
          <input className="ad-input" value={q} placeholder="🔎 Agregar producto del catálogo…" aria-label="Buscar producto"
            onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} onChange={e => { setQ(e.target.value); setOpen(true) }} />
          {open && matches.length > 0 && (
            <ul className="bz-pick__menu" role="listbox">
              {matches.map(p => (
                <li key={p.id}>
                  <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => addProduct(p)}>
                    {p.image && <img src={p.image} alt="" />}
                    <span>{p.name}</span>
                    <b className="num">{formatPrice(p.price)}</b>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={addFree}>+ Línea libre</button>
      </div>
    </div>
  )
}
