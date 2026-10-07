// Hero editorial de LisArt
import './WelcomeSection.css'
import { useAdmin } from '../../admin/AdminContext'
import { HERO, PROMISES, BRAND } from '../../../data/siteContent'
import { WHATSAPP_NUMBER } from '../../../data/products'
import { useLogo } from './useLogo'
import Icon from '../../ui/Icon'

function CircleText({ text }) {
  return (
    <svg viewBox="0 0 120 120" className="hero__seal-text" aria-hidden="true">
      <defs>
        <path id="seal-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
      </defs>
      <text>
        <textPath href="#seal-circle" startOffset="0">{text}</textPath>
      </text>
    </svg>
  )
}

function WelcomeSection({ images = [], onExplore }) {
  const { isAdmin } = useAdmin()
  const logo = useLogo()
  const shots = images.filter(Boolean).slice(0, 3)
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola LisArt 👋 Quiero un regalo personalizado. ¿Me ayudas?')}`

  const removeLogo = () => {
    try { localStorage.removeItem('lisart_logo') } catch { /* noop */ }
    window.dispatchEvent(new CustomEvent('lisart_logo_changed', { detail: null }))
  }

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__glow" aria-hidden="true" />
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">
            <span className="hero__dot" aria-hidden="true" /> {HERO.eyebrow}
          </p>

          <h1 id="hero-title" className="display hero__title">
            {HERO.titleStart}{' '}
            <em className="hero__em">
              {HERO.titleEmphasis}
              <svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 14 C 40 4, 90 4, 120 10 S 180 17, 197 6" />
              </svg>
            </em>{' '}
            {HERO.titleEnd}
          </h1>

          <p className="hero__sub">{HERO.subtitle}</p>

          <div className="hero__ctas">
            <button className="btn btn--primary" onClick={onExplore}>
              {HERO.primaryCta} <Icon name="arrow" />
            </button>
            <a className="btn btn--ghost" href={waHref} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" /> {HERO.secondaryCta}
            </a>
          </div>

          {isAdmin && (
            <div className="hero__admin">
              <span className="admin-chip">Admin · Logo</span>
              <button className="admin-chip" onClick={() => window.__openLogoUpload?.()}>
                {logo ? 'Cambiar logo' : 'Subir logo'}
              </button>
              {logo && <button className="admin-chip" onClick={removeLogo}>Quitar logo</button>}
            </div>
          )}
        </div>

        <div className={`hero__art hero__art--${shots.length || 0}`} aria-hidden="true">
          {shots.length > 0 ? (
            shots.map((src, i) => (
              <figure key={i} className={`hero__shot hero__shot--${i + 1}`}>
                <img src={src} alt="" loading={i === 0 ? 'eager' : 'lazy'} fetchpriority={i === 0 ? 'high' : undefined} decoding="async" />
              </figure>
            ))
          ) : (
            <>
              <div className="hero__shot hero__shot--1 hero__shot--empty" />
              <div className="hero__shot hero__shot--2 hero__shot--empty" />
            </>
          )}

          <div className="hero__seal">
            <CircleText text={`HECHO A MANO · CON AMOR · ${BRAND.name.toUpperCase()} · `} />
            <span className="hero__seal-core">
              {logo ? <img src={logo} alt="" /> : <Icon name="heart" size={22} />}
            </span>
          </div>

          <svg className="hero__doodle" viewBox="0 0 80 80" aria-hidden="true">
            <path d="M40 8c3 15 10 22 25 25-15 3-22 10-25 25-3-15-10-22-25-25 15-3 22-10 25-25Z" />
          </svg>
        </div>
      </div>

      <div className="container">
        <ul className="promises">
          {PROMISES.map(p => (
            <li key={p.title} className="promise">
              <span className="promise__icon"><Icon name={p.icon} size={20} /></span>
              <span>
                <strong>{p.title}</strong>
                <small>{p.text}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default WelcomeSection
