import { useState, useEffect, useRef } from 'react'
import './CarouselSection.css'
import { formatPrice, contactWhatsApp } from '../../data/products'
import { useAdmin } from '../admin/AdminContext'
import EditableImage from '../common/editarimagen/EditableImage'
import EditableText from '../common/editartexto/EditableText'

function CarouselSection({ title, products, sectionId }) {
  const { isAdmin } = useAdmin()

  const storageKey = `lisart_carousel_${sectionId}`

  const [items, setItems] = useState(products)
  const [isPaused, setIsPaused] = useState(false)

  const scrollRef = useRef(null)
  const animationRef = useRef(null)

  // 🔹 Cargar datos guardados
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      setItems(JSON.parse(saved))
    }
  }, [storageKey])

  const saveItems = (newItems) => {
    setItems(newItems)
    localStorage.setItem(storageKey, JSON.stringify(newItems))
  }

  // 🔥 AUTO SCROLL INFINITO PERFECTO
  useEffect(() => {
    if (isAdmin) return

    const container = scrollRef.current
    if (!container) return

    const speed = 1

    const animate = () => {
      if (!isPaused) {
        container.scrollLeft += speed

        const halfWidth = container.scrollWidth / 2

        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft -= halfWidth
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationRef.current)
  }, [isPaused, isAdmin, items])

  const handleAddClick = (product) => {
    contactWhatsApp(product.name, product.price)
  }

  const handleDelete = (id) => {
    const updated = items.filter(p => p.id !== id)
    saveItems(updated)
  }

  const handleAddProduct = () => {
    const newProduct = {
      id: Date.now(),
      name: 'Nuevo Producto',
      category: 'Nueva categoría',
      price: 10000,
      image: 'https://via.placeholder.com/300x300',
      badge: ''
    }

    saveItems([...items, newProduct])
  }

  return (
    <div className="carousel-section">
      <h3 className="section-title">{title}</h3>

      {isAdmin && (
        <button className="carousel-admin-add" onClick={handleAddProduct}>
          + Agregar producto
        </button>
      )}

      <div
        className="carousel-scroll"
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {[...items, ...items].map((product, index) => (
          <div
            key={`${product.id}-${index}`}
            className="carousel-card"
            onClick={() => !isAdmin && handleAddClick(product)}
          >
            <div className="carousel-image-container">
              <EditableImage
                id={`carousel_${sectionId}_${product.id}`}
                defaultImage={product.image}
                alt={product.name}
                className="carousel-image"
                containerClassName="carousel-image-container"
              />

              {product.badge && (
                <EditableText
                  id={`badge_${sectionId}_${product.id}`}
                  defaultValue={product.badge}
                  className="carousel-badge"
                  as="span"
                />
              )}

              {isAdmin && (
                <button
                  className="carousel-delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(product.id)
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="carousel-info">
              <EditableText
                id={`name_${sectionId}_${product.id}`}
                defaultValue={product.name}
                className="carousel-name"
                as="h4"
              />

              <EditableText
                id={`category_${sectionId}_${product.id}`}
                defaultValue={product.category}
                className="carousel-category"
                as="p"
              />

              <div className="carousel-footer">
                <EditableText
                  id={`price_${sectionId}_${product.id}`}
                  defaultValue={product.price}
                  className="carousel-price"
                  as="span"
                  type="number"
                  format={formatPrice}
                />

                {!isAdmin && (
                  <button
                    className="carousel-add"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddClick(product)
                    }}
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

export default CarouselSection