// Plantilla "Comida y postres": restaurantes, pastelerías, comidas rápidas, domicilios.
import { extendTemplate } from './_base'

export default extendTemplate({
  id: 'comida',
  label: 'Comida y postres',
  description: 'Cálida y antojadora. Menú por categorías, combos y domicilios. Para restaurantes, pastelerías y comidas rápidas.',
  layout: 'menu',
  theme: 'sabor',
  sections: [
    { id: 'destacados', emoji: '🔥', name: 'Los más pedidos', eyebrow: 'Favoritos', title: 'Los más', emphasis: 'pedidos', subtitle: 'Lo que nadie se resiste a repetir.', style: 'carrusel' },
    { id: 'menu', emoji: '🍽️', name: 'Menú', eyebrow: 'Carta', title: 'Nuestro', emphasis: 'menú', subtitle: 'Hecho al momento, con ingredientes frescos.', style: 'catalogo' },
    { id: 'combos', emoji: '🥤', name: 'Combos', eyebrow: 'Para compartir', title: 'Combos', emphasis: 'y promos', subtitle: 'Más sabor por menos.', style: 'arcos' },
    { id: 'postres', emoji: '🍰', name: 'Postres', eyebrow: 'El final feliz', title: 'Postres', emphasis: 'caseros', subtitle: 'Porque siempre hay espacio para el postre.', style: 'catalogo' },
  ],
  order: ['destacados', 'menu', 'combos', 'postres', 'galeria'],
  content: {
    announcements: ['Domicilios en {ciudad}', 'Hecho al momento', 'Pide por WhatsApp'],
    hero: {
      sticker: '¡Recién hecho!',
      titleStart: 'Antojos que',
      titleEmphasis: 'llegan calientes',
      titleEnd: 'a tu puerta',
      subtitle: 'Elige del menú, arma tu pedido y envíalo por WhatsApp. Nosotros cocinamos y te lo llevamos.',
      primaryCta: 'Ver el menú',
      secondaryCta: 'Pedir por WhatsApp',
    },
    stats: [
      { value: '30–45', label: 'min de entrega' },
      { value: '100%', label: 'hecho al momento' },
      { value: '★ 4.9', label: 'de nuestros clientes' },
    ],
    ribbon: ['Fresco', 'Casero', 'Domicilios', 'Hecho al momento', 'Pide por WhatsApp'],
    how: [
      { title: 'Elige', text: 'Arma tu pedido desde el menú.' },
      { title: 'Envía', text: 'Llega listo a nuestro WhatsApp con dirección y forma de pago.' },
      { title: 'Disfruta', text: 'Lo preparamos al momento y te lo llevamos.' },
    ],
    story: { title: 'Cocinado con', titleEmphasis: 'cariño', text: 'En {negocio} cocinamos cada plato como si fuera para nuestra familia: ingredientes frescos y recetas de la casa.', sign: 'La cocina de {negocio}' },
    faq: [
      { q: '¿Cuánto se demora el domicilio?', a: 'Normalmente entre 30 y 45 minutos, según la zona de {ciudad}.' },
      { q: '¿Tienen valor mínimo de pedido?', a: 'Escríbenos y te contamos según tu zona.' },
      { q: '¿Puedo pedir para recoger?', a: 'Sí, indícalo en el mensaje y te avisamos cuando esté listo.' },
    ],
    cartNote: 'El domicilio y el pago se confirman por WhatsApp.',
    perks: ['Hecho al momento', 'Domicilios en {ciudad}'],
    footer: { eyebrow: 'Domicilios en {ciudad}', title: '¿Con', emphasis: 'hambre?', titleEnd: 'Escríbenos.', cta: 'Pedir por WhatsApp', legal: '{ciudad}, Colombia' },
  },
})
