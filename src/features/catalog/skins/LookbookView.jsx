// Estructura "Lookbook inmersivo" (moda, arte, fotografía, decoración):
// portada a pantalla completa con paralaje, una colección contada con scroll
// (la foto cambia mientras bajas) y galerías horizontales con flechas.
import { useEffect, useRef, useState } from 'react'
import EditText from '@/features/editor/EditText'
import Icon from '@/shared/ui/Icon'
import { MarketingSections } from '@/features/marketing/Boost'
import { activeOffer } from '@/lib/marketing'
import SectionBlock from './SectionBlock'
import { useSkin, useSearch, Price } from './shared'
import { useRevealAll, useScrolled, scrollToSection, CartButton, AdminButton, QuickAdd, Img, Faq, Skeleton, Footer } from './kit'
import './Lookbook.css'

export default function LookbookView({ onOpenDashboard }) {
  const s = useSkin()
  const root = useRef(null)
  const scrolled = useScrolled(80)
  const search = useSearch(s.products)
  const [searching, setSearching] = useState(false)
  useRevealAll(root)
  useParallax(root)
  const H = s.content.hero
  const secs = s.sections.filter(x => x.items.length)
  const story = secs[0]
  const rest = secs.slice(1)
  const cover = s.heroImage || s.featured?.image

  return (
    <div className="kt lb" ref={root}>
      <header className={`lb-head ${scrolled ? 'is-solid' : ''}`}>
        <div className="lb-head__in">
          <nav className="lb-nav" aria-label="Colecciones">
            {secs.slice(0, 4).map(x => <button key={x.id} onClick={() => scrollToSection(x.id)}>{x.name}</button>)}
          </nav>
          <a href="#top" className="lb-brand">{s.brand.logo ? <img src={s.brand.logo} alt={s.brand.name} /> : s.brand.name}</a>
          <div className="lb-head__actions">
            <button className="kt-ic" onClick={() => setSearching(v => !v)} aria-label="Buscar" aria-expanded={searching}><Icon name={searching ? 'close' : 'search'} size={20} /></button>
            <AdminButton onOpenDashboard={onOpenDashboard} />
            <CartButton s={s} />
          </div>
        </div>
        {searching && (
          <div className="lb-search">
            <input autoFocus type="search" placeholder="Buscar en la colección…" value={search.term} onChange={e => search.setTerm(e.target.value)} aria-label="Buscar productos" />
          </div>
        )}
      </header>

      <main id="top">
        {search.results ? (
          <section className="kt-wrap lb-results">
            <h2 className="lb-h2">Resultados <em>“{search.term}”</em></h2>
            {search.results.length ? <Rail items={search.results} s={s} /> : <p className="lb-empty">Sin resultados.</p>}
          </section>
        ) : (
          <>
            <section className="lb-hero">
              <div className="lb-hero__bg" data-parallax>{cover ? <Img src={cover} eager /> : <span className="kt-img--empty" />}</div>
              <div className="lb-hero__shade" aria-hidden="true" />
              <div className="lb-hero__in">
                <EditText path="hero.sticker" fallback={H.sticker} as="p" className="lb-kicker" />
                <h1 className="lb-hero__title">
                  <EditText path="hero.titleStart" fallback={H.titleStart} /> <em><EditText path="hero.titleEmphasis" fallback={H.titleEmphasis} /></em> <EditText path="hero.titleEnd" fallback={H.titleEnd} />
                </h1>
                <EditText path="hero.subtitle" fallback={H.subtitle} as="p" className="lb-hero__sub" multiline />
                <div className="lb-hero__ctas">
                  <button className="kt-btn lb-btn-light" onClick={() => story && scrollToSection(story.id)}><EditText path="hero.primaryCta" fallback={H.primaryCta} inButton /></button>
                  <button className="kt-btn lb-btn-line" onClick={() => s.wa.open()}><Icon name="whatsapp" size={18} /> <EditText path="hero.secondaryCta" fallback={H.secondaryCta} inButton /></button>
                </div>
              </div>
              <button className="lb-scroll" onClick={() => story && scrollToSection(story.id)} aria-label="Bajar a la colección"><span /></button>
            </section>

            {s.loading && <div className="kt-wrap lb-results"><Skeleton n={4} /></div>}
            {story && <Story sec={story} s={s} />}

            {s.content.ribbon?.length > 0 && (
              <div className="lb-marquee" aria-label={s.content.ribbon.join(', ')}>
                <div className="lb-marquee__track" aria-hidden="true">
                  {[0, 1].map(k => <span key={k}>{[...s.content.ribbon, ...s.content.ribbon].map((t, i) => <span key={i}>{t}<i>—</i></span>)}</span>)}
                </div>
              </div>
            )}

            {rest.map((sec, i) => (
              <section key={sec.id} id={`sec-${sec.id}`} className="lb-col">
                <header className="kt-wrap lb-col__head" data-reveal>
                  <span className="lb-col__n">{String(i + 2).padStart(2, '0')}</span>
                  <div>
                    <h2 className="lb-h2">{sec.title} <em>{sec.emphasis}</em>{!sec.title && !sec.emphasis && sec.name}</h2>
                    {sec.subtitle && <p className="lb-col__sub">{sec.subtitle}</p>}
                  </div>
                </header>
                <SectionBlock sec={sec}><Rail items={sec.items} s={s} /></SectionBlock>
              </section>
            ))}

            {s.content.story?.text && (
              <section className="kt-wrap lb-quote" data-reveal>
                <p className="lb-kicker lb-kicker--dark">{s.content.story.title} {s.content.story.titleEmphasis}</p>
                <blockquote>“{s.content.story.text}”</blockquote>
                {s.content.story.sign && <cite>— {s.content.story.sign}</cite>}
              </section>
            )}
          </>
        )}
      </main>

      <MarketingSections />

      {s.content.faq?.length > 0 && (
        <section className="kt-wrap lb-faq" id="preguntas">
          <h2 className="lb-h2" data-reveal>Preguntas <em>frecuentes</em></h2>
          <Faq items={s.content.faq} />
        </section>
      )}

      <Footer s={s} className="lb-foot" go={(id) => scrollToSection(id)} />
    </div>
  )
}

// La foto grande queda fija y cambia según el producto que estás leyendo
function Story({ sec, s }) {
  const [active, setActive] = useState(0)
  const list = useRef(null)
  useEffect(() => {
    const items = [...(list.current?.querySelectorAll('[data-i]') || [])]
    if (!items.length || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) setActive(Number(e.target.dataset.i)) }), { rootMargin: '-45% 0px -45% 0px' })
    items.forEach(i => io.observe(i))
    return () => io.disconnect()
  }, [sec.items.length])
  const items = sec.items.slice(0, 6)
  return (
    <section id={`sec-${sec.id}`} className="lb-story">
      <div className="lb-story__media" aria-hidden="true">
        {items.map((p, i) => <div key={p.id} className={`lb-story__img ${i === active ? 'is-on' : ''}`}><Img src={p.image} /></div>)}
        <div className="lb-story__dots">{items.map((p, i) => <i key={p.id} className={i === active ? 'is-on' : ''} />)}</div>
      </div>
      <div className="lb-story__list" ref={list}>
        <header className="lb-story__head" data-reveal>
          <span className="lb-col__n">01</span>
          <h2 className="lb-h2">{sec.title} <em>{sec.emphasis}</em>{!sec.title && !sec.emphasis && sec.name}</h2>
          {sec.subtitle && <p className="lb-col__sub">{sec.subtitle}</p>}
        </header>
        {items.map((p, i) => (
          <article key={p.id} data-i={i} className={`lb-look ${i === active ? 'is-on' : ''}`}>
            <div className="lb-look__img"><Img src={p.image} /></div>
            <p className="lb-look__n">Look {String(i + 1).padStart(2, '0')}</p>
            <h3>{p.name}</h3>
            {p.description && <p className="lb-look__desc">{p.description}</p>}
            <div className="lb-look__buy">
              <Price p={p} className="lb-look__price" />
              <button className="kt-btn kt-btn--solid lb-look__see" onClick={() => s.openProduct(p)}>Ver detalle <Icon name="arrow" size={17} /></button>
              <QuickAdd p={p} openProduct={s.openProduct} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

// Galería horizontal con flechas y barra de progreso
function Rail({ items, s }) {
  const ref = useRef(null)
  const [pct, setPct] = useState(0)
  const onScroll = () => { const e = ref.current; if (e) setPct(e.scrollWidth > e.clientWidth ? e.scrollLeft / (e.scrollWidth - e.clientWidth) : 1) }
  const move = (d) => { const e = ref.current; if (e) e.scrollBy({ left: d * e.clientWidth * 0.8, behavior: 'smooth' }) }
  return (
    <div className="lb-rail">
      <div className="lb-rail__track" ref={ref} onScroll={onScroll}>
        {items.map((p, i) => {
          const offer = activeOffer(p)
          return (
            <article key={p.id} className="lb-card" data-reveal="fade" style={{ '--d': `${Math.min(i, 4) * 0.07}s` }}>
              <button className="lb-card__img" onClick={() => s.openProduct(p)} aria-label={`Ver ${p.name}`}>
                <Img src={p.image} />
                {(offer || p.badge) && <span className="lb-card__tag">{offer ? `-${offer.percent}%` : p.badge}</span>}
                <span className="lb-card__hover" aria-hidden="true">Ver <Icon name="arrow" size={16} /></span>
              </button>
              <div className="lb-card__meta">
                <div><strong>{p.name}</strong><Price p={p} /></div>
                <QuickAdd p={p} openProduct={s.openProduct} />
              </div>
            </article>
          )
        })}
      </div>
      {items.length > 2 && (
        <div className="kt-wrap lb-rail__ctrl">
          <span className="lb-rail__bar"><i style={{ width: `${Math.max(8, pct * 100)}%` }} /></span>
          <button className="kt-ic" onClick={() => move(-1)} aria-label="Anterior" disabled={pct <= 0.01}><Icon name="chevronLeft" size={20} /></button>
          <button className="kt-ic" onClick={() => move(1)} aria-label="Siguiente" disabled={pct >= 0.99}><Icon name="chevron" size={20} /></button>
        </div>
      )}
    </div>
  )
}

// Paralaje suave de la portada
function useParallax(root) {
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const on = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const y = Math.min(window.scrollY, window.innerHeight)
        root.current?.querySelectorAll('[data-parallax]').forEach(el => { el.style.transform = `translate3d(0, ${y * 0.35}px, 0) scale(${1 + y / 4000})` })
      })
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [root])
}
