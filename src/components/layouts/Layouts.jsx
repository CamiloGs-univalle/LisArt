// ─────────────────────────────────────────────────────────────
// Estilos de sección del catálogo.
// Todos reciben: { items, add, added, onDelete }
// La admin elige el estilo de cada sección desde el catálogo.
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react'
import './Layouts.css'
import { useAdmin } from '../admin/AdminContext'
import { useUI } from '../../contexts/UIContext'
import { getImages } from '../../data/images'
import ProductCard from '../ui/ProductCard'
import InfiniteGallery from './InfiniteGallery'
import Reveal from '../ui/Reveal'
import Icon from '../ui/Icon'
import { ProductMedia, Name, PriceTag as Price, Category, Description, Badge, AddButton, Personalization, useOpener } from './parts'

/* Seguimiento del scroll de un riel horizontal (barra de progreso + flechas) */
function useRail(dep) {
  const ref = useRef(null)
  const [state, setState] = useState({ progress: 0, start: true, end: false })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const on = () => {
      const max = el.scrollWidth - el.clientWidth
      setState({ progress: max > 0 ? el.scrollLeft / max : 0, start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 })
    }
    on()
    el.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { el.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [dep])
  const scrollBy = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' })
  return { ref, ...state, scrollBy }
}

function RailControls({ rail, count }) {
  if (count < 2) return null
  return (
    <div className="container lx-railbar">
      <div className="lx-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${Math.max(0.1, rail.progress)})` }} />
      </div>
      <div className="lx-arrows">
        <button onClick={() => rail.scrollBy(-1)} disabled={rail.start} aria-label="Anterior"><Icon name="chevronLeft" size={20} /></button>
        <button onClick={() => rail.scrollBy(1)} disabled={rail.end} aria-label="Siguiente"><Icon name="chevron" size={20} /></button>
      </div>
    </div>
  )
}

/* 1 ── Carrusel clásico ─────────────────────────────── */
export function Carrusel({ items, add, added, onDelete }) {
  const rail = useRail(items.length)
  return (
    <>
      <div className="lx-rail lx-rail--cards" ref={rail.ref}>
        {items.map((p, i) => (
          <div className="lx-rail__item" key={p.id}>
            <ProductCard product={p} index={i} showDescription onAdd={add} added={added[p.id]} onDelete={onDelete} />
          </div>
        ))}
      </div>
      <RailControls rail={rail} count={items.length} />
    </>
  )
}

/* 2 ── Cuadrícula editorial ─────────────────────────── */
export function Cuadricula({ items, add, added, onDelete }) {
  const editorial = items.length >= 5
  return (
    <div className="container">
      <div className={`pgrid ${editorial ? 'pgrid--editorial' : ''}`}>
        {items.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 60} className="pgrid__cell">
            <ProductCard product={p} index={i} onAdd={add} added={added[p.id]} onDelete={onDelete} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}

/* 2b ── Catálogo simple: foto, nombre, descripción y precio, todos iguales */
export function Catalogo({ items, add, added, onDelete }) {
  return (
    <div className="container">
      <div className="pgrid pgrid--catalog">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 60} className="pgrid__cell">
            <ProductCard product={p} index={i} showDescription onAdd={add} added={added[p.id]} onDelete={onDelete} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}

/* 3 ── Lista ────────────────────────────────────────── */
export function Lista({ items, add, added, onDelete }) {
  return (
    <div className="container">
      <div className="pgrid pgrid--list">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 60}>
            <ProductCard product={p} index={i} variant="list" onAdd={add} added={added[p.id]} onDelete={onDelete} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}

/* 4 ── Mosaico (bento) ──────────────────────────────── */
const BENTO = ['big', 'tall', 'sq', 'sq', 'wide', 'sq', 'tall', 'sq', 'sq']
export function Mosaico({ items, add, added, onDelete }) {
  const op = useOpener()
  return (
    <div className="container">
      <div className="lx-bento">
        {items.map((p, i) => {
          const size = BENTO[i % BENTO.length]
          return (
            <Reveal key={p.id} delay={(i % 4) * 70} className={`lx-tile lx-tile--${size}`}>
              <div className="lx-tile__in" {...op(p)}>
                <ProductMedia p={p} className="lx-tile__media" width={size === 'big' || size === 'wide' ? 900 : 600} onDelete={onDelete} />
                <Badge p={p} className="lx-badge lx-tile__badge" />
                <div className="lx-tile__info">
                  <Name p={p} className="lx-name lx-tile__name" />
                  <div className="lx-tile__row">
                    <Price p={p} className="lx-price lx-tile__price" />
                    <AddButton p={p} add={add} added={added} />
                  </div>
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}

/* 5 ── Arcos ────────────────────────────────────────── */
export function Arcos({ items, add, added, onDelete }) {
  const op = useOpener()
  const rail = useRail(items.length)
  return (
    <>
      <div className="lx-rail lx-rail--arch" ref={rail.ref}>
        {items.map((p, i) => (
          <article key={p.id} className={`lx-arch ${i % 2 ? 'is-low' : ''}`}>
            <div className="lx-arch__frame" {...op(p)}>
              <ProductMedia p={p} className="lx-arch__media" width={600} onDelete={onDelete} />
              <Badge p={p} className="lx-badge lx-arch__badge" />
            </div>
            <div className="lx-arch__body">
              <Category p={p} className="lx-cat" />
              <Name p={p} className="lx-name lx-arch__name" />
              <Description p={p} className="lx-desc lx-clamp2" />
              <Personalization p={p} className="perso lx-perso" />
              <Price p={p} />
              <AddButton p={p} add={add} added={added} variant="pill" className="lx-arch__add" />
            </div>
          </article>
        ))}
      </div>
      <RailControls rail={rail} count={items.length} />
    </>
  )
}

/* 6 ── Polaroid ─────────────────────────────────────── */
export function Polaroid({ items, add, added, onDelete }) {
  const op = useOpener()
  return (
    <div className="container">
      <div className="lx-polaroids">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 70} className="lx-pola-cell">
            <figure className="lx-pola" style={{ '--tilt': `${[-3, 2.5, -1.5, 3, -2.5, 1.5][i % 6]}deg` }} {...op(p)}>
              <span className="lx-pola__tape" aria-hidden="true" />
              <ProductMedia p={p} className="lx-pola__media" width={600} onDelete={onDelete} />
              <figcaption className="lx-pola__cap">
                <Name p={p} className="lx-pola__name" as="span" />
                <Description p={p} className="lx-desc lx-clamp2 lx-pola__desc" />
                <span className="lx-pola__row">
                  <Price p={p} />
                  <AddButton p={p} add={add} added={added} />
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

/* 7 ── Historias (tipo reels) ───────────────────────── */
export function Historias({ items, add, added, onDelete }) {
  const { isAdmin } = useAdmin()
  const { openStory } = useUI()
  const rail = useRail(items.length)
  return (
    <>
      <div className="lx-rail lx-rail--story" ref={rail.ref}>
        {items.map((p, i) => {
          const n = getImages(p).length
          return (
            <article
              key={p.id}
              className="lx-story"
              {...(isAdmin ? {} : {
                role: 'button', tabIndex: 0, 'aria-label': `Ver historia de ${p.name}`,
                onClick: () => openStory(items, i),
                onKeyDown: (e) => { if (e.key === 'Enter') openStory(items, i) },
              })}
            >
              <ProductMedia p={p} className="lx-story__media" width={600} onDelete={onDelete} showCount={false} />
              <div className="lx-story__bars" aria-hidden="true">
                {Array.from({ length: Math.min(n, 6) }).map((_, k) => <span key={k} />)}
              </div>
              {!isAdmin && <span className="lx-story__play" aria-hidden="true"><Icon name="play" size={16} /></span>}
              <div className="lx-story__info">
                <Badge p={p} className="lx-badge lx-story__badge" />
                <Name p={p} className="lx-name lx-story__name" />
                <div className="lx-story__row">
                  <Price p={p} className="lx-price lx-story__price" />
                  <AddButton p={p} add={add} added={added} />
                </div>
              </div>
            </article>
          )
        })}
      </div>
      <RailControls rail={rail} count={items.length} />
    </>
  )
}

/* 8 ── Coverflow 3D ─────────────────────────────────── */
export function Coverflow({ items, add, added, onDelete }) {
  const op = useOpener()
  const ref = useRef(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const mid = el.scrollLeft + el.clientWidth / 2
      let best = 0, bestD = Infinity
      ;[...el.children].forEach((c, i) => {
        const center = c.offsetLeft + c.offsetWidth / 2
        const d = (center - mid) / c.offsetWidth
        c.style.setProperty('--d', Math.max(-2, Math.min(2, d)).toFixed(3))
        if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i }
      })
      setActive(best)
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    el.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { el.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [items.length])

  const go = (i) => {
    const el = ref.current
    const c = el?.children[i]
    if (c) el.scrollTo({ left: c.offsetLeft - (el.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' })
  }
  const p = items[active]

  return (
    <div className="lx-cover">
      <div className="lx-cover__track" ref={ref}>
        {items.map((it, i) => (
          <div key={it.id} className={`lx-cover__item ${i === active ? 'is-active' : ''}`} onClick={() => i !== active && go(i)}>
            <div className="lx-cover__card" {...(i === active ? op(it) : {})}>
              <ProductMedia p={it} className="lx-cover__media" width={700} onDelete={onDelete} />
            </div>
          </div>
        ))}
      </div>
      {p && (
        <div className="container lx-cover__info" key={p.id}>
          <Category p={p} />
          <Name p={p} className="lx-name lx-cover__name" as="h3" />
          <Description p={p} className="lx-desc lx-cover__desc" />
          <Personalization p={p} className="perso lx-perso" />
          <div className="lx-cover__row">
            <Price p={p} className="lx-price lx-cover__price" />
            <AddButton p={p} add={add} added={added} variant="pill" />
          </div>
          <div className="lx-dots" role="tablist" aria-label="Elegir producto">
            {items.map((it, i) => (
              <button key={it.id} role="tab" aria-selected={i === active} aria-label={it.name} className={i === active ? 'is-on' : ''} onClick={() => go(i)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* 9 ── Formas geométricas ───────────────────────────── */
const SHAPES = ['arch', 'circle', 'blob', 'diamond', 'pill', 'leaf']
export function Formas({ items, add, added, onDelete }) {
  const op = useOpener()
  return (
    <div className="container">
      <div className="lx-shapes">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 70} className={`lx-shape lx-shape--${SHAPES[i % SHAPES.length]}`}>
            <div className="lx-shape__frame" {...op(p)}>
              <span className="lx-shape__bg" aria-hidden="true" />
              <ProductMedia p={p} className="lx-shape__media" width={600} onDelete={onDelete} />
            </div>
            <div className="lx-shape__body">
              <Name p={p} className="lx-name lx-shape__name" />
              <Description p={p} className="lx-desc lx-clamp2" />
              <div className="lx-shape__row">
                <Price p={p} />
                <AddButton p={p} add={add} added={added} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

/* 10 ── Círculos ────────────────────────────────────── */
export function Circulos({ items, onDelete }) {
  const op = useOpener()
  return (
    <div className="container">
      <div className="lx-circles">
        {items.map((p, i) => (
          <div key={p.id} className="lx-circle" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="lx-circle__ring" {...op(p)}>
              <ProductMedia p={p} className="lx-circle__media" width={300} onDelete={onDelete} showCount={false} />
            </div>
            <Name p={p} className="lx-circle__name" as="span" />
            <Price p={p} className="lx-circle__price" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* 11 ── Revista (zigzag) ────────────────────────────── */
export function Revista({ items, add, added, onDelete }) {
  const op = useOpener()
  return (
    <div className="container lx-mag">
      {items.map((p, i) => (
        <Reveal key={p.id} className={`lx-mag__row ${i % 2 ? 'is-flip' : ''}`}>
          <div className="lx-mag__pic" {...op(p)}>
            <ProductMedia p={p} className="lx-mag__media" width={900} onDelete={onDelete} />
            <span className="lx-mag__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          </div>
          <div className="lx-mag__card">
            <Badge p={p} className="lx-badge lx-mag__badge" />
            <Category p={p} />
            <Name p={p} className="lx-name lx-mag__name" as="h3" />
            <Description p={p} />
            <Personalization p={p} className="perso lx-perso" />
            <div className="lx-mag__row2">
              <Price p={p} className="lx-price lx-mag__price" />
              <AddButton p={p} add={add} added={added} variant="pill" />
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

/* Registro de estilos: nombre visible, descripción y componente */
export const LAYOUTS = {
  catalogo: { label: 'Catálogo', hint: 'Simple y claro: foto, nombre, descripción y precio, todas del mismo tamaño', C: Catalogo },
  infinito: { label: 'Infinito', hint: 'Todas las fotos deslizándose solas y sin fin, en dos filas', C: InfiniteGallery },
  historias: { label: 'Historias', hint: 'Tarjetas altas tipo reels; al tocarlas se abren a pantalla completa', C: Historias },
  mosaico: { label: 'Mosaico', hint: 'Fotos de distintos tamaños, estilo revista bento', C: Mosaico },
  arcos: { label: 'Arcos', hint: 'Marcos en forma de arco que se deslizan', C: Arcos },
  coverflow: { label: 'Vitrina 3D', hint: 'Carrusel con efecto 3D: la foto central se agranda', C: Coverflow },
  formas: { label: 'Formas', hint: 'Juego de geometrías: círculo, arco, rombo, hoja…', C: Formas },
  polaroid: { label: 'Polaroid', hint: 'Fotos instantáneas inclinadas con cinta', C: Polaroid },
  revista: { label: 'Revista', hint: 'Foto grande y texto en zigzag', C: Revista },
  carrusel: { label: 'Carrusel', hint: 'Tarjetas clásicas deslizables', C: Carrusel },
  cuadricula: { label: 'Cuadrícula', hint: 'Tarjetas en columnas; la primera más grande', C: Cuadricula },
  lista: { label: 'Lista', hint: 'Foto pequeña y texto al lado', C: Lista },
  circulos: { label: 'Círculos', hint: 'Fotos redondas pequeñas, para detalles', C: Circulos },
}

