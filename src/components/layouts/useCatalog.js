// Lista ordenada de secciones del catálogo (de fábrica + creadas por la admin)
import { useAdmin } from '../admin/AdminContext'
import { useProductsCtx } from '../../contexts/ProductsContext'
import { useSettingsCtx } from '../../contexts/SettingsContext'
import { CATALOG_SECTIONS, isDraft } from '../../data/catalog'

// Secciones especiales que no son de productos
export const GALLERY_ID = 'galeria'
const GALLERY = {
  id: GALLERY_ID, special: 'gallery', style: 'infinito', name: 'Galería', emoji: '📸',
  eyebrow: 'Galería', title: 'Así se ven nuestras', emphasis: 'creaciones',
  subtitle: 'Desliza o toca una foto para ver el detalle.',
}

export const FEATURED_ID = 'pieza'
const FEATURED = { id: FEATURED_ID, special: 'featured', name: 'Pieza destacada', emoji: '★' }

// Orden de fábrica: destacados → pieza estrella → por tipo → galería → por ocasión
const DEFAULT_ORDER = ['destacados', FEATURED_ID, 'parejas', 'personalizados', GALLERY_ID, 'flores', 'comestibles', 'grados', 'navidad']

export function useCatalog() {
  const { isAdmin } = useAdmin()
  const { products, getBySection, getFeatured } = useProductsCtx()
  const { layouts, customSections, order, hidden } = useSettingsCtx()

  const all = [
    ...CATALOG_SECTIONS,
    GALLERY,
    FEATURED,
    ...customSections.map(s => ({ ...s, emoji: s.emoji || '✨', name: [s.title, s.emphasis].filter(Boolean).join(' '), custom: s })),
  ]
  const byId = Object.fromEntries(all.map(s => [s.id, s]))
  const base = [...DEFAULT_ORDER, ...customSections.map(s => s.id)]
  const savedOrder = order.filter(id => byId[id])
  const ids = [...savedOrder, ...base.filter(id => !savedOrder.includes(id))]

  const visibleProducts = isAdmin ? products : products.filter(p => !isDraft(p))

  const sections = ids.map(id => {
    const s = byId[id]
    const feat = getFeatured()
    const items = s.special === 'gallery'
      ? visibleProducts
      : s.special === 'featured'
      ? (feat && (isAdmin || !isDraft(feat)) ? [feat] : [])
      : (isAdmin ? getBySection(id) : getBySection(id).filter(p => !isDraft(p)))
    return {
      ...s,
      style: layouts[id] || s.style || 'catalogo',
      items,
      hidden: hidden.includes(id),
    }
  })

  // Lo que ve el cliente: secciones con productos y no ocultas
  const publicSections = sections.filter(s => !s.hidden && s.items.length > 0)

  return { sections, publicSections, ids, visibleProducts }
}
