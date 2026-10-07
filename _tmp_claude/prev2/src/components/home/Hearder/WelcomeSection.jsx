// Hero de LisArt — colorido, con collage tipo polaroid y stickers
import './WelcomeSection.css'
import { useAdmin } from '../../admin/AdminContext'
import { HERO, STATS, BRAND } from '../../../data/siteContent'
import { WHATSAPP_NUMBER } from '../../../data/products'
import { useLogo } from './useLogo'
import Icon from '../../ui/Icon'

function CircleText({ text }) {
  return (
    <svg viewBox="0 0 120 120" className="hero__seal-text" aria-hidden="true">
      <defs>
        <path id="seal-circle" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
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
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('¡Hola LisArt! 👋 Quiero cotizar un regalo personalizado.')}`

  const removeLogo = () => {
    try { localStorage.removeItem('lisart_logo') } catch { /* noop */ }
    window.dispatchEvent(new CustomEvent('lisart_logo_changed', { detail: null }))
  }

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true">
        <span className="blob blob--1" />
        <span className="blob blob--2" />
        <span className="blob blob--3" />
      </div>

      <div className="container hero__grid">
        <div className="hero__copy">
          <span className="sticker hero__sticker">{HERO.sticker}</span>

          <h1 id="hero-title" className="display hero__title">
            {HERO.titleStart}{' '}
            <em>
              {HERO.titleEmphasis}
              <svg className="hero__heart" viewBox="0 0 40 36" aria-hidden="true">
                <path d="M20 33S3 22.5 3 11.5A8.5 8.5 0 0 1 20 7a8.5 8.5 0 0 1 17 4.5C37 22.5 20 33 20 33Z" />
              </svg>
            </em>{' '}
            <span className="hero__end">{HERO.titleEnd}</span>
          </h1>

          <p className="hero__sub">{HERO.subtitle}</p>

          <div className="hero__ctas">
            <button className="btn btn--primary" onClick={onExplore}>
              <Icon name="gift" /> {HERO.primaryCta}
            </button>
            <a className="btn btn--ghost" href={waHref} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" /> {HERO.secondaryCta}
            </a>
          </div>

          <ul className="hero__stats">
            {STATS.map((s, i) => (
              <li key={s.label} style={{ '--c': ['var(--c-blue)', 'var(--c-magenta)', 'var(--c-green)'][i % 3] }}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>

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
                <span className="hero__tape" />
                <img src={src} alt="" loading={i === 0 ? 'eager' : 'lazy'} fetchpriority={i === 0 ? 'high' : undefined} decoding="async" />
              </figure>
            ))
          ) : (
            <>
              <div className="hero__shot hero__shot--1 hero__shot--empty" />
              <div className="hero__shot hero__shot--2 hero__shot--empty" />
            </>
          )}

          <span className="sticker hero__tag hero__tag--a">¡Personalizado!</span>
          <span className="sticker hero__tag hero__tag--b"><Icon name="truck" size={18} /> Envíos en Cali</span>

          <div className="hero__seal">
            <CircleText text={`HECHO A MANO ✦ CON AMOR ✦ ${BRAND.name.toUpperCase()} ✦ `} />
            <span className="hero__seal-core">
              {logo ? <img src={logo} alt="" /> : <Icon name="heart" size={22} strokeWidth={2.2} />}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WelcomeSection
