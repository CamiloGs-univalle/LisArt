// Galería infinita: las fotos se deslizan solas y sin fin.
// El cliente también puede arrastrarla con el dedo; al soltar, sigue sola.
import { useEffect, useMemo, useRef } from 'react'
import './InfiniteGallery.css'
import { useUI } from '../../contexts/UIContext'
import { useAdmin } from '../admin/AdminContext'
import { formatPrice } from '../../data/products'
import { getImages, optimizeImg } from '../../data/images'

const SHAPES = ['arch', 'tall', 'round', 'square', 'pill', 'wide']

function MarqueeRow({ tiles, reverse = false, speed = 0.55 }) {
  const ref = useRef(null)
  const { openProduct } = useUI()
  const { isAdmin } = useAdmin()
  const state = useRef({ pos: 0, paused: false, resumeAt: 0, downX: 0, moved: false })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const s = state.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0

    const half = () => el.scrollWidth / 2
    // Arranca en la mitad para poder ir hacia ambos lados
    s.pos = reverse ? half() : 0
    el.scrollLeft = s.pos

    const tick = (t) => {
      const h = half()
      if (!s.paused && t > s.resumeAt && !reduce && h > 0) {
        s.pos += reverse ? -speed : speed
        if (s.pos >= h) s.pos -= h
        if (s.pos <= 0) s.pos += h
        el.scrollLeft = s.pos
      } else {
        // Mientras el usuario arrastra, seguimos su posición y mantenemos el bucle
        if (el.scrollLeft >= h) el.scrollLeft -= h
        if (el.scrollLeft <= 0 && h > 0) el.scrollLeft += h
        s.pos = el.scrollLeft
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const pause = () => { s.paused = true }
    const resume = () => { s.paused = false; s.resumeAt = performance.now() + 1200 }
    el.addEventListener('pointerdown', pause)
    el.addEventListener('touchstart', pause, { passive: true })
    el.addEventListener('pointerup', resume)
    el.addEventListener('pointercancel', resume)
    el.addEventListener('touchend', resume)
    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', resume)
    el.addEventListener('wheel', () => { s.resumeAt = performance.now() + 1500 }, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointerdown', pause)
      el.removeEventListener('touchstart', pause)
      el.removeEventListener('pointerup', resume)
      el.removeEventListener('pointercancel', resume)
      el.removeEventListener('touchend', resume)
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', resume)
    }
  }, [reverse, speed, tiles.length])

  // Se repite la lista para que el bucle no tenga cortes
  const loop = [...tiles, ...tiles]

  return (
    <div
      className="ig-row"
      ref={ref}
      onPointerDown={e => { state.current.downX = e.clientX; state.current.moved = false }}
      onPointerMove={e => { if (Math.abs(e.clientX - state.current.downX) > 8) state.current.moved = true }}
    >
      {loop.map((t, i) => (
        <button
          key={`${t.key}-${i}`}
          type="button"
          className={`ig-tile ig-tile--${t.shape}`}
          tabIndex={i < tiles.length ? 0 : -1}
          aria-hidden={i >= tiles.length}
          aria-label={`Ver ${t.p.name}`}
          onClick={() => { if (!state.current.moved && !isAdmin) openProduct(t.p) }}
        >
          <img src={optimizeImg(t.url, 500)} alt="" loading="lazy" decoding="async" draggable="false" />
          <span className="ig-tile__info">
            <span className="ig-tile__name">{t.p.name}</span>
            <span className="ig-tile__price">{Number(t.p.price) > 0 ? formatPrice(t.p.price) : "A cotizar"}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

// items: productos a mostrar. Usa TODAS las fotos de cada producto.
export default function InfiniteGallery({ items = [] }) {
  const tiles = useMemo(() => {
    const out = []
    items.forEach(p => getImages(p).forEach((url, k) => {
      if (!String(url).includes('placehold.co')) out.push({ p, url, key: `${p.id}-${k}` })
    }))
    return out.map((t, i) => ({ ...t, shape: SHAPES[i % SHAPES.length] }))
  }, [items])

  if (tiles.length === 0) return null

  // Con suficientes fotos se hacen dos filas que van en sentido contrario
  const twoRows = false // una sola fila
  const rowA = twoRows ? tiles.filter((_, i) => i % 2 === 0) : tiles
  const rowB = twoRows ? tiles.filter((_, i) => i % 2 === 1).map((t, i) => ({ ...t, shape: SHAPES[(i + 3) % SHAPES.length] })) : []

  return (
    <div className="ig" aria-label="Galería de fotos">
      <MarqueeRow tiles={rowA} />
      {twoRows && <MarqueeRow tiles={rowB} reverse speed={0.42} />}
    </div>
  )
}
