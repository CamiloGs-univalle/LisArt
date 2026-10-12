// Plantilla "Moda urbana": ropa, tenis, gorras, streetwear.
// Gris claro, negro y naranja; esquinas rectas.
import { extendTemplate } from './_base'

export default extendTemplate({
  id: 'moda',
  label: 'Moda urbana',
  description: 'Estilo streetwear: negro, gris y naranja, esquinas rectas. Para ropa, tenis y accesorios.',
  layout: 'terrain',
  theme: 'streetwear',
  sections: [
    { id: 'lanzamientos', emoji: '🔥', name: 'Lanzamientos', eyebrow: 'Drop', title: 'Nuevos', emphasis: 'lanzamientos', subtitle: 'Lo más nuevo de la colección.', style: 'coverflow' },
    { id: 'hombre', emoji: '🧥', name: 'Hombre', eyebrow: 'Colección', title: 'Para', emphasis: 'él', subtitle: 'Camisetas, hoodies, pantalones y más.', style: 'catalogo' },
    { id: 'mujer', emoji: '👗', name: 'Mujer', eyebrow: 'Colección', title: 'Para', emphasis: 'ella', subtitle: 'Lo último en tendencia.', style: 'catalogo' },
    { id: 'accesorios', emoji: '🧢', name: 'Accesorios', eyebrow: 'Completa tu look', title: 'Accesorios', emphasis: 'urbanos', subtitle: 'Gorras, bolsos, medias y más.', style: 'carrusel' },
    { id: 'ofertas', emoji: '🏷️', name: 'Sale', eyebrow: 'Sale', title: 'Precios', emphasis: 'especiales', subtitle: 'Por tiempo limitado.', style: 'arcos' },
  ],
  order: ['lanzamientos', 'pieza', 'hombre', 'mujer', 'galeria', 'accesorios', 'ofertas'],
  content: {
    announcements: ['Nueva colección disponible', 'Envíos en {ciudad}', 'Cambios fáciles'],
    hero: {
      sticker: 'Nueva colección',
      titleStart: 'Hecho para hoy.',
      titleEmphasis: 'Diseñado',
      titleEnd: 'para destacar.',
      subtitle: 'Prendas con estilo propio. Elige tu talla y pide por WhatsApp.',
      primaryCta: 'Ver colección',
      secondaryCta: 'Preguntar tallas',
    },
    ribbon: ['Nueva colección', 'Tallas S–XXL', 'Envíos', 'Cambios fáciles', 'Pide por WhatsApp'],
  },
})
