// Cierre de la página: llamado final + redes + pie
import './SocialLinks.css'
import { BRAND, SOCIALS } from '../../../data/siteContent'
import { WHATSAPP_NUMBER } from '../../../data/products'
import Icon from '../../ui/Icon'
import Reveal from '../../ui/Reveal'

const LINKS = [
  { name: 'Instagram', icon: 'instagram', href: SOCIALS.instagram },
  { name: 'TikTok', icon: 'tiktok', href: SOCIALS.tiktok },
  { name: 'Facebook', icon: 'facebook', href: SOCIALS.facebook },
  { name: 'WhatsApp', icon: 'whatsapp', href: `https://wa.me/${WHATSAPP_NUMBER}` },
]

function SocialLinks() {
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola LisArt 👋 Tengo una idea para un regalo personalizado.')}`
  return (
    <footer className="foot">
      <div className="container">
        <Reveal className="foot__cta">
          <p className="eyebrow foot__eyebrow">Pedidos con anticipación · Envíos a todo Cali</p>
          <h2 className="display foot__title">
            ¿Lo imaginas? <em>Lo creamos</em> para ti.
          </h2>
          <a className="btn btn--rose" href={waHref} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" /> Escríbenos por WhatsApp
          </a>
        </Reveal>

        <div className="foot__bottom">
          <div className="foot__brand">
            <span className="foot__word">{BRAND.name}</span>
            <span className="foot__tag">{BRAND.tagline}</span>
          </div>

          <ul className="foot__social" aria-label="Redes sociales">
            {LINKS.map(s => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}>
                  <Icon name={s.icon} size={20} />
                </a>
              </li>
            ))}
          </ul>

          <p className="foot__legal">
            © {new Date().getFullYear()} {BRAND.name} · Regalos personalizados hechos a mano · Cali, Colombia
          </p>
        </div>
      </div>
    </footer>
  )
}

export default SocialLinks
