// src/components/product/GridSection.jsx
// ⚠️ NO SE CAMBIA NINGUNA CLASE CSS — diseño 100% intacto
// Solo se corrige la lógica de CRUD para que use el contexto

import { useState } from 'react'
import './GridSection.css'
import { formatPrice, contactWhatsApp } from '../../data/products'
import { useAdmin } from '../admin/AdminContext'
import { useProductsCtx } from '../../contexts/ProductsContext'
import EditableImage from '../common/editarimagen/EditableImage'
import EditableText  from '../common/editartexto/EditableText'

function GridSection({ title, products, sectionId }) {
  const { isAdmin }                              = useAdmin()
  const { createProduct, deleteProduct }         = useProductsCtx()
  const [favorites, setFavorites]                = useState({})
  const [creating, setCreating]                  = useState(false)

  // "products" viene del contexto (ya filtrado por sección en HomeLisArt)
  const items = products || []

  const toggleFavorite = (id) =>
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }))

  const handleAddClick = (product) =>
    contactWhatsApp(product.name, product.price)

  // ➕ AGREGAR — guarda en Firebase y aparece de inmediato
  const handleAddProduct = async () => {
    if (creating) return
    setCreating(true)
    try {
      await createProduct(sectionId)
    } catch (err) {
      console.error('❌ Error creando producto:', err)
      alert('Error al crear el producto. Verifica las reglas de Firestore (allow read, write: if true)')
    } finally {
      setCreating(false)
    }
  }

  // 🗑 ELIMINAR
  const handleDelete = async (e, productId) => {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar este producto?')) return
    try {
      await deleteProduct(productId)
    } catch (err) {
      console.error('❌ Error eliminando:', err)
      alert('Error al eliminar.')
    }
  }

  return (
    <div className="grid-section-wrapper">
      <h3 className="section-title">{title}</h3>

      {isAdmin && (
        <button className="grid-admin-add" onClick={handleAddProduct} disabled={creating}>
          {creating ? '⏳ Creando...' : '+ Agregar producto'}
        </button>
      )}

      {/* Mensaje vacío solo visible al admin */}
      {items.length === 0 && isAdmin && (
        <p style={{ fontSize: 13, color: '#aaa', padding: '8px 0' }}>
          Sin productos. Haz click en "+ Agregar producto".
        </p>
      )}

      <div className="grid-section">
        {items.map(product => (
          <div
            key={product.id}
            className="grid-card"
            onClick={() => !isAdmin && handleAddClick(product)}
          >
            {/* ── IMAGEN ── */}
            <div className="grid-image-container">
              <EditableImage
                id={`grid_${sectionId}_${product.id}`}
                productId={product.id}
                defaultImage={product.image}
                alt={product.name}
                className="grid-image"
                containerClassName="grid-image-container"
              />

              {!isAdmin && (
                <button
                  className="grid-favorite"
                  onClick={e => { e.stopPropagation(); toggleFavorite(product.id) }}
                >
                  {favorites[product.id] ? '❤️' : '🤍'}
                </button>
              )}

              {product.badge && (
                <EditableText
                  id={`badge_${sectionId}_${product.id}`}
                  productId={product.id}
                  field="badge"
                  defaultValue={product.badge}
                  className="grid-badge"
                  as="span"
                  mode="product"
                />
              )}

              {isAdmin && (
                <button
                  className="grid-delete"
                  onClick={e => handleDelete(e, product.id)}
                >
                  ✕
                </button>
              )}
            </div>

            {/* ── INFO ── */}
            <div className="grid-info">
              {product.rating && (
                <div className="grid-rating">
                  <div className="grid-stars">⭐⭐⭐⭐⭐</div>
                  <span className="grid-rating-count">{product.rating}</span>
                </div>
              )}

              <EditableText
                id={`name_${sectionId}_${product.id}`}
                productId={product.id}
                field="name"
                defaultValue={product.name}
                className="grid-name"
                as="h4"
                mode="product"
              />

              <EditableText
                id={`category_${sectionId}_${product.id}`}
                productId={product.id}
                field="category"
                defaultValue={product.category}
                className="grid-category"
                as="p"
                mode="product"
              />

              <div className="grid-footer">
                <EditableText
                  id={`price_${sectionId}_${product.id}`}
                  productId={product.id}
                  field="price"
                  defaultValue={product.price}
                  className="grid-price"
                  as="span"
                  type="number"
                  format={formatPrice}
                  mode="product"
                />

                {!isAdmin && (
                  <button
                    className="grid-add"
                    onClick={e => { e.stopPropagation(); handleAddClick(product) }}
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GridSection