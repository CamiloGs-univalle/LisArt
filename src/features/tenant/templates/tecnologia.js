// Plantilla "Tecnología": celulares, accesorios, gaming, servicios técnicos.
// Modo oscuro con acentos morados.
import { extendTemplate } from './_base'

export default extendTemplate({
  id: 'tecnologia',
  label: 'Tecnología (oscuro)',
  description: 'Modo oscuro con acentos neón. Para celulares, accesorios, gaming y tecnología.',
  layout: 'bento',
  theme: 'tech',
  sections: [
    { id: 'destacados', emoji: '⚡', name: 'Destacados', eyebrow: 'Lo más vendido', title: 'Top', emphasis: 'ventas', subtitle: 'Lo que más piden nuestros clientes.', style: 'carrusel' },
    { id: 'celulares', emoji: '📱', name: 'Celulares', eyebrow: 'Smartphones', title: 'Celulares', emphasis: 'y tablets', subtitle: 'Equipos nuevos con garantía.', style: 'catalogo' },
    { id: 'accesorios', emoji: '🎧', name: 'Accesorios', eyebrow: 'Complementa', title: 'Accesorios', emphasis: 'y audio', subtitle: 'Cargadores, audífonos, fundas y más.', style: 'catalogo' },
    { id: 'gaming', emoji: '🎮', name: 'Gaming', eyebrow: 'Juega', title: 'Zona', emphasis: 'gamer', subtitle: 'Controles, consolas y periféricos.', style: 'coverflow' },
    { id: 'ofertas', emoji: '🏷️', name: 'Ofertas', eyebrow: 'Ahorra', title: 'Ofertas', emphasis: 'de la semana', subtitle: 'Precios especiales por tiempo limitado.', style: 'arcos' },
  ],
  order: ['destacados', 'pieza', 'celulares', 'accesorios', 'galeria', 'gaming', 'ofertas'],
  content: {
    announcements: ['Garantía en todos los productos', 'Envíos en {ciudad}', 'Pide por WhatsApp'],
    hero: {
      sticker: 'Tecnología original',
      titleStart: 'La tecnología',
      titleEmphasis: 'que buscas,',
      titleEnd: 'al mejor precio',
      subtitle: 'Equipos originales, garantía y asesoría real. Arma tu pedido y envíalo por WhatsApp.',
      primaryCta: 'Ver productos',
      secondaryCta: 'Asesoría por WhatsApp',
    },
    ribbon: ['Originales', 'Garantía', 'Envíos', 'Asesoría', 'Pide por WhatsApp'],
    stats: [
      { value: '100%', label: 'productos originales' },
      { value: '24 h', label: 'respuesta rápida' },
      { value: '✓', label: 'garantía' },
    ],
  },
})
