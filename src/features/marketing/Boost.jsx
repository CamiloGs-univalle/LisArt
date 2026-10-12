// ─────────────────────────────────────────────────────────────
// Estrategias de venta visibles en el catálogo.
//  · OfferNote   → ahorro + cuenta regresiva real de la oferta
//  · StockNote   → «¡Quedan 3!» según el inventario real
//  · GoalBar     → «Te faltan $X para envío gratis» (meta de compra)
//  · CartUpsell  → «Completa tu pedido» priorizando lo que alcanza la meta
//  · ProductBoost→ en la ficha: comparador, combos, opiniones y «lleva también»
//  · MarketingSections → bloques del catálogo: Compara y elige, Combos, Opiniones
// ─────────────────────────────────────────────────────────────
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSettingsCtx } from '@/features/catalog/data/SettingsProvider'
import { useCatalog } from '@/features/catalog/layouts/useCatalog'
import { useCart } from '@/features/cart/CartProvider'
import { useUI } from '@/features/catalog/UIProvider'
import { useAdmin } from '@/features/editor/EditorProvider'
import { formatPrice } from '@/lib/format'
import { activeOffer, timeLeft, stockInfo, goalLabel, comboInfo, compareInfo, suggestions, GOAL_TYPES } from '@/lib/marketing'
import Icon from '@/shared/ui/Icon'
import './Boost.css'

function useNow(active, every = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setNow(Date.now()), every)
    return () => clearInterval(t)
  }, [active, every])
  return now
}
const pad = (x) => String(x).padStart(2, '0')

/* ── Oferta con cuenta regresiva ── */
export function OfferNote({ p, variant = 'full' }) {
  const offer = activeOffer(p)
  const soon = !!offer?.ends && offer.ends.getTime() - Date.now() < 14 * 864e5
  const now = useNow(soon)
  if (!offer) return null
  const t = soon ? timeLeft(offer.ends, now) : null
  if (variant === 'chip') return soon ? <span className="mk-chip mk-chip--hot"><Icon name="calendar" size={12} /> {t.d > 0 ? `${t.d}d ${t.h}h` : `${pad(t.h)}:${pad(t.m)}:${pad(t.s)}`}</span> : null
  return (
    <div className="mk-offer" role="note">
      <span className="mk-offer__save">Ahorras <b className="num">{formatPrice(offer.save)}</b> ({offer.percent}%)</span>
      {soon && (
        <span className="mk-offer__clock" aria-label={`La oferta termina en ${t.d} días ${t.h} horas`}>
          <span>Termina en</span>
          {t.d > 0 && <b className="num">{t.d}<small>d</small></b>}
          <b className="num">{pad(t.h)}<small>h</small></b>
          <b className="num">{pad(t.m)}<small>m</small></b>
          {t.d === 0 && <b className="num">{pad(t.s)}<small>s</small></b>}
        </span>
      )}
    </div>
  )
}

/* ── Inventario ── */
export function StockNote({ p, compact = false }) {
  const { marketing } = useSettingsCtx()
  const s = stockInfo(p, marketing)
  if (!s || (!s.low && !s.out)) return null
  if (compact) return <span className={`mk-stock ${s.out ? 'is-out' : ''}`}>{s.label}</span>
  return (
    <p className={`mk-stock mk-stock--full ${s.out ? 'is-out' : ''}`}>
      {!s.out && <span className="mk-stock__dot" aria-hidden="true" />}
      {s.out ? 'Agotado por ahora · pregúntanos cuándo vuelve' : s.label}
      {!s.out && <span className="mk-stock__meter" aria-hidden="true"><i style={{ width: `${Math.max(8, (s.stock / Math.max(marketing.lowStock, 1)) * 100)}%` }} /></span>}
    </p>
  )
}

/* ── Meta de compra (estilo Temu) ── */
export function GoalBar({ compact = false }) {
  const { progress, total } = useCart()
  if (!progress) return null
  const { next, won, missing, tiers } = progress
  const last = tiers.at(-1)
  return (
    <div className={`mk-goal ${compact ? 'mk-goal--compact' : ''} ${next ? '' : 'is-done'}`} role="status" aria-live="polite">
      <p className="mk-goal__txt">
        {next
          ? <><Icon name={GOAL_TYPES[next.type]?.icon || 'gift'} size={16} /> <span>Te faltan <b className="num">{formatPrice(missing)}</b> para <b>{goalLabel(next).toLowerCase()}</b></span></>
          : <><Icon name="check" size={16} /> <span>¡Ganaste <b>{won.map(g => goalLabel(g).toLowerCase()).join(' + ')}</b>!</span></>}
      </p>
      {!compact && (
        <div className="mk-goal__track">
          <i style={{ width: `${Math.min(100, (total / Number(last.amount)) * 100)}%` }} />
          {tiers.map(g => (
            <span key={g.amount} className={`mk-goal__stop ${total >= Number(g.amount) ? 'is-won' : ''}`} style={{ left: `${(Number(g.amount) / Number(last.amount)) * 100}%` }} title={`${goalLabel(g)} desde ${formatPrice(g.amount)}`}>
              <Icon name={GOAL_TYPES[g.type]?.icon || 'gift'} size={12} />
            </span>
          ))}
        </div>
      )}
      {compact && next && <span className="mk-goal__mini" aria-hidden="true"><i style={{ width: `${progress.pct}%` }} /></span>}
    </div>
  )
}

/* ── Agregar rápido (para sugerencias y combos) ── */
function QuickAdd({ p, label = 'Agregar' }) {
  const { addToCart } = useCart()
  const { notify } = useUI()
  const [ok, setOk] = useState(false)
  const needsOptions = String(p.sizes || '').trim() || String(p.colors || '').includes(',')
  const { openProduct } = useUI()
  return (
    <button type="button" className={`mk-add ${ok ? 'is-ok' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        if (needsOptions) return openProduct(p)
        if (addToCart(p, 1)) return openProduct(p)
        notify({ title: p.name, image: p.image }); setOk(true); setTimeout(() => setOk(false), 1400)
      }}>
      <Icon name={ok ? 'check' : 'plus'} size={15} /> {ok ? 'Listo' : needsOptions ? 'Elegir' : label}
    </button>
  )
}

function MiniCard({ p }) {
  const { openProduct } = useUI()
  const offer = activeOffer(p)
  return (
    <div className="mk-mini">
      <button type="button" className="mk-mini__img" onClick={() => openProduct(p)} aria-label={`Ver ${p.name}`}>
        {p.image && <img src={p.image} alt="" loading="lazy" />}
        {offer && <span className="mk-mini__off">-{offer.percent}%</span>}
      </button>
      <strong className="mk-mini__name">{p.name}</strong>
      <span className="mk-mini__price num">{formatPrice(p.price)}{offer && <s>{formatPrice(offer.before)}</s>}</span>
      <QuickAdd p={p} />
    </div>
  )
}

/* ── Carrito: completa tu pedido ── */
export function CartUpsell() {
  const { marketing } = useSettingsCtx()
  const { visibleProducts } = useCatalog()
  const { items, progress } = useCart()
  const list = useMemo(() => suggestions({
    product: null,
    cartIds: items.map(i => i.id),
    products: visibleProducts,
    missing: progress?.missing || 0,
    max: 6,
  }), [items, visibleProducts, progress?.missing])
  if (!marketing.crossSellEnabled || !list.length) return null
  return (
    <section className="mk-upsell" aria-label="Completa tu pedido">
      <h3>{progress?.next ? <>Súmale y gana <em>{goalLabel(progress.next).toLowerCase()}</em></> : 'Completa tu pedido'}</h3>
      <div className="mk-rail">{list.map(p => <MiniCard key={p.id} p={p} />)}</div>
    </section>
  )
}

/* ── Comparador (precio ancla: barato · recomendado · premium) ── */
export function CompareBlock({ cmp, currentId }) {
  const { visibleProducts } = useCatalog()
  const { openProduct } = useUI()
  const { items, recommended } = compareInfo(cmp, visibleProducts)
  const grid = useRef(null)
  // En celular las opciones se deslizan: se arranca mostrando la recomendada
  useEffect(() => {
    const g = grid.current
    const rec = g?.querySelector('.is-rec')
    if (g && rec && g.scrollWidth > g.clientWidth) g.scrollLeft = rec.offsetLeft - (g.clientWidth - rec.clientWidth) / 2
  }, [recommended, items.length])
  if (items.length < 2) return null
  const features = (cmp.features || []).filter(f => f.label)
  return (
    <section className="mk-compare" aria-label={cmp.title || 'Compara opciones'}>
      <header className="mk-head">
        <p className="mk-eyebrow">Compara y elige</p>
        <h3>{cmp.title || 'Encuentra la opción ideal'}</h3>
        {cmp.subtitle && <p className="mk-sub">{cmp.subtitle}</p>}
      </header>
      <div ref={grid} className="mk-compare__grid" style={{ '--cols': items.length }}>
        {items.map((p, i) => {
          const rec = p.id === recommended
          const col = (cmp.items || []).indexOf(p.id)
          return (
            <article key={p.id} className={`mk-plan ${rec ? 'is-rec' : ''} ${p.id === currentId ? 'is-current' : ''}`}>
              {rec && <span className="mk-plan__flag"><Icon name="star" size={12} /> El más elegido</span>}
              <button type="button" className="mk-plan__img" onClick={() => openProduct(p)} aria-label={`Ver ${p.name}`}>
                {p.image && <img src={p.image} alt="" loading="lazy" />}
              </button>
              <p className="mk-plan__tier">{['Esencial', 'Recomendado', 'Premium', 'Plus'][items.length === 2 ? (i ? 2 : 0) : i] || ''}</p>
              <h4>{p.name}</h4>
              <p className="mk-plan__price num">{formatPrice(p.price)}</p>
              {features.length > 0 && (
                <ul className="mk-plan__feat">
                  {features.map((f, k) => {
                    const v = String(f.values?.[col] ?? '').trim()
                    const no = !v || v === '-' || v.toLowerCase() === 'no'
                    return <li key={k} className={no ? 'is-no' : ''}><Icon name={no ? 'close' : 'check'} size={14} /> <span>{f.label}{v && !no && !['si', 'sí', '✓'].includes(v.toLowerCase()) ? `: ${v}` : ''}</span></li>
                  })}
                </ul>
              )}
              <QuickAdd p={p} label={rec ? 'Elegir este' : 'Agregar'} />
            </article>
          )
        })}
      </div>
    </section>
  )
}

/* ── Combos con ahorro ── */
export function ComboCard({ combo }) {
  const { visibleProducts } = useCatalog()
  const { addToCart } = useCart()
  const { notify } = useUI()
  const [ok, setOk] = useState(false)
  const c = comboInfo(combo, visibleProducts)
  if (c.items.length < 2) return null
  const add = () => {
    addToCart({ id: `combo:${combo.id}`, name: `Combo ${combo.name}`, price: c.price, image: c.image }, 1, { detail: c.items.map(p => p.name).join(' + ') })
    notify({ title: `Combo ${combo.name}`, image: c.image }); setOk(true); setTimeout(() => setOk(false), 1400)
  }
  return (
    <article className="mk-combo">
      <div className="mk-combo__imgs">
        {c.items.slice(0, 3).map((p, i) => <span key={p.id} style={{ '--i': i }}>{p.image && <img src={p.image} alt="" loading="lazy" />}</span>)}
        {c.save > 0 && <em className="mk-combo__save">Ahorra {c.percent}%</em>}
      </div>
      <div className="mk-combo__body">
        <h4>{combo.name}</h4>
        <p className="mk-combo__items">{c.items.map(p => p.name).join(' + ')}</p>
        {combo.description && <p className="mk-sub">{combo.description}</p>}
        <p className="mk-combo__price num">
          <b>{formatPrice(c.price)}</b>
          {c.save > 0 && <><s>{formatPrice(c.regular)}</s><span>Te ahorras {formatPrice(c.save)}</span></>}
        </p>
        <button type="button" className={`mk-cta ${ok ? 'is-ok' : ''}`} onClick={add}><Icon name={ok ? 'check' : 'cart'} size={17} /> {ok ? 'Combo agregado' : 'Agregar combo'}</button>
      </div>
    </article>
  )
}

/* ── Opiniones de clientes reales ── */
function Stars({ n = 5 }) {
  return <span className="mk-stars" aria-label={`${n} de 5 estrellas`}>{[1, 2, 3, 4, 5].map(i => <Icon key={i} name="star" size={14} className={i <= n ? 'is-on' : ''} />)}</span>
}
export function Reviews({ list, title = 'Lo que dicen nuestros clientes' }) {
  if (!list?.length) return null
  const avg = list.reduce((a, r) => a + (Number(r.stars) || 5), 0) / list.length
  return (
    <section className="mk-reviews" aria-label="Opiniones">
      <header className="mk-head">
        <p className="mk-eyebrow">Opiniones</p>
        <h3>{title}</h3>
        <p className="mk-sub mk-reviews__avg"><Stars n={Math.round(avg)} /> <b className="num">{avg.toFixed(1)}</b> · {list.length} {list.length === 1 ? 'opinión' : 'opiniones'}</p>
      </header>
      <div className="mk-rail mk-rail--reviews">
        {list.map(r => (
          <figure key={r.id} className="mk-review">
            <Stars n={Number(r.stars) || 5} />
            <blockquote>“{r.text}”</blockquote>
            <figcaption><span className="mk-review__av" aria-hidden="true">{(r.name || '?').slice(0, 1).toUpperCase()}</span>{r.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/* ── Ficha de producto ── */
export function ProductBoost({ p, showSuggestions = true }) {
  const { marketing } = useSettingsCtx()
  const { visibleProducts } = useCatalog()
  const { items, progress } = useCart()
  const cmp = marketing.compares.find(c => (c.items || []).includes(p.id))
  const combos = marketing.combos.filter(c => (c.items || []).includes(p.id))
  const reviews = marketing.reviews.filter(r => r.productId === p.id)
  const sugg = useMemo(() => (marketing.crossSellEnabled && showSuggestions
    ? suggestions({ product: p, cartIds: items.map(i => i.id), products: visibleProducts, missing: 0, max: 4 })
    : []), [marketing.crossSellEnabled, showSuggestions, p, items, visibleProducts])

  return (
    <div className="mk-boost">
      {progress?.next && Number(p.price) > 0 && (
        <p className="mk-goalhint">
          <Icon name={GOAL_TYPES[progress.next.type]?.icon || 'gift'} size={15} />
          {Number(p.price) >= progress.missing
            ? <span>Con este producto <b>ganas {goalLabel(progress.next).toLowerCase()}</b></span>
            : <span>Con este te faltarían <b className="num">{formatPrice(progress.missing - Number(p.price))}</b> para {goalLabel(progress.next).toLowerCase()}</span>}
        </p>
      )}
      {cmp && <CompareBlock cmp={cmp} currentId={p.id} />}
      {combos.map(c => <ComboCard key={c.id} combo={c} />)}
      {reviews.length > 0 && <Reviews list={reviews} title="Opiniones de este producto" />}
      {sugg.length > 0 && (
        <section className="mk-upsell" aria-label="Lleva también">
          <h3>Lleva también</h3>
          <div className="mk-rail">{sugg.map(x => <MiniCard key={x.id} p={x} />)}</div>
        </section>
      )}
    </div>
  )
}

/* ── Bloques del catálogo (antes del pie de página) ── */
export function MarketingSections() {
  const { marketing } = useSettingsCtx()
  const { isAdmin } = useAdmin()
  const { visibleProducts } = useCatalog()
  const compares = marketing.compares.filter(c => compareInfo(c, visibleProducts).items.length >= 2)
  const combos = marketing.combos.filter(c => comboInfo(c, visibleProducts).items.length >= 2)
  const reviews = marketing.reviews.filter(r => r.text)
  if (!compares.length && !combos.length && !reviews.length) {
    return isAdmin ? <p className="mk-adminhint">🚀 Agrega comparadores, combos y opiniones en <b>Panel → Vender más</b> y aparecerán aquí.</p> : null
  }
  return (
    <div className="mk-sections">
      {compares.map(c => <CompareBlock key={c.id} cmp={c} />)}
      {combos.length > 0 && (
        <section className="mk-combos" aria-label="Combos">
          <header className="mk-head"><p className="mk-eyebrow">Combos</p><h3>Llévalos juntos y <em>ahorra</em></h3></header>
          <div className="mk-combos__grid">{combos.map(c => <ComboCard key={c.id} combo={c} />)}</div>
        </section>
      )}
      <Reviews list={reviews} />
    </div>
  )
}
