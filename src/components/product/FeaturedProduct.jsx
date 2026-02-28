import { useState, useEffect, useRef } from 'react'
import './FeaturedProduct.css'
import { formatPrice, contactWhatsApp } from '../../data/products'
import { useAdmin } from '../admin/AdminContext'
import EditableImage from '../common/editarimagen/EditableImage'
import EditableText from '../common/editartexto/EditableText'

function FeaturedProduct({ product }) {
  const { isAdmin } = useAdmin()
  const [isFavorite, setIsFavorite] = useState(false)
  const [image, setImage] = useState(product.image)
  const [isHovering, setIsHovering] = useState(false)
  const fileInputRef = useRef(null)

  const storageKey = `lisart_product_image_${product.id}`

  useEffect(() => {
    const savedImage = localStorage.getItem(storageKey)
    if (savedImage) setImage(savedImage)

    const onImageChanged = (e) => {
      if (e.detail.id === product.id) {
        setImage(e.detail.image)
      }
    }

    window.addEventListener('lisart_product_image_changed', onImageChanged)
    return () =>
      window.removeEventListener('lisart_product_image_changed', onImageChanged)
  }, [product.id])

  const handleOrderClick = () => {
    contactWhatsApp(product.name, product.price)
  }

  const handleImageClick = () => {
    if (!isAdmin) return
    fileInputRef.current?.click()
  }

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onloadend = () => {
      localStorage.setItem(storageKey, reader.result)
      window.dispatchEvent(
        new CustomEvent('lisart_product_image_changed', {
          detail: { id: product.id, image: reader.result }
        })
      )
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="featured-product">
      <div
        className={`featured-image-container ${isAdmin ? 'is-admin' : ''}`}
        onClick={handleImageClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <EditableImage
          id={`featured_${product.id}`}
          defaultImage={product.image}
          alt={product.name}
          className="featured-image"
          containerClassName="featured-image-container"
        />

        {isAdmin && isHovering && (
          <div className="image-overlay">
            <span>📷 Cambiar imagen</span>
          </div>
        )}

        <span className="featured-badge">{product.badge}</span>

        <button
          className="featured-favorite"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>

        {isAdmin && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        )}
      </div>

      <div className="featured-info">
        <div className="featured-category">{product.category}</div>
        <EditableText
          id={`name_${product.id}`}
          defaultValue={product.name}
          className="featured-name"
          as="h2"
        />
        <EditableText
          id={`desc_${product.id}`}
          defaultValue={product.description}
          className="featured-description"
          as="p"
        />

        <div className="featured-rating">
          <div className="featured-stars">⭐⭐⭐⭐⭐</div>
          <EditableText
            id={`price_${product.id}`}
            defaultValue={product.price}
            className="featured-price"
            as="span"
            type="number"
            format={formatPrice}
          />
        </div>

        <div className="featured-footer">
          <span className="featured-price">
            {formatPrice(product.price)}
          </span>

          <button className="featured-btn" onClick={handleOrderClick}>
            Ordenar Ahora
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeaturedProduct