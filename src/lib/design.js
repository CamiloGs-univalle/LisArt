// ─────────────────────────────────────────────────────────────
// "Abanico de diseños": cómo se muestran los productos.
//  · Estilo de cada sección (por estructura): 'auto' = el diseño propio de la estructura
//  · Estilo de tarjeta (todo el catálogo)
//  · Destacar un producto: grande, a lo ancho (banner) o con fondo de color
// ─────────────────────────────────────────────────────────────
export const CARD_STYLES = {
  auto: { label: 'Automático', hint: 'Cada estructura usa su propio diseño de tarjeta.' },
  clasica: { label: 'Clásica', hint: 'Foto arriba, texto y precio abajo.' },
  encima: { label: 'Texto sobre la foto', hint: 'La foto completa con el nombre y el precio encima.' },
  polaroid: { label: 'Polaroid', hint: 'Marco blanco, foto cuadrada y nombre a mano.' },
  minimal: { label: 'Minimal', hint: 'Sin caja: solo la foto y el texto centrado.' },
  borde: { label: 'Con borde', hint: 'Línea fina alrededor y esquinas rectas.' },
  flotante: { label: 'Flotante', hint: 'Sombra suave y esquinas muy redondeadas.' },
}

export const HIGHLIGHTS = {
  '': { label: 'Normal' },
  grande: { label: 'Grande (ocupa 2 espacios)' },
  banner: { label: 'A lo ancho (banner)' },
  color: { label: 'Con fondo de color' },
}

export const sectionStyleFor = (sectionStyles, layout, sectionId) => (sectionStyles?.[layout] || {})[sectionId] || 'auto'
