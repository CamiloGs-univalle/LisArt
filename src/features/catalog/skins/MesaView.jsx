// Estructura "Mesa de productos" (collage / moodboard): fotos tipo polaroid
// esparcidas sobre una mesa, que se mueven con el scroll (paralaje), se pueden
// arrastrar y se "ordenan" con un botón. Abajo, cada categoría es una nota con
// sus productos en mosaico y cinta adhesiva.
import { useEffect, useRef, useState } from 'react'
import EditText from '@/features/editor/EditText'
import Icon from '@/shared/ui/Icon'
import { formatPrice } from '@/lib/format'
import { MarketingSections } from '@/features/marketing/Boost'
import { activeOffer } from '@/lib/marketing'
import { reducedMotion } from '@/lib/fx'
import SectionBlock from './SectionBlock'
import { useSkin } from './shared'
import { useRevealAll, useScrolled, scrollToSection, CartButton, AdminButton, QuickAdd, Img, Faq, Skeleton, Footer } from './kit'
import './Mesa.css'

// Posiciones "desordenadas" (en % de la mesa) y "ordenadas" (cuadrícula 3×3)
const MESSY = [
  { x: 4, y: 8, r: -9, s: 1, v: 0.18 }, { x: 70, y: 4, r: 7, s: 1.05, v: 0.3 }, { x: 12, y: 58, r: 6, s: .95, v: 0.42 },
  { x: 76, y: 56, r: -6, s: 1, v: 0.22 }, { x: 40, y: 72, r: -3, s: .9, v: 0.5 }, { x: 54, y: 2, r: -12, s: .85, v: 0.12 },
  { x: 24, y: 2, r: 11, s: .8, v: 0.36 }, { x: 88, y: 30, r: 10, s: .8, v: 0.46 }, { x: -2, y: 34, r: -14, s: .82, v: 0.28 },
]
const TIDY = Array.from({ length: 9 }, (_, i) => ({ x: 18 + (i % 3) * 32, y: 8 + Math.floor(i / 3) * 30, r: 0, s: .9, v: 0 }))

export default function MesaView({ onOpenDashboard }) {
  const s = useSkin()
  const root = useRef(null)
  const table = useRef(null)
  const scrolled = useScrolled(40)
  const [tidy, setTidy] = useState(false)
  const [offsets, setOffsets] = useState({})
  const [top, setTop] = useState(null)
  useRevealAll(root)
  const H = s.content.hero
  const secs = s.sections.filter(x => x.items.length)
  const pics = s.products.filter(p => p.image).slice(0, 9)

  // Paralaje: cada foto sube a una velocidad distinta
  useEffect(() => {
    if (reducedMotion()) return
    let raf = 0
    const on = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const el = table.current
        if (!el) return
        const y = Math.max(0, Math.min(window.scrollY, el.offsetHeight))
        el.style.setProperty('--sy', y.toFixed(0))
      })
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [])

  const shuffle = () => { setOffsets({}); setTidy(t => !t) }

  return (
    <div className="kt mz" ref={root}>
      <header className={`mz-head ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="kt-wrap mz-head__in">
          <a href="#top" className="mz-brand">{s.brand.name}</a>
          <nav className="mz-nav" aria-label="Categorías">{secs.slice(0, 4).map(x => <button key={x.id} onClick={() => scrollToSection(x.id)}>{x.name}</button>)}</nav>
          <div className="mz-head__actions"><AdminButton onOpenDashboard={onOpenDashboard} /><CartButton s={s} /></div>
        </div>
      </header>

      <main id="top">
        <section className={`mz-table ${tidy ? 'is-tidy' : ''}`} ref={table} aria-label="Mesa de productos">
          {pics.map((p, i) => {
            const pos = (tidy ? TIDY : MESSY)[i]
            const off = offsets[p.id] || { x: 0, y: 0 }
            return (
              <Polaroid key={p.id} p={p} pos={pos} off={off} z={top === p.id ? 30 : 10 + i}
                onFront={() => setTop(p.id)}
                onMove={(o) => setOffsets(v => ({ ...v, [p.id]: o }))}
                onOpen={() => s.openProduct(p)} />
            )
          })}
          <div className="mz-note" data-reveal="zoom">
            <span className="mz-tape" aria-hidden="true" />
            <EditText path="hero.sticker" fallback={H.sticker} as="p" className="mz-note__k" />
            <h1 className="mz-note__title"><EditText path="hero.titleStart" fallback={H.titleStart} /> <em><EditText path="hero.titleEmphasis" fallback={H.titleEmphasis} /></em> <EditText path="hero.titleEnd" fallback={H.titleEnd} /></h1>
            <EditText path="hero.subtitle" fallback={H.subtitle} as="p" className="mz-note__sub" multiline />
            <div className="mz-note__ctas">
              <button className="kt-btn kt-btn--solid" onClick={() => secs[0] && scrollToSection(secs[0].id)}><EditText path="hero.primaryCta" fallback={H.primaryCta} inButton /></button>
              <button className="kt-btn kt-btn--ghost" onClick={() => s.wa.open()}><Icon name="whatsapp" size={18} /> <EditText path="hero.secondaryCta" fallback={H.secondaryCta} inButton /></button>
            </div>
          </div>
          {pics.length > 2 && (
            <button className="mz-tidy" onClick={shuffle}>
              <Icon name={tidy ? 'sparkle' : 'grid'} size={16} /> {tidy ? 'Desordenar la mesa' : 'Ordenar la mesa'}
            </button>
          )}
          <p className="mz-hint" aria-hidden="true">Arrastra las fotos · toca para ver</p>
        </section>

        {s.loading && <div className="kt-wrap"><Skeleton n={6} /></div>}

        {secs.map((sec, si) => (
          <section key={sec.id} id={`sec-${sec.id}`} className="kt-wrap mz-sec">
            <header className="mz-sec__head" data-reveal style={{ '--rot': `${si % 2 ? 2 : -2}deg` }}>
              <span className="mz-sticky">
                {sec.emoji && <span aria-hidden="true">{sec.emoji}</span>}
                <strong>{sec.title || sec.name} {sec.emphasis}</strong>
                {sec.subtitle && <small>{sec.subtitle}</small>}
              </span>
            </header>
            <SectionBlock sec={sec}>
            <div className="mz-board">
              {sec.items.map((p, i) => {
                const offer = activeOffer(p)
                return (
                  <article key={p.id} className="mz-pin" data-reveal style={{ '--rot': `${[-2.5, 1.8, -1.2, 2.6, -1.8][i % 5]}deg`, '--d': `${(i % 3) * 0.08}s` }}>
                    <span className="mz-tape mz-tape--sm" aria-hidden="true" style={{ '--tr': `${i % 2 ? 6 : -8}deg` }} />
                    <button className="mz-pin__img" onClick={() => s.openProduct(p)} aria-label={`Ver ${p.name}`}>
                      <Img src={p.image} />
                      {offer && <span className="mz-stamp">-{offer.percent}%</span>}
                    </button>
                    <div className="mz-pin__cap">
                      <span className="mz-pin__name">{p.name}</span>
                      <span className="mz-pin__price">{Number(p.price) > 0 ? formatPrice(p.price) : 'Cotizar'}{offer && <s>{formatPrice(offer.before)}</s>}</span>
                    </div>
                    <QuickAdd p={p} openProduct={s.openProduct} className="mz-pin__add" />
                  </article>
                )
              })}
            </div>
            </SectionBlock>
          </section>
        ))}
      </main>

      <MarketingSections />
      {s.content.faq?.length > 0 && <section className="kt-wrap mz-faq"><h2>Preguntas frecuentes</h2><Faq items={s.content.faq} /></section>}
      <Footer s={s} className="mz-foot" go={(id) => scrollToSection(id)} />
    </div>
  )
}

// Foto tipo polaroid: se arrastra con el mouse o el dedo; un toque sin mover la abre
function Polaroid({ p, pos, off, z, onFront, onMove, onOpen }) {
  const st = useRef(null)
  const [drag, setDrag] = useState(null)
  const down = (e) => {
    onFront()
    st.current = { x: e.clientX, y: e.clientY, ox: off.x, oy: off.y, moved: false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const move = (e) => {
    const t = st.current
    if (!t) return
    const dx = e.clientX - t.x, dy = e.clientY - t.y
    if (!t.moved && Math.hypot(dx, dy) > 6) t.moved = true
    if (t.moved) setDrag({ x: t.ox + dx, y: t.oy + dy })
  }
  const up = () => {
    const t = st.current
    st.current = null
    if (!t) return
    if (t.moved && drag) { onMove(drag); setDrag(null) } else onOpen()
  }
  const o = drag || off
  return (
    <button className={`mz-pol ${drag ? 'is-drag' : ''}`}
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: z, '--r': `${pos.r}deg`, '--s': pos.s, '--v': pos.v, '--ox': `${o.x}px`, '--oy': `${o.y}px` }}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { st.current = null; setDrag(null) }}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen() }}
      aria-label={`Ver ${p.name}`}>
      <span className="mz-pol__img"><Img src={p.image} eager draggable="false" /></span>
      <span className="mz-pol__cap">{p.name}</span>
    </button>
  )
}
