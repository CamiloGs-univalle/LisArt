// src/components/common/editarimagen/EditableImage.jsx
// Imagen de producto. Para el admin: clic para cambiarla (Cloudinary → Firebase).

import { useRef, useState } from 'react'
import { useAdmin } from '../../admin/AdminContext'
import { useProductsCtx } from '../../../contexts/ProductsContext'

function EditableImage({ productId, defaultImage, alt, className, containerClassName, priority = false }) {
  const { isAdmin } = useAdmin()
  const { updateImage } = useProductsCtx()

  const [src, setSrc] = useState(defaultImage)
  const [uploading, setUploading] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const fileRef = useRef(null)

  // Sincroniza si el padre cambia la imagen (ej: después de crear)
  if (defaultImage !== src && !uploading) setSrc(defaultImage)

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setUploading(true)
    setSrc(URL.createObjectURL(file)) // vista previa inmediata
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
      className={`${containerClassName || ''} ${isAdmin ? 'is-admin' : ''} ${loaded ? 'is-loaded' : ''}`.trim()}
      style={{ position: 'relative', cursor: isAdmin ? 'pointer' : undefined }}
      onClick={isAdmin ? (e) => { e.stopPropagation(); if (!uploading) fileRef.current?.click() } : undefined}
      onMouseEnter={isAdmin ? () => setHovering(true) : undefined}
      onMouseLeave={isAdmin ? () => setHovering(false) : undefined}
    >
      <img
        src={src}
        alt={alt || ''}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        fetchpriority={priority ? 'high' : undefined}
        decoding="async"
        onLoad={() => setLoaded(true)}
        style={{ opacity: uploading ? 0.5 : undefined, width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {isAdmin && (hovering || uploading) && (
        <div className="image-overlay">
          <span>{uploading ? 'Subiendo…' : 'Cambiar imagen'}</span>
        </div>
      )}

      {isAdmin && (
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onClick={e => e.stopPropagation()}
          onChange={e => handleFile(e.target.files[0])}
        />
      )}
    </div>
  )
}

export default EditableImage
