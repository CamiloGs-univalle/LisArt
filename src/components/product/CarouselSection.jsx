// src/components/product/CarouselSection.jsx

import { useState, useEffect, useRef } from 'react'
import './CarouselSection.css'
import { formatPrice, contactWhatsApp } from '../../data/products'
import { useAdmin } from '../admin/AdminContext'
import { useProductsCtx } from '../../contexts/ProductsContext'
import EditableImage from '../common/editarimagen/EditableImage'
import EditableText  from '../common/editartexto/EditableText'

function CarouselSection({ title, products, sectionId }) {
  const { isAdmin }                      = useAdmin()
  const { createProduct, deleteProduct } = useProductsCtx()
  const [creating, setCreating]          = useState(false)
  const scrollRef    = useRef(null)
  const animationRef = useRef(null)
  const posRef       = useRef(0)
  // ✅ isPaused como REF (no state) → cambiarla NO reinicia el useEffect
  const isPausedRef  = useRef(false)

  const items = products || []
  const COPIES = 4
  const displayItems = items.length > 0
    ? Array.from({ length: COPIES }, () => items).flat()
    : []

  // El loop se monta UNA sola vez (cuando hay items y no es admin)
  // isPausedRef se lee dentro del loop sin necesidad de estar en dependencias
  useEffect(() => {
    if (isAdmin || items.length === 0) return

    const el = scrollRef.current
    if (!el) return

    el.style.scrollBehavior = 'auto'

    const speed = 0.7

    const animate = () => {
      if (!isPausedRef.current) {
        posRef.current += speed
        const oneSetWidth = el.scrollWidth / COPIES
        if (posRef.current >= oneSetWidth) {
          posRef.current -= oneSetWidth
        }
        el.scrollLeft = posRef.current
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationRef.current)

  }, [isAdmin, items.length]) // ← isPaused NO está aquí → el loop nunca se reinicia

  const handleAddClick = (product) => contactWhatsApp(product.name, product.price)

  const handleAddProduct = async () => {
    if (creating) return
    setCreating(true)
    try {
      await createProduct(sectionId)
    } catch (err) {
      console.error('❌ Error creando producto:', err)
      alert('Error al crear. Verifica las reglas de Firestore.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    try {
      await deleteProduct(productId)
    } catch {
      alert('Error al eliminar.')
    }
  }

  return (
    <div className="carousel-section">
      <h3 className="section-title">{title}</h3>

      {isAdmin && (
        <button className="carousel-admin-add" onClick={handleAddProduct} disabled={creating}>
          {creating ? '⏳ Creando...' : '+ Agregar producto'}
        </button>
      )}

      {items.length === 0 && isAdmin && (
        <p style={{ fontSize: 13, color: '#aaa', padding: '8px 0' }}>
          Sin productos. Haz click en "+ Agregar producto".
        </p>
      )}

      <div
        className="carousel-scroll"
        ref={scrollRef}
        onMouseEnter={() => { isPausedRef.current = true  }}
        onMouseLeave={() => { isPausedRef.current = false }}
        onTouchStart={() => { isPausedRef.current = true  }}
        onTouchEnd={()   => { isPausedRef.current = false }}
      >
        {displayItems.map((product, index) => {
          const isReal = index < items.length
          return (
            <div
              key={`${product.id}-${index}`}
              className="carousel-card"
              onClick={() => !isAdmin && handleAddClick(product)}
            >
              {/* ── IMAGEN ── */}
              <div className="carousel-image-container">
                {isReal ? (
                  <EditableImage
                    id={`carousel_${sectionId}_${product.id}`}
                    productId={product.id}
                    defaultImage={product.image}
                    alt={product.name}
                    className="carousel-image"
                    containerClassName="carousel-image-container"
                  />
                ) : (
                  <img src={product.image} alt={product.name} className="carousel-image" />
                )}

                {product.badge && isReal && (
                  <EditableText
                    id={`badge_${sectionId}_${product.id}`}
                    productId={product.id}
                    field="badge"
                    defaultValue={product.badge}
                    className="carousel-badge"
                    as="span"
                    mode="product"
                  />
                )}
                {product.badge && !isReal && (
                  <span className="carousel-badge">{product.badge}</span>
                )}

                {isAdmin && isReal && (
                  <button
                    className="carousel-delete"
                    onClick={e => { e.stopPropagation(); handleDelete(product.id) }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* ── INFO ── */}
              <div className="carousel-info">
                {isReal ? (
                  <EditableText
                    id={`name_${sectionId}_${product.id}`}
                    productId={product.id}
                    field="name"
                    defaultValue={product.name}
                    className="carousel-name"
                    as="h4"
                    mode="product"
                  />
                ) : (
                  <h4 className="carousel-name">{product.name}</h4>
                )}

                {isReal ? (
                  <EditableText
                    id={`category_${sectionId}_${product.id}`}
                    productId={product.id}
                    field="category"
                    defaultValue={product.category}
                    className="carousel-category"
                    as="p"
                    mode="product"
                  />
                ) : (
                  <p className="carousel-category">{product.category}</p>
                )}

                <div className="carousel-footer">
                  {isReal ? (
                    <EditableText
                      id={`price_${sectionId}_${product.id}`}
                      productId={product.id}
                      field="price"
                      defaultValue={product.price}
                      className="carousel-price"
                      as="span"
                      type="number"
                      format={formatPrice}
                      mode="product"
                    />
                  ) : (
                    <span className="carousel-price">{formatPrice(product.price)}</span>
                  )}

                  {!isAdmin && (
                    <button
                      className="carousel-add"
                      onClick={e => { e.stopPropagation(); handleAddClick(product) }}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CarouselSection