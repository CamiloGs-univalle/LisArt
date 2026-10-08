// Secciones informativas: historias destacadas, cinta, cómo pedir, historia y preguntas
import { useEffect, useRef, useState } from 'react'
import { useAdmin } from '@/features/editor/EditorProvider'
import './InfoSections.css'
import { useSiteContent, highlightTextPath } from '@/features/tenant/useSiteContent'
import { useTenant } from '@/features/tenant/TenantProvider'
import { useWhatsApp } from '@/features/tenant/useWhatsApp'
import Reveal from '@/shared/ui/Reveal'
import Icon from '@/shared/ui/Icon'
import SectionHeader from '@/features/catalog/components/SectionHeader'
import EditText, { useEditableText } from '@/features/editor/EditText'

const STEP_COLORS = ['var(--c-berry)', 'var(--c-rose)', 'var(--c-gold)']

/* ── Historias destacadas (como en Instagram) ── */
export function Highlights({ onCatalog }) {
  const { highlights: HIGHLIGHTS } = useSiteContent()
  const { brand } = useTenant()
  const wa = useWhatsApp()
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
      wa.open(`¡Hola {negocio}! 👋 Tengo una pregunta sobre: ${h.label}`)
      return
    }
    if (brand.instagram) window.open(brand.instagram, '_blank', 'noopener')
    else wa.open(`¡Hola {negocio}! 👋 Quiero saber más sobre: ${h.label}`)
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
              <EditText path={`highlights.${h.id}.label`} fallback={h.label} className="hl__label" inButton />
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
            <EditText path={`highlights.${active.id}.label`} fallback={active.label} as="p" className="hand hl-modal__label" />
            <h2 id="hl-title" className="display hl-modal__title"><EditText path={`highlights.${active.id}.title`} fallback={active.title} /></h2>
            {(active.text || !active.steps) && <EditText path={highlightTextPath(active.id)} fallback={active.text} as="p" className="hl-modal__text" multiline />}
            {active.steps && (
              <ol className="hl-modal__steps">
                {active.steps.map((s, i) => <li key={i}><span>{i + 1}</span><EditText path={`highlights.${active.id}.steps.${i}`} fallback={s} /></li>)}
              </ol>
            )}
            <button className="btn btn--primary btn--block" onClick={() => runAction(active)}>
              {active.action === 'whatsapp' ? <Icon name="whatsapp" /> : active.action === 'catalog' ? <Icon name="gift" /> : <Icon name="instagram" />}
              <EditText path={`highlights.${active.id}.cta`} fallback={active.cta} inButton />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

/* ── Cinta de colores ── */
export function Ribbon() {
  const { read } = useEditableText()
  const { ribbon } = useSiteContent()
  const list = (read('ribbon', ribbon) || []).filter(w => String(w).trim())
  const words = [...list, ...list]
  const colors = ['var(--c-blue)', 'var(--c-magenta)', 'var(--c-orange)', 'var(--c-green)', 'var(--c-purple)', 'var(--c-red)']
  return (
    <>
    <RibbonEditor />
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
    </>
  )
}

// Editar las palabras de la cinta (solo admin): separadas por comas
function RibbonEditor() {
  const { read, write } = useEditableText()
  const { isAdmin } = useAdmin()
  const { ribbon } = useSiteContent()
  if (!isAdmin) return null
  const list = read('ribbon', ribbon) || []
  return (
    <div className="container">
      <button
        className="admin-chip"
        onClick={() => {
          const v = window.prompt('Palabras de la cinta, separadas por comas:', list.join(', '))
          if (v !== null) write('ribbon', v.split(',').map(x => x.trim()).filter(Boolean))
        }}
      >✏️ Editar palabras de la cinta</button>
    </div>
  )
}

/* ── Cómo pedir ── */
export function HowToOrder({ onStart }) {
  const { how: HOW_TO_ORDER } = useSiteContent()
  return (
    <section className="how" id="como-pedir" aria-labelledby="how-title">
      <div className="container">
        <Reveal>
          <SectionHeader
            id="how-title"
            align="center"
            editKey="howHead"
            copy={{ eyebrow: 'Sin complicaciones', title: 'Pedir es', emphasis: 'facilísimo', subtitle: 'Sin registros ni pagos en línea: todo lo coordinamos contigo por WhatsApp.' }}
          />
        </Reveal>
        <ol className="how__steps">
          {HOW_TO_ORDER.map((s, i) => (
            <Reveal as="li" key={i} className="how__step" delay={i * 90} style={{ '--c': s.color || STEP_COLORS[i % 3] }}>
              <span className="how__num">{i + 1}</span>
              <EditText path={`how.${i}.title`} fallback={s.title} as="h3" />
              <EditText path={`how.${i}.text`} fallback={s.text} as="p" multiline />
            </Reveal>
          ))}
        </ol>
        <div className="how__cta">
          <button className="btn btn--primary" onClick={onStart}>
            <Icon name="gift" /> <EditText path="howCta.button" fallback="Empezar a elegir" inButton />
          </button>
          <EditText path="howCta.note" fallback="¡toma menos de 2 minutos!" className="hand how__note" />
        </div>
      </div>
    </section>
  )
}

/* ── Historia ── */
export function Story({ image }) {
  const { story: STORY } = useSiteContent()
  const { brand } = useTenant()
  return (
    <section className="story container" aria-labelledby="story-title">
      <Reveal className="story__card">
        {image && (
          <div className="story__media">
            <img src={image} alt="" loading="lazy" decoding="async" />
            <EditText path="story.sticker" fallback="Hecho con amor ♥" className="sticker story__sticker" />
          </div>
        )}
        <div className="story__copy">
          <h2 id="story-title" className="display story__title">
            <EditText path="story.title" fallback={STORY.title} /> <em><EditText path="story.titleEmphasis" fallback={STORY.titleEmphasis} /></em>
          </h2>
          <EditText path="story.text" fallback={STORY.text} as="p" className="story__text" multiline />
          <p className="hand story__sign">— <EditText path="story.sign" fallback={STORY.sign} /></p>
          {brand.instagram && (
          <a className="btn btn--ghost story__ig" href={brand.instagram} target="_blank" rel="noopener noreferrer">
            <Icon name="instagram" /> <EditText path="story.cta" fallback="Ver más en Instagram" inButton />
          </a>
          )}
        </div>
      </Reveal>
    </section>
  )
}

/* ── Preguntas frecuentes ── */
export function Faq() {
  const { faq: FAQ } = useSiteContent()
  const wa = useWhatsApp()
  const { isAdmin } = useAdmin()
  const { write } = useEditableText()
  const [open, setOpen] = useState(0)
  return (
    <section className="faq container" id="preguntas" aria-labelledby="faq-title">
      <div className="faq__grid">
        <Reveal>
          <SectionHeader id="faq-title" editKey="faqHead" copy={{ eyebrow: 'Preguntas frecuentes', title: '¿Tienes', emphasis: 'dudas?', color: 'var(--c-blue)' }} />
          <EditText path="faqHead.aside" fallback="Si no encuentras tu respuesta, escríbenos: respondemos con gusto." as="p" className="faq__aside" multiline />
          <a className="btn btn--wa faq__wa" href={wa.link('¡Hola {negocio}! 👋 Tengo una pregunta.')} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" /> <EditText path="faqHead.cta" fallback="Preguntar ahora" inButton />
          </a>
        </Reveal>
        <div className="faq__list">
          {FAQ.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={i} className={`faq__item ${isOpen || isAdmin ? 'is-open' : ''}`}>
                <h3>
                  <button
                    className="faq__q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <EditText path={`faq.${i}.q`} fallback={f.q} inButton />
                    <span className="faq__icon" aria-hidden="true"><Icon name="plus" size={18} strokeWidth={2.4} /></span>
                  </button>
                </h3>
                <div className="faq__a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                  <div>
                    <EditText path={`faq.${i}.a`} fallback={f.a} as="p" multiline />
                    {isAdmin && (
                      <button className="admin-chip faq__del" onClick={() => { if (window.confirm('¿Eliminar esta pregunta?')) write('faq', FAQ.filter((_, j) => j !== i)) }}>
                        <Icon name="trash" size={14} /> Eliminar pregunta
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {isAdmin && (
            <button className="admin-chip faq__add" onClick={() => write('faq', [...FAQ, { q: 'Nueva pregunta', a: 'Escribe aquí la respuesta.' }])}>
              <Icon name="plus" size={14} /> Agregar pregunta
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
