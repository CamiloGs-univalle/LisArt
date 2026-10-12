// ─────────────────────────────────────────────────────────────
// GS Solutions · página principal con estructura de portafolio editorial:
// póster de portada, «Hola, soy…», hoja de vida, servicios, simulaciones en vivo,
// proyectos, cotizador y contacto. El contenido se edita en /super → «Mi página».
// ─────────────────────────────────────────────────────────────
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from '@/app/router'
import { waLink } from '@/lib/format'
import { usePortfolio, useReveal } from './effects'
import { SOLUTIONS, PROCESS, SKILLS, FAQ, withEstimator, simForProject } from './gs/data'
import Sim from './gs/Sims'
import GsIcon from './gs/GsIcon'
import Estimator from './gs/Estimator'
import ContactForm from './gs/ContactForm'
import Detail from './gs/Detail'
import './gs/gs.css'
import './gs/poster.css'

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500..900;1,9..144,500..800&family=Inter:wght@400..700&family=Great+Vibes&display=swap'
const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
const https = (u) => (/^https:\/\//.test(u || '') ? u : '')
const handle = (u) => (u || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '').split('/').slice(1).join('/') || u

export default function PortfolioPage() {
  const p = usePortfolio()
  const root = useRef(null)
  const cfg = withEstimator(p.estimator)
  const [detail, setDetail] = useState(null)
  const [system, setSystem] = useState('erp')
  const [prefill, setPrefill] = useState(null)
  const [menu, setMenu] = useState(false)
  useReveal(root, [p.projects.length])

  useEffect(() => {
    let link = document.getElementById('gs-fonts2')
    if (!link) {
      link = Object.assign(document.createElement('link'), { id: 'gs-fonts2', rel: 'stylesheet', href: FONTS_HREF })
      document.head.appendChild(link)
    }
    document.title = `${p.brand} · ${p.brandLong}`
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#2E4A36')
    document.documentElement.style.colorScheme = 'light'
    document.documentElement.style.setProperty('--page-bg', '#F4EEE1')
    return () => document.documentElement.style.removeProperty('--page-bg')
  }, [p.brand, p.brandLong])

  const a = p.about
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ')
  const whatsapp = p.contact.whatsapp
  const socials = [
    ['GH', 'github', https(p.contact.github)],
    ['LI', 'linkedin', https(p.contact.linkedin)],
    ['IG', 'instagram', https(p.contact.instagram)],
  ].filter(s => s[2])
  const quote = useCallback((id) => { setDetail(null); setSystem(id); setTimeout(() => go('cotizar'), 60) }, [])
  const ask = useCallback((type, summary, message) => { setDetail(null); setPrefill({ type, summary, message, at: Date.now() }); setTimeout(() => go('contacto'), 60) }, [])
  const closeDetail = useCallback(() => setDetail(null), [])
  const openSol = (s) => setDetail({ kind: 'solution', data: s })
  const nav = [['sobre-mi', 'Sobre mí'], ['hoja-de-vida', 'Hoja de vida'], ['servicios', 'Servicios'], ['trabajo', 'Trabajo'], ['cotizar', 'Cotizador']]

  return (
    <div className="gs gsp" ref={root}>
      {/* Encabezado */}
      <header className="gs-top gsp-top">
        <a href="#inicio" className="gsp-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <Star /> <span>{p.brand}</span>
        </a>
        <nav className={`gs-nav ${menu ? 'is-open' : ''}`} aria-label="Secciones">
          {nav.map(([id, l]) => <button key={id} onClick={() => { setMenu(false); go(id) }}>{l}</button>)}
        </nav>
        <button className="gsp-pill gs-top__cta" onClick={() => ask('cita', '')}>¡Hablemos!</button>
        <button className="gs-burger" onClick={() => setMenu(m => !m)} aria-label="Menú" aria-expanded={menu}><span /><span /></button>
      </header>

      <main id="inicio">
        {/* 1 · Póster de portada */}
        <section className="gsp-poster">
          <div className="gsp-poster__green">
            <h1 className="gsp-poster__word" aria-label={`${p.brand} · ${p.brandLong}`}>
              <span className="gsp-solid" data-reveal>{p.brand.replace(/\s+/g, ' ').toUpperCase()}</span>
              <span className="gsp-outline" aria-hidden="true">{(p.brand.split(' ').pop() || '').toUpperCase()}</span>
              <span className="gsp-outline gsp-outline--b" aria-hidden="true">{(p.brand.split(' ').pop() || '').toUpperCase()}</span>
              <span className="gsp-outline gsp-outline--c" aria-hidden="true">{(p.brand.split(' ').pop() || '').toUpperCase()}</span>
            </h1>
            <div className="gsp-poster__photo" data-reveal="zoom">
              <Star className="gsp-star gsp-star--a" /><Star className="gsp-star gsp-star--b" />
              <Photo src={p.photo} alt={`Foto de ${name}`} letter={(p.firstName || 'C')[0]} />
            </div>
            <ul className="gsp-poster__social">
              {socials.map(([k, , u]) => <li key={k}><a href={u} target="_blank" rel="noopener noreferrer"><b>{k}:</b> /{handle(u)}</a></li>)}
              {p.contact.email && <li><a href={`mailto:${p.contact.email}`}><b>@:</b> {p.contact.email}</a></li>}
            </ul>
          </div>
          <div className="gsp-poster__black">
            <p className="gsp-poster__lead">{p.heroTitleA} {p.heroTitleB} {p.heroText}</p>
            <Star className="gsp-star gsp-star--c" />
          </div>
          <button className="gsp-scroll" onClick={() => go('sobre-mi')}>Ver<br />más</button>
        </section>

        {/* 2 · Hola, soy… */}
        <section className="gsp-hello" id="sobre-mi">
          <div className="gsp-hello__text" data-reveal>
            <p className="gsp-kicker">{p.heroKicker}</p>
            <h2 className="gsp-serif">{a.hello?.replace(/,?\s*soy$/i, ',') || 'Hola,'}<br /><span className="gsp-nowrap">soy {p.firstName}&nbsp;!</span></h2>
            <p className="gsp-script">{p.founderRole}</p>
            <p className="gsp-hello__bio">{a.bio}</p>
            <div className="gsp-hello__cta">
              <button className="gsp-search" onClick={() => go('cotizar')}><GsIcon name="spark" size={18} /> Cotiza tu sistema en 1 minuto</button>
              <button className="gsp-btn gsp-btn--ghost" onClick={() => go('demo')}><GsIcon name="play" size={16} /> Ver cómo funciona</button>
            </div>
            <ul className="gsp-stats">
              <li><b>{p.projects.length}+</b><span>sistemas entregados</span></li>
              <li><b>100%</b><span>a la medida</span></li>
              <li><b>24 h</b><span>respuesta</span></li>
            </ul>
          </div>
          <div className="gsp-hello__art" data-reveal="zoom">
            {/* Tarjeta de perfil: foto + contacto en una sola pieza, etiquetas encima */}
            <div className="gsp-outline-stack gsp-outline-stack--perfil" aria-hidden="true"><span>PERFIL</span><span>PERFIL</span><span>PERFIL</span></div>
            <article className="gsp-profile">
              <div className="gsp-profile__top">
                <div className={`gsp-cut ${p.photoCutout ? 'is-cutout' : ''}`}>
                  <i className="gsp-cut__sun" />
                  <Photo src={p.photo} alt={`Foto de ${p.firstName}`} letter={(p.firstName || 'C')[0]} />
                </div>
                {(a.chips || []).slice(0, 2).map((c, i) => <span key={c} className={`gsp-chip gsp-chip--${i}`}>{c}</span>)}
              </div>
              <div className="gsp-contact">
                <b className="gsp-serif">Contacto</b>
                {a.location && <span><GsIcon name="pin" size={15} /> {a.location}</span>}
                {p.contact.email && <a href={`mailto:${p.contact.email}`}><GsIcon name="mail" size={15} /> {p.contact.email}</a>}
                {whatsapp && <a href={waLink(whatsapp, `Hola ${p.firstName} 👋`)} target="_blank" rel="noopener noreferrer"><GsIcon name="whatsapp" size={15} /> WhatsApp</a>}
              </div>
            </article>
          </div>
        </section>

        {/* 3 · Hoja de vida (bloque verde + experiencia amarilla) */}
        <section className="gsp-resume" id="hoja-de-vida">
          <div className="gsp-resume__green">
            <div className="gsp-resume__edu" data-reveal>
              <h2 className="gsp-serif gsp-h gsp-h--sun">Formación</h2>
              <ul className="gsp-edu">
                {(a.education || []).map(ed => (
                  <li key={ed.title + ed.years}>
                    <i aria-hidden="true"><GsIcon name="id" size={20} /></i>
                    <div><strong>{ed.title}</strong>{ed.place && <small>{ed.place}</small>}</div>
                    {/\d/.test(ed.years || '') && <em>{ed.years}</em>}
                  </li>
                ))}
              </ul>
              {a.languages?.length > 0 && (
                <>
                  <h3 className="gsp-serif gsp-sub">Idiomas</h3>
                  <div className="gsp-langs gsp-langs--dark">{a.languages.map(l => <div key={l.name}><b className="gsp-serif">{l.name}</b><span>{l.level}</span></div>)}</div>
                </>
              )}
              {a.tags?.length > 0 && (
                <>
                  <h3 className="gsp-serif gsp-sub">Cómo trabajo</h3>
                  <div className="gsp-tags gsp-tags--dark">{a.tags.map(t => <span key={t}>{t.replace(/^#/, '')}</span>)}</div>
                </>
              )}
            </div>
            <div className="gsp-resume__skills" data-reveal>
              <h2 className="gsp-serif gsp-h gsp-h--sun">Habilidades técnicas</h2>
              <h3 className="gsp-serif gsp-sub">Tecnologías que manejo</h3>
              <ul className="gsp-tech">{techList(a.tools).map(t => <li key={t}><i aria-hidden="true">{mono(t)}</i>{t}</li>)}</ul>
              <h3 className="gsp-serif gsp-sub">Especialidades</h3>
              <div className="gsp-pills">{['Diseño UX/UI', 'Sistemas a la medida', 'Automatización con IA', 'Integraciones'].map(t => <span key={t}>{t}</span>)}</div>
            </div>
          </div>
          <div className="gsp-resume__low">
            <div className="gsp-exp" data-reveal>
              <h2 className="gsp-serif gsp-h">Experiencia</h2>
              <Timeline items={a.experience || []} light />
            </div>
            <div className="gsp-right" data-reveal>
              <div className="gsp-block">
                <h2 className="gsp-serif gsp-h gsp-h--ink">¿Por qué yo?</h2>
                <div className="gsp-why">{(a.why || []).map((w, i) => <span key={w.title} style={{ '--i': i }}><i><GsIcon name={w.icon} size={26} /></i>{w.title}</span>)}</div>
              </div>
              {a.hobbies?.length > 0 && (
                <div className="gsp-block">
                  <h2 className="gsp-serif gsp-h gsp-h--ink">Me gusta</h2>
                  <div className="gsp-tags gsp-tags--soft">{a.hobbies.map(h => <span key={h}>{h}</span>)}</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4 · Banda de servicios (estilo tarjeta de presentación) */}
        <section className="gsp-band" id="servicios">
          <div className="gsp-band__about" data-reveal>
            <p className="gsp-kicker gsp-kicker--sun">Sobre {p.brand}</p>
            <h2 className="gsp-serif">Soy {p.firstName}, y esto es lo que hago</h2>
            <p>{p.heroText}</p>
            <div className="gsp-monogram" aria-hidden="true"><b className="gsp-serif">{p.brand.split(' ')[0]}</b><span className="gsp-script">{p.brand.split(' ').slice(1).join(' ') || 'Solutions'}</span><small>{p.brandLong}</small></div>
          </div>
          <div className="gsp-band__grid">
            <div className="gsp-col gsp-col--cream" data-reveal>
              <h3>Mis servicios</h3>
              <ul className="gsp-services">
                {SOLUTIONS.map(s => (
                  <li key={s.id}><button onClick={() => openSol(s)}><i><GsIcon name={s.icon} size={15} /></i>{s.name.split(' · ')[0]}<GsIcon name="arrow" size={14} /></button></li>
                ))}
              </ul>
            </div>
            <div className="gsp-col gsp-col--sand" data-reveal style={{ '--d': '.08s' }}>
              <h3>Mis habilidades</h3>
              <p className="gsp-col__sub">Lado creativo</p>
              <ul className="gsp-checks">{SKILLS.creative.map(s => <li key={s.name}>{s.name}</li>)}</ul>
              <p className="gsp-col__sub">Lado profesional</p>
              <ul className="gsp-checks">{SKILLS.pro.map(s => <li key={s.name}>{s.name}</li>)}</ul>
            </div>
            <div className="gsp-col gsp-col--green" data-reveal style={{ '--d': '.16s' }}>
              <h3>Experiencia</h3>
              <div className="gsp-badge"><i><GsIcon name="grid" size={22} /></i><div><b>{p.founderRole}</b><span>{p.brand} · Hoy</span></div></div>
              <ul className="gsp-checks gsp-checks--light">
                <li>{p.projects.length}+ sistemas en producción</li>
                <li>ERP, CRM, inventarios y catálogos</li>
                <li>Integraciones con SAP B1 y Gmail</li>
                <li>Automatización con inteligencia artificial</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5 · Simulaciones */}
        <Showcase onOpen={openSol} onQuote={quote} />

        {/* 6 · Mi trabajo */}
        <section className="gs-sec" id="trabajo">
          <SecHead kicker="Mi trabajo" title="Sistemas que ya están" em="funcionando" text="Toca un proyecto para ver su resumen y una simulación de lo que hace." />
          <div className="gsp-work">
            {p.projects.map((pr, i) => {
              const sol = SOLUTIONS.find(s => s.sim === (pr.sim || simForProject(pr)))
              return (
                <button key={pr.title + i} className="gsp-card" style={{ '--c': sol?.color || '#2E4A36', '--d': `${(i % 4) * 0.06}s` }} data-reveal onClick={() => setDetail({ kind: 'project', data: pr })}>
                  <span className="gsp-card__img">
                    {pr.image ? <img src={pr.image} alt="" loading="lazy" /> : <Sim kind={pr.sim || simForProject(pr)} title={pr.title} color={sol?.color} />}
                    <span className="gsp-card__n">{String(i + 1).padStart(2, '0')}</span>
                  </span>
                  <b className="gsp-serif">{pr.title}</b>
                  <span className="gsp-card__cat">{sol?.name.split(' · ')[0]} · {pr.category}</span>
                  <span className="gsp-card__more">Ver resumen <GsIcon name="arrow" size={14} /></span>
                </button>
              )
            })}
          </div>
          <p className="gsp-work__cats">{SOLUTIONS.slice(0, 7).map(s => s.name.split(' · ')[0]).join('  ·  ')}</p>
        </section>

        {/* 7 · Proceso */}
        <section className="gs-sec" id="proceso">
          <SecHead kicker="Cómo trabajamos" title="Simple, claro y" em="sin sorpresas" />
          <ol className="gs-steps">
            {PROCESS.map((s, i) => (
              <li key={s.n} data-reveal style={{ '--d': `${i * 0.1}s` }}>
                <span className="gs-steps__n">{s.n}</span>
                <b>{s.title}</b>
                <p>{s.text}</p>
                <small>{s.time}</small>
              </li>
            ))}
          </ol>
        </section>

        {/* 8 · Cotizador */}
        <section className="gs-sec" id="cotizar">
          <SecHead kicker="Cotizador" title="Arma tu sistema y mira" em="cuánto cuesta" text="Elige lo que necesitas y te mostramos un rango de precio y tiempo al instante. Sin compromiso." />
          <Estimator cfg={cfg} system={system} setSystem={setSystem} onRequest={(type, summary) => ask(type, summary)} />
        </section>

        {p.testimonials.length > 0 && (
          <section className="gs-sec">
            <SecHead kicker="Clientes" title="Lo que dicen" em="de nosotros" />
            <div className="gs-quotes">
              {p.testimonials.map((t, i) => <figure key={i} data-reveal><blockquote>“{t.text}”</blockquote><figcaption><b>{t.name}</b>{t.role && <span>{t.role}</span>}</figcaption></figure>)}
            </div>
          </section>
        )}

        {/* 9 · Preguntas */}
        <section className="gs-sec gs-sec--narrow" id="preguntas">
          <SecHead kicker="Preguntas frecuentes" title="Lo que todos" em="preguntan" />
          <div className="gs-faq">
            {FAQ.map(f => (
              <details key={f.q} data-reveal>
                <summary>{f.q}<span aria-hidden="true">+</span></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 10 · Trabajemos juntos */}
        <section className="gs-sec" id="contacto">
          <div className="gsp-together">
            <div className="gsp-together__text" data-reveal>
              <p className="gsp-kicker gsp-kicker--sun">Hablemos</p>
              <h2 className="gsp-serif">¿Trabajamos <span className="gsp-script">juntos?</span></h2>
              <p>¿Tienes un proyecto en mente? En una charla gratis de 30 minutos entendemos tu negocio y te decimos qué sistema te conviene, cuánto cuesta y cuánto tarda.</p>
              <ul className="gsp-together__list">
                {whatsapp && <li><a href={waLink(whatsapp, `¡Hola ${p.brand}! 👋 Vi tu página y quiero información sobre un sistema para mi negocio.`)} target="_blank" rel="noopener noreferrer"><GsIcon name="whatsapp" /> Escríbenos por WhatsApp</a></li>}
                {p.contact.email && <li><a href={`mailto:${p.contact.email}`}><GsIcon name="mail" /> {p.contact.email}</a></li>}
                {p.contact.location && <li><span><GsIcon name="pin" /> {p.contact.location}</span></li>}
              </ul>
            </div>
            <div data-reveal style={{ '--d': '.1s' }}><ContactForm prefill={prefill} whatsapp={whatsapp} brand={p.brand} /></div>
          </div>
        </section>
      </main>

      <footer className="gsp-foot">
        <p className="gsp-foot__line"><Star /> Construyamos <span className="gsp-script">tu sistema</span> juntos. <Star /></p>
        <div className="gsp-foot__row">
          <span className="gsp-logo"><Star /> <span>{p.brand}</span></span>
          <span>© {new Date().getFullYear()} {p.brand} · Fundado por {name}</span>
          <Link to="/admin" className="gs-foot__link">Acceso clientes <GsIcon name="arrow" size={14} /></Link>
        </div>
      </footer>

      <button className="gs-fab gsp-fab" onClick={() => ask('cita', '')}><GsIcon name="calendar" size={18} /> Agendar cita</button>
      {detail && <Detail item={detail} cfg={cfg} onClose={closeDetail} onQuote={quote} onAsk={(msg) => ask('info', '', msg)} />}
    </div>
  )
}

/* ── Partes ── */
function Photo({ src, alt, letter }) {
  const [ok, setOk] = useState(true)
  return src && ok ? <img src={src} alt={alt} onError={() => setOk(false)} /> : <span>{letter}</span>
}

function Star({ className = '' }) {
  return <svg className={`gsp-st ${className}`} viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path fill="currentColor" d="M12 0c.8 6.8 4.4 10.6 12 12-7.6 1.4-11.2 5.2-12 12-.8-6.8-4.4-10.6-12-12C7.6 10.6 11.2 6.8 12 0z" /></svg>
}

function SecHead({ kicker, title, em, text }) {
  return (
    <header className="gs-head" data-reveal>
      <p className="gsp-kicker">{kicker}</p>
      <h2 className="gsp-serif">{title} <span className="gsp-script">{em}</span></h2>
      {text && <p>{text}</p>}
    </header>
  )
}

function Timeline({ items, light = false }) {
  return (
    <ol className={`gsp-tl ${light ? 'gsp-tl--light' : ''}`}>
      {items.map((it, i) => (
        <li key={i}>
          <Star className="gsp-tl__dot" />
          <b className="gsp-serif">{it.years}</b>
          <div><strong>{it.title}</strong>{it.text && <small>{it.text}</small>}</div>
        </li>
      ))}
    </ol>
  )
}

// Vitrina: el visitante elige un sistema y lo ve funcionando
function Showcase({ onOpen, onQuote }) {
  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(true)
  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => setI(x => (x + 1) % SOLUTIONS.length), 7000)
    return () => clearInterval(id)
  }, [auto])
  const s = SOLUTIONS[i]
  return (
    <section className="gs-sec" id="demo">
      <SecHead kicker="Pruébalo aquí" title="Mira cómo funciona" em="cada sistema" text="Elige un sistema: la simulación muestra lo que hace por tu negocio, en vivo." />
      <div className="gs-show" style={{ '--c': s.color }} data-reveal>
        <div className="gs-show__list" role="tablist" aria-label="Sistemas">
          {SOLUTIONS.map((x, k) => (
            <button key={x.id} role="tab" aria-selected={k === i} className={k === i ? 'is-on' : ''} style={{ '--c': x.color }} onClick={() => { setI(k); setAuto(false) }}>
              <GsIcon name={x.icon} /> <span>{x.name.split(' · ')[0]}</span>
              {k === i && auto && <i className="gs-show__timer" />}
            </button>
          ))}
        </div>
        <div className="gs-show__stage" role="tabpanel">
          <Sim key={s.id} kind={s.sim} title={s.name} color={s.color} big />
          <div className="gs-show__info">
            <b className="gsp-serif">{s.name}</b>
            <p>{s.simple}</p>
            <div className="gs-show__cta">
              <button className="gs-btn gs-btn--primary" onClick={() => onQuote(s.id)}>Cotizar</button>
              <button className="gs-btn gs-btn--ghost" onClick={() => onOpen(s)}>Ver detalle</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Monograma de 2 letras (React → Re, TypeScript → TS)
// Tecnologías del perfil + las de la plataforma, sin repetir (máx. 12)
function techList(tools) {
  const seen = new Set()
  return [...(tools || []), ...SKILLS.tools].filter(x => { const k = String(x).trim().toLowerCase(); if (!k || seen.has(k)) return false; seen.add(k); return true }).slice(0, 12)
}

// Abreviatura legible de cada tecnología (sin repetidas como «Fi» para Firebase y Figma)
const TECH_ABBR = { react: 'Re', typescript: 'TS', javascript: 'JS', firebase: 'Fb', 'node.js': 'Nd', node: 'Nd', figma: 'Fg', python: 'Py', 'sap b1': 'SAP', git: 'Git', github: 'GH', vercel: 'Vc', ia: 'IA', sql: 'SQL', pwa: 'PWA', html: 'H5', css: 'CSS', excel: 'XL', 'power bi': 'BI' }
function mono(t) {
  const known = TECH_ABBR[String(t).trim().toLowerCase()]
  if (known) return known
  const words = t.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .]/g, ' ').split(/[\s.]+/).filter(Boolean)
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase()
  const caps = t.match(/[A-Z]/g)
  if (caps && caps.length >= 2) return caps.slice(0, 2).join('')
  return t.slice(0, 2).replace(/^./, c => c.toUpperCase())
}
