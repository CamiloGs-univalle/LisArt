// Secciones informativas: historias destacadas, cinta, cómo pedir, historia y preguntas
import { useEffect, useRef, useState } from 'react'
import './InfoSections.css'
import { MARQUEE_WORDS, HOW_TO_ORDER, STORY, FAQ, HIGHLIGHTS, SOCIALS } from '../../data/siteContent'
import { WHATSAPP_NUMBER } from '../../data/products'
import Reveal from '../ui/Reveal'
import Icon from '../ui/Icon'
import SectionHeader from '../ui/SectionHeader'

const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`

/* ── Historias destacadas (como en Instagram) ── */
export function Highlights({ onCatalog }) {
  const [active, setActive] = useState(null)
  const closeRef = useRef(null)

  useEffect(() => {
    if (!active) return
    closeRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') setActive(null) }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [active])

  const runAction = (h) => {
    if (h.action === 'catalog') { setActive(null); setTimeout(onCatalog, 50); return }
    if (h.action === 'whatsapp') {
      window.open(waLink(`¡Hola LisArt! 👋 Tengo una pregunta sobre: ${h.label}`), '_blank', 'noopener')
      return
    }
    window.open(SOCIALS.instagram, '_blank', 'noopener')
  }

  return (
    <section className="hl container" aria-label="Información rápida">
      <ul className="hl__row">
        {HIGHLIGHTS.map((h, i) => (
          <li key={h.id} style={{ '--c': h.color, animationDelay: `${i * 60}ms` }}>
            <button className="hl__item" onClick={() => setActive(h)} aria-haspopup="dialog">
              <span className="hl__ring">
                <span className="hl__bubble"><Icon name={h.icon} size={28} strokeWidth={1.9} /></span>
              </span>
              <span className="hl__label">{h.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {active && (
        <div className="hl-modal" onClick={() => setActive(null)} role="presentation">
          <div
            className="hl-modal__card"
            style={{ '--c': active.color }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="hl-title"
            onClick={e => e.stopPropagation()}
          >
            <div className="hl-modal__bar"><span /></div>
            <button ref={closeRef} className="hl-modal__close" onClick={() => setActive(null)} aria-label="Cerrar">
              <Icon name="close" size={20} />
            </button>
            <span className="hl-modal__icon"><Icon name={active.icon} size={34} strokeWidth={1.8} /></span>
            <p className="hand hl-modal__label">{active.label}</p>
            <h2 id="hl-title" className="display hl-modal__title">{active.title}</h2>
            {active.text && <p className="hl-modal__text">{active.text}</p>}
            {active.steps && (
              <ol className="hl-modal__steps">
                {active.steps.map((s, i) => <li key={i}><span>{i + 1}</span>{s}</li>)}
              </ol>
            )}
            <button className="btn btn--primary btn--block" onClick={() => runAction(active)}>
              {active.action === 'whatsapp' ? <Icon name="whatsapp" /> : active.action === 'catalog' ? <Icon name="gift" /> : <Icon name="instagram" />}
              {active.cta}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

/* ── Cinta de colores ── */
export function Ribbon() {
  const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS]
  const colors = ['var(--c-blue)', 'var(--c-magenta)', 'var(--c-orange)', 'var(--c-green)', 'var(--c-purple)', 'var(--c-red)']
  return (
    <div className="ribbon" aria-hidden="true">
      <div className="ribbon__track">
        {words.map((w, i) => (
          <span key={i} className="ribbon__word" style={{ '--c': colors[i % colors.length] }}>
            {w}
            <svg viewBox="0 0 24 24"><path d="M12 2c.8 5.6 3.4 8.2 10 10-6.6 1.8-9.2 4.4-10 10-.8-5.6-3.4-8.2-10-10 6.6-1.8 9.2-4.4 10-10Z" /></svg>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── Cómo pedir ── */
export function HowToOrder({ onStart }) {
  return (
    <section className="how" id="como-pedir" aria-labelledby="how-title">
      <div className="container">
        <Reveal>
          <SectionHeader
            id="how-title"
            align="center"
            copy={{ eyebrow: 'Sin complicaciones', title: 'Pedir es', emphasis: 'facilísimo', subtitle: 'Sin registros ni pagos en línea: todo lo coordinamos contigo por WhatsApp.' }}
          />
        </Reveal>
        <ol className="how__steps">
          {HOW_TO_ORDER.map((s, i) => (
            <Reveal as="li" key={s.title} className="how__step" delay={i * 90} style={{ '--c': s.color }}>
              <span className="how__num">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </ol>
        <div className="how__cta">
          <button className="btn btn--primary" onClick={onStart}>
            <Icon name="gift" /> Empezar a elegir
          </button>
          <span className="hand how__note">¡toma menos de 2 minutos!</span>
        </div>
      </div>
    </section>
  )
}

/* ── Historia ── */
export function Story({ image }) {
  return (
    <section className="story container" aria-labelledby="story-title">
      <Reveal className="story__card">
        {image && (
          <div className="story__media">
            <img src={image} alt="" loading="lazy" decoding="async" />
            <span className="sticker story__sticker">Hecho con amor ♥</span>
          </div>
        )}
        <div className="story__copy">
          <h2 id="story-title" className="display story__title">
            {STORY.title} <em>{STORY.titleEmphasis}</em>
          </h2>
          <p className="story__text">{STORY.text}</p>
          <p className="hand story__sign">— {STORY.sign}</p>
          <a className="btn btn--ghost story__ig" href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer">
            <Icon name="instagram" /> Ver más en Instagram
          </a>
        </div>
      </Reveal>
    </section>
  )
}

/* ── Preguntas frecuentes ── */
export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="faq container" id="preguntas" aria-labelledby="faq-title">
      <div className="faq__grid">
        <Reveal>
          <SectionHeader id="faq-title" copy={{ eyebrow: 'Preguntas frecuentes', title: '¿Tienes', emphasis: 'dudas?', color: 'var(--c-blue)' }} />
          <p className="faq__aside">Si no encuentras tu respuesta, escríbenos: respondemos con gusto.</p>
          <a className="btn btn--wa faq__wa" href={waLink('¡Hola LisArt! 👋 Tengo una pregunta.')} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" /> Preguntar ahora
          </a>
        </Reveal>
        <div className="faq__list">
          {FAQ.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q} className={`faq__item ${isOpen ? 'is-open' : ''}`}>
                <h3>
                  <button
                    className="faq__q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    {f.q}
                    <span className="faq__icon" aria-hidden="true"><Icon name="plus" size={18} strokeWidth={2.4} /></span>
                  </button>
                </h3>
                <div className="faq__a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                  <div><p>{f.a}</p></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
