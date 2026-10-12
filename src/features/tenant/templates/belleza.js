// Plantilla "Belleza y spa": salones, uñas, cosmética, spa y bienestar.
import { extendTemplate } from './_base'

export default extendTemplate({
  id: 'belleza',
  label: 'Belleza y spa',
  description: 'Serena y elegante, tonos naturales. Servicios, tratamientos y productos. Para salones, uñas, spa y cosmética.',
  layout: 'servicios',
  theme: 'spa',
  sections: [
    { id: 'destacados', emoji: '🌿', name: 'Favoritos', eyebrow: 'Lo más pedido', title: 'Nuestros', emphasis: 'favoritos', subtitle: 'Los rituales que más aman nuestras clientas.', style: 'carrusel' },
    { id: 'servicios', emoji: '💆', name: 'Servicios', eyebrow: 'Agenda tu cita', title: 'Servicios', emphasis: 'y tratamientos', subtitle: 'Reserva por WhatsApp en un clic.', style: 'catalogo' },
    { id: 'productos', emoji: '🧴', name: 'Productos', eyebrow: 'Cuidado en casa', title: 'Productos', emphasis: 'para ti', subtitle: 'Lleva el cuidado a tu rutina diaria.', style: 'catalogo' },
    { id: 'paquetes', emoji: '🎁', name: 'Paquetes', eyebrow: 'Regala bienestar', title: 'Paquetes', emphasis: 'y bonos', subtitle: 'Ideales para regalar o consentirte.', style: 'arcos' },
  ],
  order: ['destacados', 'servicios', 'productos', 'paquetes', 'galeria'],
  content: {
    announcements: ['Agenda por WhatsApp', 'Atención con cita', 'Bonos de regalo'],
    hero: {
      sticker: 'Tu momento',
      titleStart: 'Belleza que',
      titleEmphasis: 'se siente',
      titleEnd: '',
      subtitle: 'Tratamientos, servicios y productos pensados para ti. Elige y agenda por WhatsApp.',
      primaryCta: 'Ver servicios',
      secondaryCta: 'Agendar cita',
    },
    ribbon: ['Bienestar', 'Cuidado', 'Productos naturales', 'Con cita', 'Bonos de regalo'],
    how: [
      { title: 'Elige', text: 'Escoge tu servicio, tratamiento o producto.' },
      { title: 'Agenda', text: 'Envíanos tu solicitud por WhatsApp y acordamos el horario.' },
      { title: 'Relájate', text: 'Nosotros nos encargamos del resto.' },
    ],
    story: { title: 'Un espacio para', titleEmphasis: 'ti', text: 'En {negocio} creemos que cuidarte no es un lujo: es parte de sentirte bien todos los días.', sign: 'Con cariño, {negocio}' },
    faq: [
      { q: '¿Cómo agendo una cita?', a: 'Agrega el servicio y envíanos la solicitud por WhatsApp. Te confirmamos el horario disponible.' },
      { q: '¿Puedo regalar un servicio?', a: 'Sí, tenemos bonos de regalo personalizados.' },
      { q: '¿Dónde están ubicados?', a: 'Estamos en {ciudad}. Te enviamos la ubicación al confirmar tu cita.' },
    ],
    cartNote: 'El horario y el pago se confirman por WhatsApp.',
    perks: ['Atención con cita', 'Bonos de regalo'],
    footer: { eyebrow: 'Atención con cita · {ciudad}', title: 'Agenda', emphasis: 'tu momento', titleEnd: '', cta: 'Agendar por WhatsApp', legal: '{ciudad}, Colombia' },
  },
})
