import { useState } from 'react'
import '../product/GridSection.css'
import { formatPrice } from '../../data/products'
import { useCart } from '../../contexts/CartContext'

function ResultsSection({ products, title }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState({})

  const items = products || []

  const handleAdd = (product) => {
    addToCart(product)
    setAdded(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1200)
  }

  return (
    <div className="grid-section-wrapper">
      <h3 className="section-title">{title}</h3>

      {items.length === 0 ? (
        <p style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
          No encontramos productos. Prueba con otra búsqueda 🌸
        </p>
      ) : (
        <div className="grid-section">
          {items.map(product => (
            <div className="grid-card" key={product.id}>
              <div className="grid-image-container">
                <img src={product.image} alt={product.name} className="grid-image" />
                {product.badge && <span className="grid-badge">{product.badge}</span>}
              </div>

              <div className="grid-info">
                <h4 className="grid-name">{product.name}</h4>
                <p className="grid-category">{product.category || ''}</p>
                <div className="grid-footer">
                  <span className="grid-price">{formatPrice(product.price)}</span>
                  <button
                    className="grid-add"
                    onClick={() => handleAdd(product)}
                  >
                    {added[product.id] ? '✓' : '+'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ResultsSection
