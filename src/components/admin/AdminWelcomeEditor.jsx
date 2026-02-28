import { useRef } from 'react'
import { useAdmin } from '../admin/AdminContext'

/**
 * AdminWelcomeEditor
 * No renderiza UI propia. Expone al window un trigger para que
 * WelcomeSection lo invoque cuando el admin toca el logo.
 * 
 * Uso: montar este componente en HomeLisArt (ya lo tienes).
 * WelcomeSection llama window.__openLogoUpload() al hacer click.
 */
function AdminWelcomeEditor() {
  const { isAdmin } = useAdmin()
  const fileInputRef = useRef(null)

  // Registra el trigger en window para que WelcomeSection lo llame
  if (isAdmin) {
    window.__openLogoUpload = () => fileInputRef.current?.click()
  } else {
    window.__openLogoUpload = null
  }

  if (!isAdmin) return null

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onloadend = () => {
      localStorage.setItem('lisart_logo', reader.result)
      window.dispatchEvent(
        new CustomEvent('lisart_logo_changed', { detail: reader.result })
      )
    }
    reader.readAsDataURL(file)
  }

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={(e) => handleFile(e.target.files[0])}
    />
  )
}

export default AdminWelcomeEditor