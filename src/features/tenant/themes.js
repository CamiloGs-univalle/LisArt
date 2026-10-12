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
    'Bodoni Moda': 'Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..600',
    'Space Grotesk': 'Space+Grotesk:wght@400..700',
    'Archivo': 'Archivo:wght@400..800',
    'Inter Tight': 'Inter+Tight:ital,wght@0,400..800;1,400..600',
  },
  script: {
    'Great Vibes': 'Great+Vibes',
    'Allura': 'Allura',
    'Dancing Script': 'Dancing+Script:wght@500..700',
    'Pacifico': 'Pacifico',
    'Caveat': 'Caveat:wght@500..700',
    'Mrs Saint Delafield': 'Mrs+Saint+Delafield',
  },
  ui: {
    'Manrope': 'Manrope:wght@400..800',
    'Inter': 'Inter:wght@400..800',
    'Nunito': 'Nunito:wght@400..800',
    'Poppins': 'Poppins:wght@400;500;600;700',
    'Inter Tight': 'Inter+Tight:wght@400..800',
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
  // ── Estilos inspirados en diseño editorial y tiendas premium ──
  editorial: {
    label: 'Editorial',
    paper: '#F4EFE7', ink: '#161412', primary: '#C4623A', primaryDeep: '#A84C29', primarySoft: '#E5A88A',
    blush: '#EBDDCF', gold: '#B8935A',
    fontDisplay: 'Bodoni Moda', fontScript: 'Mrs Saint Delafield', fontUi: 'Inter',
    radius: 'sharp',
  },
  tech: {
    label: 'Tech oscuro',
    paper: '#0B1020', ink: '#E8EAF6', primary: '#7C5CFF', primaryDeep: '#5B3FE0', primarySoft: '#A996FF',
    blush: '#19203D', gold: '#38BDF8',
    fontDisplay: 'Space Grotesk', fontScript: 'Caveat', fontUi: 'Inter',
    dark: true,
  },
  streetwear: {
    label: 'Streetwear',
    paper: '#ECECE8', ink: '#0E0E0E', primary: '#FF5A1F', primaryDeep: '#D9430D', primarySoft: '#FFB08F',
    blush: '#DCDCD6', gold: '#FF5A1F',
    fontDisplay: 'Archivo', fontScript: 'Caveat', fontUi: 'Inter',
    radius: 'sharp',
  },
  sabor: {
    label: 'Sabor',
    paper: '#FFF8F0', ink: '#2B1A12', primary: '#D9481F', primaryDeep: '#B23512', primarySoft: '#F2A07E',
    blush: '#FBE3CF', gold: '#E2A33B',
    fontDisplay: 'Fraunces', fontScript: 'Caveat', fontUi: 'Manrope',
  },
  spa: {
    label: 'Spa natural',
    paper: '#F6F3EE', ink: '#2F3A33', primary: '#7E9A82', primaryDeep: '#5F7B64', primarySoft: '#B7C9B9',
    blush: '#E7DED3', gold: '#C3A27A',
    fontDisplay: 'Cormorant Garamond', fontScript: 'Allura', fontUi: 'Manrope',
  },
  fiesta: {
    label: 'Noche de gala',
    paper: '#0F1424', ink: '#F4EEDF', primary: '#D4AF37', primaryDeep: '#B8932A', primarySoft: '#E8D08A',
    blush: '#1C2340', gold: '#E9C46A',
    fontDisplay: 'DM Serif Display', fontScript: 'Great Vibes', fontUi: 'Inter',
    dark: true,
  },
  minimal: {
    label: 'Tienda minimal',
    paper: '#FFFFFF', ink: '#111111', primary: '#111111', primaryDeep: '#000000', primarySoft: '#8E8E8E',
    blush: '#F2F2F2', gold: '#B8935A',
    fontDisplay: 'Inter Tight', fontScript: 'Dancing Script', fontUi: 'Inter',
  },
}

export const DEFAULT_THEME = 'rosa'

// Tema final = preset + cambios del negocio
export function resolveTheme(theme = {}) {
  const base = THEME_PRESETS[theme.preset] || THEME_PRESETS[DEFAULT_THEME]
  const t = { ...base, ...Object.fromEntries(Object.entries(theme).filter(([, v]) => v)) }
  // Si el fondo es oscuro, el tema funciona en modo oscuro aunque se haya personalizado
  t.dark = isDarkColor(t.paper)
  return t
}

// Brillo percibido de un color (0 = negro, 1 = blanco)
function luminance(hex) {
  try {
    const [r, g, b] = hex2rgb(hex)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255
  } catch { return 1 }
}
export const isDarkColor = (hex) => luminance(hex) < 0.45

const RADII = {
  soft: { sm: '10px', md: '14px', lg: '20px', xl: '28px', pill: '999px' },
  sharp: { sm: '2px', md: '3px', lg: '4px', xl: '6px', pill: '4px' },
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
  const dark = !!t.dark
  const r = RADII[t.radius] || RADII.soft
  return {
    '--paper': t.paper,
    '--paper-2': mix(t.paper, t.primarySoft, dark ? 0.08 : 0.18),
    '--card': dark ? mix(t.paper, '#FFFFFF', 0.06) : '#FFFFFF',
    '--blush': t.blush,
    '--blush-2': dark ? mix(t.blush, t.paper, 0.5) : mix(t.blush, '#FFFFFF', 0.5),
    '--shade': dark ? '#000000' : t.ink,
    '--inv': dark ? mix(t.paper, '#FFFFFF', 0.1) : t.ink,
    '--on-inv': dark ? t.ink : t.paper,
    '--r-sm': r.sm, '--r-md': r.md, '--r-lg': r.lg, '--r-xl': r.xl, '--r-pill': r.pill,
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
  root.style.colorScheme = t.dark ? 'dark' : 'light'
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
