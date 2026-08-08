import { createContext, useContext, useEffect, useState } from 'react'
import { formatPrice, WHATSAPP_NUMBER } from '../data/products'

const Ctx = createContext(null)
const CART_KEY = 'lisart_cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch {
      // noop
    }
  }, [items])

  const addToCart = (product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          image: product.image,
          qty: 1
        }
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

  const removeFromCart = (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  const checkout = () => {
    if (items.length === 0) return
    const lines = items.map(
      i => `• ${i.name} x${i.qty} = ${formatPrice(i.price * i.qty)}\n  📷 ${i.image}`
    )
    const msg = `Hola LisArt! Quiero ordenar:\n${lines.join('\n')}\n\nTotal: ${formatPrice(total)} 🎁`
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
      '_blank'
    )
  }

  return (
    <Ctx.Provider
      value={{ items, addToCart, setQty, removeFromCart, clearCart, total, count, checkout }}
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
