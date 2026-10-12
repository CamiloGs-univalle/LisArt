// ─────────────────────────────────────────────────────────────
// Cuentas del negocio (sin dependencias): costos, ganancia, ventas
// y cotizaciones. Todo se calcula aquí para que la pantalla y los
// mensajes de WhatsApp muestren siempre los mismos números.
// ─────────────────────────────────────────────────────────────

// Partes del costo de un producto
export const COST_FIELDS = [
  { k: 'materiales', label: 'Materiales', hint: 'Lo que compras para hacerlo' },
  { k: 'manoObra', label: 'Mano de obra', hint: 'Tu tiempo o el de quien lo hace' },
  { k: 'empaque', label: 'Empaque', hint: 'Caja, bolsa, tarjeta, moño…' },
  { k: 'otros', label: 'Otros', hint: 'Transporte, comisiones…' },
]

export const BUSINESS_DEFAULTS = { targetMargin: 40 } // % de ganancia sobre el precio de venta

const n = (v) => Number(v) || 0
const round = (v) => Math.round(n(v))

export const unitCost = (c) => COST_FIELDS.reduce((a, f) => a + n(c?.[f.k]), 0)

// Ganancia por unidad y margen (sobre el precio de venta)
export function profitOf(price, cost) {
  const p = n(price), c = n(cost)
  const profit = p - c
  return { profit, margin: p > 0 ? Math.round((profit / p) * 100) : 0, markup: c > 0 ? Math.round((profit / c) * 100) : 0 }
}

// Redondeo "de vitrina": a la centena / quinientos / mil más cercano hacia arriba
export function nicePrice(v) {
  const x = n(v)
  if (x <= 0) return 0
  const step = x < 10000 ? 100 : x < 100000 ? 500 : 1000
  return Math.ceil(x / step) * step
}

// Precio sugerido para lograr el margen deseado
export const suggestedPrice = (cost, targetMargin = BUSINESS_DEFAULTS.targetMargin) => {
  const m = Math.min(Math.max(n(targetMargin), 0), 95) / 100
  return n(cost) > 0 ? nicePrice(n(cost) / (1 - m)) : 0
}

// Semáforo del margen
export const marginLevel = (margin) => (margin >= 35 ? 'good' : margin >= 15 ? 'mid' : 'low')

/* ── Ventas y cotizaciones (mismo formato de líneas) ──
   line = { productId?, name, qty, price, cost }               */
export function totalsOf(doc = {}) {
  const lines = doc.lines || []
  const subtotal = lines.reduce((a, l) => a + n(l.price) * n(l.qty), 0)
  const discount = doc.discountType === 'percent'
    ? round(subtotal * Math.min(n(doc.discount), 100) / 100)
    : Math.min(n(doc.discount), subtotal)
  const shipping = n(doc.shipping)
  const total = Math.max(subtotal - discount + shipping, 0)
  const cost = lines.reduce((a, l) => a + n(l.cost) * n(l.qty), 0)
  const profit = subtotal - discount - cost // el envío no es ganancia
  const units = lines.reduce((a, l) => a + n(l.qty), 0)
  return { subtotal, discount, shipping, total, cost, profit, units, margin: subtotal - discount > 0 ? Math.round((profit / (subtotal - discount)) * 100) : 0 }
}

const toDate = (v) => {
  if (!v) return null
  if (typeof v === 'object' && typeof v.toDate === 'function') return v.toDate()
  if (typeof v === 'object' && 'seconds' in v) return new Date(v.seconds * 1000)
  // "2026-10-10" es una fecha local (no UTC), si no en Colombia se correría un día
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(`${v}T12:00:00`)
  const d = new Date(v)
  return isNaN(d) ? null : d
}
// Sin fecha válida no pertenece a ningún mes (antes caía en el mes actual)
export const monthKey = (v = new Date()) => { const d = toDate(v); if (!d) return ''; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
export const monthLabel = (key) => {
  const [y, m] = key.split('-').map(Number)
  const t = new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  return t.charAt(0).toUpperCase() + t.slice(1)
}
export const shiftMonth = (key, delta) => {
  const [y, m] = key.split('-').map(Number)
  return monthKey(new Date(y, m - 1 + delta, 1))
}

// Resumen de un mes: totales, ventas por día y productos más vendidos
export function summarize(sales = [], key = monthKey()) {
  const list = sales.filter(s => s.status !== 'anulada' && monthKey(s.date || s.createdAt) === key)
  const [y, m] = key.split('-').map(Number)
  const days = new Date(y, m, 0).getDate()
  const byDay = Array.from({ length: days }, () => 0)
  const top = new Map()
  let revenue = 0, cost = 0, profit = 0, units = 0
  for (const s of list) {
    const t = totalsOf(s)
    revenue += t.subtotal - t.discount; cost += t.cost; profit += t.profit; units += t.units
    const d = toDate(s.date); if (d) byDay[d.getDate() - 1] += t.subtotal - t.discount
    for (const l of s.lines || []) {
      const k = l.productId || l.name
      const cur = top.get(k) || { name: l.name, qty: 0, revenue: 0, profit: 0 }
      cur.qty += n(l.qty); cur.revenue += n(l.price) * n(l.qty); cur.profit += (n(l.price) - n(l.cost)) * n(l.qty)
      top.set(k, cur)
    }
  }
  return {
    count: list.length, revenue, cost, profit, units,
    margin: revenue > 0 ? Math.round((profit / revenue) * 100) : 0,
    avgTicket: list.length ? Math.round(revenue / list.length) : 0,
    byDay,
    top: [...top.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    list,
  }
}

// Convierte el mensaje de pedido de WhatsApp (el que arma el catálogo) en líneas de venta
//   "1. *Ramo de rosas* (Talla M) × 2 — $ 90.000"
export function parseOrderMessage(text = '', products = [], costs = {}) {
  const lines = []
  const re = /^\s*\d+\.\s*\*?(.+?)\*?(?:\s*\(([^)]*)\))?\s*[x×]\s*(\d+)\s*[—–-]\s*\$?\s*([\d.,\s\u00a0]+)/i
  for (const raw of String(text).split(/\r?\n/)) {
    const m = raw.match(re)
    if (!m) continue
    const name = m[1].replace(/\*/g, '').trim()
    const qty = Math.max(1, parseInt(m[3], 10))
    const lineTotal = Number(m[4].replace(/[^\d]/g, '')) || 0
    const p = products.find(x => (x.name || '').trim().toLowerCase() === name.toLowerCase())
    lines.push({
      productId: p?.id || null,
      name: m[2] ? `${name} (${m[2].trim()})` : name,
      qty,
      price: qty ? Math.round(lineTotal / qty) : 0,
      cost: p ? unitCost(costs[p.id]) : 0,
    })
  }
  const name = String(text).match(/Mi nombre:\s*(.+)/i)?.[1]?.trim() || ''
  // "Descuento por meta de compra: −$ 10.000" → descuento en pesos
  const dm = String(text).match(/Descuento[^:\n]*:\s*[−-]?\s*\$?\s*([\d.,\s\u00a0]+)/i)
  const discount = dm ? Number(dm[1].replace(/[^\d]/g, '')) || 0 : 0
  return { lines, customer: name, discount, discountType: discount ? 'amount' : undefined }
}

export const PAYMENT_METHODS = ['Efectivo', 'Nequi', 'Daviplata', 'Transferencia', 'Tarjeta', 'Otro']
export const QUOTE_STATUS = {
  borrador: { label: 'Borrador' },
  enviada: { label: 'Enviada' },
  aceptada: { label: 'Aceptada' },
  rechazada: { label: 'No aceptada' },
}
