import { createContext, useContext, useEffect, useState } from 'react'
// Pedido del cliente (se guarda en su navegador, separado por negocio)
import { formatPrice, waLink } from '@/lib/format'
import { useTenant } from '@/features/tenant/TenantProvider'

const Ctx = createContext(null)

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* noop */ }
}

export function CartProvider({ children }) {
  const { tenantId, brand } = useTenant()
  const CART_KEY = `cart:${tenantId}`
  const INFO_KEY = `order-info:${tenantId}`
  const [items, setItems] = useState(() => load(CART_KEY, []))
  // Datos opcionales que ayudan a cerrar el pedido más rápido
  const [info, setInfo] = useState(() => load(INFO_KEY, { name: '', date: '', note: '' }))

  useEffect(() => { save(CART_KEY, items) }, [CART_KEY, items])
  useEffect(() => { save(INFO_KEY, info) }, [INFO_KEY, info])

  const addToCart = (product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => (i.id === product.id ? { ...i, qty: i.qty + qty } : i))
      }
      return [
        ...prev,
        { id: product.id, name: product.name, price: Number(product.price) || 0, image: product.image, qty },
      ]
    })
  }

  const setQty = (id, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.id !== id))
      return
    }
    setItems(prev => prev.map(i => (i.id === id ? { ...i, qty } : i)))
  }

  const removeFromCart = (id) => setItems(prev => prev.filter(i => i.id !== id))
  const clearCart = () => setItems([])
  const updateInfo = (field, value) => setInfo(prev => ({ ...prev, [field]: value }))

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  const buildMessage = () => {
    const lines = items.map(
      (i, n) => `${n + 1}. *${i.name}* × ${i.qty} — ${formatPrice(i.price * i.qty)}`
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
      `*Total productos: ${formatPrice(total)}*`,
      ...(extra.length ? ['', ...extra] : []),
      ...(photos.length ? ['', '📷 Fotos de referencia:', ...photos] : []),
      '',
      '¿Me confirmas disponibilidad y costo de envío? ¡Gracias!',
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
      value={{ items, addToCart, setQty, removeFromCart, clearCart, total, count, checkout, checkoutUrl, info, updateInfo }}
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
