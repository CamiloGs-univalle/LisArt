// Detalle de producto: hoja inferior en móvil, modal en escritorio
import { useEffect, useRef, useState } from 'react'
import './ProductSheet.css'
import { useUI } from '../../contexts/UIContext'
import { useCart } from '../../contexts/CartContext'
import { formatPrice, contactWhatsApp } from '../../data/products'
import Icon from '../ui/Icon'

export default function ProductSheet() {
  const { product: p, closeProduct, notify, openCart } = useUI()
  const { addToCart } = useCart()
  const [qty, setQty] = useState(1)
  const [closing, setClosing] = useState(false)
  const closeRef = useRef(null)

  useEffect(() => {
    if (!p) return
    setQty(1)
    setClosing(false)
    const prev = document.activeElement
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p])

  if (!p) return null

  function close() {
    setClosing(true)
    setTimeout(closeProduct, 220)
  }

  const handleAdd = (goToCart = false) => {
    addToCart(p, qty)
    if (goToCart) { openCart(); return }
    notify({ title: p.name, image: p.image })
    close()
  }

  const rating = Number(p.rating)

  return (
    <div className={`sheet ${closing ? 'is-closing' : ''}`} onClick={close} role="presentation">
      <div
        className="sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        onClick={e => e.stopPropagation()}
      >
        <span className="sheet__grip" aria-hidden="true" />
        <button ref={closeRef} className="sheet__close" onClick={close} aria-label="Cerrar">
          <Icon name="close" size={20} />
        </button>

        <div className="sheet__media">
          <img src={p.image} alt={p.name} />
          {p.badge && <span className="sheet__badge">{p.badge}</span>}
        </div>

        <div className="sheet__body">
          {p.category && <p className="eyebrow">{p.category}</p>}
          <h2 id="sheet-title" className="display sheet__name">{p.name}</h2>

          <div className="sheet__meta">
            <span className="sheet__price">{formatPrice(p.price)}</span>
            {rating > 0 && (
              <span className="sheet__rating"><Icon name="star" size={14} /> {rating.toFixed(1)}</span>
            )}
          </div>

          {p.description && <p className="sheet__desc">{p.description}</p>}

          <ul className="sheet__perks">
            <li><Icon name="hand" size={18} /> Hecho a mano para ti</li>
            <li><Icon name="sparkle" size={18} /> Personalízalo con fotos, nombres o frases</li>
            <li><Icon name="truck" size={18} /> Envíos a todo Cali · Pide con anticipación</li>
          </ul>

          <div className="sheet__actions">
            <div className="qty" aria-label="Cantidad">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Menos" disabled={qty <= 1}><Icon name="minus" size={18} /></button>
              <span aria-live="polite">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} aria-label="Más"><Icon name="plus" size={18} /></button>
            </div>
            <button className="btn btn--primary sheet__add" onClick={() => handleAdd(false)}>
              <Icon name="heart" /> Lo quiero · {formatPrice((Number(p.price) || 0) * qty)}
            </button>
          </div>

          <div className="sheet__secondary">
            <button className="sheet__link" onClick={() => handleAdd(true)}>
              Agregar y ver pedido <Icon name="arrow" size={16} />
            </button>
            <button className="sheet__link sheet__link--wa" onClick={() => contactWhatsApp(p.name, p.price)}>
              <Icon name="whatsapp" size={16} /> Preguntar por este
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
