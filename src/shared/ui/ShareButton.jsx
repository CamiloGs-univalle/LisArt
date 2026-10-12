// Compartir un enlace: menú nativo del celular o, si no existe, copiar al portapapeles
import { useState } from 'react'
import Icon from './Icon'

export default function ShareButton({ url, title, text, className = '', label = 'Compartir', showLabel = false }) {
  const [done, setDone] = useState(false)
  const share = async (e) => {
    e.stopPropagation()
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return } catch (err) { if (err?.name === 'AbortError') return }
    }
    try { await navigator.clipboard.writeText(url); setDone(true); setTimeout(() => setDone(false), 1800) } catch { /* sin permiso */ }
  }
  return (
    <button type="button" className={`share-btn ${className}`} onClick={share} aria-label={done ? 'Enlace copiado' : label} title={label}>
      <Icon name={done ? 'check' : 'share'} size={18} />
      {showLabel && <span>{done ? 'Enlace copiado' : label}</span>}
    </button>
  )
}
