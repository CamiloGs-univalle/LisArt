// Estructura "Menú / Carta" (restaurantes, cafés, comidas rápidas, postres):
// portada con plato estrella, pestañas de categoría fijas que siguen el scroll,
// favoritos en carrusel y platos en filas tipo app de domicilios.
import { useRef } from 'react'
import EditText from '@/features/editor/EditText'
import Icon from '@/shared/ui/Icon'
import { MarketingSections } from '@/features/marketing/Boost'
import { activeOffer } from '@/lib/marketing'
import SectionBlock from './SectionBlock'
import { useSkin, useSearch, Price } from './shared'
import { useRevealAll, useScrollSpy, scrollToSection, useScrolled, CartButton, AdminButton, QuickAdd, Img, Faq, Skeleton, Footer, CountUp } from './kit'
import './Menu.css'

export default function MenuView({ onOpenDashboard }) {
  const s = useSkin()
  const root = useRef(null)
  const tabs = useRef(null)
  const search = useSearch(s.products)
  const scrolled = useScrolled(40)
  useRevealAll(root)
  const H = s.content.hero
  const secs = s.sections.filter(x => x.items.length)
  const [active, setActive] = useScrollSpy(secs.map(x => x.id))
  const hero = s.featured
  // La primera categoría (los favoritos) se muestra como carrusel de fotos grandes
  const rail = secs[0] && secs[0].items.length >= 3 && secs.length > 1 ? secs[0] : null

  const go = (id) => {
    setActive(id)
    scrollToSection(id)
    tabs.current?.querySelector(`[data-id="${id}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }

  return (
    <div className="kt mn" ref={root}>
      <header className={`mn-head ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="kt-wrap mn-head__in">
          <a href="#top" className="mn-brand">
            {s.brand.logo ? <img src={s.brand.logo} alt="" /> : <span className="mn-brand__mono">{(s.brand.name || '?').slice(0, 1)}</span>}
            <span><strong>{s.brand.name}</strong>{s.brand.city && <small><Icon name="pin" size={12} /> {s.brand.city}</small>}</span>
          </a>
          <div className="mn-head__actions">
            <AdminButton onOpenDashboard={onOpenDashboard} />
            <CartButton s={s} />
          </div>
        </div>
      </header>

      <main id="top">
        <section className="kt-wrap mn-hero">
          <div className="mn-hero__text">
            <EditText path="hero.sticker" fallback={H.sticker} as="p" className="mn-pill" />
            <h1 className="mn-hero__title" data-reveal>
              <EditText path="hero.titleStart" fallback={H.titleStart} /> <em><EditText path="hero.titleEmphasis" fallback={H.titleEmphasis} /></em> <EditText path="hero.titleEnd" fallback={H.titleEnd} />
            </h1>
            <EditText path="hero.subtitle" fallback={H.subtitle} as="p" className="mn-hero__sub" multiline />
            <div className="mn-hero__ctas" data-reveal style={{ '--d': '.1s' }}>
              <button className="kt-btn kt-btn--accent" onClick={() => secs[0] && go(secs[0].id)}><Icon name="list" size={18} /> <EditText path="hero.primaryCta" fallback={H.primaryCta} inButton /></button>
              <button className="kt-btn kt-btn--ghost" onClick={() => s.wa.open()}><Icon name="whatsapp" size={18} /> <EditText path="hero.secondaryCta" fallback={H.secondaryCta} inButton /></button>
            </div>
            {s.content.stats?.length > 0 && (
              <dl className="mn-stats" data-reveal style={{ '--d': '.2s' }}>
                {s.content.stats.slice(0, 3).map((x, i) => <div key={i}><dt><CountUp value={x.value} /></dt><dd>{x.label}</dd></div>)}
              </dl>
            )}
          </div>
          {hero && (
            <button className="mn-hero__dish" onClick={() => s.openProduct(hero)} aria-label={`Ver ${hero.name}`} data-reveal="zoom">
              <span className="mn-hero__plate"><Img src={hero.image} eager /></span>
              <span className="mn-hero__ring" aria-hidden="true">
                <svg viewBox="0 0 200 200"><defs><path id="mn-c" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" /></defs><text><textPath href="#mn-c">★ RECOMENDADO DE LA CASA ★ HECHO AL MOMENTO </textPath></text></svg>
              </span>
              <span className="mn-hero__tag"><small>Plato estrella</small><strong>{hero.name}</strong><Price p={hero} /></span>
            </button>
          )}
        </section>

        <nav className={`mn-tabs ${scrolled ? 'is-stuck' : ''}`} aria-label="Categorías del menú">
          <div className="kt-wrap mn-tabs__in" ref={tabs}>
            <label className="mn-search">
              <Icon name="search" size={17} />
              <input type="search" placeholder="Buscar en el menú" value={search.term} onChange={e => search.setTerm(e.target.value)} aria-label="Buscar en el menú" />
            </label>
            {!search.results && secs.map(x => (
              <button key={x.id} data-id={x.id} className={active === x.id ? 'is-on' : ''} aria-current={active === x.id} onClick={() => go(x.id)}>
                {x.emoji && <span aria-hidden="true">{x.emoji}</span>} {x.name} <small>{x.items.length}</small>
              </button>
            ))}
          </div>
        </nav>

        {search.results ? (
          <section className="kt-wrap mn-sec">
            <header className="mn-sec__head"><h2>Resultados para “{search.term}”</h2><button className="mn-link" onClick={() => search.setTerm('')}>Limpiar</button></header>
            {search.results.length ? <Rows items={search.results} s={s} /> : <p className="mn-empty">No encontramos ese plato. Prueba con otra palabra.</p>}
          </section>
        ) : (
          <>
            {s.loading && <div className="kt-wrap mn-sec"><Skeleton n={6} /></div>}
            {rail && (
              <section className="mn-favs" id={`sec-${rail.id}`} aria-label={rail.name}>
                <header className="kt-wrap mn-sec__head" data-reveal>
                  <h2>{rail.emoji && <span aria-hidden="true">{rail.emoji}</span>} {[rail.title, rail.emphasis].filter(Boolean).join(' ') || rail.name}</h2>
                  {rail.subtitle && <p>{rail.subtitle}</p>}
                </header>
                <div className="mn-rail">
                  {rail.items.map((p, i) => (
                    <article key={p.id} className="mn-fav" data-reveal style={{ '--d': `${Math.min(i, 5) * 0.06}s` }}>
                      <button className="mn-fav__img" onClick={() => s.openProduct(p)} aria-label={`Ver ${p.name}`}>
                        <Img src={p.image} />
                        {activeOffer(p) && <span className="mn-off">-{activeOffer(p).percent}%</span>}
                      </button>
                      <div className="mn-fav__body">
                        <strong>{p.name}</strong>
                        <Price p={p} />
                      </div>
                      <QuickAdd p={p} openProduct={s.openProduct} className="mn-fav__add" />
                    </article>
                  ))}
                </div>
              </section>
            )}

            {secs.filter(x => x !== rail).map(sec => (
              <section key={sec.id} id={`sec-${sec.id}`} className="kt-wrap mn-sec">
                <header className="mn-sec__head" data-reveal>
                  <h2>{sec.emoji && <span aria-hidden="true">{sec.emoji}</span>} {[sec.title, sec.emphasis].filter(Boolean).join(' ') || sec.name}</h2>
                  {sec.subtitle && <p>{sec.subtitle}</p>}
                </header>
                <SectionBlock sec={sec}><Rows items={sec.items} s={s} /></SectionBlock>
              </section>
            ))}

            {s.content.how?.length > 0 && (
              <section className="kt-wrap mn-how" aria-label="Cómo pedir">
                <h2 data-reveal>Pedir es <em>facilísimo</em></h2>
                <ol>
                  {s.content.how.map((h, i) => (
                    <li key={i} data-reveal style={{ '--d': `${i * 0.08}s` }}>
                      <span className="mn-how__n">{i + 1}</span>
                      <strong>{h.title}</strong>
                      <p>{h.text}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </>
        )}
      </main>

      <MarketingSections />

      {s.content.faq?.length > 0 && (
        <section className="kt-wrap mn-sec mn-faq" id="preguntas">
          <header className="mn-sec__head"><h2>Preguntas frecuentes</h2></header>
          <Faq items={s.content.faq} />
        </section>
      )}

      <Footer s={s} className="mn-foot" go={go} />
    </div>
  )
}

// Platos en filas: texto a la izquierda, foto cuadrada con botón + a la derecha
function Rows({ items, s }) {
  return (
    <div className="mn-rows">
      {items.map((p, i) => {
        const offer = activeOffer(p)
        return (
          <article key={p.id} className="mn-row" data-reveal style={{ '--d': `${(i % 6) * 0.04}s` }}>
            <button className="mn-row__main" onClick={() => s.openProduct(p)}>
              <span className="mn-row__text">
                <strong>{p.name}</strong>
                {p.description && <small>{p.description}</small>}
                <span className="mn-row__price">
                  <Price p={p} />
                  {p.badge && <em className="mn-badge">{p.badge}</em>}
                </span>
              </span>
              <span className="mn-row__img">
                <Img src={p.image} />
                {offer && <span className="mn-off">-{offer.percent}%</span>}
              </span>
            </button>
            <QuickAdd p={p} openProduct={s.openProduct} className="mn-row__add" />
          </article>
        )
      })}
    </div>
  )
}
