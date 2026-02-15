import { useState } from 'react'
import './FeaturedProduct.css'
import { formatPrice, contactWhatsApp } from '../data/products'

function FeaturedProduct({ product }) {
  const [isFavorite, setIsFavorite] = useState(false)

  const handleOrderClick = () => {
    contactWhatsApp(product.name, product.price)
  }

  return (
    <div className="featured-product">
      <div className="featured-image-container">
        <img src={product.image} alt={product.name} className="featured-image" />
        <span className="featured-badge">{product.badge}</span>
        <button 
          className="featured-favorite"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="featured-info">
        <div className="featured-category">{product.category}</div>
        <h2 className="featured-name">{product.name}</h2>
        <p className="featured-description">{product.description}</p>
        <div className="featured-rating">
          <div className="featured-stars">⭐⭐⭐⭐⭐</div>
          <span className="featured-rating-text">{product.rating} ({product.reviews} opiniones)</span>
        </div>
        <div className="featured-footer">
          <span className="featured-price">{formatPrice(product.price)}</span>
          <button className="featured-btn" onClick={handleOrderClick}>
            Ordenar Ahora
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeaturedProduct
