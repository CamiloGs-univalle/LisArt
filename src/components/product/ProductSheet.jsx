// Detalle de producto: hoja inferior en móvil, modal en escritorio
import { useEffect, useRef, useState } from 'react'
import './ProductSheet.css'
import { useUI } from '../../contexts/UIContext'
import { useCart } from '../../contexts/CartContext'
import { formatPrice, contactWhatsApp } from '../../data/products'
import Icon from '../ui/Icon'
import { getImages, optimizeImg } from '../../data/images'
import { useSiteContent } from '../../hooks/useSiteContent'

// Galería deslizable con puntos y miniaturas
function Gallery({ p }) {
  const imgs = getImages(p)
  const ref = useRef(null)
  const [i, setI] = useState(0)

  useEffect(() => { setI(0); if (ref.current) ref.current.scrollLeft = 0 }, [p])

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    setI(Math.round(el.scrollLeft / el.clientWidth))
  }
  const go = (k) => ref.current?.scrollTo({ left: k * ref.current.clientWidth, behavior: 'smooth' })

  return (
    <div className="sheet__media">
      <div className="gal" ref={ref} onScroll={onScroll} aria-label={`Fotos de ${p.name}`}>
        {imgs.map((url, k) => (
          <img key={url} src={optimizeImg(url, 1000)} alt={`${p.name}, foto ${k + 1} de ${imgs.length}`} loading={k === 0 ? 'eager' : 'lazy'} />
        ))}
      </div>
      {p.badge && <span className="sheet__badge">{p.badge}</span>}
      {imgs.length > 1 && (
        <>
          <span className="gal__count">{i + 1} / {imgs.length}</span>
          <div className="gal__dots">
            {imgs.map((_, k) => <button key={k} className={k === i ? 'is-on' : ''} onClick={() => go(k)} aria-label={`Foto ${k + 1}`} />)}
          </div>
          <button className="gal__nav gal__nav--prev" onClick={() => go(Math.max(0, i - 1))} disabled={i === 0} aria-label="Foto anterior"><Icon name="chevronLeft" size={20} /></button>
          <button className="gal__nav gal__nav--next" onClick={() => go(Math.min(imgs.length - 1, i + 1))} disabled={i === imgs.length - 1} aria-label="Foto siguiente"><Icon name="chevron" size={20} /></button>
        </>
      )}
    </div>
  )
}

export default function ProductSheet() {
  const { product: p, closeProduct, notify, openCart } = useUI()
  const { addToCart } = useCart()
  const { perks } = useSiteContent()
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

        <Gallery p={p} />

        <div className="sheet__body">
          {p.category && <p className="eyebrow">{p.category}</p>}
          <h2 id="sheet-title" className="display sheet__name">{p.name}</h2>

          <div className="sheet__meta">
            <span className="sheet__price">
              {Number(p.price) > 0
                ? <>{p.pricePrefix && <small className="sheet__prefix">{p.pricePrefix}</small>} {formatPrice(p.price)}</>
                : 'Precio a cotizar'}
            </span>
            {rating > 0 && (
              <span className="sheet__rating"><Icon name="star" size={14} /> {rating.toFixed(1)}</span>
            )}
          </div>

          {p.description && <p className="sheet__desc">{p.description}</p>}
          {p.personalizacion && (
            <p className="sheet__perso"><Icon name="sparkle" size={16} /> <span><strong>Personalizamos:</strong> {p.personalizacion}</span></p>
          )}

          <ul className="sheet__perks">
            {perks.filter(x => String(x).trim()).map((txt, k) => (
              <li key={k}><Icon name={['hand', 'sparkle', 'truck', 'card', 'heart'][k % 5]} size={18} /> {txt}</li>
            ))}
          </ul>

          <div className="sheet__actions">
            <div className="qty" aria-label="Cantidad">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Menos" disabled={qty <= 1}><Icon name="minus" size={18} /></button>
              <span aria-live="polite">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} aria-label="Más"><Icon name="plus" size={18} /></button>
            </div>
            <button className="btn btn--primary sheet__add" onClick={() => handleAdd(false)}>
              <Icon name="bag" /> {Number(p.price) > 0 ? `Pedir · ${formatPrice((Number(p.price) || 0) * qty)}` : 'Agregar para cotizar'}
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
