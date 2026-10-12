// Pestaña "Cuentas": resumen del mes, costos y ganancia, ventas y cotizaciones
import { useMemo, useState } from 'react'
import { useProductsCtx } from '@/features/catalog/data/ProductsProvider'
import { summarize, totalsOf, monthKey, monthLabel, shiftMonth, unitCost, profitOf, marginLevel } from '@/lib/business'
import { formatPrice } from '@/lib/format'
import { useBusinessData } from './useBusiness'
import CostsView from './CostsView'
import SalesView from './SalesView'
import QuotesView from './QuotesView'
import { Kpi } from './parts'
import './Business.css'

const VIEWS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'costos', label: 'Costos y ganancia' },
  { id: 'ventas', label: 'Ventas' },
  { id: 'cotizaciones', label: 'Cotizaciones' },
]

export default function AccountsTab() {
  const data = useBusinessData()
  const [view, setView] = useState('resumen')

  return (
    <div className="bz">
      <nav className="bz-nav" role="tablist" aria-label="Cuentas">
        {VIEWS.map(v => (
          <button key={v.id} role="tab" aria-selected={view === v.id} className={view === v.id ? 'is-on' : ''} onClick={() => setView(v.id)}>{v.label}</button>
        ))}
      </nav>
      {data.error && <p className="bz-alert">{data.error}</p>}
      {data.loading && !data.error
        ? <div className="bz-skeleton" aria-busy="true"><i /><i /><i /></div>
        : view === 'resumen' ? <Summary data={data} go={setView} />
          : view === 'costos' ? <CostsView data={data} />
            : view === 'ventas' ? <SalesView data={data} />
              : <QuotesView data={data} />}
    </div>
  )
}

function Summary({ data, go }) {
  const { products } = useProductsCtx()
  const [key, setKey] = useState(monthKey())
  const s = useMemo(() => summarize(data.sales, key), [data.sales, key])
  const prev = useMemo(() => summarize(data.sales, shiftMonth(key, -1)), [data.sales, key])
  const max = Math.max(...s.byDay, 1)
  const isCurrent = key === monthKey()
  const today = new Date().getDate()
  const pending = data.sales.filter(x => x.status === 'pendiente')
  const noCost = products.filter(p => Number(p.price) > 0 && !unitCost(data.costs[p.id])).length
  const lowMargin = products.filter(p => { const c = unitCost(data.costs[p.id]); return c > 0 && marginLevel(profitOf(p.price, c).margin) === 'low' })
  const openQuotes = data.quotes.filter(q => q.status === 'enviada')
  const delta = prev.revenue > 0 ? Math.round(((s.revenue - prev.revenue) / prev.revenue) * 100) : null

  return (
    <div className="bz-stack">
      <section className="ad-card">
        <div className="bz-month">
          <button className="bz-x" onClick={() => setKey(shiftMonth(key, -1))} aria-label="Mes anterior">‹</button>
          <h2>{monthLabel(key)}</h2>
          <button className="bz-x" onClick={() => setKey(shiftMonth(key, 1))} disabled={isCurrent} aria-label="Mes siguiente">›</button>
        </div>
        <div className="bz-kpis">
          <Kpi label="Vendido" value={formatPrice(s.revenue)} hint={delta === null ? `${s.count} ${s.count === 1 ? 'venta' : 'ventas'}` : `${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)}% vs. mes anterior`} tone={delta === null ? '' : delta >= 0 ? 'up' : 'down'} />
          <Kpi label="Ganancia" value={formatPrice(s.profit)} hint={s.cost > 0 ? `Margen ${s.margin}%` : 'Agrega costos para verla'} tone={s.cost > 0 ? marginLevel(s.margin) : ''} />
          <Kpi label="Ventas" value={s.count} hint={`${s.units} unidades`} />
          <Kpi label="Ticket promedio" value={formatPrice(s.avgTicket)} hint="por venta" />
        </div>
        <div className="bz-chart" role="img" aria-label={`Ventas por día de ${monthLabel(key)}`}>
          {s.byDay.map((v, i) => (
            <span key={i} className={`bz-chart__bar ${isCurrent && i + 1 === today ? 'is-today' : ''} ${isCurrent && i + 1 > today ? 'is-future' : ''}`} title={`${i + 1}: ${formatPrice(v)}`}>
              <i style={{ height: `${v ? Math.max(4, (v / max) * 100) : 0}%` }} />
            </span>
          ))}
        </div>
        <div className="bz-chart__axis"><span>1</span><span>{Math.ceil(s.byDay.length / 2)}</span><span>{s.byDay.length}</span></div>
      </section>

      {(noCost > 0 || lowMargin.length > 0 || pending.length > 0 || openQuotes.length > 0) && (
        <section className="ad-card">
          <h2>Para hacer hoy</h2>
          <ul className="bz-todo">
            {pending.length > 0 && <li><span>💸</span><p>Tienes <b>{pending.length}</b> {pending.length === 1 ? 'venta' : 'ventas'} por cobrar ({formatPrice(pending.reduce((a, x) => a + totalsOf(x).total, 0))}).</p><button className="ad-btn ad-btn-sm ad-btn-ghost" onClick={() => go('ventas')}>Ver</button></li>}
            {openQuotes.length > 0 && <li><span>📄</span><p><b>{openQuotes.length}</b> {openQuotes.length === 1 ? 'cotización enviada espera' : 'cotizaciones enviadas esperan'} respuesta. ¡Haz seguimiento!</p><button className="ad-btn ad-btn-sm ad-btn-ghost" onClick={() => go('cotizaciones')}>Ver</button></li>}
            {noCost > 0 && <li><span>🧮</span><p><b>{noCost}</b> {noCost === 1 ? 'producto no tiene' : 'productos no tienen'} costo. Agrégalo para saber cuánto ganas.</p><button className="ad-btn ad-btn-sm ad-btn-ghost" onClick={() => go('costos')}>Agregar</button></li>}
            {lowMargin.length > 0 && <li><span>⚠️</span><p><b>{lowMargin.map(p => p.name).slice(0, 2).join(', ')}{lowMargin.length > 2 ? '…' : ''}</b> te {lowMargin.length === 1 ? 'deja' : 'dejan'} muy poca ganancia.</p><button className="ad-btn ad-btn-sm ad-btn-ghost" onClick={() => go('costos')}>Revisar</button></li>}
          </ul>
        </section>
      )}

      <section className="ad-card">
        <h2>Lo más vendido</h2>
        {s.top.length === 0
          ? <p className="ad-hint">Cuando registres ventas verás aquí tus productos estrella. <button className="bz-link" onClick={() => go('ventas')}>Registrar una venta →</button></p>
          : (
            <ol className="bz-top">
              {s.top.map((p, i) => (
                <li key={i}>
                  <span className="bz-top__n">{i + 1}</span>
                  <span className="bz-top__name"><strong>{p.name}</strong><small>{p.qty} {p.qty === 1 ? 'unidad' : 'unidades'}</small></span>
                  <span className="bz-top__bar" aria-hidden="true"><i style={{ width: `${(p.revenue / s.top[0].revenue) * 100}%` }} /></span>
                  <strong className="num">{formatPrice(p.revenue)}</strong>
                </li>
              ))}
            </ol>
          )}
      </section>
    </div>
  )
}
