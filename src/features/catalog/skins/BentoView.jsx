// Estructura "Bento moderno" (tecnología, apps, marcas jóvenes):
// portada en mosaico de bloques de distintos tamaños con brillo que sigue al cursor,
// cinta de beneficios, categorías como pestañas y productos en cuadrícula bento.
import { useEffect, useMemo, useRef, useState } from 'react'
import EditText from '@/features/editor/EditText'
import Icon from '@/shared/ui/Icon'
import { MarketingSections } from '@/features/marketing/Boost'
import { activeOffer } from '@/lib/marketing'
import { useSkin, useSearch, Price } from './shared'
import { useRevealAll, useScrolled, usePointerGlow, CartButton, AdminButton, QuickAdd, Img, Faq, Skeleton, Footer, CountUp } from './kit'
import './Bento.css'

const ICONS = ['truck', 'card', 'chat', 'gift']

export default function BentoView({ onOpenDashboard }) {
  const s = useSkin()
  const root = useRef(null)
  const scrolled = useScrolled(20)
  const search = useSearch(s.products)
  const glow = usePointerGlow()
  const secs = s.sections.filter(x => x.items.length)
  const [tab, setTab] = useState('')
  useRevealAll(root)
  const H = s.content.hero
  const current = secs.find(x => x.id === tab) || null
  const list = search.results || (current ? current.items : s.products)
  const tiles = useMemo(() => [s.featured, ...s.products].filter(Boolean).filter((p, i, a) => a.findIndex(x => x.id === p.id) === i).slice(0, 3), [s.featured, s.products])
  const go = () => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
  const searchRef = useRef(null)
  // Atajo Ctrl/⌘ + K para buscar
  useEffect(() => {
    const on = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); searchRef.current?.focus() } }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  return (
    <div className="kt bn" ref={root}>
      <header className={`bn-head ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="kt-wrap bn-head__in">
          <a href="#top" className="bn-brand">
            <span className="bn-brand__dot" aria-hidden="true" />
            {s.brand.logo ? <img src={s.brand.logo} alt={s.brand.name} /> : <span>{s.brand.name}</span>}
          </a>
          <label className="bn-search">
            <Icon name="search" size={17} />
            <input ref={searchRef} type="search" placeholder="Buscar productos…" value={search.term} onChange={e => { search.setTerm(e.target.value); if (e.target.value) go() }} aria-label="Buscar productos" />
            <kbd aria-hidden="true">⌘K</kbd>
          </label>
          <div className="bn-head__actions">
            <AdminButton onOpenDashboard={onOpenDashboard} />
            <CartButton s={s} />
          </div>
        </div>
      </header>

      <main id="top">
        <section className="kt-wrap bn-bento" aria-label="Portada">
          <div className="bn-tile bn-tile--intro" {...glow} data-reveal>
            <EditText path="hero.sticker" fallback={H.sticker} as="p" className="bn-chip" />
            <h1 className="bn-title">
              <EditText path="hero.titleStart" fallback={H.titleStart} /> <span className="bn-grad"><EditText path="hero.titleEmphasis" fallback={H.titleEmphasis} /></span> <EditText path="hero.titleEnd" fallback={H.titleEnd} />
            </h1>
            <EditText path="hero.subtitle" fallback={H.subtitle} as="p" className="bn-sub" multiline />
            <div className="bn-ctas">
              <button className="kt-btn kt-btn--accent" onClick={go}><EditText path="hero.primaryCta" fallback={H.primaryCta} inButton /> <Icon name="arrow" size={18} /></button>
              <button className="kt-btn kt-btn--ghost" onClick={() => s.wa.open()}><Icon name="whatsapp" size={18} /> <EditText path="hero.secondaryCta" fallback={H.secondaryCta} inButton /></button>
            </div>
          </div>

          {tiles[0] && (
            <button className="bn-tile bn-tile--hero" onClick={() => s.openProduct(tiles[0])} {...glow} data-reveal="zoom" style={{ '--d': '.08s' }}>
              <Img src={tiles[0].image} eager />
              <span className="bn-tile__label"><small>{tiles[0].badge || 'Destacado'}</small><strong>{tiles[0].name}</strong><Price p={tiles[0]} /></span>
              <span className="bn-tile__go" aria-hidden="true"><Icon name="arrow" size={18} /></span>
            </button>
          )}

          {s.content.stats?.[0] && (
            <div className="bn-tile bn-tile--stat" {...glow} data-reveal style={{ '--d': '.14s' }}>
              <strong><CountUp value={s.content.stats[0].value} /></strong>
              <span>{s.content.stats[0].label}</span>
            </div>
          )}

          {tiles[1] && (
            <button className="bn-tile bn-tile--small" onClick={() => s.openProduct(tiles[1])} {...glow} data-reveal style={{ '--d': '.2s' }}>
              <Img src={tiles[1].image} />
              <span className="bn-tile__label bn-tile__label--sm"><strong>{tiles[1].name}</strong><Price p={tiles[1]} /></span>
            </button>
          )}

          <button className="bn-tile bn-tile--wa" onClick={() => s.wa.open()} {...glow} data-reveal style={{ '--d': '.26s' }}>
            <Icon name="whatsapp" size={28} />
            <strong>¿Dudas? <br />Te respondemos ya</strong>
            <span className="bn-tile__go" aria-hidden="true"><Icon name="arrow" size={18} /></span>
          </button>

          {secs.length > 1 && (
            <div className="bn-tile bn-tile--cats" {...glow} data-reveal style={{ '--d': '.32s' }}>
              <p className="bn-tile__k">Categorías</p>
              <div className="bn-catlist">
                {secs.slice(0, 6).map(x => (
                  <button key={x.id} onClick={() => { setTab(x.id); search.setTerm(''); go() }}>
                    <span>{x.emoji} {x.name}</span><small>{x.items.length}</small>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {s.content.highlights?.length > 0 && (
          <section className="kt-wrap bn-perks" aria-label="Beneficios">
            {s.content.highlights.slice(0, 4).map((h, i) => (
              <div key={h.id} data-reveal style={{ '--d': `${i * 0.06}s` }}>
                <span className="bn-perks__ic"><Icon name={ICONS[i]} size={20} /></span>
                <span><strong>{h.title}</strong><small>{h.text || (h.steps || [])[0]}</small></span>
              </div>
            ))}
          </section>
        )}

        <section className="kt-wrap bn-shop" id="productos">
          <header className="bn-shop__head">
            <h2 className="bn-h2" data-reveal>{search.results ? <>Resultados para <span className="bn-grad">“{search.term}”</span></> : current ? ([current.title, current.emphasis].filter(Boolean).join(' ') || current.name) : <>Todo el <span className="bn-grad">catálogo</span></>}</h2>
            <div className="bn-tabs" role="tablist" aria-label="Filtrar por categoría">
              <button role="tab" aria-selected={!tab && !search.results} className={!tab && !search.results ? 'is-on' : ''} onClick={() => { setTab(''); search.setTerm('') }}>Todo <small>{s.products.length}</small></button>
              {secs.map(x => <button key={x.id} role="tab" aria-selected={tab === x.id} className={tab === x.id ? 'is-on' : ''} onClick={() => { setTab(x.id); search.setTerm('') }}>{x.name} <small>{x.items.length}</small></button>)}
            </div>
          </header>
          {s.loading ? <Skeleton n={8} /> : list.length ? (
            <div className="bn-grid" key={tab + (search.term || '')}>
              {list.map((p, i) => <Card key={p.id} p={p} i={i} s={s} glow={glow} />)}
            </div>
          ) : <p className="bn-empty">No encontramos productos. Prueba con otra palabra.</p>}
        </section>

        {s.content.how?.length > 0 && (
          <section className="kt-wrap bn-how">
            <h2 className="bn-h2" data-reveal>Comprar es <span className="bn-grad">así de simple</span></h2>
            <ol>
              {s.content.how.map((h, i) => (
                <li key={i} className="bn-tile" {...glow} data-reveal style={{ '--d': `${i * 0.1}s` }}>
                  <span className="bn-how__n">{String(i + 1).padStart(2, '0')}</span>
                  <strong>{h.title}</strong>
                  <p>{h.text}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>

      <MarketingSections />

      {s.content.faq?.length > 0 && (
        <section className="kt-wrap bn-faq" id="preguntas">
          <h2 className="bn-h2" data-reveal>Preguntas <span className="bn-grad">frecuentes</span></h2>
          <Faq items={s.content.faq} />
        </section>
      )}

      <Footer s={s} className="bn-foot" />
    </div>
  )
}

// Cada 7 productos uno ocupa doble ancho: el mosaico se ve vivo y ordenado
function Card({ p, i, s, glow }) {
  const offer = activeOffer(p)
  const wide = i % 7 === 0
  return (
    <article className={`bn-card ${wide ? 'bn-card--wide' : ''}`} {...glow} data-reveal style={{ '--d': `${(i % 4) * 0.05}s` }}>
      <button className="bn-card__img" onClick={() => s.openProduct(p)} aria-label={`Ver ${p.name}`}>
        <Img src={p.image} />
        <span className="bn-card__tags">
          {offer && <em className="bn-tag bn-tag--hot">-{offer.percent}%</em>}
          {p.badge && <em className="bn-tag">{p.badge}</em>}
        </span>
      </button>
      <div className="bn-card__body">
        <button className="bn-card__name" onClick={() => s.openProduct(p)}>{p.name}</button>
        {wide && p.description && <p className="bn-card__desc">{p.description}</p>}
        <div className="bn-card__foot">
          {Number(p.price) > 0 ? <Price p={p} className="bn-card__price" /> : <span className="bn-card__price">A cotizar</span>}
          <QuickAdd p={p} openProduct={s.openProduct} />
        </div>
      </div>
    </article>
  )
}
