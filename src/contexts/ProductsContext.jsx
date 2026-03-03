// src/context/ProductsContext.jsx
import { createContext, useContext } from 'react'
import { useProducts } from '../hooks/useProducts'

const Ctx = createContext(null)

export function ProductsProvider({ children }) {
  const store = useProducts()
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useProductsCtx() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useProductsCtx debe usarse dentro de <ProductsProvider>')
  return ctx
}