// Plantilla "Variedades y surtido": ferreterías, papelerías, misceláneas, supermercados.
import { extendTemplate } from './_base'

export default extendTemplate({
  id: 'variedades',
  label: 'Variedades y surtido',
  description: 'Clara y práctica para muchos productos: búsqueda, filtros y categorías. Para ferreterías, papelerías, misceláneas y supermercados.',
  layout: 'tienda',
  theme: 'oceano',
  sections: [
    { id: 'destacados', emoji: '⭐', name: 'Destacados', eyebrow: 'Lo más vendido', title: 'Más', emphasis: 'vendidos', subtitle: '', style: 'carrusel' },
    { id: 'hogar', emoji: '🏠', name: 'Hogar', eyebrow: '', title: 'Hogar', emphasis: '', subtitle: '', style: 'catalogo' },
    { id: 'oficina', emoji: '✏️', name: 'Papelería y oficina', eyebrow: '', title: 'Papelería', emphasis: 'y oficina', subtitle: '', style: 'catalogo' },
    { id: 'herramientas', emoji: '🔧', name: 'Herramientas', eyebrow: '', title: 'Herramientas', emphasis: '', subtitle: '', style: 'catalogo' },
    { id: 'ofertas', emoji: '🏷️', name: 'Ofertas', eyebrow: '', title: 'Ofertas', emphasis: 'de la semana', subtitle: '', style: 'catalogo' },
  ],
  order: ['destacados', 'hogar', 'oficina', 'herramientas', 'ofertas'],
  content: {
    announcements: ['Domicilios en {ciudad}', 'Pide por WhatsApp', 'Precios de mayorista desde 12 unidades'],
    hero: {
      sticker: 'Todo en un solo lugar',
      titleStart: 'Lo que necesitas,',
      titleEmphasis: 'a buen precio',
      titleEnd: '',
      subtitle: 'Busca, agrega al carrito y envía tu pedido por WhatsApp. Te lo llevamos.',
      primaryCta: 'Ver productos',
      secondaryCta: 'Escribir por WhatsApp',
    },
  },
})
