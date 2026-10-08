// Lista ordenada de secciones del catálogo (de fábrica + creadas por la admin)
import { useAdmin } from '@/features/editor/EditorProvider'
import { useProductsCtx } from '@/features/catalog/data/ProductsProvider'
import { useSettingsCtx } from '@/features/catalog/data/SettingsProvider'
import { isDraft } from '@/lib/catalog'
import { useTenant } from '@/features/tenant/TenantProvider'
import { fillTemplate } from '@/features/tenant/templates'

// Secciones especiales que no son de productos
export const GALLERY_ID = 'galeria'
const GALLERY = {
  id: GALLERY_ID, special: 'gallery', style: 'infinito', name: 'Galería', emoji: '📸',
  eyebrow: 'Galería', title: 'Así se ven nuestras', emphasis: 'creaciones',
  subtitle: 'Desliza o toca una foto para ver el detalle.',
}

export const FEATURED_ID = 'pieza'
const FEATURED = { id: FEATURED_ID, special: 'featured', name: 'Pieza destacada', emoji: '★' }


export function useCatalog() {
  const { isAdmin } = useAdmin()
  const { products, getBySection, getFeatured } = useProductsCtx()
  const { layouts, customSections, order, hidden, content = {} } = useSettingsCtx()
  const { template, brand } = useTenant()
  const templateSections = fillTemplate(template.sections, { negocio: brand.name, ciudad: brand.city })
  // Orden de fábrica de la plantilla (ej. destacados → pieza estrella → por tipo → galería)
  const DEFAULT_ORDER = template.order || [...templateSections.map(s => s.id), FEATURED_ID, GALLERY_ID]

  const all = [
    ...templateSections,
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
    const ov = (content.sec || {})[id] || {}
    return {
      ...s,
      baseName: s.name,
      name: ov.name || s.name,
      style: layouts[id] || s.style || 'catalogo',
      items,
      hidden: hidden.includes(id),
    }
  })

  // Lo que ve el cliente: secciones con productos y no ocultas
  const publicSections = sections.filter(s => !s.hidden && s.items.length > 0)

  return { sections, publicSections, ids, visibleProducts }
}
