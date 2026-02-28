import { useState, useEffect } from 'react'
import './GridSection.css'
import { formatPrice, contactWhatsApp } from '../../data/products'
import { useAdmin } from '../admin/AdminContext'
import EditableImage from '../../components/common/editarimagen/EditableImage'
import EditableText from '../../components/common/editartexto/EditableText'

function GridSection({ title, products, sectionId }) {
  const { isAdmin } = useAdmin()

  const storageKey = `lisart_grid_${sectionId}`

  const [items, setItems] = useState(products)
  const [favorites, setFavorites] = useState({})

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

  const toggleFavorite = (productId) => {
    setFavorites(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }))
  }

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
      image: 'https://via.placeholder.com/300',
      badge: '',
      rating: ''
    }

    saveItems([...items, newProduct])
  }

  return (
    <div className="grid-section-wrapper">
      <h3 className="section-title">{title}</h3>

      {isAdmin && (
        <button className="grid-admin-add" onClick={handleAddProduct}>
          + Agregar producto
        </button>
      )}

      <div className="grid-section">
        {items.map(product => (
          <div
            key={product.id}
            className="grid-card"
            onClick={() => !isAdmin && handleAddClick(product)}
          >
            <div className="grid-image-container">

              <EditableImage
                id={`grid_${sectionId}_${product.id}`}
                defaultImage={product.image}
                alt={product.name}
                className="grid-image"
                containerClassName="grid-image-container"
              />

              {!isAdmin && (
                <button
                  className="grid-favorite"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(product.id)
                  }}
                >
                  {favorites[product.id] ? '❤️' : '🤍'}
                </button>
              )}

              {product.badge && (
                <EditableText
                  id={`badge_${sectionId}_${product.id}`}
                  defaultValue={product.badge}
                  className="grid-badge"
                  as="span"
                />
              )}

              {isAdmin && (
                <button
                  className="grid-delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(product.id)
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="grid-info">

              {product.rating && (
                <div className="grid-rating">
                  <div className="grid-stars">⭐⭐⭐⭐⭐</div>
                  <EditableText
                    id={`rating_${sectionId}_${product.id}`}
                    defaultValue={product.rating}
                    className="grid-rating-count"
                    as="span"
                  />
                </div>
              )}

              <EditableText
                id={`name_${sectionId}_${product.id}`}
                defaultValue={product.name}
                className="grid-name"
                as="h4"
              />

              <EditableText
                id={`category_${sectionId}_${product.id}`}
                defaultValue={product.category}
                className="grid-category"
                as="p"
              />

              <div className="grid-footer">
                <EditableText
                  id={`price_${sectionId}_${product.id}`}
                  defaultValue={product.price}
                  className="grid-price"
                  as="span"
                  type="number"
                  format={formatPrice}
                />

                {!isAdmin && (
                  <button
                    className="grid-add"
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

export default GridSection