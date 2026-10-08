// ─────────────────────────────────────────────────────────────
// Plantilla "Regalos y detalles" (la de Creaciones LisArt).
// Textos por defecto de un catálogo nuevo con esta plantilla.
// {negocio} y {ciudad} se reemplazan por los datos de cada negocio.
// Todo es editable luego por el dueño desde su catálogo.
// ─────────────────────────────────────────────────────────────

const SECTIONS = [
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

const ANNOUNCEMENTS = [
  { icon: 'truck', text: 'Envíos a todo {ciudad}' },
  { icon: 'calendar', text: 'Pedidos con mínimo 1 día de anticipación · ¡Separa tu fecha!' },
  { icon: 'card', text: 'Pagos por Nequi y Bancolombia · Inicia con el 50%' },
  { icon: 'sparkle', text: 'Personalizamos tu idea con fotos, nombres y frases' },
  { icon: 'chat', text: 'Pide fácil por WhatsApp' },
]

const HERO = {
  sticker: '¡Hecho a mano en {ciudad}!',
  titleStart: 'Sorprende de',
  titleEmphasis: 'maneras únicas',
  titleEnd: 'y creativas',
  subtitle:
    'Bouquets, cajas sorpresa, cuadros y detalles personalizados hechos a mano en {ciudad}. Elige el tuyo y lo hacemos realidad.',
  primaryCta: 'Quiero mi regalo',
  secondaryCta: 'Cotizar por WhatsApp',
}

const STATS = [
  { value: '+300', label: 'creaciones publicadas' },
  { value: '+700', label: 'seguidores felices' },
  { value: '100%', label: 'hecho a mano' },
]

const HIGHLIGHTS = [
  {
    id: 'procesos', label: 'Procesos', color: 'var(--c-berry)', icon: 'hand',
    title: 'Así nace cada regalo',
    text: 'Cada detalle lo armamos a mano, pieza por pieza: elegimos los materiales, personalizamos con tus fotos, nombres o frases y lo empacamos con todo el cariño.',
    cta: 'Ver procesos en Instagram',
  },
  {
    id: 'opiniones', label: 'Opiniones', color: 'var(--c-rose)', icon: 'heart',
    title: 'Nuestros clientes hablan por nosotros',
    text: 'Mira lo que dicen quienes ya sorprendieron con {negocio}. Sus mensajes y fotos están en nuestras historias destacadas de Instagram.',
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
    title: 'Envíos a todo {ciudad}',
    text: 'Llevamos tu sorpresa a cualquier lugar de {ciudad}. El valor del domicilio depende de la zona y te lo confirmamos por WhatsApp antes de cerrar el pedido.',
    cta: 'Consultar envío', action: 'whatsapp',
  },
  {
    id: 'pagos', label: 'Medios de pago', color: 'var(--c-berry)', icon: 'card',
    title: 'Medios de pago',
    text: 'Recibimos transferencias por Nequi y Bancolombia. Trabajamos con abonos: pagas la mitad del valor para iniciar tu pedido y el resto cuando lo entregamos.',
    cta: 'Preguntar por WhatsApp', action: 'whatsapp',
  },
]

const RIBBON = [
  'Bouquets', 'Cajas sorpresa', 'Cuadros y retratos', 'Rosas eternas', 'Mugs', 'Camisetas en pareja', '¡Y mucho más!',
]

const HOW_TO_ORDER = [
  { title: 'Elige tu regalo', text: 'Explora el catálogo y toca “Lo quiero” en lo que te enamore.', color: 'var(--c-berry)' },
  { title: 'Envíalo por WhatsApp', text: 'Tu pedido llega listo a nuestro chat. Ahí personalizamos cada detalle contigo.', color: 'var(--c-rose)' },
  { title: 'Sorprende', text: 'Confirmamos pago y fecha, y entregamos en {ciudad}. ¡Tú solo disfruta la reacción!', color: 'var(--c-gold)' },
]

const STORY = {
  title: 'Detrás de cada regalo hay una',
  titleEmphasis: 'historia',
  text:
    'En {negocio} cada pedido empieza con una conversación: para quién es, qué quieres decir y qué momento quieres celebrar. Luego lo creamos a mano, cuidando cada lazo, cada flor y cada foto, para que quien lo reciba sienta exactamente lo que quieres transmitir.',
  sign: 'Con amor, {negocio}',
}

const FAQ = [
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
    a: 'Trabajamos con mínimo 1 día de anticipación. El tiempo puede variar según el tipo de detalle, así que escríbenos con la fecha que necesitas y te confirmamos disponibilidad.',
  },
  {
    q: '¿Hacen envíos?',
    a: 'Sí, hacemos envíos a todo {ciudad}. El valor depende de la zona; te lo confirmamos por WhatsApp antes de cerrar el pedido.',
  },
  {
    q: '¿Cuáles son los medios de pago?',
    a: 'Recibimos transferencias por Nequi y Bancolombia.',
  },
  {
    q: '¿Puedo pagar por abonos?',
    a: 'Sí. Para iniciar tu pedido abonas la mitad del valor y, cuando te lo entregamos, pagas el resto.',
  },
]

const CART_NOTE = 'Pagas el 50% para iniciar (Nequi o Bancolombia) y el resto al recibir. Envíos a todo {ciudad}: el domicilio se confirma por WhatsApp.'

export default {
  id: 'regalos',
  label: 'Regalos y detalles',
  description: 'Bouquets, cajas sorpresa, cuadros, comestibles… con secciones por ocasión.',
  theme: 'rosa',
  sections: SECTIONS,
  order: ['destacados', 'pieza', 'parejas', 'personalizados', 'galeria', 'flores', 'comestibles', 'grados', 'navidad'],
  content: {
    announcements: ANNOUNCEMENTS.map(a => a.text),
    hero: HERO,
    stats: STATS,
    highlights: HIGHLIGHTS,
    ribbon: RIBBON,
    how: HOW_TO_ORDER,
    story: STORY,
    faq: FAQ,
    cartNote: CART_NOTE,
    perks: ['Hecho a mano para ti', 'Personalízalo con fotos, nombres o frases', 'Envíos a todo {ciudad} · Pide con mínimo 1 día de anticipación'],
    footer: {
      eyebrow: 'Nequi y Bancolombia · Abonos del 50% · Envíos a todo {ciudad}',
      title: '¿Lo imaginas?', emphasis: 'Lo creamos', titleEnd: 'para ti.',
      cta: 'Escríbenos por WhatsApp',
      legal: 'Regalos personalizados hechos a mano · {ciudad}, Colombia',
    },
  },
}
