import { useState } from 'react'
import { useProductsCtx } from '../../contexts/ProductsContext'

// Crear / eliminar productos de una sección (solo admin)
export function useSectionAdmin(sectionId) {
  const { createProduct, deleteProduct } = useProductsCtx()
  const [creating, setCreating] = useState(false)

  const create = async () => {
    if (creating) return
    setCreating(true)
    try {
      await createProduct(sectionId)
    } catch (err) {
      console.error('Error creando producto:', err)
      alert('Error al crear el producto. Verifica las reglas de Firestore.')
    } finally {
      setCreating(false)
    }
  }

  const remove = async (productId) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    try {
      await deleteProduct(productId)
    } catch (err) {
      console.error('Error eliminando:', err)
      alert('Error al eliminar.')
    }
  }

  return { creating, create, remove }
}
