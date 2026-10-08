// Cierre de la página: llamado final + redes + pie
import './SocialLinks.css'
import { BRAND, SOCIALS } from '../../../data/siteContent'
import { WHATSAPP_NUMBER } from '../../../data/products'
import Icon from '../../ui/Icon'
import EditText from '../../ui/EditText'
import { DEFAULT_CONTENT } from '../../../hooks/useSiteContent'
import Reveal from '../../ui/Reveal'

const LINKS = [
  { name: 'Instagram', icon: 'instagram', href: SOCIALS.instagram },
  { name: 'TikTok', icon: 'tiktok', href: SOCIALS.tiktok },
  { name: 'Facebook', icon: 'facebook', href: SOCIALS.facebook },
  { name: 'WhatsApp', icon: 'whatsapp', href: `https://wa.me/${WHATSAPP_NUMBER}` },
]

function SocialLinks() {
  const F = DEFAULT_CONTENT.footer
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola LisArt 👋 Tengo una idea para un regalo personalizado.')}`
  return (
    <footer className="foot">
      <div className="container">
        <Reveal className="foot__cta">
          <EditText path="footer.eyebrow" fallback={F.eyebrow} as="p" className="eyebrow foot__eyebrow" />
          <h2 className="display foot__title">
            <EditText path="footer.title" fallback={F.title} /> <em><EditText path="footer.emphasis" fallback={F.emphasis} /></em> <EditText path="footer.titleEnd" fallback={F.titleEnd} />
          </h2>
          <a className="btn btn--rose" href={waHref} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" /> <EditText path="footer.cta" fallback={F.cta} inButton />
          </a>
        </Reveal>

        <div className="foot__bottom">
          <div className="foot__brand">
            <span className="foot__word">{BRAND.name}</span>
            <EditText path="footer.tagline" fallback={F.tagline} className="foot__tag" />
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
            © {new Date().getFullYear()} {BRAND.name} · <EditText path="footer.legal" fallback={F.legal} />
          </p>
        </div>
      </div>
    </footer>
  )
}

export default SocialLinks
