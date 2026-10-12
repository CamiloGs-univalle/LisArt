// "Quién está detrás": presentación personal del fundador (foto, contacto,
// formación, experiencia, herramientas, idiomas y por qué trabajar con nosotros).
import { useState } from 'react'
import { waLink } from '@/lib/format'
import GsIcon from './GsIcon'

const https = (u) => (/^https:\/\//.test(u || '') ? u : '')

export default function About({ p, onContact }) {
  const a = p.about
  const [imgOk, setImgOk] = useState(true)
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ')
  const wa = p.contact.whatsapp
  const socials = [
    ['github', 'GitHub', https(p.contact.github)],
    ['linkedin', 'LinkedIn', https(p.contact.linkedin)],
    ['instagram', 'Instagram', https(p.contact.instagram)],
  ].filter(s => s[2])

  return (
    <section className="gs-me" id="nosotros" aria-labelledby="gs-me-title">
      {/* Presentación */}
      <div className="gs-me__hero">
        <div className="gs-me__text" data-reveal>
          <p className="gs-eyebrow"><GsIcon name="star4" size={14} /> Quién está detrás</p>
          <h2 id="gs-me-title" className="gs-serif">{a.hello}<br /><span>{name}</span><em> !</em></h2>
          <p className="gs-me__role">{p.founderRole} · <b>{p.brand}</b></p>
          <p className="gs-me__bio">{a.bio}</p>
          {a.tagline && <p className="gs-me__quote">“{a.tagline}”</p>}
          <div className="gs-me__cta">
            <button className="gs-btn gs-btn--primary" onClick={onContact}>Hablemos <GsIcon name="arrow" size={18} /></button>
            {socials.map(([ic, l, u]) => <a key={ic} className="gs-me__social" href={u} target="_blank" rel="noopener noreferrer" aria-label={l}><GsIcon name={ic} size={20} /></a>)}
          </div>
        </div>

        <div className="gs-me__art" data-reveal="zoom">
          <span className="gs-me__spark gs-me__spark--a" aria-hidden="true"><GsIcon name="star4" size={34} /></span>
          <span className="gs-me__spark gs-me__spark--b" aria-hidden="true"><GsIcon name="star4" size={20} /></span>
          <div className={`gs-me__arch ${p.photoCutout ? 'is-cutout' : ''}`}>
            <div className="gs-me__sun" aria-hidden="true" />
            {p.photo && imgOk ? <img src={p.photo} alt={`Foto de ${name}`} onError={() => setImgOk(false)} /> : <span className="gs-me__initial">{(p.firstName || 'C').slice(0, 1)}</span>}
          </div>
          {(a.chips || []).slice(0, 2).map((c, i) => <span key={c} className={`gs-me__chip gs-me__chip--${i}`}>{c}</span>)}
          <div className="gs-me__card gs-dark">
            <b className="gs-serif">Contacto</b>
            {a.location && <span><GsIcon name="pin" size={16} /> {a.location}</span>}
            {p.contact.email && <a href={`mailto:${p.contact.email}`}><GsIcon name="mail" size={16} /> {p.contact.email}</a>}
            {wa && <a href={waLink(wa, `Hola ${p.firstName} 👋`)} target="_blank" rel="noopener noreferrer"><GsIcon name="whatsapp" size={16} /> WhatsApp</a>}
          </div>
        </div>
      </div>

      {/* Hoja de vida */}
      <div className="gs-me__cv">
        <div className="gs-me__col">
          {a.education?.length > 0 && (
            <div className="gs-me__block" data-reveal>
              <h3 className="gs-serif gs-me__h">Formación</h3>
              <Timeline items={a.education.map(e => ({ years: e.years, title: e.title, text: e.place }))} />
            </div>
          )}
          {a.experience?.length > 0 && (
            <div className="gs-me__block gs-me__exp" data-reveal>
              <h3 className="gs-serif gs-me__h">Experiencia</h3>
              <Timeline items={a.experience} light />
              {a.tags?.length > 0 && <div className="gs-me__tags">{a.tags.map(t => <span key={t}>{t}</span>)}</div>}
            </div>
          )}
        </div>

        <div className="gs-me__col">
          {a.tools?.length > 0 && (
            <div className="gs-me__block" data-reveal>
              <h3 className="gs-serif gs-me__h">Herramientas</h3>
              <div className="gs-me__tools">
                {a.tools.map((t, i) => <span key={t} style={{ '--i': i }}><b>{mono(t)}</b><small>{t}</small></span>)}
              </div>
            </div>
          )}
          {a.languages?.length > 0 && (
            <div className="gs-me__block" data-reveal>
              <h3 className="gs-serif gs-me__h">Idiomas</h3>
              <div className="gs-me__langs">{a.languages.map(l => <div key={l.name}><b className="gs-serif">{l.name}</b><span>{l.level}</span></div>)}</div>
            </div>
          )}
          {a.hobbies?.length > 0 && (
            <div className="gs-me__block" data-reveal>
              <h3 className="gs-serif gs-me__h">Me gusta</h3>
              <div className="gs-me__tags gs-me__tags--soft">{a.hobbies.map(h => <span key={h}>{h}</span>)}</div>
            </div>
          )}
          {a.why?.length > 0 && (
            <div className="gs-me__block" data-reveal>
              <h3 className="gs-serif gs-me__h">¿Por qué trabajar conmigo?</h3>
              <div className="gs-me__why">{a.why.map((w, i) => <span key={w.title} style={{ '--i': i }}><i><GsIcon name={w.icon} size={22} /></i>{w.title}</span>)}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Timeline({ items, light = false }) {
  return (
    <ol className={`gs-tl ${light ? 'gs-tl--light' : ''}`}>
      {items.map((it, i) => (
        <li key={i} style={{ '--d': `${i * 0.1}s` }}>
          <span className="gs-tl__dot" aria-hidden="true"><GsIcon name="star4" size={18} /></span>
          <b className="gs-serif gs-tl__y">{it.years}</b>
          <div><strong>{it.title}</strong>{it.text && <small>{it.text}</small>}</div>
        </li>
      ))}
    </ol>
  )
}

// Monograma de 2 letras (React → Re, TypeScript → TS, SAP B1 → SB)
function mono(t) {
  const words = t.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .]/g, ' ').split(/[\s.]+/).filter(Boolean)
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase()
  const caps = t.match(/[A-Z]/g)
  if (caps && caps.length >= 2) return caps.slice(0, 2).join('')
  return t.slice(0, 2).replace(/^./, c => c.toUpperCase())
}
