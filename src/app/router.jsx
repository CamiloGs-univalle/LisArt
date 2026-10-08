// ─────────────────────────────────────────────────────────────
// Enrutador mínimo (sin dependencias):
//   /            → catálogo por defecto (PLATFORM.defaultTenant)
//   /admin       → iniciar sesión
//   /super       → panel del super administrador
//   /:negocio    → catálogo de un negocio
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { PLATFORM } from '@/config/platform'

const EVENT = 'app:navigate'

export function navigate(to, { replace = false } = {}) {
  if (to === window.location.pathname + window.location.search) return
  window.history[replace ? 'replaceState' : 'pushState']({}, '', to)
  window.dispatchEvent(new Event(EVENT))
  window.scrollTo(0, 0)
}

export function parseRoute(pathname) {
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean)
  const [first] = parts
  if (!first) return PLATFORM.defaultTenant ? { name: 'catalog', slug: PLATFORM.defaultTenant, isRoot: true } : { name: 'home' }
  if (first === 'admin' || first === 'login') return { name: 'login' }
  if (first === 'super') return { name: 'super' }
  return { name: 'catalog', slug: decodeURIComponent(first).toLowerCase() }
}

export function useRoute() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const on = () => setPath(window.location.pathname)
    window.addEventListener('popstate', on)
    window.addEventListener(EVENT, on)
    return () => { window.removeEventListener('popstate', on); window.removeEventListener(EVENT, on) }
  }, [])
  return parseRoute(path)
}

// Enlace interno que no recarga la página
export function Link({ to, onClick, ...rest }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        navigate(to)
      }}
      {...rest}
    />
  )
}

// URL pública de un catálogo
export const catalogPath = (slug) => (slug === PLATFORM.defaultTenant ? '/' : `/${slug}`)
export const catalogUrl = (slug) => `${window.location.origin}/${slug}`
