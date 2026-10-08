// Textos de la página del negocio =
//   textos por defecto de su plantilla (con {negocio}/{ciudad} reemplazados)
//   + lo que el dueño haya editado (settings.content)
import { useMemo } from 'react'
import { useSettingsCtx } from '@/features/catalog/data/SettingsProvider'
import { useTenant } from './TenantProvider'
import { fillTemplate } from './templates'

const ANNOUNCE_ICONS = ['truck', 'calendar', 'card', 'sparkle', 'chat', 'gift']

// Textos por defecto del negocio actual (plantilla ya rellenada)
export function useDefaultContent() {
  const { template, brand } = useTenant()
  return useMemo(() => {
    const filled = fillTemplate(template.content, { negocio: brand.name, ciudad: brand.city })
    const { highlights, ...rest } = filled
    return {
      ...rest,
      // Los círculos se guardan como { id: cambios }, no como lista
      highlightsList: highlights || [],
      pagos: highlights?.find(h => h.id === 'pagos')?.text || '',
      envios: highlights?.find(h => h.id === 'envios')?.text || '',
      footer: { tagline: brand.tagline, ...(rest.footer || {}) },
    }
  }, [template, brand.name, brand.city, brand.tagline])
}

export function useSiteContent() {
  const { content = {} } = useSettingsCtx()
  const d = useDefaultContent()

  return useMemo(() => {
    const list = (v, def) => (Array.isArray(v) ? v : def)
    const pagos = content.pagos ?? d.pagos
    const envios = content.envios ?? d.envios

    return {
      defaults: d,
      hero: { ...d.hero, ...(content.hero || {}) },
      faq: Array.isArray(content.faq) && content.faq.length ? content.faq : d.faq,
      announcements: list(content.announcements, d.announcements)
        .filter(t => String(t || '').trim())
        .map((text, i) => ({ text, icon: ANNOUNCE_ICONS[i % ANNOUNCE_ICONS.length] })),
      highlights: d.highlightsList.map(h => {
        const o = { ...h, ...((content.highlights || {})[h.id] || {}) }
        if (h.id === 'pagos') o.text = pagos
        if (h.id === 'envios') o.text = envios
        return o
      }),
      pagos,
      envios,
      cartNote: content.cartNote ?? d.cartNote,
      perks: list(content.perks, d.perks),
      ribbon: list(content.ribbon, d.ribbon),
      stats: list(content.stats, d.stats),
      how: list(content.how, d.how),
      story: { ...d.story, ...(content.story || {}) },
      footer: { ...d.footer, ...(content.footer || {}) },
    }
  }, [content, d])
}

// Ruta donde se guarda el texto de un círculo destacado
export const highlightTextPath = (id) => (id === 'pagos' ? 'pagos' : id === 'envios' ? 'envios' : `highlights.${id}.text`)
