// ─────────────────────────────────────────────────────────────
// Estrategias de venta del catálogo (sin dependencias).
// Regla de oro: todo número que ve el cliente final sale de datos
// reales que pone el dueño (inventario, fechas, precios). Nada inventado.
//
//  · Metas de compra: «Te faltan $X para envío gratis / descuento / regalo»
//  · Precio ancla: 3 opciones con la del medio recomendada
//  · Ofertas: precio antes/ahora con fecha de fin (cuenta regresiva real)
//  · Pocas unidades: «Quedan 3» según el inventario
//  · Combos con ahorro y «lleva también»
//  · Opiniones de clientes reales
// ─────────────────────────────────────────────────────────────

export const MARKETING_DEFAULTS = {
  goalsEnabled: false,
  goals: [
    { amount: 80000, type: 'shipping', value: 0, label: 'Envío gratis' },
    { amount: 150000, type: 'percent', value: 10, label: '10% de descuento' },
  ],
  stockEnabled: true,
  lowStock: 5,              // desde cuántas unidades se muestra «Quedan N»
  crossSellEnabled: true,
  compares: [],             // [{ id, title, subtitle, items:[id,id,id], recommended:id, features:[{ label, values:['','',''] }] }]
  combos: [],               // [{ id, name, description, items:[id…], price, image }]
  reviews: [],              // [{ id, name, text, stars, productId? }]
}

export const GOAL_TYPES = {
  shipping: { label: 'Envío gratis', icon: 'truck' },
  percent: { label: '% de descuento', icon: 'tag' },
  amount: { label: 'Descuento en pesos', icon: 'tag' },
  gift: { label: 'Regalo', icon: 'gift' },
}

const n = (v) => Number(v) || 0

export const withMarketingDefaults = (m) => ({ ...MARKETING_DEFAULTS, ...(m || {}) })

export const goalLabel = (g) => g.label || (
  g.type === 'percent' ? `${n(g.value)}% de descuento`
    : g.type === 'amount' ? `$ ${n(g.value).toLocaleString('es-CO')} de descuento`
      : g.type === 'gift' ? 'Un regalo' : 'Envío gratis')

// Progreso hacia las metas: cuál ya ganó y cuánto falta para la siguiente
export function goalProgress(total, mk) {
  const m = withMarketingDefaults(mk)
  if (!m.goalsEnabled) return null
  const tiers = (m.goals || []).filter(g => n(g.amount) > 0).sort((a, b) => n(a.amount) - n(b.amount))
  if (!tiers.length) return null
  const won = tiers.filter(g => total >= n(g.amount))
  const next = tiers.find(g => total < n(g.amount)) || null
  const prevAmount = won.length ? n(won.at(-1).amount) : 0
  const pct = next ? Math.min(100, Math.round(((total - prevAmount) / (n(next.amount) - prevAmount)) * 100)) : 100
  return { tiers, won, next, missing: next ? n(next.amount) - total : 0, pct, overallPct: Math.min(100, Math.round((total / n(tiers.at(-1).amount)) * 100)) }
}

// Descuento que da la mejor meta alcanzada (el envío gratis y el regalo no restan del total)
export function goalDiscount(total, progress) {
  if (!progress?.won?.length) return 0
  let best = 0
  for (const g of progress.won) {
    const d = g.type === 'percent' ? Math.round(total * Math.min(n(g.value), 90) / 100) : g.type === 'amount' ? n(g.value) : 0
    best = Math.max(best, d)
  }
  return Math.min(best, total)
}

/* ── Ofertas con fecha de fin ── */
const toDate = (v) => { if (!v) return null; const d = new Date(v); return isNaN(d) ? null : d }

// Oferta vigente: precio antes > ahora y (sin fecha o la fecha no ha pasado)
export function activeOffer(p, now = Date.now()) {
  const price = n(p?.price), before = n(p?.oldPrice)
  if (!price || before <= price) return null
  const ends = toDate(p?.offerEnds)
  if (ends && ends.getTime() <= now) return null
  return { before, price, save: before - price, percent: Math.round((1 - price / before) * 100), ends }
}

export function timeLeft(ends, now = Date.now()) {
  const ms = Math.max(0, (ends?.getTime?.() || 0) - now)
  const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60
  return { ms, d, h, m, s }
}

/* ── Inventario ── */
// null = sin control de inventario
export function stockInfo(p, mk) {
  const m = withMarketingDefaults(mk)
  if (p?.stock === '' || p?.stock == null) return null
  const stock = Math.max(0, Math.floor(n(p.stock)))
  if (stock === 0) return { stock, out: true, low: false, label: 'Agotado' }
  const low = m.stockEnabled && stock <= n(m.lowStock)
  return { stock, out: false, low, label: low ? (stock === 1 ? '¡Última unidad!' : `¡Quedan ${stock}!`) : '' }
}

/* ── Combos ── */
export function comboInfo(combo, products = []) {
  const items = (combo?.items || []).map(id => products.find(p => p.id === id)).filter(Boolean)
  const regular = items.reduce((a, p) => a + n(p.price), 0)
  const price = n(combo?.price) || regular
  const save = Math.max(regular - price, 0)
  return { items, regular, price, save, percent: regular ? Math.round((save / regular) * 100) : 0, image: combo?.image || items[0]?.image || '' }
}

/* ── Comparador (precio ancla) ── */
export function compareInfo(cmp, products = []) {
  const items = (cmp?.items || []).map(id => products.find(p => p.id === id)).filter(Boolean)
  // Ordenadas de menor a mayor precio: la barata hace ver razonable la del medio, la cara la ancla
  items.sort((a, b) => n(a.price) - n(b.price))
  const recommended = cmp?.recommended && items.some(p => p.id === cmp.recommended)
    ? cmp.recommended
    : items[Math.floor(items.length / 2)]?.id
  return { items, recommended }
}

// ¿En qué comparador aparece este producto?
export const compareFor = (productId, mk) => withMarketingDefaults(mk).compares.find(c => (c.items || []).includes(productId)) || null

// Productos sugeridos para «lleva también»
export function suggestions({ product, cartIds = [], products = [], missing = 0, max = 4 }) {
  const exclude = new Set([product?.id, ...cartIds].filter(Boolean))
  const pool = products.filter(p => !exclude.has(p.id) && n(p.price) > 0 && !(stockInfo(p)?.out))
  const related = (product?.related || []).map(id => pool.find(p => p.id === id)).filter(Boolean)
  let rest = pool.filter(p => !related.includes(p))
  if (missing > 0) {
    // Primero lo que completa la meta con el menor gasto extra
    rest = rest.sort((a, b) => {
      const da = n(a.price) >= missing ? n(a.price) - missing : 1e12 + (missing - n(a.price))
      const db = n(b.price) >= missing ? n(b.price) - missing : 1e12 + (missing - n(b.price))
      return da - db
    })
  } else {
    const sec = new Set(product?.sections || [])
    rest = rest.sort((a, b) => Number((b.sections || []).some(s => sec.has(s))) - Number((a.sections || []).some(s => sec.has(s))) || Number(!!b.featured) - Number(!!a.featured))
  }
  return [...related, ...rest].slice(0, max)
}

export const newId = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

// Texto para la barra de anuncios: «Envío gratis desde $80.000»
export function goalAnnouncement(mk) {
  const m = withMarketingDefaults(mk)
  if (!m.goalsEnabled) return ''
  const g = (m.goals || []).filter(x => n(x.amount) > 0).sort((a, b) => n(a.amount) - n(b.amount))[0]
  return g ? `${goalLabel(g)} en compras desde $ ${n(g.amount).toLocaleString('es-CO')}` : ''
}
