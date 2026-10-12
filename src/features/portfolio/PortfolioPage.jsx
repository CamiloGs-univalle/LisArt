// ─────────────────────────────────────────────────────────────
// Portafolio (página principal). Estilo editorial premium:
// tipografía gigante, crema + terracota y animaciones al hacer scroll.
// El contenido se edita en /super → "Mi portafolio".
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react'
import { Link } from '@/app/router'
import { THEME_PRESETS } from '@/features/tenant/themes'
import { waLink } from '@/lib/format'
import { usePortfolio, useFitText, useReveal, useScrollVar } from './effects'
import './Portfolio.css'

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Anton&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..600&family=Inter:wght@400..700&family=Mrs+Saint+Delafield&display=swap'

export default function PortfolioPage() {
  const p = usePortfolio()
  const root = useRef(null)
  useScrollVar(root)
  useReveal(root, [p.projects.length, p.skills.length, p.services.length, p.testimonials.length])

  // Fuentes, título y color del navegador propios del portafolio
  useEffect(() => {
    let link = document.getElementById('pfo-fonts')
    if (!link) {
      link = Object.assign(document.createElement('link'), { id: 'pfo-fonts', rel: 'stylesheet', href: FONTS_HREF })
      document.head.appendChild(link)
    }
    const name = [p.firstName, p.lastName].filter(Boolean).join(' ')
    document.title = `${name} · ${p.role}`
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#F4EFE7')
    document.documentElement.style.colorScheme = 'light'
  }, [p.firstName, p.lastName, p.role])

  const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ')
  const wa = p.contact.whatsapp ? waLink(p.contact.whatsapp, `Hola ${p.firstName} 👋 Vi tu portafolio y quiero hablar de un proyecto.`) : ''
  const primaryContact = wa || (p.contact.email ? `mailto:${p.contact.email}` : '#contacto')

  return (
    <div className="pfo" ref={root}>

      <a href="#proyectos" className="pfo-skip">Saltar a proyectos</a>

      <header className="pfo-top">
        <span className="pfo-top__role"><span className="pfo-star" aria-hidden="true">✱</span>{p.role}</span>
        <nav className="pfo-top__nav" aria-label="Secciones">
          <a href="#proyectos">Proyectos</a>
          <a href="#habilidades">Servicios</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <a className="pfo-top__cta" href="#contacto">{p.availability} <Arrow /></a>
      </header>

      <span className="pfo-side pfo-side--l" aria-hidden="true">{p.sideLeft}</span>
      <span className="pfo-side pfo-side--r" aria-hidden="true">{p.sideRight}</span>

      <Hero p={p} fullName={fullName} contactHref={primaryContact} />

      <Marquee items={p.marquee} />

      <Projects p={p} />

      <Skills p={p} />

      {p.testimonials.length > 0 && <Testimonials p={p} />}

      <Contact p={p} wa={wa} fullName={fullName} />

      <footer className="pfo-foot">
        <span className="pfo-foot__brand">{p.bigWord}</span>
        <span>© {new Date().getFullYear()} {fullName}</span>
        <Link to="/admin" className="pfo-foot__link">Acceso clientes <Arrow /></Link>
      </footer>
    </div>
  )
}

/* ── Portada ──────────────────────────────────────────────── */
function Hero({ p, fullName, contactHref }) {
  const [box, inner] = useFitText(p.bigWord)
  const letters = [...(p.bigWord || '')]
  return (
    <section className="pfo-hero" aria-labelledby="pfo-name">
      <div className="pfo-big" ref={box} aria-hidden="true">
        <span ref={inner} className="pfo-big__inner">
          {letters.map((ch, i) => (
            <span key={i} className="pfo-big__ch" style={{ '--i': i }}>{ch === ' ' ? ' ' : ch}</span>
          ))}
        </span>
      </div>

      <div className="pfo-hero__grid">
        <div className="pfo-hero__text">
          <p className="pfo-kicker pfo-in" style={{ '--d': '.5s' }}>{p.greeting}</p>
          <h1 id="pfo-name" className="pfo-name pfo-in" style={{ '--d': '.6s' }}>
            {p.firstName}{p.lastName && <><br />{p.lastName}</>}
          </h1>
          <p className="pfo-title pfo-in" style={{ '--d': '.7s' }}>{p.title}</p>
          <p className="pfo-intro pfo-in" style={{ '--d': '.8s' }}>{p.intro}</p>
          {p.signature && <p className="pfo-sign pfo-in" style={{ '--d': '.95s' }} aria-hidden="true">{p.signature}</p>}
          <div className="pfo-ctas pfo-in" style={{ '--d': '1.05s' }}>
            <a className="pfo-btn pfo-btn--ink" href="#proyectos">Ver proyectos <Arrow /></a>
            <a className="pfo-btn" href={contactHref} target={contactHref.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">Hablemos</a>
          </div>
        </div>

        <div className="pfo-hero__art">
          <div className="pfo-circle" />
          {p.photo ? (
            <img className={`pfo-photo ${p.photoCutout ? 'is-cutout' : ''}`} src={p.photo} alt={fullName} />
          ) : (
            <div className="pfo-mono" aria-hidden="true">
              <span>{(p.firstName || '✱')[0]}</span>
              <code className="pfo-code">
                <i>const</i> dev = {'{'}<br />
                &nbsp;&nbsp;nombre: <b>&quot;{p.firstName}&quot;</b>,<br />
                &nbsp;&nbsp;pasión: <b>&quot;crear&quot;</b><br />
                {'}'}
              </code>
            </div>
          )}
          <Badge text={p.badge} />
        </div>
      </div>
    </section>
  )
}

function Badge({ text }) {
  const t = (text || '').toUpperCase()
  return (
    <div className="pfo-badge" aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <defs><path id="pfo-badge-path" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
        <text><textPath href="#pfo-badge-path" textLength="288">{t.repeat(Math.max(1, Math.round(40 / Math.max(1, t.length))))}</textPath></text>
      </svg>
      <span className="pfo-badge__core">✱</span>
    </div>
  )
}

/* ── Cinta animada ────────────────────────────────────────── */
function Marquee({ items }) {
  if (!items?.length) return null
  const row = [...items, ...items]
  return (
    <div className="pfo-marquee" aria-label={items.join(', ')}>
      <div className="pfo-marquee__track" aria-hidden="true">
        {[0, 1].map(k => (
          <span key={k} className="pfo-marquee__group">
            {row.map((t, i) => <span key={i} className="pfo-marquee__item">{t}<span className="pfo-star">✱</span></span>)}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── Proyectos ────────────────────────────────────────────── */
function Projects({ p }) {
  return (
    <section id="proyectos" className="pfo-sec">
      <div className="pfo-sec__head">
        <h2 className="pfo-h2" data-reveal>{p.projectsTitle}<br /><em>{p.projectsEmphasis}</em></h2>
        <p className="pfo-sec__intro" data-reveal>{p.projectsIntro}</p>
        {p.githubUrl
          ? <a className="pfo-link" href={p.githubUrl} target="_blank" rel="noopener noreferrer" data-reveal>Ver todo en GitHub <Arrow /></a>
          : <a className="pfo-link" href="#contacto" data-reveal>¿Tienes un proyecto? <Arrow /></a>}
      </div>
      <div className="pfo-projects">
        {p.projects.map((pr, i) => <ProjectCard key={i} pr={pr} i={i} />)}
      </div>
    </section>
  )
}

function ProjectCard({ pr, i }) {
  const link = pr.url || pr.repo || ''
  const tech = String(pr.tech || '').split(',').map(t => t.trim()).filter(Boolean)
  return (
    <article className="pfo-proj" data-reveal style={{ '--d': `${(i % 4) * 0.08}s` }}>
      <a className="pfo-proj__visual" href={link || undefined} target={/^https?:/.test(link) ? '_blank' : undefined} rel="noopener noreferrer" aria-label={`Ver ${pr.title}`} tabIndex={link ? undefined : -1}>
        {pr.image
          ? <img src={pr.image} alt="" loading="lazy" />
          : pr.preset ? <MiniSite project={pr} /> : <Cover project={pr} i={i} />}
        {pr.description && <span className="pfo-proj__desc"><span>{pr.description}</span></span>}
        {link && <span className="pfo-proj__go" aria-hidden="true"><Arrow /></span>}
      </a>
      <div className="pfo-proj__meta">
        <span className="pfo-proj__num">{String(i + 1).padStart(2, '0')}</span>
        <span className="pfo-proj__txt">
          <strong>{pr.title}</strong>
          <small>{pr.category}</small>
          {(tech.length > 0 || pr.repo) && (
            <span className="pfo-proj__tags">
              {tech.slice(0, 3).map(t => <em key={t}>{t}</em>)}
              {pr.repo && <a href={pr.repo} target="_blank" rel="noopener noreferrer" className="pfo-proj__code" aria-label={`Código de ${pr.title} en GitHub`}>{'</>'} Código</a>}
            </span>
          )}
        </span>
      </div>
    </article>
  )
}

// Portada tipográfica elegante (cuando el proyecto no tiene imagen)
const COVERS = ['ink', 'stone', 'paper', 'night']
function Cover({ project, i }) {
  const words = String(project.title || '').toUpperCase().split(/\s+/)
  const mid = Math.ceil(words.length / 2)
  return (
    <div className={`pfo-cover pfo-cover--${COVERS[i % COVERS.length]}`} aria-hidden="true">
      <div className="pfo-cover__nav"><b>{words[0]}</b><span><i /><i /><i /></span></div>
      <p className="pfo-cover__title">{words.slice(0, mid).join(' ')}<br />{words.slice(mid).join(' ')}</p>
      <span className="pfo-cover__btn">Ver proyecto</span>
      <span className="pfo-cover__shape" />
    </div>
  )
}

// Vista previa ilustrada de un catálogo (proyectos importados desde tus catálogos)
function MiniSite({ project }) {
  const t = THEME_PRESETS[project.preset] || THEME_PRESETS.noche
  return (
    <div className="pfo-mini" style={{ '--m-paper': t.paper, '--m-ink': t.ink, '--m-acc': t.primary, '--m-soft': t.blush, '--m-font': `'${t.fontDisplay}', serif` }} aria-hidden="true">
      <div className="pfo-mini__bar"><i /><i /><i /></div>
      <div className="pfo-mini__nav"><b>{project.title}</b><span /></div>
      <div className="pfo-mini__hero">
        <p>{project.title}</p>
        <span className="pfo-mini__btn" />
      </div>
      <div className="pfo-mini__grid"><i /><i /><i /></div>
    </div>
  )
}

/* ── Habilidades y servicios ──────────────────────────────── */
function Skills({ p }) {
  return (
    <section id="habilidades" className="pfo-sec pfo-skills">
      <div className="pfo-skills__col">
        <h2 className="pfo-h2" data-reveal>{p.skillsTitle}<br /><em>{p.skillsEmphasis}</em></h2>
        <ul className="pfo-bars">
          {p.skills.map((s, i) => (
            <li key={i} data-reveal style={{ '--lvl': `${Math.max(0, Math.min(100, Number(s.level) || 0))}%`, '--d': `${i * 0.06}s` }}>
              <span>{s.name}</span><b>{s.level}%</b>
              <i className="pfo-bars__track"><i className="pfo-bars__fill" /></i>
            </li>
          ))}
        </ul>
      </div>
      <blockquote className="pfo-quote" data-reveal>
        <span className="pfo-quote__mark" aria-hidden="true">“</span>
        {p.quote}
      </blockquote>
      <ul className="pfo-services">
        {p.services.map((s, i) => (
          <li key={i} data-reveal style={{ '--d': `${i * 0.08}s` }}>
            <span className="pfo-services__icon"><Icon name={s.icon} /></span>
            <span><strong>{s.title}</strong><small>{s.text}</small></span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ── Testimonios ──────────────────────────────────────────── */
function Testimonials({ p }) {
  return (
    <section className="pfo-sec">
      <div className="pfo-sec__head">
        <h2 className="pfo-h2" data-reveal>{p.testimonialsTitle}<br /><em>{p.testimonialsEmphasis}</em></h2>
      </div>
      <div className="pfo-testi">
        {p.testimonials.map((t, i) => (
          <figure key={i} data-reveal style={{ '--d': `${i * 0.08}s` }}>
            <span className="pfo-quote__mark" aria-hidden="true">“</span>
            <blockquote>{t.text}</blockquote>
            <figcaption>
              <span className="pfo-testi__avatar">{t.photo ? <img src={t.photo} alt="" /> : (t.name || '?')[0]}</span>
              <span><strong>{t.name}</strong><small>{t.role}</small></span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/* ── Contacto ─────────────────────────────────────────────── */
function Contact({ p, wa, fullName }) {
  const c = p.contact
  const items = [
    c.email && { icon: 'mail', label: c.email, href: `mailto:${c.email}` },
    c.whatsapp && { icon: 'chat', label: `+${c.whatsapp.replace(/\D/g, '')}`, href: wa },
    c.website && { icon: 'globe', label: c.website.replace(/^https?:\/\//, ''), href: /^https?:/.test(c.website) ? c.website : `https://${c.website}` },
    c.location && { icon: 'pin', label: c.location },
  ].filter(Boolean)
  const socials = [
    c.instagram && { name: 'Instagram', href: c.instagram },
    c.github && { name: 'GitHub', href: c.github },
    c.linkedin && { name: 'LinkedIn', href: c.linkedin },
  ].filter(Boolean)
  return (
    <section id="contacto" className="pfo-sec pfo-contact">
      <div>
        <h2 className="pfo-h2 pfo-h2--xl" data-reveal>{p.ctaTitle}<br /><em>{p.ctaEmphasis}</em></h2>
        <p className="pfo-sec__intro" data-reveal>{p.ctaText}</p>
        <div className="pfo-ctas" data-reveal>
          {wa && <a className="pfo-btn pfo-btn--accent" href={wa} target="_blank" rel="noopener noreferrer">{p.ctaButton} <Arrow /></a>}
          {c.email && <a className="pfo-btn" href={`mailto:${c.email}`}>Enviar un correo</a>}
        </div>
      </div>
      <div className="pfo-contact__side" data-reveal>
        <div className="pfo-contact__spin" aria-hidden="true">✱</div>
        <div className="pfo-qr">
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&color=161412&bgcolor=F4EFE7&data=${encodeURIComponent(window.location.origin)}`} alt="Código QR de este sitio" loading="lazy" width="90" height="90" />
          <span>Escanea para<br />visitar mi sitio</span>
        </div>
        <ul className="pfo-contact__list">
          {items.map((it, i) => (
            <li key={i}>
              <span className="pfo-services__icon pfo-services__icon--sm"><Icon name={it.icon} /></span>
              {it.href ? <a href={it.href} target={it.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{it.label}</a> : <span>{it.label}</span>}
            </li>
          ))}
        </ul>
        {socials.length > 0 && (
          <p className="pfo-contact__social">
            {socials.map(s => <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer">{s.name}</a>)}
          </p>
        )}
        <p className="pfo-sign pfo-sign--sm" aria-hidden="true">{p.signature || fullName}</p>
      </div>
    </section>
  )
}

/* ── Íconos ───────────────────────────────────────────────── */
function Arrow() {
  return <svg className="pfo-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
}

const ICONS = {
  monitor: 'M3 4h18v12H3zM8 20h8M12 16v4',
  code: 'm8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14',
  phone: 'M7 2h10v20H7zM11 18h2',
  rocket: 'M5 15c-1 1-2 4-2 6 2 0 5-1 6-2M9 13l2 2M14 4c3-1 6-1 6-1s0 3-1 6l-7 7-5-5zM15 9h.01',
  palette: 'M12 3a9 9 0 1 0 0 18c1 0 2-1 1-2-1-2 0-3 2-3h2a4 4 0 0 0 4-4c0-5-4-9-9-9zM7.5 11h.01M10 7h.01M15 7h.01',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
  chat: 'M21 12a8 8 0 0 1-12 7l-5 1 1-4a8 8 0 1 1 16-4z',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  pin: 'M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  cart: 'M3 4h2l2 12h11l2-8H6M9 20h.01M17 20h.01',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  star: 'm12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
}

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name] || ICONS.star} />
    </svg>
  )
}
