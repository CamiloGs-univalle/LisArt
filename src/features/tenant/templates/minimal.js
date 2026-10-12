// Plantilla "Tienda minimal": blanco y negro, limpia, el producto es el protagonista.
import { extendTemplate } from './_base'

export default extendTemplate({
  id: 'minimal',
  label: 'Tienda minimal',
  description: 'Blanco y negro, limpia y moderna. El producto es el protagonista. Sirve para cualquier tienda.',
  layout: 'velora',
  theme: 'minimal',
  content: {
    announcements: ['Envíos en {ciudad}', 'Pago seguro', 'Pide por WhatsApp'],
    hero: {
      sticker: 'Nueva temporada',
      titleStart: 'Lo esencial,',
      titleEmphasis: 'bien hecho',
      titleEnd: '',
      subtitle: 'Productos de calidad, sin complicaciones. Elige y pide por WhatsApp.',
      primaryCta: 'Comprar ahora',
      secondaryCta: 'Escribir por WhatsApp',
    },
  },
})
