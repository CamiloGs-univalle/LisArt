// Costos y ganancia por producto: cuánto te cuesta, cuánto ganas y a cuánto deberías venderlo
import { useEffect, useMemo, useState } from 'react'
import { useProductsCtx } from '@/features/catalog/data/ProductsProvider'
import { saveCosts, saveBusinessPrefs } from '@/services/business.service'
import { COST_FIELDS, unitCost, profitOf, suggestedPrice, marginLevel } from '@/lib/business'
import { formatPrice } from '@/lib/format'
import { isDraft } from '@/lib/catalog'

const LEVEL = { good: 'Buen margen', mid: 'Margen justo', low: 'Margen bajo' }

export default function CostsView({ data }) {
  const { products, updateField } = useProductsCtx()
  const { tenantId, costs, targetMargin } = data
  const [openId, setOpenId] = useState(null)
  const [target, setTarget] = useState(targetMargin)
  const [filter, setFilter] = useState('all')
  useEffect(() => { setTarget(targetMargin) }, [targetMargin])

  const rows = useMemo(() => products.filter(p => !isDraft(p) || Number(p.price) > 0).map(p => {
    const cost = unitCost(costs[p.id])
    const pr = profitOf(p.price, cost)
    return { p, cost, ...pr, level: cost > 0 ? marginLevel(pr.margin) : 'none', suggested: suggestedPrice(cost, target) }
  }), [products, costs, target])

  const shown = rows.filter(r => filter === 'all' || (filter === 'none' ? r.level === 'none' : filter === 'low' ? ['low', 'mid'].includes(r.level) : true))
  const missing = rows.filter(r => r.level === 'none').length
  const low = rows.filter(r => r.level === 'low').length

  const saveCost = (id, next) => saveCosts(tenantId, { ...costs, [id]: next }).catch(() => alert('No se pudo guardar el costo.'))
  const saveTarget = () => { const v = Math.min(Math.max(Number(target) || 0, 1), 90); setTarget(v); saveBusinessPrefs(tenantId, { targetMargin: v }) }

  return (
    <div className="bz-stack">
      <section className="ad-card">
        <div className="bz-head">
          <div>
            <h2>💰 Costos y ganancia</h2>
            <p className="ad-hint">Escribe cuánto te cuesta hacer cada producto. Calculamos tu ganancia real y el precio ideal. <strong>Esto es privado:</strong> tus clientes nunca lo ven.</p>
          </div>
          <label className="bz-target">
            <span>Ganancia deseada</span>
            <span className="bz-join bz-join--sm">
              <input className="ad-input" type="number" min="1" max="90" value={target} onChange={e => setTarget(e.target.value)} onBlur={saveTarget} aria-label="Margen deseado en porcentaje" />
              <em>%</em>
            </span>
          </label>
        </div>
        <div className="bz-chips" role="tablist" aria-label="Filtrar productos">
          {[['all', `Todos (${rows.length})`], ['none', `Sin costo (${missing})`], ['low', `Margen por mejorar (${rows.filter(r => ['low', 'mid'].includes(r.level)).length})`]].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={filter === k} className={filter === k ? 'is-on' : ''} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
        {low > 0 && <p className="bz-alert">⚠️ {low} {low === 1 ? 'producto deja' : 'productos dejan'} menos del 15% de ganancia. Revisa el precio sugerido.</p>}
      </section>

      <ul className="bz-costs">
        {shown.map(r => {
          const open = openId === r.p.id
          const c = costs[r.p.id] || {}
          return (
            <li key={r.p.id} className={`bz-cost ${open ? 'is-open' : ''}`}>
              <button type="button" className="bz-cost__row" aria-expanded={open} onClick={() => setOpenId(open ? null : r.p.id)}>
                <span className="bz-cost__img">{r.p.image ? <img src={r.p.image} alt="" loading="lazy" /> : '📦'}</span>
                <span className="bz-cost__name">
                  <strong>{r.p.name}</strong>
                  <small className="num">Precio {formatPrice(r.p.price)} · Costo {r.cost ? formatPrice(r.cost) : '—'}</small>
                </span>
                <span className="bz-cost__res">
                  {r.level === 'none'
                    ? <span className="bz-pill bz-pill--none">Agregar costo</span>
                    : <>
                      <strong className="num">{formatPrice(r.profit)}</strong>
                      <span className={`bz-pill bz-pill--${r.level}`} title={LEVEL[r.level]}>{r.margin}%</span>
                    </>}
                </span>
              </button>
              {open && (
                <div className="bz-cost__edit">
                  <div className="bz-cost__fields">
                    {COST_FIELDS.map(f => (
                      <label key={f.k} className="bz-field">
                        <span>{f.label}</span>
                        <input className="ad-input" type="number" min="0" inputMode="numeric" placeholder="0" defaultValue={c[f.k] || ''}
                          onBlur={e => { const v = Number(e.target.value) || 0; if (v !== (Number(c[f.k]) || 0)) saveCost(r.p.id, { ...c, [f.k]: v }) }} />
                        <small>{f.hint}</small>
                      </label>
                    ))}
                  </div>
                  {r.cost > 0 && (
                    <div className="bz-cost__insight">
                      <div className="bz-bar" aria-hidden="true">
                        <i style={{ width: `${Math.min(100, Math.max(0, 100 - r.margin))}%` }} />
                      </div>
                      <p>
                        De cada <b className="num">{formatPrice(r.p.price)}</b> que te pagan, <b className="num">{formatPrice(r.cost)}</b> se van en costos y te quedan <b className="num">{formatPrice(r.profit)}</b> ({r.margin}%).
                      </p>
                      {r.suggested > 0 && r.suggested !== Number(r.p.price) && (
                        <div className="bz-suggest">
                          <span>Para ganar el {target}% deberías venderlo a <b className="num">{formatPrice(r.suggested)}</b></span>
                          <button type="button" className="ad-btn ad-btn-sm ad-btn-primary" onClick={() => { if (window.confirm(`¿Cambiar el precio de «${r.p.name}» a ${formatPrice(r.suggested)}?`)) updateField(r.p.id, 'price', r.suggested) }}>Usar este precio</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
        {shown.length === 0 && <li className="ad-empty">No hay productos en este filtro.</li>}
      </ul>
    </div>
  )
}
