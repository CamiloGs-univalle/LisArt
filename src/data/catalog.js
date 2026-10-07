// src/data/catalog.js
// ─────────────────────────────────────────────────────────────
// MAPA DEL CATÁLOGO DE CREACIONES LISART
// Orden: primero lo más bonito y vendible, luego por tipo de
// regalo y por ocasión. Un producto puede estar en VARIAS
// secciones (ej. el Cuadro Spotify en Destacados, Parejas y
// Personalizados).
// ─────────────────────────────────────────────────────────────

export const CATALOG_SECTIONS = [
  {
    id: 'destacados', emoji: '⭐', name: 'Destacados',
    eyebrow: 'Lo más pedido', title: 'Nuestros', emphasis: 'destacados',
    subtitle: 'Los detalles que más enamoran.',
    style: 'arcos',
  },
  {
    id: 'parejas', emoji: '💕', name: 'Para parejas',
    eyebrow: 'Amor', title: 'Para', emphasis: 'parejas',
    subtitle: 'Detalles para compartir con esa persona especial.',
    style: 'revista',
  },
  {
    id: 'personalizados', emoji: '🎁', name: 'Personalizados',
    eyebrow: 'Hecho para ti', title: 'Regalos', emphasis: 'personalizados',
    subtitle: 'Cuadros, cajas, camisas, vasos, llaveros y más, con tus fotos, frases y diseño.',
    style: 'catalogo',
  },
  {
    id: 'flores', emoji: '🌹', name: 'Flores & ramos',
    eyebrow: 'Flores', title: 'Flores &', emphasis: 'ramos',
    subtitle: 'Rosas eternas, ramos y bouquets armados a mano.',
    style: 'polaroid',
  },
  {
    id: 'comestibles', emoji: '🍓', name: 'Comestibles',
    eyebrow: 'Dulces', title: 'Detalles', emphasis: 'dulces',
    subtitle: 'Fresones, chocofresas, paletas y desayunos sorpresa.',
    style: 'formas',
  },
  {
    id: 'grados', emoji: '🎓', name: 'Grados',
    eyebrow: 'Ocasión', title: 'Para celebrar el', emphasis: 'grado',
    subtitle: 'Bouquets, ramos, cuadros, alcancías y cajas de graduación.',
    style: 'coverflow',
  },
  {
    id: 'navidad', emoji: '🎄', name: 'Navidad',
    eyebrow: 'Temporada', title: 'Magia de', emphasis: 'Navidad',
    subtitle: 'Velas, esferas personalizadas y calendarios imantados.',
    style: 'carrusel',
  },
]

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
