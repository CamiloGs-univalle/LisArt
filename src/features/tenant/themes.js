// ─────────────────────────────────────────────────────────────
// Temas visuales de los catálogos.
// Un tema = colores base + 3 fuentes. El resto de colores
// (líneas, fondos suaves, acentos) se calculan automáticamente.
// ─────────────────────────────────────────────────────────────

// Fuentes disponibles (todas de Google Fonts)
export const FONTS = {
  display: {
    'Playfair Display': 'Playfair+Display:ital,wght@0,400..700;1,400..600',
    'Cormorant Garamond': 'Cormorant+Garamond:ital,wght@0,400..700;1,400..600',
    'Fraunces': 'Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600',
    'DM Serif Display': 'DM+Serif+Display:ital@0;1',
    'Poppins': 'Poppins:wght@400;500;600;700',
    'Montserrat': 'Montserrat:wght@400..700',
  },
  script: {
    'Great Vibes': 'Great+Vibes',
    'Allura': 'Allura',
    'Dancing Script': 'Dancing+Script:wght@500..700',
    'Pacifico': 'Pacifico',
    'Caveat': 'Caveat:wght@500..700',
  },
  ui: {
    'Manrope': 'Manrope:wght@400..800',
    'Inter': 'Inter:wght@400..800',
    'Nunito': 'Nunito:wght@400..800',
    'Poppins': 'Poppins:wght@400;500;600;700',
  },
}

const FALLBACK = { display: 'Georgia, serif', script: 'cursive', ui: 'system-ui, sans-serif' }

// Temas listos para elegir
export const THEME_PRESETS = {
  rosa: {
    label: 'Rosa elegante',
    paper: '#FFF8F6', ink: '#2E1A24', primary: '#CF4A7E', primaryDeep: '#A22F5E', primarySoft: '#EFA3BE',
    blush: '#F9DCE4', gold: '#B8935A',
    fontDisplay: 'Playfair Display', fontScript: 'Great Vibes', fontUi: 'Manrope',
  },
  noche: {
    label: 'Negro y dorado',
    paper: '#F7F5F1', ink: '#161412', primary: '#A8823F', primaryDeep: '#7A5C28', primarySoft: '#D9C092',
    blush: '#EEE6D8', gold: '#A8823F',
    fontDisplay: 'Cormorant Garamond', fontScript: 'Allura', fontUi: 'Inter',
  },
  menta: {
    label: 'Verde menta',
    paper: '#F5FBF8', ink: '#12302A', primary: '#2E8B6E', primaryDeep: '#1E6650', primarySoft: '#9ED9C4',
    blush: '#DCF2EA', gold: '#C9A063',
    fontDisplay: 'Fraunces', fontScript: 'Dancing Script', fontUi: 'Nunito',
  },
  lavanda: {
    label: 'Lavanda',
    paper: '#FAF7FF', ink: '#2A2140', primary: '#7B5CC9', primaryDeep: '#5A3FA6', primarySoft: '#C7B6F2',
    blush: '#ECE5FC', gold: '#C9A063',
    fontDisplay: 'Playfair Display', fontScript: 'Great Vibes', fontUi: 'Manrope',
  },
  terracota: {
    label: 'Terracota',
    paper: '#FBF5EF', ink: '#3A2418', primary: '#C4673D', primaryDeep: '#9A4A27', primarySoft: '#EDB596',
    blush: '#F7E1D3', gold: '#B8935A',
    fontDisplay: 'DM Serif Display', fontScript: 'Caveat', fontUi: 'Nunito',
  },
  oceano: {
    label: 'Azul océano',
    paper: '#F4F8FC', ink: '#0F2438', primary: '#2A6FB0', primaryDeep: '#1B4F82', primarySoft: '#9CC4EA',
    blush: '#DDEBF8', gold: '#C9A063',
    fontDisplay: 'Montserrat', fontScript: 'Pacifico', fontUi: 'Poppins',
  },
}

export const DEFAULT_THEME = 'rosa'

// Tema final = preset + cambios del negocio
export function resolveTheme(theme = {}) {
  const base = THEME_PRESETS[theme.preset] || THEME_PRESETS[DEFAULT_THEME]
  return { ...base, ...Object.fromEntries(Object.entries(theme).filter(([, v]) => v)) }
}

/* ── Utilidades de color ───────────────────── */
const hex2rgb = (h) => {
  const s = h.replace('#', '')
  const n = parseInt(s.length === 3 ? s.split('').map(c => c + c).join('') : s, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const rgb2hex = (r) => '#' + r.map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
export const mix = (a, b, t) => {
  try {
    const A = hex2rgb(a), B = hex2rgb(b)
    return rgb2hex(A.map((v, i) => v * (1 - t) + B[i] * t))
  } catch { return a }
}

// Variables CSS de un tema
export function themeToVars(t) {
  return {
    '--paper': t.paper,
    '--paper-2': mix(t.paper, t.primarySoft, 0.18),
    '--card': '#FFFFFF',
    '--blush': t.blush,
    '--blush-2': mix(t.blush, '#FFFFFF', 0.5),
    '--ink': t.ink,
    '--ink-2': mix(t.ink, t.paper, 0.28),
    '--ink-3': mix(t.ink, t.paper, 0.45),
    '--line': mix(t.paper, t.ink, 0.08),
    '--line-strong': mix(t.paper, t.ink, 0.16),
    '--rose': t.primary,
    '--rose-deep': t.primaryDeep,
    '--rose-soft': t.primarySoft,
    '--gold': t.gold,
    '--champagne': mix(t.gold, '#FFFFFF', 0.6),
    '--font-display': `'${t.fontDisplay}', ${FALLBACK.display}`,
    '--font-script': `'${t.fontScript}', ${FALLBACK.script}`,
    '--font-ui': `'${t.fontUi}', ${FALLBACK.ui}`,
  }
}

// Aplica el tema a toda la página y carga sus fuentes
export function applyTheme(theme) {
  const t = resolveTheme(theme)
  const root = document.documentElement
  Object.entries(themeToVars(t)).forEach(([k, v]) => root.style.setProperty(k, v))
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.paper)
  loadFonts([FONTS.display[t.fontDisplay], FONTS.script[t.fontScript], FONTS.ui[t.fontUi]])
  return t
}

function loadFonts(families) {
  const list = families.filter(Boolean)
  if (!list.length) return
  const href = `https://fonts.googleapis.com/css2?${list.map(f => `family=${f}`).join('&')}&display=swap`
  let link = document.getElementById('tenant-fonts')
  if (!link) {
    link = document.createElement('link')
    link.id = 'tenant-fonts'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.href !== href) link.href = href
}
