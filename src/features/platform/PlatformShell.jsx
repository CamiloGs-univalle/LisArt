// Envoltura de las páginas de la plataforma (login, super admin):
// usan el tema neutro "Negro y dorado" para no mezclarse con ningún negocio.
import { useEffect } from 'react'
import { applyTheme } from '@/features/tenant/themes'
import { PLATFORM } from '@/config/platform'
import './Platform.css'

export default function PlatformShell({ title, children, wide = false }) {
  useEffect(() => {
    applyTheme({ preset: 'noche' })
    document.title = title ? `${title} · ${PLATFORM.name}` : PLATFORM.name
  }, [title])
  return <div className={`pf ${wide ? 'pf--wide' : ''}`}>{children}</div>
}
