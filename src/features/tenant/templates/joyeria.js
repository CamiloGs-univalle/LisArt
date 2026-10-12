// Plantilla "Joyería y lujo": joyerías, perfumerías, relojes y marcas premium.
import { extendTemplate } from './_base'

export default extendTemplate({
  id: 'joyeria',
  label: 'Joyería y lujo',
  description: 'Oscura y dorada, elegante. Piezas icónicas, colección y asesoría privada. Para joyerías, perfumes, relojes y marcas premium.',
  layout: 'lujo',
  theme: 'noche',
  sections: [
    { id: 'destacados', emoji: '✦', name: 'Icónicos', eyebrow: 'Lo más deseado', title: 'Piezas', emphasis: 'icónicas', subtitle: 'Las favoritas de nuestros clientes.', style: 'carrusel' },
    { id: 'joyas', emoji: '💍', name: 'Joyería', eyebrow: 'Colección', title: 'Joyería', emphasis: 'fina', subtitle: 'Oro, plata y piedras seleccionadas.', style: 'catalogo' },
    { id: 'relojes', emoji: '⌚', name: 'Relojes', eyebrow: 'Tiempo', title: 'Relojes', emphasis: 'clásicos', subtitle: 'Precisión y estilo para cada ocasión.', style: 'catalogo' },
    { id: 'fragancias', emoji: '🌹', name: 'Fragancias', eyebrow: 'Esencias', title: 'Fragancias', emphasis: 'de autor', subtitle: 'Aromas que dejan huella.', style: 'catalogo' },
  ],
  order: ['destacados', 'joyas', 'relojes', 'fragancias', 'galeria'],
  content: {
    announcements: ['Asesoría personalizada', 'Empaque de regalo incluido', 'Envíos asegurados en {ciudad}'],
    hero: {
      sticker: 'Alta joyería',
      titleStart: 'Piezas que',
      titleEmphasis: 'perduran',
      titleEnd: 'en el tiempo',
      subtitle: 'Diseños seleccionados con cuidado, empaque de regalo y asesoría personalizada por WhatsApp.',
      primaryCta: 'Ver colección',
      secondaryCta: 'Asesoría privada',
    },
    ribbon: ['Certificado de autenticidad', 'Empaque de regalo', 'Garantía', 'Asesoría privada'],
    how: [
      { title: 'Elige', text: 'Descubre la colección y guarda tus piezas favoritas.' },
      { title: 'Conversa', text: 'Un asesor te acompaña por WhatsApp para elegir la ideal.' },
      { title: 'Recibe', text: 'Entrega asegurada con empaque de regalo.' },
    ],
    story: { title: 'Nuestra', titleEmphasis: 'casa', text: 'En {negocio} creemos que una pieza especial cuenta una historia: la tuya. Por eso cuidamos cada detalle.', sign: '{negocio}' },
    faq: [
      { q: '¿Las piezas tienen garantía?', a: 'Sí, todas nuestras piezas incluyen garantía y certificado.' },
      { q: '¿Hacen envíos?', a: 'Sí, envíos asegurados en {ciudad} y a todo el país.' },
      { q: '¿Puedo pedir una asesoría?', a: 'Claro, escríbenos por WhatsApp y te acompañamos a elegir.' },
    ],
    cartNote: 'El envío y el pago se confirman por WhatsApp.',
    perks: ['Empaque de regalo', 'Garantía'],
    footer: { eyebrow: 'Asesoría privada · {ciudad}', title: 'Una pieza', emphasis: 'para siempre', titleEnd: '', cta: 'Hablar con un asesor', legal: '{ciudad}, Colombia' },
  },
})
