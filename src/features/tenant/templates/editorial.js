// Plantilla "Editorial": boutiques, decoración, artesanías, marcas de autor.
// Crema + terracota, tipografía de revista.
import { extendTemplate } from './_base'

export default extendTemplate({
  id: 'editorial',
  label: 'Editorial (boutique)',
  description: 'Estilo revista en crema y terracota. Ideal para boutiques, decoración, joyería y marcas de autor.',
  layout: 'editorial',
  theme: 'editorial',
  sections: [
    { id: 'destacados', emoji: '✱', name: 'Selección', eyebrow: 'Curado para ti', title: 'Piezas', emphasis: 'seleccionadas', subtitle: 'Una selección de nuestras piezas favoritas.', style: 'revista' },
    { id: 'coleccion', emoji: '🏺', name: 'Colección', eyebrow: 'Colección', title: 'La', emphasis: 'colección', subtitle: 'Cada pieza, hecha con intención.', style: 'catalogo' },
    { id: 'nuevos', emoji: '✨', name: 'Nuevos', eyebrow: 'Recién llegados', title: 'Lo', emphasis: 'nuevo', subtitle: 'Lo último de nuestro taller.', style: 'coverflow' },
    { id: 'regalos', emoji: '🎁', name: 'Para regalar', eyebrow: 'Ideas', title: 'Para', emphasis: 'regalar', subtitle: 'Detalles que se recuerdan.', style: 'polaroid' },
  ],
  order: ['destacados', 'pieza', 'coleccion', 'galeria', 'nuevos', 'regalos'],
  content: {
    announcements: ['Piezas únicas', 'Envíos en {ciudad}', 'Pide por WhatsApp'],
    hero: {
      sticker: 'Hecho con intención',
      titleStart: 'Diseño que',
      titleEmphasis: 'se siente',
      titleEnd: 'en casa',
      subtitle: 'Piezas seleccionadas con cuidado. Elige la tuya y pídela por WhatsApp en un minuto.',
      primaryCta: 'Ver colección',
      secondaryCta: 'Escribir por WhatsApp',
    },
    ribbon: ['Piezas únicas', 'Hecho a mano', 'Diseño de autor', 'Envíos', 'Pide por WhatsApp'],
  },
})
