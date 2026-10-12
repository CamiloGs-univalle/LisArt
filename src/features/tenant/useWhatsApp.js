// Enlaces de WhatsApp con el número y nombre del negocio actual
import { useTenant } from './TenantProvider'
import { waLink } from '@/lib/format'
import { productQuestionMessage } from '@/lib/waMessages'

export function useWhatsApp() {
  const { brand, tenantId } = useTenant()
  const greet = (text) => text.replace(/\{negocio\}/g, brand.name)
  const link = (text = '') => waLink(brand.whatsapp, greet(text))
  // Pregunta por un producto: lleva el enlace a su ficha → el negocio ve la foto en el chat
  const askProduct = (p, opts = {}) => window.open(waLink(brand.whatsapp, productQuestionMessage(p, brand.name, { slug: tenantId, ...opts })), '_blank', 'noopener')
  return {
    number: brand.whatsapp,
    link,
    open: (text) => window.open(link(text), '_blank', 'noopener'),
    askProduct,
  }
}
