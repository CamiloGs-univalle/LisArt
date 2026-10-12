// Estructura "Escaparate 3D": los productos giran en un carrusel con profundidad
// (arrastrar, rueda del mouse, flechas o teclado). El fondo toma el color del
// producto del frente y la información cambia con animación.
import { useEffect, useMemo, useRef, useState } from 'react'
import EditText from '@/features/editor/EditText'
import Icon from '@/shared/ui/Icon'
import { MarketingSections } from '@/features/marketing/Boost'
import { activeOffer } from '@/lib/marketing'
import { useSkin, useSearch, Price } from './shared'
import { useRevealAll, useScrolled, CartButton, AdminButton, QuickAdd, Img, Faq, Skeleton, Footer } from './kit'
import './Escaparate.css'

const FALLBACK = ['#e76f51', '#2a9d8f', '#e9c46a', '#8338ec', '#ff006e', '#3a86ff', '#6a994e', '#bc6c25']

// Color promedio de una foto (si el servidor de imágenes lo permite)
function useAverageColor(src, fallback) {
  const [color, setColor] = useState(fallback)
  useEffect(() => {
    if (!src) { setColor(fallback); return }
    let alive = true
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const c = document.createElement('canvas'); c.width = c.height = 12
        const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, 12, 12)
        const d = x.getImageData(0, 0, 12, 12).data
        let r = 0, g = 0, b = 0
        for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2] }
        const n = d.length / 4
        if (alive) setColor(`rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`)
      } catch { if (alive) setColor(fallback) }
    }
    img.onerror = () => alive && setColor(fallback)
    img.src = src
    return () => { alive = false }
  }, [src, fallback])
  return color
}

export default function EscaparateView({ onOpenDashboard }) {
  const s = useSkin()
  const root = useRef(null)
  const scrolled = useScrolled(30)
  const search = useSearch(s.products)
  useRevealAll(root)
  const H = s.content.hero
  const secs = s.sections.filter(x => x.items.length)
  const [cat, setCat] = useState('')
  const ring = useMemo(() => (cat ? secs.find(x => x.id === cat)?.items || [] : s.products).slice(0, 12), [cat, secs, s.products])
  const [idx, setIdx] = useState(0)
  useEffect(() => setIdx(0), [cat])
  const cur = ring[((idx % ring.length) + ring.length) % ring.length]
  const color = useAverageColor(cur?.image, FALLBACK[Math.abs(idx) % FALLBACK.length])

  return (
    <div className="kt es" ref={root} style={{ '--es-c': color }}>
      <header className={`es-head ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="kt-wrap es-head__in">
          <a href="#top" className="es-brand">{s.brand.logo ? <img src={s.brand.logo} alt={s.brand.name} /> : s.brand.name}</a>
          <div className="es-head__actions">
            <AdminButton onOpenDashboard={onOpenDashboard} />
            <CartButton s={s} />
          </div>
        </div>
      </header>

      <main id="top">
        <section className="es-stage" aria-label="Escaparate">
          <div className="es-stage__glow" aria-hidden="true" />
          <div className="kt-wrap es-stage__head">
            <EditText path="hero.sticker" fallback={H.sticker} as="p" className="es-kicker" />
            <h1 className="es-title"><EditText path="hero.titleStart" fallback={H.titleStart} /> <em><EditText path="hero.titleEmphasis" fallback={H.titleEmphasis} /></em> <EditText path="hero.titleEnd" fallback={H.titleEnd} /></h1>
          </div>
          {secs.length > 1 && (
            <div className="es-cats" role="tablist" aria-label="Categorías">
              <button role="tab" aria-selected={!cat} className={!cat ? 'is-on' : ''} onClick={() => setCat('')}>Todo</button>
              {secs.map(x => <button key={x.id} role="tab" aria-selected={cat === x.id} className={cat === x.id ? 'is-on' : ''} onClick={() => setCat(x.id)}>{x.name}</button>)}
            </div>
          )}
          {s.loading ? <div className="kt-wrap"><Skeleton n={3} /></div> : ring.length > 0 && (
            <>
              <Carousel items={ring} idx={idx} setIdx={setIdx} onOpen={s.openProduct} key={cat} />
              {cur && (
                <div className="kt-wrap es-info" key={cur.id} aria-live="polite">
                  <p className="es-info__n">{String((((idx % ring.length) + ring.length) % ring.length) + 1).padStart(2, '0')} <span>/ {String(ring.length).padStart(2, '0')}</span></p>
                  <h2 className="es-info__name">{cur.name}</h2>
                  <Price p={cur} className="es-info__price" />
                  {cur.description && <p className="es-info__desc">{cur.description}</p>}
                  <div className="es-info__ctas">
                    <button className="kt-btn kt-btn--solid" onClick={() => s.openProduct(cur)}>Ver detalle</button>
                    <QuickAdd p={cur} openProduct={s.openProduct} icon="cart" label="Agregar" />
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="kt-wrap es-all" id="catalogo">
          <header className="es-all__head" data-reveal>
            <h2>Todo el <em>escaparate</em></h2>
            <label className="es-search"><Icon name="search" size={16} /><input type="search" placeholder="Buscar" value={search.term} onChange={e => search.setTerm(e.target.value)} aria-label="Buscar productos" /></label>
          </header>
          <div className="es-grid">
            {(search.results || s.products).map((p, i) => {
              const offer = activeOffer(p)
              return (
                <article key={p.id} className="es-card" data-reveal style={{ '--d': `${(i % 4) * 0.06}s` }}>
                  <button className="es-card__img" onClick={() => s.openProduct(p)} aria-label={`Ver ${p.name}`}>
                    <Img src={p.image} />
                    {offer && <span className="es-card__off">-{offer.percent}%</span>}
                  </button>
                  <div className="es-card__meta">
                    <div><strong>{p.name}</strong><Price p={p} /></div>
                    <QuickAdd p={p} openProduct={s.openProduct} />
                  </div>
                </article>
              )
            })}
          </div>
          {search.results && !search.results.length && <p className="es-empty">Sin resultados.</p>}
        </section>
      </main>

      <MarketingSections />
      {s.content.faq?.length > 0 && <section className="kt-wrap es-faq"><h2>Preguntas frecuentes</h2><Faq items={s.content.faq} /></section>}
      <Footer s={s} className="es-foot" />
    </div>
  )
}

// Carrusel circular en 3D: arrastrar, rueda, flechas, teclado
function Carousel({ items, idx, setIdx, onOpen }) {
  const n = items.length
  const step = 360 / Math.max(n, 3)
  const [drag, setDrag] = useState(0)
  const st = useRef(null)
  const wheelT = useRef(0)
  const box = useRef(null)
  const [w, setW] = useState(300)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const card = Math.min(Math.max(w * 0.4, 180), 290)
  const radius = Math.max(card * 0.62 / Math.tan(Math.PI / Math.max(n, 3)), card * 1.05)

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return
      // Con una ficha, el carrito u otra ventana abierta, las flechas no mueven la vitrina
      if (document.querySelector('[aria-modal="true"]')) return
      if (e.key === 'ArrowRight') setIdx(i => i + 1)
      if (e.key === 'ArrowLeft') setIdx(i => i - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setIdx])

  const moved = useRef(false)
  const down = (e) => { st.current = { x: e.clientX, moved: false }; moved.current = false }
  const move = (e) => { if (!st.current) return; const dx = e.clientX - st.current.x; if (Math.abs(dx) > 4) st.current.moved = true; setDrag(dx) }
  const up = () => {
    if (!st.current) return
    moved.current = st.current.moved
    st.current = null
    const steps = Math.round(-drag / (card * 0.55))
    setDrag(0)
    if (moved.current && steps) setIdx(i => i + steps)
  }
  const onWheel = (e) => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return
    const now = Date.now()
    if (now - wheelT.current < 380) return
    wheelT.current = now
    setIdx(i => i + (e.deltaX > 0 ? 1 : -1))
  }
  const rot = -idx * step + (drag / (card * 0.55)) * step

  return (
    <div className="es-car" ref={box} style={{ '--card': `${card}px` }}>
      <div className="es-car__scene" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} onWheel={onWheel}>
        <div className={`es-car__ring ${st.current ? 'is-drag' : ''}`} style={{ transform: `translateZ(${-radius}px) rotateY(${rot}deg)` }}>
          {items.map((p, i) => {
            const delta = ((((i - idx) % n) + n) % n)
            const dist = Math.min(delta, n - delta)
            return (
              <button key={p.id} className={`es-car__item ${dist === 0 ? 'is-front' : ''}`} tabIndex={dist === 0 ? 0 : -1}
                style={{ transform: `rotateY(${i * step}deg) translateZ(${radius}px)`, '--dist': dist }}
                onClick={(e) => { if (moved.current) { e.preventDefault(); moved.current = false; return } dist === 0 ? onOpen(p) : setIdx(idx + (delta <= n / 2 ? delta : delta - n)) }}
                aria-label={dist === 0 ? `Ver ${p.name}` : `Mostrar ${p.name}`}>
                <span className="es-car__img"><Img src={p.image} eager={dist < 2} draggable="false" /></span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="es-car__ctrl">
        <button className="kt-ic" onClick={() => setIdx(i => i - 1)} aria-label="Anterior"><Icon name="chevronLeft" size={22} /></button>
        <span className="es-car__dots">{items.map((p, i) => <i key={p.id} className={(((idx % n) + n) % n) === i ? 'is-on' : ''} />)}</span>
        <button className="kt-ic" onClick={() => setIdx(i => i + 1)} aria-label="Siguiente"><Icon name="chevron" size={22} /></button>
      </div>
    </div>
  )
}
