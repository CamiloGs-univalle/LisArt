import './CarouselSection.css'
import { formatPrice, contactWhatsApp } from '../data/products'

function CarouselSection({ title, products }) {
  const handleAddClick = (product) => {
    contactWhatsApp(product.name, product.price)
  }

  return (
    <div className="carousel-section">
      <h3 className="section-title">{title}</h3>
      <div className="carousel-scroll">
        {products.map(product => (
          <div 
            key={product.id} 
            className="carousel-card"
            onClick={() => handleAddClick(product)}
          >
            <div className="carousel-image-container">
              <img src={product.image} alt={product.name} className="carousel-image" />
              {product.badge && <span className="carousel-badge">{product.badge}</span>}
            </div>
            <div className="carousel-info">
              <h4 className="carousel-name">{product.name}</h4>
              <p className="carousel-category">{product.category}</p>
              <div className="carousel-footer">
                <span className="carousel-price">{formatPrice(product.price)}</span>
                <button 
                  className="carousel-add"
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

export default CarouselSection
