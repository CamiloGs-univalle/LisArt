// Ayudas compartidas por las páginas para Google (catálogo, mapa del sitio, listado de productos)
import { getDoc, listDocs } from './firestore.js'

export const SLUG_RE = /^[a-z0-9-]{3,40}$/
export const RESERVED = ['admin', 'super', 'login', 'api', 'app', 'assets', 'static', 'ayuda', 'soporte', 'registro']

// Dominio del sitio. No se confía en el encabezado Host (podría venir manipulado):
// 1) SITE_ORIGIN (ej. https://catalogospro.com) · 2) el dominio de producción de Vercel
// 3) el Host solo si es un dominio *.vercel.app o localhost (vistas previas y pruebas)
export const originOf = (req) => {
  const fixed = (process.env.SITE_ORIGIN || '').trim().replace(/\/+$/, '')
  if (/^https:\/\/[a-z0-9.-]+$/i.test(fixed)) return fixed
  const prod = (process.env.VERCEL_PROJECT_PRODUCTION_URL || '').trim()
  const host = String(req.headers.host || '').toLowerCase()
  if (/^[a-z0-9-]+\.vercel\.app$/.test(host)) return `https://${host}`
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return `http://${host}`
  if (/^[a-z0-9.-]+$/i.test(prod)) return `https://${prod}`
  return `https://${host.replace(/[^a-z0-9.:-]/g, '')}`
}

// Negocio + productos (solo lo público)
export async function loadCatalog(slug) {
  if (!SLUG_RE.test(slug) || RESERVED.includes(slug)) return null
  const tenant = await getDoc(`tenants/${slug}`)
  if (!tenant) return null
  const products = await listDocs(`tenants/${slug}/products`, { max: 1000 })
  return { tenant, products }
}
