// src/data/siteContent.js
// ─────────────────────────────────────────────────────────────
// Textos de la página en un solo lugar.
// Cambia aquí lo que quieras sin tocar los componentes.
// ─────────────────────────────────────────────────────────────

export const BRAND = {
  name: 'LisArt',
  tagline: 'Creaciones con amor',
  instagramHandle: '@creaciones.lisart',
}

export const SOCIALS = {
  instagram: 'https://www.instagram.com/creaciones.lisart/',
  tiktok: 'https://www.tiktok.com/@creaciones.lisart?_r=1&_t=ZS-98hLOOIeDth',
  facebook: 'https://www.facebook.com/share/1FHo3H2Qgf/',
}

export const HERO = {
  eyebrow: 'Atelier de regalos · Hecho a mano',
  titleStart: 'Regalos que',
  titleEmphasis: 'dicen',
  titleEnd: 'lo que sientes',
  subtitle:
    'Bouquets, cajas sorpresa y detalles personalizados, armados a mano pieza por pieza. Elige el tuyo y lo coordinamos contigo por WhatsApp.',
  primaryCta: 'Ver catálogo',
  secondaryCta: 'Pedir por WhatsApp',
}

// Pequeñas razones para confiar (aparecen bajo el hero)
export const PROMISES = [
  { icon: 'hand', title: 'Hecho a mano', text: 'Cada detalle se arma para ti' },
  { icon: 'sparkle', title: 'Personalizable', text: 'Nombres, fotos, colores y frases' },
  { icon: 'chat', title: 'Atención directa', text: 'Hablas con nosotras por WhatsApp' },
]

export const MARQUEE_WORDS = [
  'Hecho a mano', 'Con amor', 'Personalizado', 'Bouquets', 'Cajas sorpresa', 'Detalles únicos',
]

export const HOW_TO_ORDER = [
  { title: 'Elige tu regalo', text: 'Explora el catálogo y agrega a tu pedido lo que te enamore.' },
  { title: 'Envíalo por WhatsApp', text: 'Tu pedido llega armado a nuestro chat. Ahí personalizamos cada detalle contigo.' },
  { title: 'Confirma y recibe', text: 'Acordamos pago, fecha y entrega. Nosotras nos encargamos del resto.' },
]

export const STORY = {
  eyebrow: 'Nuestra forma de hacer las cosas',
  title: 'Un regalo no se compra, se',
  titleEmphasis: 'crea',
  text:
    'En LisArt cada pedido empieza con una conversación: para quién es, qué quieres decir y qué momento quieres celebrar. Luego lo armamos a mano, cuidando cada lazo, cada flor y cada detalle, para que quien lo reciba sienta exactamente lo que quieres transmitir.',
}

// Preguntas frecuentes — ajusta las respuestas a tus políticas reales.
export const FAQ = [
  {
    q: '¿Cómo hago mi pedido?',
    a: 'Agrega los productos que quieras al pedido y toca “Pedir por WhatsApp”. Te llegará un mensaje listo con todo el detalle y desde ahí coordinamos personalización, pago y entrega.',
  },
  {
    q: '¿Puedo personalizar mi regalo?',
    a: 'Sí. Podemos adaptar colores, nombres, fotos, frases y algunos elementos del arreglo. Cuéntanos tu idea en el chat y te decimos qué es posible.',
  },
  {
    q: '¿Con cuánta anticipación debo pedir?',
    a: 'Entre más pronto, mejor: así aseguramos tu fecha. Escríbenos con el día de entrega que necesitas y te confirmamos disponibilidad.',
  },
  {
    q: '¿Hacen entregas a domicilio?',
    a: 'Sí. El costo y los tiempos de envío dependen de la zona; te los confirmamos por WhatsApp antes de cerrar el pedido.',
  },
  {
    q: '¿Cuáles son los medios de pago?',
    a: 'Te compartimos los medios de pago disponibles por WhatsApp al confirmar tu pedido.',
  },
]

// Etiquetas públicas de las secciones (el panel admin usa los ids internos)
export const SECTION_COPY = {
  featured: { eyebrow: 'La pieza del momento', title: 'Destacado' },
  promos_circulo: { eyebrow: 'Inspírate', title: 'Encuentra el', emphasis: 'detalle perfecto' },
  carousel_cajas: { eyebrow: '01 — Colección', title: 'Sorpresas', emphasis: 'especiales', subtitle: 'Cajas que se abren con una sonrisa.' },
  grid_arreglos: { eyebrow: '02 — Colección', title: 'Arreglos &', emphasis: 'bouquets', subtitle: 'Flores y detalles armados a mano.' },
  promos_grande: { eyebrow: 'Selección', title: 'Favoritos de', emphasis: 'nuestros clientes' },
  list_regalos: { eyebrow: '03 — Colección', title: 'Regalos', emphasis: 'especiales', subtitle: 'Para cada persona y cada ocasión.' },
  promos_mediano: { eyebrow: 'Más ideas', title: 'Para', emphasis: 'sorprender' },
}
