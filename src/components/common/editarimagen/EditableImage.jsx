// src/components/common/editarimagen/EditableImage.jsx
// Mismas clases CSS que el original. Solo la lógica es nueva.

import { useRef, useState } from 'react'
import { useAdmin } from '../../admin/AdminContext'
import { useProductsCtx } from '../../../contexts/ProductsContext'

function EditableImage({ productId, defaultImage, alt, className, containerClassName }) {
  const { isAdmin }     = useAdmin()
  const { updateImage } = useProductsCtx()

  const [src, setSrc]           = useState(defaultImage)
  const [uploading, setUploading] = useState(false)
  const [hovering, setHovering]   = useState(false)
  const fileRef = useRef(null)

  // Sincroniza si el padre cambia la imagen (ej: después de crear)
  if (defaultImage !== src && !uploading) setSrc(defaultImage)

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setUploading(true)
    setSrc(URL.createObjectURL(file)) // preview local inmediato
    try {
      const url = await updateImage(productId, file)
      setSrc(url)
    } catch {
      setSrc(defaultImage)
      alert('Error subiendo la imagen. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className={`${containerClassName || ''} ${isAdmin ? 'is-admin' : ''}`}
      style={{ position: 'relative', cursor: isAdmin ? 'pointer' : 'default' }}
      onClick={() => isAdmin && !uploading && fileRef.current?.click()}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ opacity: uploading ? 0.5 : 1, transition: 'opacity .3s', width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* Overlay hover admin — usa la clase CSS existente */}
      {isAdmin && hovering && !uploading && (
        <div className="image-overlay" style={{ opacity: 1 }}>
          <span>📷 Cambiar imagen</span>
        </div>
      )}

      {isAdmin && uploading && (
        <div className="image-overlay" style={{ opacity: 1 }}>
          <span>⏳ Subiendo...</span>
        </div>
      )}

      {isAdmin && (
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
      )}
    </div>
  )
}

export default EditableImage