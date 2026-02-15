import { useState } from 'react'
import './GridSection.css'
import { formatPrice, contactWhatsApp } from '../data/products'

function GridSection({ title, products }) {
  const [favorites, setFavorites] = useState({})

  const toggleFavorite = (productId) => {
    setFavorites(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }))
  }

  const handleAddClick = (product) => {
    contactWhatsApp(product.name, product.price)
  }

  return (
    <div className="grid-section-wrapper">
      <h3 className="section-title">{title}</h3>
      <div className="grid-section">
        {products.map(product => (
          <div 
            key={product.id} 
            className="grid-card"
            onClick={() => handleAddClick(product)}
          >
            <div className="grid-image-container">
              <img src={product.image} alt={product.name} className="grid-image" />
              <button 
                className="grid-favorite"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(product.id)
                }}
              >
                {favorites[product.id] ? '❤️' : '🤍'}
              </button>
              {product.badge && <span className="grid-badge">{product.badge}</span>}
            </div>
            <div className="grid-info">
              {product.rating && (
                <div className="grid-rating">
                  <div className="grid-stars">⭐⭐⭐⭐⭐</div>
                  <span className="grid-rating-count">({product.rating})</span>
                </div>
              )}
              <h4 className="grid-name">{product.name}</h4>
              <p className="grid-category">{product.category}</p>
              <div className="grid-footer">
                <span className="grid-price">{formatPrice(product.price)}</span>
                <button 
                  className="grid-add"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddClick(product)
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GridSection
