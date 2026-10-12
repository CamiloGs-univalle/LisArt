// Estructura "Historias" (tipo Instagram): círculos de categorías y un reproductor
// a pantalla completa donde cada producto es una historia. Toca a los lados para
// pasar, mantén presionado para pausar, desliza hacia arriba para ver el detalle.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import EditText from '@/features/editor/EditText'
import Icon from '@/shared/ui/Icon'
import { formatPrice } from '@/lib/format'
import { MarketingSections } from '@/features/marketing/Boost'
import { activeOffer } from '@/lib/marketing'
import { useAddToCart } from '@/features/cart/useAddToCart'
import { productSizes, productColors } from '@/lib/catalog'
import { useSkin, useSearch, Price } from './shared'
import { useRevealAll, CartButton, AdminButton, Img, Faq, Skeleton, Footer } from './kit'
import './Historias.css'

const DURATION = 6000

export default function HistoriasView({ onOpenDashboard }) {
  const s = useSkin()
  const root = useRef(null)
  const search = useSearch(s.products)
  useRevealAll(root)
  const H = s.content.hero
  const secs = useMemo(() => s.sections.filter(x => x.items.length), [s.sections])
  const [player, setPlayer] = useState(null) // { sec, item }
  const [seen, setSeen] = useState(() => new Set())
  const open = (sec, item = 0) => { setPlayer({ sec, item }); setSeen(v => new Set(v).add(secs[sec]?.id)) }

  return (
    <div className="kt hs" ref={root}>
      <header className="hs-head">
        <div className="kt-wrap hs-head__in">
          <a href="#top" className="hs-brand">{s.brand.name}</a>
          <div className="hs-head__actions">
            <AdminButton onOpenDashboard={onOpenDashboard} />
            <CartButton s={s} />
          </div>
        </div>
      </header>

      <main id="top">
        <section className="kt-wrap hs-profile">
          <button className="hs-avatar" onClick={() => secs.length && open(0)} aria-label="Ver historias">
            <span className="hs-ring hs-ring--big"><span>{s.brand.logo ? <img src={s.brand.logo} alt="" /> : (s.brand.name || '?').slice(0, 1)}</span></span>
          </button>
          <div className="hs-profile__text">
            <h1 className="hs-name">{s.brand.name}</h1>
            <EditText path="hero.subtitle" fallback={H.subtitle} as="p" className="hs-bio" multiline />
            <div className="hs-profile__stats">
              <span><b>{s.products.length}</b> productos</span>
              <span><b>{secs.length}</b> categorías</span>
              {s.brand.city && <span><Icon name="pin" size={14} /> {s.brand.city}</span>}
            </div>
            <div className="hs-profile__ctas">
              <button className="kt-btn kt-btn--accent" onClick={() => secs.length && open(0)}><Icon name="play" size={16} /> Ver historias</button>
              <button className="kt-btn kt-btn--ghost" onClick={() => s.wa.open()}><Icon name="whatsapp" size={18} /> Mensaje</button>
            </div>
          </div>
        </section>

        <nav className="hs-bubbles" aria-label="Historias por categoría">
          <div className="hs-bubbles__in">
            {secs.map((x, i) => (
              <button key={x.id} className={`hs-bubble ${seen.has(x.id) ? 'is-seen' : ''}`} onClick={() => open(i)} data-reveal="zoom" style={{ '--d': `${i * 0.05}s` }}>
                <span className="hs-ring"><span><Img src={x.items[0]?.image} /></span></span>
                <small>{x.name}</small>
              </button>
            ))}
          </div>
        </nav>

        <section className="kt-wrap hs-feed">
          <div className="hs-feed__bar">
            <h2><EditText path="hero.titleStart" fallback={H.titleStart} /> <em><EditText path="hero.titleEmphasis" fallback={H.titleEmphasis} /></em></h2>
            <label className="hs-search"><Icon name="search" size={16} /><input type="search" placeholder="Buscar" value={search.term} onChange={e => search.setTerm(e.target.value)} aria-label="Buscar productos" /></label>
          </div>
          {s.loading ? <Skeleton n={9} className="hs-skel" /> : (
            <div className="hs-grid">
              {(search.results || s.products).map((p, i) => {
                const secIdx = secs.findIndex(x => x.items.some(y => y.id === p.id))
                const itemIdx = secIdx >= 0 ? secs[secIdx].items.findIndex(y => y.id === p.id) : 0
                const offer = activeOffer(p)
                return (
                  <article key={p.id} className="hs-tile" data-reveal="fade" style={{ '--d': `${(i % 3) * 0.05}s` }}>
                    <button className="hs-tile__img" onClick={() => (secIdx >= 0 ? open(secIdx, itemIdx) : s.openProduct(p))} aria-label={`Ver ${p.name} en historias`}>
                      <Img src={p.image} />
                      <span className="hs-tile__over"><strong>{p.name}</strong><span>{Number(p.price) > 0 ? formatPrice(p.price) : 'Cotizar'}</span></span>
                      {offer && <span className="hs-tile__off">-{offer.percent}%</span>}
                      <span className="hs-tile__play" aria-hidden="true"><Icon name="play" size={12} /></span>
                    </button>
                  </article>
                )
              })}
            </div>
          )}
          {search.results && !search.results.length && <p className="hs-empty">Sin resultados.</p>}
        </section>
      </main>

      <MarketingSections />
      {s.content.faq?.length > 0 && <section className="kt-wrap hs-faq"><h2>Preguntas frecuentes</h2><Faq items={s.content.faq} /></section>}
      <Footer s={s} className="hs-foot" />

      {player && <Player secs={secs} start={player} s={s} onSeen={(id) => setSeen(v => new Set(v).add(id))} onClose={() => setPlayer(null)} />}
    </div>
  )
}

// Reproductor de historias a pantalla completa
function Player({ secs, start, s, onClose, onSeen }) {
  const [sec, setSec] = useState(start.sec)
  const [item, setItem] = useState(start.item)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const { add, added } = useAddToCart()
  const touch = useRef(null)
  const holdT = useRef(0)
  const list = secs[sec]?.items || []
  const p = list[item]

  const next = useCallback(() => {
    setProgress(0)
    if (item < list.length - 1) setItem(i => i + 1)
    else if (sec < secs.length - 1) { setSec(x => x + 1); setItem(0); onSeen(secs[sec + 1].id) }
    else onClose()
  }, [item, list.length, sec, secs, onClose, onSeen])
  const prev = useCallback(() => {
    setProgress(0)
    if (item > 0) setItem(i => i - 1)
    else if (sec > 0) { setSec(x => x - 1); setItem(Math.max(0, secs[sec - 1].items.length - 1)) }
  }, [item, sec, secs])

  // Avance automático
  useEffect(() => {
    if (paused || !p) return
    let raf = 0
    const t0 = performance.now() - progress * DURATION
    const tick = (t) => {
      const k = (t - t0) / DURATION
      if (k >= 1) { next(); return }
      setProgress(k)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [paused, p, next]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === ' ') { e.preventDefault(); setPaused(v => !v) }
    }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [next, prev, onClose])

  if (!p) return null
  const needs = productSizes(p).length > 0 || productColors(p).length > 1
  const details = () => { onClose(); setTimeout(() => s.openProduct(p), 30) }

  const down = (e) => { touch.current = { x: e.clientX, y: e.clientY, t: Date.now() }; holdT.current = window.setTimeout(() => setPaused(true), 180) }
  const up = (e) => {
    clearTimeout(holdT.current)
    const t = touch.current; touch.current = null
    if (!t) return
    const dx = e.clientX - t.x, dy = e.clientY - t.y
    const wasHold = Date.now() - t.t > 220
    setPaused(false)
    if (dy < -70 && Math.abs(dy) > Math.abs(dx)) return details()
    if (dy > 90 && Math.abs(dy) > Math.abs(dx)) return onClose()
    if (Math.abs(dx) > 60) { if (dx < 0 && sec < secs.length - 1) { setSec(sec + 1); setItem(0); setProgress(0); onSeen(secs[sec + 1].id) } else if (dx > 0 && sec > 0) { setSec(sec - 1); setItem(0); setProgress(0) } return }
    if (wasHold) return
    const r = e.currentTarget.getBoundingClientRect()
    if (e.clientX - r.left < r.width * 0.33) prev(); else next()
  }

  const offer = activeOffer(p)
  return (
    <div className="hs-player" role="dialog" aria-modal="true" aria-label={`Historias de ${secs[sec].name}`}>
      <div className="hs-player__bg" aria-hidden="true"><img key={p.image} src={p.image} alt="" /></div>
      <div className="hs-story">
        <div className="hs-story__media" onPointerDown={down} onPointerUp={up} onPointerCancel={() => { clearTimeout(holdT.current); setPaused(false); touch.current = null }}>
          <img key={p.id} src={p.image} alt={p.name} draggable="false" />
        </div>
        <div className="hs-story__top">
          <div className="hs-bars">{list.map((x, i) => <span key={x.id}><i style={{ transform: `scaleX(${i < item ? 1 : i === item ? progress : 0})` }} /></span>)}</div>
          <div className="hs-story__who">
            <span className="hs-ring hs-ring--sm"><span><Img src={list[0]?.image} /></span></span>
            <strong>{secs[sec].name}</strong>
            <small>{item + 1}/{list.length}</small>
            <button className="hs-story__ic" onClick={() => setPaused(v => !v)} aria-label={paused ? 'Reproducir' : 'Pausar'}><Icon name={paused ? 'play' : 'pause'} size={18} /></button>
            <button className="hs-story__ic" onClick={onClose} aria-label="Cerrar historias"><Icon name="close" size={20} /></button>
          </div>
        </div>
        <div className="hs-story__info" key={p.id + 'i'}>
          {(p.badge || offer) && <span className="hs-story__tag">{offer ? `Oferta -${offer.percent}%` : p.badge}</span>}
          <h3>{p.name}</h3>
          <Price p={p} className="hs-story__price" />
          {p.description && <p>{p.description}</p>}
          <div className="hs-story__ctas">
            <button className="hs-cta" onClick={() => (needs ? details() : add(p))}><Icon name={added[p.id] ? 'check' : 'cart'} size={18} /> {added[p.id] ? 'Agregado' : needs ? 'Elegir opciones' : 'Agregar'}</button>
            <button className="hs-cta hs-cta--ghost" onClick={() => s.wa.askProduct(p)} aria-label="Preguntar por WhatsApp"><Icon name="whatsapp" size={20} /></button>
          </div>
          <button className="hs-up" onClick={details}><Icon name="arrowUp" size={16} /> Ver detalle</button>
        </div>
        <button className="hs-side hs-side--prev" onClick={prev} aria-label="Anterior"><Icon name="chevronLeft" size={22} /></button>
        <button className="hs-side hs-side--next" onClick={next} aria-label="Siguiente"><Icon name="chevron" size={22} /></button>
      </div>
    </div>
  )
}
