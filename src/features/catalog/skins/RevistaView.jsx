// Estructura "Revista con capítulos": portada de revista, índice, y cada categoría
// es un capítulo a pantalla completa que queda fijo mientras sus "páginas"
// (productos) suben por encima, con letra capital, citas y precio al margen.
import { useRef } from 'react'
import EditText from '@/features/editor/EditText'
import Icon from '@/shared/ui/Icon'
import { MarketingSections } from '@/features/marketing/Boost'
import SectionBlock from './SectionBlock'
import { useSkin, Price } from './shared'
import { useRevealAll, useScrolled, scrollToSection, CartButton, AdminButton, QuickAdd, Img, Faq, Skeleton, Footer } from './kit'
import { useFitText } from '@/features/portfolio/effects'
import './Revista.css'

const MONTH = () => new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

export default function RevistaView({ onOpenDashboard }) {
  const s = useSkin()
  const root = useRef(null)
  const scrolled = useScrolled(60)
  useRevealAll(root)
  const H = s.content.hero
  const secs = s.sections.filter(x => x.items.length)
  const cover = s.featured || s.products[0]
  const [mastBox, mastInner] = useFitText(s.brand.name || '')

  return (
    <div className="kt ch" ref={root}>
      <header className={`ch-head ${scrolled ? 'is-on' : ''}`}>
        <div className="ch-head__in">
          <a href="#top" className="ch-head__brand">{s.brand.name}</a>
          <nav className="ch-head__nav" aria-label="Capítulos">
            {secs.slice(0, 5).map((x, i) => <button key={x.id} onClick={() => scrollToSection(x.id)}><span>{String(i + 1).padStart(2, '0')}</span> {x.name}</button>)}
          </nav>
          <div className="ch-head__actions"><AdminButton onOpenDashboard={onOpenDashboard} /><CartButton s={s} /></div>
        </div>
      </header>

      <main id="top">
        {/* Portada */}
        <section className="ch-cover">
          <div className="ch-cover__img">{cover && <Img src={cover.image} eager />}</div>
          <div className="ch-cover__shade" aria-hidden="true" />
          <div className="ch-cover__top">
            <p className="ch-cover__issue"><span>Edición {MONTH()}</span><span>{s.brand.city || 'Catálogo'}</span></p>
            {(s.brand.name || '').length > 16
              ? <h1 className="ch-mast ch-mast--long">{s.brand.name}</h1>
              : <h1 className="ch-mast" ref={mastBox}><span ref={mastInner}>{s.brand.name}</span></h1>}
          </div>
          <div className="ch-cover__lines">
            <EditText path="hero.sticker" fallback={H.sticker} as="p" className="ch-cover__kicker" />
            <p className="ch-cover__head"><EditText path="hero.titleStart" fallback={H.titleStart} /> <em><EditText path="hero.titleEmphasis" fallback={H.titleEmphasis} /></em> <EditText path="hero.titleEnd" fallback={H.titleEnd} /></p>
            <ul>
              {secs.slice(0, 4).map((x, i) => <li key={x.id}><button onClick={() => scrollToSection(x.id)}><b>{String(i + 1).padStart(2, '0')}</b> {x.name} <Icon name="arrow" size={16} /></button></li>)}
            </ul>
          </div>
          {cover && <button className="ch-cover__tag" onClick={() => s.openProduct(cover)}><small>En portada</small><strong>{cover.name}</strong><Price p={cover} /></button>}
        </section>

        {/* Índice */}
        <section className="ch-toc">
          <div className="ch-toc__in">
            <p className="ch-kicker">Índice</p>
            <EditText path="hero.subtitle" fallback={H.subtitle} as="p" className="ch-toc__lead" multiline />
            <ol>
              {secs.map((x, i) => (
                <li key={x.id} data-reveal style={{ '--d': `${i * 0.06}s` }}>
                  <button onClick={() => scrollToSection(x.id)}>
                    <span className="ch-toc__n">{String(i + 1).padStart(2, '0')}</span>
                    <span className="ch-toc__t">{x.name}</span>
                    <span className="ch-toc__dots" aria-hidden="true" />
                    <span className="ch-toc__p">{x.items.length} {x.items.length === 1 ? 'pieza' : 'piezas'}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {s.loading && <div className="kt-wrap"><Skeleton n={3} /></div>}

        {/* Capítulos */}
        {secs.map((sec, ci) => (
          <section key={sec.id} id={`sec-${sec.id}`} className="ch-chapter">
            <div className="ch-opener">
              <div className="ch-opener__img"><Img src={sec.items[0]?.image} /></div>
              <div className="ch-opener__shade" aria-hidden="true" />
              <div className="ch-opener__text">
                <span className="ch-opener__n">Capítulo {String(ci + 1).padStart(2, '0')}</span>
                <h2>{sec.title || sec.name} <em>{sec.emphasis}</em></h2>
                {sec.subtitle && <p>{sec.subtitle}</p>}
              </div>
            </div>
            <div className="ch-pages">
              <SectionBlock sec={sec}>{sec.items.map((p, i) => <Page key={p.id} p={p} i={i} s={s} />)}</SectionBlock>
            </div>
          </section>
        ))}

        {s.content.story?.text && (
          <section className="ch-letter" data-reveal>
            <p className="ch-kicker">Carta del editor</p>
            <p className="ch-letter__text"><span className="ch-drop">{s.content.story.text.charAt(0)}</span>{s.content.story.text.slice(1)}</p>
            {s.content.story.sign && <p className="ch-letter__sign">{s.content.story.sign}</p>}
          </section>
        )}
      </main>

      <MarketingSections />
      {s.content.faq?.length > 0 && <section className="kt-wrap ch-faq"><h2>Preguntas <em>frecuentes</em></h2><Faq items={s.content.faq} /></section>}
      <Footer s={s} className="ch-foot" go={(id) => scrollToSection(id)} />
    </div>
  )
}

// Cada producto es una página con composición distinta (3 variantes que se alternan)
function Page({ p, i, s }) {
  const v = i % 3
  const desc = p.description || ''
  return (
    <article className={`ch-page ch-page--${v}`}>
      <button className="ch-page__img" onClick={() => s.openProduct(p)} aria-label={`Ver ${p.name}`} data-reveal={v === 1 ? 'right' : 'left'}>
        <Img src={p.image} />
        <span className="ch-page__folio" aria-hidden="true">p. {String(i + 1).padStart(2, '0')}</span>
      </button>
      <div className="ch-page__text" data-reveal style={{ '--d': '.12s' }}>
        {p.badge && <p className="ch-kicker">{p.badge}</p>}
        <h3>{p.name}</h3>
        {desc && (v === 2
          ? <blockquote className="ch-pull">“{desc}”</blockquote>
          : desc.length > 110
            ? <p className="ch-page__desc"><span className="ch-drop">{desc.charAt(0)}</span>{desc.slice(1)}</p>
            : <p className="ch-page__desc ch-page__desc--lead">{desc}</p>)}
        <div className="ch-page__buy">
          <Price p={p} className="ch-page__price" />
          <button className="ch-link" onClick={() => s.openProduct(p)}>Leer más <Icon name="arrow" size={16} /></button>
          <QuickAdd p={p} openProduct={s.openProduct} icon="cart" />
        </div>
      </div>
    </article>
  )
}
