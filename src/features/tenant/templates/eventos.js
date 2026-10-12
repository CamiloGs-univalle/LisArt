// Plantilla "Eventos y celebraciones": decoración, banquetes, alquiler, bodas, quinceañeros.
import { extendTemplate } from './_base'

export default extendTemplate({
  id: 'eventos',
  label: 'Eventos y celebraciones',
  description: 'Elegante y nocturna, con dorados. Paquetes, decoración y alquiler. Para bodas, quinceañeros, cumpleaños y eventos.',
  layout: 'clasico',
  theme: 'fiesta',
  sections: [
    { id: 'destacados', emoji: '✨', name: 'Destacados', eyebrow: 'Los más elegidos', title: 'Momentos', emphasis: 'inolvidables', subtitle: 'Las propuestas favoritas de nuestros clientes.', style: 'carrusel' },
    { id: 'paquetes', emoji: '🎉', name: 'Paquetes', eyebrow: 'Todo incluido', title: 'Paquetes', emphasis: 'para tu evento', subtitle: 'Elige uno y lo ajustamos a tu idea.', style: 'catalogo' },
    { id: 'decoracion', emoji: '🎈', name: 'Decoración', eyebrow: 'Ambientación', title: 'Decoración', emphasis: 'a tu estilo', subtitle: 'Globos, flores, luces y montajes temáticos.', style: 'arcos' },
    { id: 'alquiler', emoji: '🪑', name: 'Alquiler', eyebrow: 'Mobiliario', title: 'Alquiler', emphasis: 'de mobiliario', subtitle: 'Mesas, sillas, mantelería y más.', style: 'catalogo' },
  ],
  order: ['destacados', 'paquetes', 'decoracion', 'galeria', 'alquiler'],
  content: {
    announcements: ['Cotiza sin compromiso', 'Eventos en {ciudad}', 'Reserva tu fecha'],
    hero: {
      sticker: 'Reserva tu fecha',
      titleStart: 'Celebra',
      titleEmphasis: 'en grande',
      titleEnd: '',
      subtitle: 'Decoración, paquetes y alquiler para bodas, quinceañeros, cumpleaños y eventos empresariales. Cotiza por WhatsApp.',
      primaryCta: 'Ver paquetes',
      secondaryCta: 'Cotizar mi evento',
    },
    stats: [
      { value: '+200', label: 'eventos realizados' },
      { value: '100%', label: 'personalizado' },
      { value: '24 h', label: 'para tu cotización' },
    ],
    ribbon: ['Bodas', 'Quinceañeros', 'Cumpleaños', 'Baby showers', 'Eventos empresariales'],
    how: [
      { title: 'Elige', text: 'Escoge paquetes, decoración o mobiliario.' },
      { title: 'Cotiza', text: 'Envíanos fecha, lugar y número de invitados por WhatsApp.' },
      { title: 'Celebra', text: 'Montamos todo para que solo disfrutes.' },
    ],
    story: { title: 'Creamos', titleEmphasis: 'recuerdos', text: 'En {negocio} convertimos tu idea en un evento que nadie olvida, cuidando cada detalle del montaje.', sign: 'El equipo de {negocio}' },
    faq: [
      { q: '¿Con cuánta anticipación debo reservar?', a: 'Te recomendamos reservar con al menos 2 a 4 semanas, según la temporada.' },
      { q: '¿Los paquetes se pueden ajustar?', a: 'Sí, todos son personalizables según tu presupuesto e idea.' },
      { q: '¿Cubren fuera de {ciudad}?', a: 'Escríbenos con el lugar del evento y te confirmamos.' },
    ],
    cartNote: 'Fecha, lugar y anticipo se confirman por WhatsApp.',
    perks: ['Montaje incluido', 'Personalizado'],
    footer: { eyebrow: 'Eventos en {ciudad} y alrededores', title: '¿Tienes una', emphasis: 'fecha especial?', titleEnd: 'Hablemos.', cta: 'Cotizar por WhatsApp', legal: '{ciudad}, Colombia' },
  },
})
