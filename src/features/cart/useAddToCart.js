import { useState } from 'react'
import { useCart } from '@/features/cart/CartProvider'
import { useUI } from '@/features/catalog/UIProvider'

// Agrega al pedido + feedback visual (check temporal y aviso)
export function useAddToCart() {
  const { addToCart } = useCart()
  const { notify } = useUI()
  const [added, setAdded] = useState({})

  const add = (product, qty = 1) => {
    addToCart(product, qty)
    notify({ title: product.name, image: product.image })
    setAdded(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1400)
  }

  return { add, added }
}
