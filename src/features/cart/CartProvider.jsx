import { createContext, useContext, useEffect, useState } from 'react'
// Pedido del cliente (se guarda en su navegador, separado por negocio)
import { formatPrice, waLink } from '@/lib/format'
import { useTenant } from '@/features/tenant/TenantProvider'
import { useSettingsCtx } from '@/features/catalog/data/SettingsProvider'
import { goalProgress, goalDiscount, goalLabel, stockInfo } from '@/lib/marketing'
import { productSizes, productColors } from '@/lib/catalog'
import { useProductsCtx } from '@/features/catalog/data/ProductsProvider'
import { flyToCart } from '@/lib/fx'

const Ctx = createContext(null)

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
// Lo guardado en el navegador puede venir dañado o de una versión vieja: se limpia
const cleanItems = (list) => (Array.isArray(list) ? list : [])
  .filter(i => i && typeof i === 'object' && i.id && typeof i.name === 'string')
  .map(i => ({ ...i, qty: Math.min(999, Math.max(1, Math.floor(Number(i.qty) || 1))), price: Math.max(0, Number(i.price) || 0) }))

// ¿Se puede agregar? 'out' = agotado · 'options' = falta elegir talla/color · null = sí
export function cartBlock(product, options = {}, marketing) {
  if (!product || String(product.id).startsWith('combo:')) return null
  if (stockInfo(product, marketing)?.out) return 'out'
  if (productSizes(product).length && !options.size) return 'options'
  if (productColors(product).length > 1 && !options.color) return 'options'
  return null
}

const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* noop */ }
}

export function CartProvider({ children }) {
  const { tenantId, brand } = useTenant()
  const { marketing } = useSettingsCtx()
  const CART_KEY = `cart:${tenantId}`
  const INFO_KEY = `order-info:${tenantId}`
  const { products, loading: productsLoading } = useProductsCtx()
  const [items, setItems] = useState(() => cleanItems(load(CART_KEY, [])))
  // Datos opcionales que ayudan a cerrar el pedido más rápido
  const [info, setInfo] = useState(() => load(INFO_KEY, { name: '', date: '', note: '' }))

  useEffect(() => { save(CART_KEY, items) }, [CART_KEY, items])
  useEffect(() => { save(INFO_KEY, info) }, [INFO_KEY, info])

  // Precios, nombres y fotos al día: si el negocio cambió un precio, el pedido lo refleja.
  // Si un producto se borró del catálogo, sale del pedido.
  useEffect(() => {
    if (productsLoading || !products) return
    const byId = new Map(products.map(p => [p.id, p]))
    setItems(prev => {
      let changed = false
      const next = prev.flatMap(i => {
        if (String(i.id).startsWith('combo:')) return [i]
        const p = byId.get(i.id)
        if (!p) { changed = true; return [] }
        const price = Number(p.price) || 0
        if (i.price === price && i.name === p.name && i.image === p.image) return [i]
        changed = true
        return [{ ...i, price, name: p.name, image: p.image }]
      })
      return changed ? next : prev
    })
  }, [products, productsLoading])

  // Cada combinación de producto + talla + color es una línea distinta del pedido
  const lineKey = (i) => i.key || i.id

  const addToCart = (product, qty = 1, options = {}) => {
    const block = cartBlock(product, { ...options, color: options.color || (productColors(product).length === 1 ? productColors(product)[0].name : options.color) }, marketing)
    if (block) return block
    const size = options.size || ''
    const color = options.color || ''
    const key = [product.id, size, color].join('|')
    qty = Math.max(1, Math.floor(Number(qty) || 1))
    setItems(prev => {
      const existing = prev.find(i => lineKey(i) === key)
      if (existing) {
        return prev.map(i => (lineKey(i) === key ? { ...i, qty: i.qty + qty } : i))
      }
      return [
        ...prev,
        { key, id: product.id, name: product.name, price: Number(product.price) || 0, image: product.image, qty, size, color, ...(options.detail ? { detail: options.detail } : {}) },
      ]
    })
    // La animación nunca debe impedir que el producto quede en el pedido
    try { flyToCart(product.image) } catch { /* sin animación */ }
    return null
  }

  // Sumar/restar con el valor más reciente (varios toques rápidos no se pierden)
  const changeQty = (key, delta) => setItems(prev => prev.flatMap(i => {
    if (lineKey(i) !== key) return [i]
    const qty = i.qty + delta
    return qty > 0 ? [{ ...i, qty: Math.min(999, qty) }] : []
  }))

  const setQty = (key, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => lineKey(i) !== key))
      return
    }
    setItems(prev => prev.map(i => (lineKey(i) === key ? { ...i, qty } : i)))
  }

  const removeFromCart = (key) => setItems(prev => prev.filter(i => lineKey(i) !== key))
  const clearCart = () => setItems([])
  const updateInfo = (field, value) => setInfo(prev => ({ ...prev, [field]: value }))

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)
  // Metas de compra: cuánto falta para el siguiente premio y el descuento ganado
  const progress = goalProgress(total, marketing)
  const discount = goalDiscount(total, progress)
  const rewards = (progress?.won || []).map(goalLabel)
  const finalTotal = total - discount

  const buildMessage = () => {
    const lines = items.map(
      (i, n) => {
        const opts = [i.size && `Talla ${i.size}`, i.color && `Color ${i.color}`].filter(Boolean).join(' · ')
        return `${n + 1}. *${i.name}*${opts ? ` (${opts})` : ''} × ${i.qty} — ${formatPrice(i.price * i.qty)}${i.detail ? `\n    Incluye: ${i.detail}` : ''}`
      }
    )
    const photos = items
      .filter(i => i.image && !String(i.image).includes('placehold.co'))
      .map(i => `• ${i.name}: ${i.image}`)

    const extra = []
    if (info.name?.trim()) extra.push(`👤 Mi nombre: ${info.name.trim()}`)
    if (info.date?.trim()) extra.push(`📅 Fecha de entrega: ${info.date.trim()}`)
    if (info.note?.trim()) extra.push(`💌 Detalles / dedicatoria: ${info.note.trim()}`)

    return [
      `Hola ${brand.name} 👋 Quiero hacer este pedido:`,
      '',
      ...lines,
      '',
      ...(discount > 0
        ? [`Subtotal: ${formatPrice(total)}`, `Descuento por meta de compra: −${formatPrice(discount)}`, `*Total productos: ${formatPrice(finalTotal)}*`]
        : [`*Total productos: ${formatPrice(total)}*`]),
      ...(rewards.length ? [`🎁 Premio ganado: ${rewards.join(' + ')}`] : []),
      ...(extra.length ? ['', ...extra] : []),
      ...(photos.length ? ['', '📷 Fotos de referencia:', ...photos] : []),
      '',
      (progress?.won || []).some(g => g.type === 'shipping') ? '¿Me confirmas disponibilidad? ¡Gracias!' : '¿Me confirmas disponibilidad y costo de envío? ¡Gracias!',
    ].join('\n')
  }

  const checkoutUrl = () =>
    waLink(brand.whatsapp, buildMessage())

  const checkout = () => {
    if (items.length === 0) return
    window.open(checkoutUrl(), '_blank', 'noopener')
  }

  return (
    <Ctx.Provider
      value={{ items, lineKey, addToCart, setQty, changeQty, removeFromCart, clearCart, total, count, checkout, checkoutUrl, info, updateInfo, progress, discount, finalTotal, rewards }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
