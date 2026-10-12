import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { withProductTransition } from '@/lib/fx'

const Ctx = createContext(null)

function setProductParam(id) {
  try {
    const url = new URL(window.location.href)
    if (id) url.searchParams.set('p', id); else url.searchParams.delete('p')
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
  } catch { /* sin historial */ }
}
export const productLink = (id) => {
  const url = new URL(window.location.href)
  url.search = ''; url.hash = ''
  url.searchParams.set('p', id)
  return url.toString()
}

// Estado de interfaz compartido: detalle de producto, carrito y avisos
export function UIProvider({ children }) {
  const [product, setProduct] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [story, setStory] = useState(null)       // { items, index } visor tipo historias
  const [photosFor, setPhotosFor] = useState(null) // id del producto en el gestor de fotos (admin)
  const [sectionsFor, setSectionsFor] = useState(null) // id del producto en el selector de secciones (admin)
  const timer = useRef(null)

  // Cada producto tiene su propio enlace (?p=id) para compartirlo
  const openProduct = useCallback((p) => {
    setProductParam(p?.id)
    // La foto de la tarjeta se expande hasta la ficha (si el navegador lo permite)
    withProductTransition(() => flushSync(() => setProduct(p)))
  }, [])
  const closeProduct = useCallback(() => { setProduct(null); setProductParam(null) }, [])
  const openCart = useCallback(() => { setProduct(null); setProductParam(null); setCartOpen(true) }, [])
  const closeCart = useCallback(() => setCartOpen(false), [])

  const openStory = useCallback((items, index = 0) => setStory({ items, index }), [])
  const closeStory = useCallback(() => setStory(null), [])
  const openPhotos = useCallback((productId) => setPhotosFor(productId), [])
  const closePhotos = useCallback(() => setPhotosFor(null), [])
  const openSectionsPicker = useCallback((id) => setSectionsFor(id), [])
  const closeSectionsPicker = useCallback(() => setSectionsFor(null), [])

  const notify = useCallback((data) => {
    clearTimeout(timer.current)
    setToast({ ...data, key: Date.now() })
    timer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  return (
    <Ctx.Provider value={{ product, openProduct, closeProduct, cartOpen, openCart, closeCart, toast, notify, story, openStory, closeStory, photosFor, openPhotos, closePhotos, sectionsFor, openSectionsPicker, closeSectionsPicker }}>
      {children}
    </Ctx.Provider>
  )
}

export function useUI() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useUI debe usarse dentro de <UIProvider>')
  return ctx
}
