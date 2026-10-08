// Textos de la página = valores por defecto (siteContent.js) + lo que la admin
// haya guardado desde el panel ("Textos de la página").
import { useSettingsCtx } from '../contexts/SettingsContext'
import { HERO, FAQ, ANNOUNCEMENTS, HIGHLIGHTS, CART_NOTE, STATS, HOW_TO_ORDER, MARQUEE_WORDS, STORY, BRAND } from '../data/siteContent'

export const DEFAULT_CONTENT = {
  hero: HERO,
  faq: FAQ,
  announcements: ANNOUNCEMENTS.map(a => a.text),
  pagos: HIGHLIGHTS.find(h => h.id === 'pagos')?.text || '',
  envios: HIGHLIGHTS.find(h => h.id === 'envios')?.text || '',
  cartNote: CART_NOTE,
  stats: STATS,
  perks: ['Hecho a mano para ti', 'Personalízalo con fotos, nombres o frases', 'Envíos a todo Cali · Pide con mínimo 1 día de anticipación'],
  how: HOW_TO_ORDER.map(({ title, text }) => ({ title, text })),
  ribbon: MARQUEE_WORDS,
  story: STORY,
  footer: {
    eyebrow: 'Nequi y Bancolombia · Abonos del 50% · Envíos a todo Cali',
    title: '¿Lo imaginas?',
    emphasis: 'Lo creamos',
    titleEnd: 'para ti.',
    cta: 'Escríbenos por WhatsApp',
    tagline: BRAND.tagline,
    legal: 'Regalos personalizados hechos a mano · Cali, Colombia',
  },
}

export function useSiteContent() {
  const { content = {} } = useSettingsCtx()
  const hero = { ...DEFAULT_CONTENT.hero, ...(content.hero || {}) }
  const faq = Array.isArray(content.faq) && content.faq.length ? content.faq : DEFAULT_CONTENT.faq
  const announcementTexts = Array.isArray(content.announcements) ? content.announcements : DEFAULT_CONTENT.announcements
  const pagos = content.pagos ?? DEFAULT_CONTENT.pagos
  const envios = content.envios ?? DEFAULT_CONTENT.envios
  const cartNote = content.cartNote ?? DEFAULT_CONTENT.cartNote

  // Íconos de la barra de anuncios (se asignan por orden)
  const icons = ['truck', 'calendar', 'card', 'sparkle', 'chat', 'gift']
  const announcements = announcementTexts
    .filter(t => String(t || '').trim())
    .map((text, i) => ({ text, icon: icons[i % icons.length] }))

  const highlights = HIGHLIGHTS.map(h => {
    const o = { ...h, ...((content.highlights || {})[h.id] || {}) }
    if (h.id === 'pagos') o.text = pagos
    if (h.id === 'envios') o.text = envios
    return o
  })

  const perks = Array.isArray(content.perks) ? content.perks : DEFAULT_CONTENT.perks

  return { hero, faq, announcements, highlights, pagos, envios, cartNote, perks }
}

// Ruta donde se guarda el texto de un círculo destacado
export const highlightTextPath = (id) => (id === 'pagos' ? 'pagos' : id === 'envios' ? 'envios' : `highlights.${id}.text`)
