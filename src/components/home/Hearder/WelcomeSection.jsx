import { useEffect, useState } from 'react'
import './WelcomeSection.css'
import { useAdmin } from '../../admin/AdminContext'

function WelcomeSection() {
  const { isAdmin } = useAdmin()
  const [logo, setLogo] = useState(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    const savedLogo = localStorage.getItem('lisart_logo')
    if (savedLogo) setLogo(savedLogo)

    const onLogoChanged = (e) => {
      setLogo(e.detail)
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 1600)
    }
    window.addEventListener('lisart_logo_changed', onLogoChanged)
    return () => window.removeEventListener('lisart_logo_changed', onLogoChanged)
  }, [])

  const handleClick = () => {
    if (!isAdmin) return
    window.__openLogoUpload?.()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (!isAdmin) return
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onloadend = () => {
      localStorage.setItem('lisart_logo', reader.result)
      window.dispatchEvent(new CustomEvent('lisart_logo_changed', { detail: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    localStorage.removeItem('lisart_logo')
    setLogo(null)
    window.dispatchEvent(new CustomEvent('lisart_logo_changed', { detail: null }))
  }

  return (
    <section className="welcome-section">

      <div
        className={`logo-main ${isAdmin ? 'is-admin' : ''} ${isDragging ? 'is-dragging' : ''} ${justSaved ? 'just-saved' : ''}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => { setIsHovering(false); setIsDragging(false) }}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); if (isAdmin) setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
      >
        <div className={`logo-content ${isAdmin && (isHovering || isDragging) ? 'dimmed' : ''}`}>
          {logo
            ? <img src={logo} alt="Logo LisArt" className="logo-image" />
            : <span>🎁</span>
          }
        </div>

        {isAdmin && !justSaved && (
          <div className={`logo-edit-overlay ${isHovering || isDragging ? 'show' : ''}`}>
            <span className="edit-icon">{isDragging ? '↓' : '+'}</span>
            <span className="edit-text">{isDragging ? 'Suelta' : logo ? 'Cambiar' : 'Subir'}</span>
          </div>
        )}

        {justSaved && (
          <div className="logo-saved-overlay show">
            <span className="saved-check">✓</span>
          </div>
        )}

        {justSaved && <div className="saved-ring" />}
      </div>

      <h1 className="brand-name">LisArt</h1>
      <p className="brand-tagline">Regalos personalizados</p>

      {isAdmin && (
        <div className="admin-bar">
          <span className="admin-badge">✦ Admin</span>
          {logo && (
            <button className="remove-btn" onClick={handleRemove}>
              Quitar logo
            </button>
          )}
        </div>
      )}

    </section>
  )
}

export default WelcomeSection