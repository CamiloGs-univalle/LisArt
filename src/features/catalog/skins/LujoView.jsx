// Estructura "Boutique de lujo" (joyería, perfumes, relojes, marcas premium):
// siempre en tono oscuro y dorado (sale de los colores del negocio), letras finas,
// marco en arco, piezas numeradas en zigzag y animaciones lentas.
import { useRef, useState } from 'react'
import EditText from '@/features/editor/EditText'
import Icon from '@/shared/ui/Icon'
import { MarketingSections } from '@/features/marketing/Boost'
import { useSkin, useSearch, Price } from './shared'
import { useRevealAll, useScrolled, scrollToSection, CartButton, AdminButton, QuickAdd, Img, Faq, Skeleton, Footer } from './kit'
import './Lujo.css'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI']

export default function LujoView({ onOpenDashboard }) {
  const s = useSkin()
  const root = useRef(null)
  const scrolled = useScrolled(40)
  const search = useSearch(s.products)
  const [searching, setSearching] = useState(false)
  const [cat, setCat] = useState('')
  useRevealAll(root)
  const H = s.content.hero
  const secs = s.sections.filter(x => x.items.length)
  const icons = s.products.filter(p => p.featured || p.badge).concat(s.products).filter((p, i, a) => a.findIndex(x => x.id === p.id) === i).slice(0, 3)
  const pool = search.results || (cat ? secs.find(x => x.id === cat)?.items || [] : s.products)
  const cover = s.featured || s.products[0]

  return (
    <div className="lj-root">
      <div className="kt lj" ref={root}>
        <header className={`lj-head ${scrolled ? 'is-scrolled' : ''}`}>
          <div className="lj-head__in">
            <nav className="lj-nav" aria-label="Secciones">
              <button onClick={() => scrollToSection('coleccion', '')}>Colección</button>
              {s.content.how?.length > 0 && <button onClick={() => scrollToSection('casa', '')}>La casa</button>}
              <button onClick={() => s.wa.open('Hola {negocio} ✨ Quisiera una asesoría personalizada.')}>Asesoría</button>
            </nav>
            <a href="#top" className="lj-brand">{s.brand.logo ? <img src={s.brand.logo} alt={s.brand.name} /> : s.brand.name}</a>
            <div className="lj-head__actions">
              <button className="kt-ic" onClick={() => setSearching(v => !v)} aria-label="Buscar" aria-expanded={searching}><Icon name={searching ? 'close' : 'search'} size={19} /></button>
              <AdminButton onOpenDashboard={onOpenDashboard} />
              <CartButton s={s} />
            </div>
          </div>
          {searching && (
            <div className="lj-search"><input autoFocus type="search" placeholder="¿Qué pieza buscas?" value={search.term} onChange={e => { search.setTerm(e.target.value); scrollToSection('coleccion', '') }} aria-label="Buscar" /></div>
          )}
        </header>

        <main id="top">
          <section className="lj-hero">
            <div className="lj-hero__text">
              <EditText path="hero.sticker" fallback={H.sticker} as="p" className="lj-kicker" />
              <h1 className="lj-hero__title">
                <EditText path="hero.titleStart" fallback={H.titleStart} /> <em><EditText path="hero.titleEmphasis" fallback={H.titleEmphasis} /></em> <EditText path="hero.titleEnd" fallback={H.titleEnd} />
              </h1>
              <span className="lj-rule" aria-hidden="true" />
              <EditText path="hero.subtitle" fallback={H.subtitle} as="p" className="lj-hero__sub" multiline />
              <div className="lj-hero__ctas">
                <button className="lj-btn lj-btn--gold" onClick={() => scrollToSection('coleccion', '')}><EditText path="hero.primaryCta" fallback={H.primaryCta} inButton /></button>
                <button className="lj-btn" onClick={() => s.wa.open('Hola {negocio} ✨ Quisiera una asesoría personalizada.')}><EditText path="hero.secondaryCta" fallback={H.secondaryCta} inButton /></button>
              </div>
            </div>
            {cover && (
              <button className="lj-arch" onClick={() => s.openProduct(cover)} aria-label={`Ver ${cover.name}`}>
                <span className="lj-arch__frame"><Img src={cover.image} eager /></span>
                <span className="lj-arch__line" aria-hidden="true" />
                <span className="lj-arch__cap"><small>Pieza destacada</small>{cover.name}</span>
              </button>
            )}
          </section>

          {icons.length >= 2 && (
            <section className="lj-icons" aria-label="Piezas icónicas">
              <header className="lj-sec__head" data-reveal>
                <p className="lj-kicker">Piezas icónicas</p>
                <h2 className="lj-h2">Lo más <em>deseado</em></h2>
              </header>
              {icons.map((p, i) => (
                <article key={p.id} className={`lj-zig ${i % 2 ? 'is-rev' : ''}`}>
                  <button className="lj-zig__img" onClick={() => s.openProduct(p)} aria-label={`Ver ${p.name}`} data-reveal={i % 2 ? 'right' : 'left'}>
                    <Img src={p.image} />
                  </button>
                  <div className="lj-zig__text" data-reveal style={{ '--d': '.15s' }}>
                    <span className="lj-zig__n">{ROMAN[i]}</span>
                    <h3>{p.name}</h3>
                    {p.description && <p>{p.description}</p>}
                    <Price p={p} className="lj-price" />
                    <div className="lj-zig__ctas">
                      <button className="lj-btn lj-btn--gold" onClick={() => s.openProduct(p)}>Descubrir</button>
                      <QuickAdd p={p} openProduct={s.openProduct} icon="cart" />
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}

          <section className="lj-col" id="coleccion">
            <header className="lj-sec__head" data-reveal>
              <p className="lj-kicker">{search.results ? 'Resultados' : 'La colección'}</p>
              <h2 className="lj-h2">{search.results ? <>“{search.term}”</> : <>Cada pieza, <em>una historia</em></>}</h2>
            </header>
            {!search.results && secs.length > 1 && (
              <div className="lj-tabs" role="tablist" aria-label="Colecciones">
                <button role="tab" aria-selected={!cat} className={!cat ? 'is-on' : ''} onClick={() => setCat('')}>Todo</button>
                {secs.map(x => <button key={x.id} role="tab" aria-selected={cat === x.id} className={cat === x.id ? 'is-on' : ''} onClick={() => setCat(x.id)}>{x.name}</button>)}
              </div>
            )}
            {s.loading ? <Skeleton n={6} /> : pool.length ? (
              <div className="lj-grid" key={cat + (search.term || '')}>
                {pool.map((p, i) => (
                  <article key={p.id} className="lj-card" data-reveal style={{ '--d': `${(i % 3) * 0.1}s` }}>
                    <button className="lj-card__img" onClick={() => s.openProduct(p)} aria-label={`Ver ${p.name}`}>
                      <Img src={p.image} />
                      <span className="lj-card__hover" aria-hidden="true">Descubrir</span>
                      {p.badge && <span className="lj-card__badge">{p.badge}</span>}
                    </button>
                    <h3 className="lj-card__name">{p.name}</h3>
                    <Price p={p} className="lj-price lj-price--sm" />
                  </article>
                ))}
              </div>
            ) : <p className="lj-empty">No encontramos esa pieza. Escríbenos y la buscamos por ti.</p>}
          </section>

          {s.content.how?.length > 0 && (
            <section className="lj-house" id="casa">
              <header className="lj-sec__head" data-reveal>
                <p className="lj-kicker">La experiencia</p>
                <h2 className="lj-h2">Atención <em>a tu medida</em></h2>
              </header>
              <ol>
                {s.content.how.map((h, i) => (
                  <li key={i} data-reveal style={{ '--d': `${i * 0.12}s` }}>
                    <span>{ROMAN[i]}</span>
                    <strong>{h.title}</strong>
                    <p>{h.text}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {s.content.story?.text && (
            <section className="lj-quote" data-reveal>
              <span className="lj-quote__mark" aria-hidden="true">“</span>
              <blockquote>{s.content.story.text}</blockquote>
              {s.content.story.sign && <cite>{s.content.story.sign}</cite>}
            </section>
          )}

          <section className="lj-advice" data-reveal>
            <div>
              <p className="lj-kicker">Asesoría privada</p>
              <h2 className="lj-h2">¿Buscas algo <em>especial</em>?</h2>
              <p>Te acompañamos a elegir la pieza perfecta, con atención personalizada por WhatsApp.</p>
            </div>
            <button className="lj-btn lj-btn--gold" onClick={() => s.wa.open('Hola {negocio} ✨ Quisiera una asesoría personalizada.')}><Icon name="whatsapp" size={18} /> Hablar con un asesor</button>
          </section>
        </main>

        <MarketingSections />

        {s.content.faq?.length > 0 && (
          <section className="lj-faq" id="preguntas">
            <h2 className="lj-h2" data-reveal>Preguntas <em>frecuentes</em></h2>
            <Faq items={s.content.faq} />
          </section>
        )}

        <Footer s={s} className="lj-foot" />
      </div>
    </div>
  )
}
