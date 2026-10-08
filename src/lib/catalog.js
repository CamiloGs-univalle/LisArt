// Utilidades de productos del catálogo

// Secciones de la versión anterior → sección nueva donde aparecen sus productos
export const LEGACY_SECTIONS = {
  featured: 'destacados',
  promos_grande: 'destacados',
  carousel_cajas: 'personalizados',
  list_regalos: 'personalizados',
  promos_mediano: 'personalizados',
  promos_circulo: 'personalizados',
  grid_arreglos: 'flores',
}

// Secciones en las que aparece un producto
export const productSections = (p) => {
  if (Array.isArray(p?.sections) && p.sections.length) return p.sections
  if (!p?.section) return []
  return [LEGACY_SECTIONS[p.section] || p.section]
}

// Producto aún sin terminar de cargar (sin foto real o sin nombre)
export const isDraft = (p) =>
  !p?.image || String(p.image).includes('placehold.co') || !p?.name || p.name === 'Nuevo Producto'
