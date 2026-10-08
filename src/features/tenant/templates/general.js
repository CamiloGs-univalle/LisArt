// ─────────────────────────────────────────────────────────────
// Plantilla "Tienda general": sirve para cualquier negocio
// (ropa, accesorios, comida, belleza, decoración…).
// {negocio} y {ciudad} se reemplazan por los datos de cada negocio.
// ─────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'destacados', emoji: '⭐', name: 'Destacados', eyebrow: 'Lo más pedido', title: 'Nuestros', emphasis: 'destacados', subtitle: 'Los favoritos de nuestros clientes.', style: 'carrusel' },
  { id: 'novedades', emoji: '✨', name: 'Novedades', eyebrow: 'Recién llegados', title: 'Lo', emphasis: 'nuevo', subtitle: 'Lo último que llegó a nuestro catálogo.', style: 'catalogo' },
  { id: 'productos', emoji: '🛍️', name: 'Productos', eyebrow: 'Catálogo', title: 'Todos nuestros', emphasis: 'productos', subtitle: 'Elige lo que más te guste y pídelo por WhatsApp.', style: 'catalogo' },
  { id: 'promociones', emoji: '🏷️', name: 'Promociones', eyebrow: 'Ahorra', title: 'Promociones', emphasis: 'del mes', subtitle: 'Precios especiales por tiempo limitado.', style: 'arcos' },
]

export default {
  id: 'general',
  label: 'Tienda general',
  description: 'Destacados, novedades, productos y promociones. Sirve para cualquier negocio.',
  theme: 'noche',
  sections: SECTIONS,
  order: ['destacados', 'pieza', 'novedades', 'productos', 'galeria', 'promociones'],
  content: {
    announcements: ['Envíos en {ciudad}', 'Pide fácil por WhatsApp', 'Atención personalizada'],
    hero: {
      sticker: '¡Bienvenido a {negocio}!',
      titleStart: 'Lo que buscas,',
      titleEmphasis: 'a un mensaje',
      titleEnd: 'de distancia',
      subtitle: 'Explora nuestro catálogo, agrega lo que te guste y envíanos tu pedido por WhatsApp. Así de fácil.',
      primaryCta: 'Ver catálogo',
      secondaryCta: 'Escribir por WhatsApp',
    },
    stats: [
      { value: '+100', label: 'clientes felices' },
      { value: '24 h', label: 'respuesta rápida' },
      { value: '100%', label: 'atención personal' },
    ],
    highlights: [
      { id: 'compra', label: 'Compra así', color: 'var(--c-gold)', icon: 'bag', title: 'Comprar es muy fácil', steps: ['Agrega tus productos favoritos al pedido.', 'Toca “Enviar pedido por WhatsApp”.', 'Confirmamos pago y entrega contigo.'], cta: 'Empezar a elegir', action: 'catalog' },
      { id: 'envios', label: 'Envíos', color: 'var(--c-rose)', icon: 'truck', title: 'Envíos en {ciudad}', text: 'Hacemos envíos en {ciudad}. El valor depende de la zona y te lo confirmamos por WhatsApp.', cta: 'Consultar envío', action: 'whatsapp' },
      { id: 'pagos', label: 'Medios de pago', color: 'var(--c-berry)', icon: 'card', title: 'Medios de pago', text: 'Te compartimos los medios de pago al confirmar tu pedido.', cta: 'Preguntar por WhatsApp', action: 'whatsapp' },
      { id: 'disponible', label: 'Disponible', color: 'var(--c-pink)', icon: 'gift', title: 'Todo listo para ti', text: 'Lo que ves en el catálogo está disponible. Si buscas algo diferente, escríbenos.', cta: 'Ver catálogo', action: 'catalog' },
    ],
    ribbon: ['Calidad', 'Buen precio', 'Atención personal', 'Envíos', 'Pide por WhatsApp'],
    how: [
      { title: 'Elige', text: 'Explora el catálogo y agrega lo que te guste.' },
      { title: 'Envía tu pedido', text: 'Tu pedido llega listo a nuestro WhatsApp.' },
      { title: 'Recibe', text: 'Confirmamos pago y entrega. ¡Listo!' },
    ],
    story: {
      title: 'Hecho con',
      titleEmphasis: 'dedicación',
      text: 'En {negocio} cuidamos cada detalle para que tu experiencia sea excelente, desde que eliges hasta que recibes tu pedido.',
      sign: 'El equipo de {negocio}',
    },
    faq: [
      { q: '¿Cómo hago mi pedido?', a: 'Agrega los productos que quieras y toca “Enviar pedido por WhatsApp”. Te llega un mensaje listo y desde ahí coordinamos todo.' },
      { q: '¿Hacen envíos?', a: 'Sí, hacemos envíos en {ciudad}. El valor depende de la zona.' },
      { q: '¿Cuáles son los medios de pago?', a: 'Te compartimos los medios de pago disponibles al confirmar tu pedido.' },
    ],
    cartNote: 'El envío y el pago se confirman por WhatsApp.',
    perks: ['Atención personalizada', 'Envíos en {ciudad}'],
    footer: {
      eyebrow: 'Envíos en {ciudad} · Atención por WhatsApp',
      title: '¿Tienes', emphasis: 'preguntas?', titleEnd: 'Escríbenos.',
      cta: 'Escríbenos por WhatsApp',
      legal: '{ciudad}, Colombia',
    },
  },
}
