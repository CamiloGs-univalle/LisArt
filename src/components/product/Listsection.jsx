// src/components/product/ListSection.jsx
// Composición horizontal: imagen cuadrada + info a la derecha
// Sigue el patrón visual de LisArt (rosas, sombras suaves, Playfair)

import { useState } from 'react'
import './ListSection.css'
import { formatPrice, contactWhatsApp } from '../../data/products'
import { useAdmin } from '../admin/AdminContext'
import { useProductsCtx } from '../../contexts/ProductsContext'
import EditableImage from '../common/editarimagen/EditableImage'
import EditableText  from '../common/editartexto/EditableText'

function ListSection({ title, products, sectionId }) {
  const { isAdmin }                      = useAdmin()
  const { createProduct, deleteProduct } = useProductsCtx()
  const [favorites, setFavorites]        = useState({})
  const [creating, setCreating]          = useState(false)

  const items = products || []

  const toggleFavorite = (id) =>
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }))

  const handleContact = (product) =>
    contactWhatsApp(product.name, product.price)

  const handleAdd = async () => {
    if (creating) return
    setCreating(true)
    try { await createProduct(sectionId) }
    catch { alert('Error al crear. Verifica las reglas de Firestore.') }
    finally { setCreating(false) }
  }

  const handleDelete = async (e, productId) => {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar este producto?')) return
    try { await deleteProduct(productId) }
    catch { alert('Error al eliminar.') }
  }

  return (
    <div className="list-section-wrapper">
      <h3 className="section-title">{title}</h3>

      {isAdmin && (
        <button className="list-admin-add" onClick={handleAdd} disabled={creating}>
          {creating ? '⏳ Creando...' : '+ Agregar producto'}
        </button>
      )}

      {items.length === 0 && isAdmin && (
        <p style={{ fontSize: 13, color: '#aaa', padding: '8px 0' }}>
          Sin productos. Haz click en "+ Agregar producto".
        </p>
      )}

      <div className="list-section">
        {items.map((product, i) => (
          <div
            key={product.id}
            className="list-card"
            style={{ animationDelay: `${i * 0.07}s` }}
            onClick={() => !isAdmin && handleContact(product)}
          >
            {/* ── IMAGEN cuadrada izquierda ── */}
            <div className="list-image-wrap">
              <EditableImage
                id={`list_${sectionId}_${product.id}`}
                productId={product.id}
                defaultImage={product.image}
                alt={product.name}
                className="list-image"
                containerClassName="list-image-wrap"
              />
              {product.badge && (
                <span className="list-badge">{product.badge}</span>
              )}
            </div>

            {/* ── INFO derecha ── */}
            <div className="list-info">
              <div className="list-top">
                <EditableText
                  id={`name_${sectionId}_${product.id}`}
                  productId={product.id}
                  field="name"
                  defaultValue={product.name}
                  className="list-name"
                  as="h4"
                  mode="product"
                />

                {!isAdmin && (
                  <button
                    className="list-favorite"
                    onClick={e => { e.stopPropagation(); toggleFavorite(product.id) }}
                  >
                    {favorites[product.id] ? '❤️' : '🤍'}
                  </button>
                )}

                {isAdmin && (
                  <button
                    className="list-delete"
                    onClick={e => handleDelete(e, product.id)}
                  >
                    ✕
                  </button>
                )}
              </div>

              <EditableText
                id={`category_${sectionId}_${product.id}`}
                productId={product.id}
                field="category"
                defaultValue={product.category}
                className="list-category"
                as="p"
                mode="product"
              />

              <div className="list-bottom">
                {product.rating && (
                  <div className="list-rating">
                    <span className="list-stars">⭐⭐⭐⭐⭐</span>
                    <span className="list-rating-num">{product.rating}</span>
                  </div>
                )}

                <div className="list-footer">
                  <EditableText
                    id={`price_${sectionId}_${product.id}`}
                    productId={product.id}
                    field="price"
                    defaultValue={product.price}
                    className="list-price"
                    as="span"
                    type="number"
                    format={formatPrice}
                    mode="product"
                  />

                  {!isAdmin && (
                    <button
                      className="list-add"
                      onClick={e => { e.stopPropagation(); handleContact(product) }}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ListSection