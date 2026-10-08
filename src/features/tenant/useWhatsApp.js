// Enlaces de WhatsApp con el número y nombre del negocio actual
import { useTenant } from './TenantProvider'
import { waLink, productQuestion } from '@/lib/format'

export function useWhatsApp() {
  const { brand } = useTenant()
  const greet = (text) => text.replace(/\{negocio\}/g, brand.name)
  const link = (text = '') => waLink(brand.whatsapp, greet(text))
  return {
    number: brand.whatsapp,
    link,
    open: (text) => window.open(link(text), '_blank', 'noopener'),
    askProduct: (p) => window.open(waLink(brand.whatsapp, productQuestion(p, brand.name)), '_blank', 'noopener'),
  }
}
