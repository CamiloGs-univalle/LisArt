// Secciones informativas: cinta, cómo pedir, historia y preguntas frecuentes
import { useState } from 'react'
import './InfoSections.css'
import { MARQUEE_WORDS, HOW_TO_ORDER, STORY, FAQ } from '../../data/siteContent'
import Reveal from '../ui/Reveal'
import Icon from '../ui/Icon'
import SectionHeader from '../ui/SectionHeader'

export function Ribbon() {
  const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS]
  return (
    <div className="ribbon" aria-hidden="true">
      <div className="ribbon__track">
        {words.map((w, i) => (
          <span key={i} className={i % 2 ? 'is-italic' : ''}>
            {w} <Icon name="sparkle" size={18} />
          </span>
        ))}
      </div>
    </div>
  )
}

export function HowToOrder({ onStart }) {
  return (
    <section className="how" id="como-pedir" aria-labelledby="how-title">
      <div className="container">
        <Reveal>
          <SectionHeader
            id="how-title"
            align="center"
            copy={{ eyebrow: 'Fácil y personal', title: 'Así de', emphasis: 'simple', subtitle: 'Sin registros ni pagos en línea: todo lo coordinamos contigo por WhatsApp.' }}
          />
        </Reveal>
        <ol className="how__steps">
          {HOW_TO_ORDER.map((s, i) => (
            <Reveal as="li" key={s.title} className="how__step" delay={i * 90}>
              <span className="how__num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </ol>
        <div className="how__cta">
          <button className="btn btn--primary" onClick={onStart}>
            Empezar a elegir <Icon name="arrow" />
          </button>
        </div>
      </div>
    </section>
  )
}

export function Story({ image }) {
  return (
    <section className="story container" aria-labelledby="story-title">
      <Reveal className="story__card">
        {image && (
          <div className="story__media">
            <img src={image} alt="" loading="lazy" decoding="async" />
          </div>
        )}
        <div className="story__copy">
          <p className="eyebrow">{STORY.eyebrow}</p>
          <h2 id="story-title" className="display story__title">
            {STORY.title} <em>{STORY.titleEmphasis}</em>.
          </h2>
          <p className="story__text">{STORY.text}</p>
          <p className="story__sign">— Con cariño, LisArt</p>
        </div>
      </Reveal>
    </section>
  )
}

export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="faq container" id="preguntas" aria-labelledby="faq-title">
      <div className="faq__grid">
        <Reveal>
          <SectionHeader id="faq-title" copy={{ eyebrow: 'Preguntas frecuentes', title: 'Antes de', emphasis: 'pedir' }} />
          <p className="faq__aside">¿Tienes otra duda? Escríbenos y te respondemos con gusto.</p>
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
                    <span className="faq__icon" aria-hidden="true"><Icon name="plus" size={18} /></span>
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
