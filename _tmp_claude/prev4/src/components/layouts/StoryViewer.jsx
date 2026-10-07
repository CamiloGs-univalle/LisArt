// Visor a pantalla completa tipo "historias" de Instagram.
// Recorre todas las fotos de cada producto y luego pasa al siguiente.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './StoryViewer.css'
import { useUI } from '../../contexts/UIContext'
import { useCart } from '../../contexts/CartContext'
import { formatPrice, contactWhatsApp } from '../../data/products'
import { getImages, optimizeImg } from '../../data/images'
import Icon from '../ui/Icon'

const DURATION = 5000

export default function StoryViewer() {
  const { story, closeStory, notify, openProduct } = useUI()
  const { addToCart } = useCart()
  const [pi, setPi] = useState(0)   // producto
  const [ii, setIi] = useState(0)   // foto
  const [paused, setPaused] = useState(false)
  const [added, setAdded] = useState(false)
  const touch = useRef(null)

  const items = useMemo(() => story?.items || [], [story])
  const p = items[pi]
  const imgs = getImages(p)

  useEffect(() => {
    if (!story) return
    setPi(story.index || 0); setIi(0); setAdded(false)
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [story])

  const next = useCallback(() => {
    setAdded(false)
    if (ii < imgs.length - 1) { setIi(ii + 1); return }
    if (pi < items.length - 1) { setPi(pi + 1); setIi(0); return }
    closeStory()
  }, [ii, imgs.length, pi, items.length, closeStory])

  const prev = useCallback(() => {
    setAdded(false)
    if (ii > 0) { setIi(ii - 1); return }
    if (pi > 0) { const prevImgs = getImages(items[pi - 1]); setPi(pi - 1); setIi(prevImgs.length - 1); return }
    setIi(0)
  }, [ii, pi, items])

  // Avance automático
  useEffect(() => {
    if (!story || paused) return
    const t = setTimeout(next, DURATION)
    return () => clearTimeout(t)
  }, [story, paused, next, pi, ii])

  // Teclado
  useEffect(() => {
    if (!story) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeStory()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [story, next, prev, closeStory])

  // Precarga la siguiente foto
  useEffect(() => {
    const nextUrl = imgs[ii + 1] || getImages(items[pi + 1])[0]
    if (nextUrl) { const im = new Image(); im.src = optimizeImg(nextUrl, 1080) }
  }, [imgs, ii, items, pi])

  if (!story || !p) return null

  const onTouchStart = (e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }; setPaused(true) }
  const onTouchEnd = (e) => {
    setPaused(false)
    const s = touch.current
    if (!s) return
    const dx = e.changedTouches[0].clientX - s.x
    const dy = e.changedTouches[0].clientY - s.y
    if (dy > 90 && Math.abs(dx) < 60) { closeStory(); return }
    if (Math.abs(dx) > 50) {
      // deslizar cambia de producto
      if (dx < 0 && pi < items.length - 1) { setPi(pi + 1); setIi(0) }
      if (dx > 0 && pi > 0) { setPi(pi - 1); setIi(0) }
    }
  }

  const handleAdd = () => {
    addToCart(p)
    setAdded(true)
    notify({ title: p.name, image: p.image })
  }

  return (
    <div className="sv" role="dialog" aria-modal="true" aria-label={`Historias: ${p.name}`}>
      <div className="sv__backdrop" style={{ backgroundImage: `url(${optimizeImg(imgs[ii], 200)})` }} aria-hidden="true" />

      <div
        className="sv__stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onMouseLeave={() => setPaused(false)}
      >
        <img key={`${p.id}-${ii}`} className="sv__img" src={optimizeImg(imgs[ii], 1080)} alt={`${p.name}, foto ${ii + 1} de ${imgs.length}`} />

        <div className="sv__top">
          <div className="sv__bars">
            {imgs.map((_, k) => (
              <span key={k} className="sv__bar">
                <i
                  className={k < ii ? 'is-done' : k === ii ? 'is-run' : ''}
                  style={k === ii ? { animationDuration: `${DURATION}ms`, animationPlayState: paused ? 'paused' : 'running' } : undefined}
                  key={`${p.id}-${ii}-${k}`}
                />
              </span>
            ))}
          </div>
          <div className="sv__head">
            <span className="sv__avatar"><img src={optimizeImg(p.image, 120)} alt="" /></span>
            <span className="sv__title">
              <strong>{p.name}</strong>
              <small>{pi + 1} de {items.length}{p.category ? ` · ${p.category}` : ''}</small>
            </span>
            <button className="sv__close" onClick={closeStory} aria-label="Cerrar"><Icon name="close" size={22} /></button>
          </div>
        </div>

        <button className="sv__tap sv__tap--prev" onClick={prev} aria-label="Anterior" />
        <button className="sv__tap sv__tap--next" onClick={next} aria-label="Siguiente" />

        <div className="sv__bottom">
          {p.badge && <span className="sv__badge">{p.badge}</span>}
          <div className="sv__price">{formatPrice(p.price)}</div>
          {p.description && <p className="sv__desc">{p.description}</p>}
          <div className="sv__actions">
            <button className={`btn btn--primary sv__add ${added ? 'is-added' : ''}`} onClick={handleAdd}>
              <Icon name={added ? 'check' : 'heart'} /> {added ? '¡Agregado!' : 'Lo quiero'}
            </button>
            <button className="sv__icon" onClick={() => { closeStory(); openProduct(p) }} aria-label="Ver detalle">
              <Icon name="bag" size={20} />
            </button>
            <button className="sv__icon sv__icon--wa" onClick={() => contactWhatsApp(p.name, p.price)} aria-label="Preguntar por WhatsApp">
              <Icon name="whatsapp" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
