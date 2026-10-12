// Estructura "Servicios y citas" (belleza, spa, consultorios, profesionales, talleres):
// portada con collage y tarjeta flotante, servicios con duración y precio,
// proceso paso a paso, beneficios y una franja final para agendar.
import { useRef, useState } from 'react'
import EditText from '@/features/editor/EditText'
import Icon from '@/shared/ui/Icon'
import { formatPrice } from '@/lib/format'
import { MarketingSections } from '@/features/marketing/Boost'
import { activeOffer } from '@/lib/marketing'
import SectionBlock from './SectionBlock'
import { useSkin, useSearch } from './shared'
import { useRevealAll, useScrolled, scrollToSection, CartButton, AdminButton, QuickAdd, Img, Faq, Skeleton, Footer, CountUp } from './kit'
import './Servicios.css'

const ICONS = ['sparkle', 'heart', 'calendar', 'gift']

export default function ServiciosView({ onOpenDashboard }) {
  const s = useSkin()
  const root = useRef(null)
  const scrolled = useScrolled(30)
  const search = useSearch(s.products)
  const [menu, setMenu] = useState(false)
  const [tab, setTab] = useState('all')
  useRevealAll(root)
  const H = s.content.hero
  const secs = s.sections.filter(x => x.items.length)
  const pics = [s.featured, ...s.products].filter(p => p?.image).filter((p, i, a) => a.findIndex(x => x.id === p.id) === i).slice(0, 3)
  const shown = tab === 'all' ? secs : secs.filter(x => x.id === tab)
  const book = (p) => s.wa.open(p
    ? `Hola {negocio} 👋 Quiero agendar *${p.name}*${p.duration ? ` (${p.duration})` : ''}. ¿Qué horarios tienes disponibles?`
    : 'Hola {negocio} 👋 Quiero agendar una cita. ¿Qué horarios tienes disponibles?')
  const go = (id) => { setMenu(false); if (secs.some(x => x.id === id)) { setTab('all'); setTimeout(() => scrollToSection(id), 30) } else scrollToSection(id) }

  return (
    <div className="kt sc" ref={root}>
      <header className={`sc-head ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="kt-wrap sc-head__in">
          <a href="#top" className="sc-brand">{s.brand.logo && <img src={s.brand.logo} alt="" />}<span>{s.brand.name}</span></a>
          <nav className="sc-nav" aria-label="Secciones">
            {secs.slice(0, 4).map(x => <button key={x.id} onClick={() => go(x.id)}>{x.name}</button>)}
            {s.content.how?.length > 0 && <button onClick={() => go('proceso')}>Cómo funciona</button>}
            {s.content.faq?.length > 0 && <button onClick={() => go('preguntas')}>Preguntas</button>}
          </nav>
          <div className="sc-head__actions">
            <AdminButton onOpenDashboard={onOpenDashboard} />
            <CartButton s={s} />
            <button className="kt-btn kt-btn--solid sc-book" onClick={() => book()}><Icon name="calendar" size={17} /> Agendar</button>
            <button className="kt-ic sc-burger" onClick={() => setMenu(true)} aria-label="Abrir menú"><Icon name="list" size={22} /></button>
          </div>
        </div>
      </header>

      {menu && (
        <div className="sc-menu" role="dialog" aria-modal="true" aria-label="Menú" onClick={() => setMenu(false)}>
          <nav className="sc-menu__panel" onClick={e => e.stopPropagation()}>
            <button className="kt-ic" onClick={() => setMenu(false)} aria-label="Cerrar menú"><Icon name="close" /></button>
            {secs.map((x, i) => <button key={x.id} className="sc-menu__link" style={{ '--d': `${i * 0.04}s` }} onClick={() => go(x.id)}>{x.name}<Icon name="arrow" size={18} /></button>)}
            {s.content.how?.length > 0 && <button className="sc-menu__link" onClick={() => go('proceso')}>Cómo funciona<Icon name="arrow" size={18} /></button>}
            <button className="kt-btn kt-btn--wa" onClick={() => book()}><Icon name="whatsapp" size={18} /> Agendar por WhatsApp</button>
          </nav>
        </div>
      )}

      <main id="top">
        <section className="kt-wrap sc-hero">
          <div className="sc-hero__text">
            <EditText path="hero.sticker" fallback={H.sticker} as="p" className="sc-eyebrow" />
            <h1 className="sc-hero__title" data-reveal>
              <EditText path="hero.titleStart" fallback={H.titleStart} /> <em><EditText path="hero.titleEmphasis" fallback={H.titleEmphasis} /></em> <EditText path="hero.titleEnd" fallback={H.titleEnd} />
            </h1>
            <EditText path="hero.subtitle" fallback={H.subtitle} as="p" className="sc-hero__sub" multiline />
            <div className="sc-hero__ctas" data-reveal style={{ '--d': '.1s' }}>
              <button className="kt-btn kt-btn--accent" onClick={() => book()}><Icon name="calendar" size={18} /> <EditText path="hero.secondaryCta" fallback={H.secondaryCta} inButton /></button>
              <button className="kt-btn kt-btn--ghost" onClick={() => secs[0] && go(secs[0].id)}><EditText path="hero.primaryCta" fallback={H.primaryCta} inButton /> <Icon name="arrowDown" size={18} /></button>
            </div>
            {s.content.stats?.length > 0 && (
              <dl className="sc-trust" data-reveal style={{ '--d': '.2s' }}>
                {s.content.stats.slice(0, 3).map((x, i) => <div key={i}><dt><CountUp value={x.value} /></dt><dd>{x.label}</dd></div>)}
              </dl>
            )}
          </div>
          <div className="sc-hero__art" aria-hidden="true">
            {pics.map((p, i) => <span key={p.id} className={`sc-pic sc-pic--${i}`} data-reveal="zoom" style={{ '--d': `${0.1 + i * 0.12}s` }}><Img src={p.image} eager /></span>)}
            <span className="sc-float" data-reveal style={{ '--d': '.5s' }}>
              <span className="sc-float__ic"><Icon name="calendar" size={18} /></span>
              <span><small>Agenda abierta</small><strong>Reserva por WhatsApp</strong></span>
            </span>
            {pics[0] && (
              <span className="sc-float sc-float--b" data-reveal style={{ '--d': '.65s' }}>
                <span className="sc-stars">★★★★★</span><small>Clientes felices</small>
              </span>
            )}
          </div>
        </section>

        {s.content.ribbon?.length > 0 && (
          <div className="sc-marquee" aria-label={s.content.ribbon.join(', ')}>
            <div className="sc-marquee__track" aria-hidden="true">
              {[0, 1].map(k => <span key={k}>{[...s.content.ribbon, ...s.content.ribbon].map((t, i) => <span key={i}>{t}<i>✦</i></span>)}</span>)}
            </div>
          </div>
        )}

        <section className="kt-wrap sc-services" id="servicios">
          <header className="sc-sec__head" data-reveal>
            <p className="sc-eyebrow">Nuestros servicios</p>
            <h2 className="sc-h2">Elige lo que <em>necesitas</em></h2>
          </header>
          <div className="sc-filter" role="tablist" aria-label="Categorías">
            <button role="tab" aria-selected={tab === 'all'} className={tab === 'all' ? 'is-on' : ''} onClick={() => setTab('all')}>Todo</button>
            {secs.map(x => <button key={x.id} role="tab" aria-selected={tab === x.id} className={tab === x.id ? 'is-on' : ''} onClick={() => setTab(x.id)}>{x.name}</button>)}
            <label className="sc-find"><Icon name="search" size={16} /><input type="search" placeholder="Buscar" value={search.term} onChange={e => search.setTerm(e.target.value)} aria-label="Buscar servicios" /></label>
          </div>
          {s.loading && <Skeleton n={6} />}
          {search.results ? (
            <Cards items={search.results} s={s} book={book} />
          ) : shown.map(sec => (
            <div key={sec.id} id={`sec-${sec.id}`} className="sc-group">
              <h3 className="sc-group__title" data-reveal>{sec.emoji && <span aria-hidden="true">{sec.emoji}</span>} {sec.name}{sec.subtitle && <small>{sec.subtitle}</small>}</h3>
              <SectionBlock sec={sec}><Cards items={sec.items} s={s} book={book} /></SectionBlock>
            </div>
          ))}
          {search.results && !search.results.length && <p className="sc-empty">No encontramos ese servicio.</p>}
        </section>

        {s.content.how?.length > 0 && (
          <section className="sc-process" id="sec-proceso">
            <div className="kt-wrap">
              <header className="sc-sec__head sc-sec__head--center" data-reveal>
                <p className="sc-eyebrow">Así de fácil</p>
                <h2 className="sc-h2">Cómo <em>funciona</em></h2>
              </header>
              <ol className="sc-steps">
                {s.content.how.map((h, i) => (
                  <li key={i} data-reveal style={{ '--d': `${i * 0.12}s` }}>
                    <span className="sc-steps__n">0{i + 1}</span>
                    <strong>{h.title}</strong>
                    <p>{h.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {s.content.highlights?.length > 0 && (
          <section className="kt-wrap sc-perks" aria-label="Por qué elegirnos">
            {s.content.highlights.slice(0, 4).map((h, i) => (
              <div key={h.id} data-reveal style={{ '--d': `${i * 0.08}s` }}>
                <span className="sc-perks__ic"><Icon name={ICONS[i]} size={22} /></span>
                <strong>{h.title}</strong>
                <p>{h.text || (h.steps || []).join(' ')}</p>
              </div>
            ))}
          </section>
        )}
      </main>

      <MarketingSections />

      {s.content.faq?.length > 0 && (
        <section className="kt-wrap sc-faq" id="sec-preguntas">
          <header className="sc-sec__head" data-reveal><p className="sc-eyebrow">Resolvemos tus dudas</p><h2 className="sc-h2">Preguntas <em>frecuentes</em></h2></header>
          <Faq items={s.content.faq} />
        </section>
      )}


      <Footer s={s} className="sc-foot" go={go} />
    </div>
  )
}

function Cards({ items, s, book }) {
  return (
    <div className="sc-cards">
      {items.map((p, i) => {
        const offer = activeOffer(p)
        return (
          <article key={p.id} className="sc-card" data-reveal style={{ '--d': `${(i % 3) * 0.07}s` }}>
            <button className="sc-card__img" onClick={() => s.openProduct(p)} aria-label={`Ver ${p.name}`}>
              <Img src={p.image} />
              {(p.badge || offer) && <span className="sc-card__badge">{offer ? `-${offer.percent}%` : p.badge}</span>}
            </button>
            <div className="sc-card__body">
              <div className="sc-card__meta">
                {p.duration && <span><Icon name="clock" size={14} /> {p.duration}</span>}
                {p.category && <span>{p.category}</span>}
              </div>
              <button className="sc-card__name" onClick={() => s.openProduct(p)}>{p.name}</button>
              {p.description && <p className="sc-card__desc">{p.description}</p>}
              <div className="sc-card__foot">
                <p className="sc-card__price">
                  {Number(p.price) > 0 ? <>{p.pricePrefix && <small>{p.pricePrefix}</small>}<b>{formatPrice(p.price)}</b>{offer && <s>{formatPrice(offer.before)}</s>}</> : <b>A cotizar</b>}
                </p>
                <div className="sc-card__btns">
                  <QuickAdd p={p} openProduct={s.openProduct} className="sc-card__add" />
                  <button className="kt-btn kt-btn--solid sc-card__book" onClick={() => book(p)}>Agendar</button>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
