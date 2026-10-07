// src/data/siteContent.js
// ─────────────────────────────────────────────────────────────
// Textos de la página en un solo lugar.
// Cambia aquí lo que quieras sin tocar los componentes.
// ─────────────────────────────────────────────────────────────

export const BRAND = {
  name: 'LisArt',
  tagline: 'Detalles y regalos personalizados · Cali',
  city: 'Cali',
  instagramHandle: '@creaciones.lisart',
}

export const SOCIALS = {
  instagram: 'https://www.instagram.com/creaciones.lisart/',
  tiktok: 'https://www.tiktok.com/@creaciones.lisart?_r=1&_t=ZS-98hLOOIeDth',
  facebook: 'https://www.facebook.com/share/1FHo3H2Qgf/',
}

// Barra superior de anuncios. El anuncio del panel admin aparece primero.
export const ANNOUNCEMENTS = [
  { icon: 'truck', text: 'Envíos a todo Cali' },
  { icon: 'calendar', text: 'Pedidos con anticipación · ¡Separa tu fecha!' },
  { icon: 'sparkle', text: 'Personalizamos tu idea con fotos, nombres y frases' },
  { icon: 'chat', text: 'Pide fácil por WhatsApp' },
]

export const HERO = {
  sticker: '¡Hecho a mano en Cali!',
  titleStart: 'Regalos que',
  titleEmphasis: 'enamoran',
  titleEnd: 'a primera vista',
  subtitle:
    'Bouquets, cajas sorpresa, cuadros y detalles personalizados creados para sorprender de formas únicas. Elige el tuyo y lo hacemos realidad.',
  primaryCta: 'Quiero mi regalo',
  secondaryCta: 'Cotizar por WhatsApp',
}

// Cifras reales del Instagram (actualízalas cuando quieras)
export const STATS = [
  { value: '+300', label: 'creaciones publicadas' },
  { value: '+700', label: 'seguidores felices' },
  { value: '100%', label: 'hecho a mano' },
]

// Círculos tipo "historias destacadas" de Instagram
export const HIGHLIGHTS = [
  {
    id: 'procesos', label: 'Procesos', color: 'var(--c-berry)', icon: 'hand',
    title: 'Así nace cada regalo',
    text: 'Cada detalle lo armamos a mano, pieza por pieza: elegimos los materiales, personalizamos con tus fotos, nombres o frases y lo empacamos con todo el cariño.',
    cta: 'Ver procesos en Instagram',
  },
  {
    id: 'opiniones', label: 'Opiniones', color: 'var(--c-rose)', icon: 'heart',
    title: 'Nuestros clientes hablan por nosotros',
    text: 'Mira lo que dicen quienes ya sorprendieron con LisArt. Sus mensajes y fotos están en nuestras historias destacadas de Instagram.',
    cta: 'Ver opiniones',
  },
  {
    id: 'disponible', label: 'Disponible', color: 'var(--c-pink)', icon: 'gift',
    title: 'Listos para sorprender',
    text: 'Todo lo que ves en este catálogo lo podemos crear para ti. Si buscas algo diferente, escríbenos y lo diseñamos juntos.',
    cta: 'Ver catálogo', action: 'catalog',
  },
  {
    id: 'informate', label: 'Infórmate', color: 'var(--c-mauve)', icon: 'sparkle',
    title: 'Te ayudamos a sorprender',
    text: 'Bouquets, cajas sorpresa, cuadros y retratos, rosas eternas y naturales, mugs, camisetas en pareja ¡y mucho más! Todo personalizable.',
    cta: 'Escribirnos', action: 'whatsapp',
  },
  {
    id: 'compra', label: 'Compra así', color: 'var(--c-gold)', icon: 'bag',
    title: 'Comprar es muy fácil',
    steps: ['Agrega tus regalos favoritos al pedido.', 'Toca “Enviar pedido por WhatsApp”.', 'Confirmamos detalles, pago y fecha de entrega.'],
    cta: 'Empezar a elegir', action: 'catalog',
  },
  {
    id: 'envios', label: 'Envíos', color: 'var(--c-rose)', icon: 'truck',
    title: 'Envíos a todo Cali',
    text: 'Llevamos tu sorpresa a cualquier lugar de Cali. El valor del domicilio depende de la zona y te lo confirmamos por WhatsApp antes de cerrar el pedido.',
    cta: 'Consultar envío', action: 'whatsapp',
  },
  {
    id: 'pagos', label: 'Medios de pago', color: 'var(--c-berry)', icon: 'card',
    title: 'Medios de pago',
    text: 'Al confirmar tu pedido te compartimos los medios de pago disponibles. Recuerda: los pedidos se hacen con anticipación.',
    cta: 'Preguntar por WhatsApp', action: 'whatsapp',
  },
]

export const MARQUEE_WORDS = [
  'Bouquets', 'Cajas sorpresa', 'Cuadros y retratos', 'Rosas eternas', 'Mugs', 'Camisetas en pareja', '¡Y mucho más!',
]

export const HOW_TO_ORDER = [
  { title: 'Elige tu regalo', text: 'Explora el catálogo y toca “Lo quiero” en lo que te enamore.', color: 'var(--c-berry)' },
  { title: 'Envíalo por WhatsApp', text: 'Tu pedido llega listo a nuestro chat. Ahí personalizamos cada detalle contigo.', color: 'var(--c-rose)' },
  { title: 'Sorprende', text: 'Confirmamos pago y fecha, y entregamos en Cali. ¡Tú solo disfruta la reacción!', color: 'var(--c-gold)' },
]

export const STORY = {
  title: 'Detrás de cada regalo hay una',
  titleEmphasis: 'historia',
  text:
    'En LisArt cada pedido empieza con una conversación: para quién es, qué quieres decir y qué momento quieres celebrar. Luego lo creamos a mano, cuidando cada lazo, cada flor y cada foto, para que quien lo reciba sienta exactamente lo que quieres transmitir.',
  sign: 'Con amor, Lis',
}

// Preguntas frecuentes — ajusta las respuestas a tus políticas reales.
export const FAQ = [
  {
    q: '¿Cómo hago mi pedido?',
    a: 'Agrega los productos que quieras y toca “Enviar pedido por WhatsApp”. Te llega un mensaje listo con todo el detalle y desde ahí coordinamos personalización, pago y entrega.',
  },
  {
    q: '¿Puedo personalizar mi regalo?',
    a: '¡Claro! Podemos adaptar colores, nombres, fotos, frases y algunos elementos. Cuéntanos tu idea en el chat y te decimos qué es posible.',
  },
  {
    q: '¿Con cuánta anticipación debo pedir?',
    a: 'Trabajamos con pedidos con anticipación para que todo quede perfecto. Escríbenos con la fecha que necesitas y te confirmamos disponibilidad.',
  },
  {
    q: '¿Hacen envíos?',
    a: 'Sí, hacemos envíos a todo Cali. El valor depende de la zona; te lo confirmamos por WhatsApp antes de cerrar el pedido.',
  },
  {
    q: '¿Cuáles son los medios de pago?',
    a: 'Te compartimos los medios de pago disponibles por WhatsApp al confirmar tu pedido.',
  },
]

// Etiquetas públicas de las secciones (el panel admin usa los ids internos)
// color: color del arcoíris que identifica la sección
export const SECTION_COPY = {
  featured: { eyebrow: 'El favorito del momento', title: 'Destacado' },
  promos_circulo: { eyebrow: 'Inspírate', title: 'Encuentra el detalle', emphasis: 'perfecto', color: 'var(--c-mauve)' },
  carousel_cajas: { num: '01', title: 'Sorpresas', emphasis: 'especiales', subtitle: 'Cajas que se abren con una sonrisa.', color: 'var(--c-berry)', note: 'desliza' },
  grid_arreglos: { num: '02', title: 'Arreglos y', emphasis: 'bouquets', subtitle: 'Flores, rosas eternas y detalles armados a mano.', color: 'var(--c-rose)' },
  promos_grande: { eyebrow: 'Los más pedidos', title: 'Favoritos de', emphasis: 'nuestros clientes', color: 'var(--c-gold)', note: 'top ventas' },
  list_regalos: { num: '03', title: 'Regalos', emphasis: 'especiales', subtitle: 'Para cada persona y cada ocasión.', color: 'var(--c-rose)' },
  promos_mediano: { eyebrow: 'Más ideas', title: 'Para', emphasis: 'sorprender', color: 'var(--c-mauve)' },
}

// Colores que rotan en etiquetas y detalles de las tarjetas
export const ACCENTS = ['var(--c-yellow)', 'var(--c-pink)', 'var(--c-berry)', 'var(--c-rose)', 'var(--c-gold)', 'var(--c-mauve)']
