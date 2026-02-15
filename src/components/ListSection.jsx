import './ListSection.css'
import { formatPrice, contactWhatsApp } from '../data/products'

function ListSection({ title, products }) {
  const handleAddClick = (product) => {
    contactWhatsApp(product.name, product.price)
  }

  return (
    <div className="list-section-wrapper">
      <h3 className="section-title">{title}</h3>
      <div className="list-section">
        {products.map(product => (
          <div 
            key={product.id} 
            className="list-card"
            onClick={() => handleAddClick(product)}
          >
            <div className="list-image-container">
              <img src={product.image} alt={product.name} className="list-image" />
            </div>
            <div className="list-info">
              <div className="list-top">
                <h4 className="list-name">{product.name}</h4>
                <p className="list-category">{product.category}</p>
                {product.rating && (
                  <div className="list-rating">
                    <div className="list-stars">⭐⭐⭐⭐⭐</div>
                  </div>
                )}
              </div>
              <div className="list-footer">
                <span className="list-price">{formatPrice(product.price)}</span>
                <button 
                  className="list-add"
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

export default ListSection
