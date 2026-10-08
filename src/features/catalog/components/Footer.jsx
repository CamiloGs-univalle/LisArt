// Cierre de la página: llamado final + redes + pie
import './Footer.css'
import Icon from '@/shared/ui/Icon'
import EditText from '@/features/editor/EditText'
import { useSiteContent } from '@/features/tenant/useSiteContent'
import { useTenant } from '@/features/tenant/TenantProvider'
import { useWhatsApp } from '@/features/tenant/useWhatsApp'
import { Link } from '@/app/router'
import { PLATFORM } from '@/config/platform'
import Reveal from '@/shared/ui/Reveal'

function Footer() {
  const { footer: F } = useSiteContent()
  const { brand } = useTenant()
  const wa = useWhatsApp()
  const waHref = wa.link('Hola {negocio} 👋 Tengo una pregunta.')
  // Solo se muestran las redes que el negocio haya configurado
  const LINKS = [
    { name: 'Instagram', icon: 'instagram', href: brand.instagram },
    { name: 'TikTok', icon: 'tiktok', href: brand.tiktok },
    { name: 'Facebook', icon: 'facebook', href: brand.facebook },
    { name: 'WhatsApp', icon: 'whatsapp', href: brand.whatsapp ? wa.link() : '' },
  ].filter(l => l.href)
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
            <span className="foot__word">{brand.name}</span>
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
            © {new Date().getFullYear()} {brand.name} · <EditText path="footer.legal" fallback={F.legal} />
            <br />
            <span className="foot__credit">
              Catálogo creado con {PLATFORM.name} · <Link to="/admin">Administrar</Link>
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
