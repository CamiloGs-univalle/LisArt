// Visor de fotos a pantalla completa: deslizar con el dedo, flechas, teclado,
// doble toque para acercar y miniaturas.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'
import { optimizeImg } from '@/lib/images'

export default function Lightbox({ images, index = 0, title = '', onClose }) {
  const [i, setI] = useState(index)
  const [zoom, setZoom] = useState(false)
  const [dx, setDx] = useState(0)
  const start = useRef(null)
  const lastTap = useRef(0)
  const n = images.length
  const go = (k) => { setZoom(false); setDx(0); setI(((k % n) + n) % n) }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
      if (e.key === 'ArrowRight') go(i + 1)
      if (e.key === 'ArrowLeft') go(i - 1)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }) // eslint-disable-line react-hooks/exhaustive-deps

  const down = (e) => { if (!zoom) start.current = { x: e.clientX, y: e.clientY } }
  const move = (e) => { if (start.current) setDx(e.clientX - start.current.x) }
  const up = (e) => {
    const s = start.current
    start.current = null
    const now = Date.now()
    if (s && Math.abs(e.clientX - s.x) < 8 && Math.abs(e.clientY - s.y) < 8) {
      if (now - lastTap.current < 300) { setZoom(z => !z) }
      lastTap.current = now
      setDx(0)
      return
    }
    if (dx < -60) go(i + 1)
    else if (dx > 60) go(i - 1)
    else setDx(0)
  }

  return createPortal(
    <div className="fx-lightbox" role="dialog" aria-modal="true" aria-label={`Fotos de ${title}`}>
      <div className="fx-lightbox__bar">
        <span>{i + 1} / {n}</span>
        <button onClick={onClose} aria-label="Cerrar fotos"><Icon name="close" size={20} /></button>
      </div>
      <div className="fx-lightbox__stage" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { start.current = null; setDx(0) }}>
        <img key={images[i]} src={optimizeImg(images[i], 1600)} alt={`${title}, foto ${i + 1}`} draggable="false"
          style={{ transform: zoom ? 'scale(2.2)' : `translateX(${dx}px)`, transition: start.current ? 'none' : undefined }} />
        {n > 1 && <>
          <button className="fx-lightbox__nav fx-lightbox__nav--prev" onClick={() => go(i - 1)} aria-label="Foto anterior"><Icon name="chevronLeft" size={22} /></button>
          <button className="fx-lightbox__nav fx-lightbox__nav--next" onClick={() => go(i + 1)} aria-label="Foto siguiente"><Icon name="chevron" size={22} /></button>
        </>}
      </div>
      {n > 1 && (
        <div className="fx-lightbox__thumbs">
          {images.map((u, k) => <button key={u + k} className={k === i ? 'is-on' : ''} onClick={() => go(k)} aria-label={`Ver foto ${k + 1}`}><img src={u} alt="" /></button>)}
        </div>
      )}
    </div>,
    document.body,
  )
}

// Zoom que sigue al mouse (escritorio). En celular, tocar abre el visor.
export function useHoverZoom() {
  const [on, setOn] = useState(false)
  const fine = typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches
  const handlers = fine ? {
    onPointerMove: (e) => {
      const r = e.currentTarget.getBoundingClientRect()
      e.currentTarget.style.setProperty('--zx', `${((e.clientX - r.left) / r.width) * 100}%`)
      e.currentTarget.style.setProperty('--zy', `${((e.clientY - r.top) / r.height) * 100}%`)
    },
    onPointerEnter: () => setOn(true),
    onPointerLeave: () => setOn(false),
  } : {}
  return { zoomClass: `fx-zoom ${on ? 'is-zoom' : ''}`, handlers, fine }
}
