// src/components/product/FeaturedProduct.jsx
// ⚠️ NO SE CAMBIA NINGUNA CLASE CSS — diseño 100% intacto

import { useState } from 'react'
import './FeaturedProduct.css'
import { formatPrice } from '../../data/products'
import { useAdmin } from '../admin/AdminContext'
import { useProductsCtx } from '../../contexts/ProductsContext'
import { useCart } from '../../contexts/CartContext'
import EditableImage from '../common/editarimagen/EditableImage'
import EditableText  from '../common/editartexto/EditableText'

function FeaturedProduct({ product }) {
  const { isAdmin }          = useAdmin()
  const { createProduct }    = useProductsCtx()
  const { addToCart }        = useCart()
  const [isFavorite, setIsFavorite] = useState(false)
  const [creating, setCreating]     = useState(false)
  const [added, setAdded]           = useState(false)

  const handleAdd = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  // Sin producto: admin puede crear uno, usuario no ve nada
  if (!product) {
    if (!isAdmin) return null
    return (
      <div style={{ padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#aaa', marginBottom: 8 }}>
          Sin producto destacado aún.
        </p>
        <button
          className="featured-btn"
          disabled={creating}
          onClick={async () => {
            setCreating(true)
            try { await createProduct('featured') }
            catch { alert('Error. Verifica las reglas de Firestore.') }
            finally { setCreating(false) }
          }}
        >
          {creating ? '⏳ Creando...' : '⭐ Crear producto destacado'}
        </button>
      </div>
    )
  }

  return (
    <div className="featured-product">

      {/* ── IMAGEN ── */}
      <div className="featured-image-container">
        <EditableImage
          id={`featured_${product.id}`}
          productId={product.id}
          defaultImage={product.image}
          alt={product.name}
          className="featured-image"
          containerClassName="featured-image-container"
        />

        {product.badge && (
          <span className="featured-badge">{product.badge}</span>
        )}

        {!isAdmin && (
          <button
            className="featured-favorite"
            onClick={() => setIsFavorite(f => !f)}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      {/* ── INFO ── */}
      <div className="featured-info">
        <div className="featured-category">
          {product.category || 'Categoría'}
        </div>

        <EditableText
          id={`name_featured_${product.id}`}
          productId={product.id}
          field="name"
          defaultValue={product.name}
          className="featured-name"
          as="h2"
          mode="product"
        />

        <EditableText
          id={`desc_featured_${product.id}`}
          productId={product.id}
          field="description"
          defaultValue={product.description || 'Descripción del producto...'}
          className="featured-description"
          as="p"
          mode="product"
        />

        <div className="featured-rating">
          <div className="featured-stars">⭐⭐⭐⭐⭐</div>
        </div>

        <div className="featured-footer">
          <EditableText
            id={`price_featured_${product.id}`}
            productId={product.id}
            field="price"
            defaultValue={product.price}
            className="featured-price"
            as="span"
            type="number"
            format={formatPrice}
            mode="product"
          />

          {!isAdmin && (
            <button
              className="featured-btn"
              onClick={handleAdd}
            >
              {added ? '✓ Añadido' : 'Agregar al carrito'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeaturedProduct