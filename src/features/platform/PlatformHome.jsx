// Página de inicio de la plataforma (solo si no hay catálogo por defecto)
import PlatformShell from './PlatformShell'
import { Link } from '@/app/router'
import { PLATFORM } from '@/config/platform'

export default function PlatformHome() {
  return (
    <PlatformShell>
      <main className="pf-center">
        <div className="pf-card pf-card--hero">
          <p className="eyebrow">{PLATFORM.name}</p>
          <h1 className="display pf-title">Catálogos digitales que <em>venden</em> por WhatsApp</h1>
          <p className="pf-muted">Cada negocio tiene su propio catálogo, con su diseño, sus productos y sus pedidos directo a WhatsApp.</p>
          <Link to="/admin" className="btn btn--primary">Entrar a mi catálogo</Link>
        </div>
      </main>
    </PlatformShell>
  )
}
