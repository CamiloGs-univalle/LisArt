import { createContext, useCallback, useContext, useRef, useState } from 'react'

const Ctx = createContext(null)

// Estado de interfaz compartido: detalle de producto, carrito y avisos
export function UIProvider({ children }) {
  const [product, setProduct] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  const openProduct = useCallback((p) => setProduct(p), [])
  const closeProduct = useCallback(() => setProduct(null), [])
  const openCart = useCallback(() => { setProduct(null); setCartOpen(true) }, [])
  const closeCart = useCallback(() => setCartOpen(false), [])

  const notify = useCallback((data) => {
    clearTimeout(timer.current)
    setToast({ ...data, key: Date.now() })
    timer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  return (
    <Ctx.Provider value={{ product, openProduct, closeProduct, cartOpen, openCart, closeCart, toast, notify }}>
      {children}
    </Ctx.Provider>
  )
}

export function useUI() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useUI debe usarse dentro de <UIProvider>')
  return ctx
}
