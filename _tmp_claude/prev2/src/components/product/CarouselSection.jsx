// Riel horizontal con scroll-snap (deslizable con el dedo, flechas en escritorio)
import { useEffect, useRef, useState } from 'react'
import './CarouselSection.css'
import { useAdmin } from '../admin/AdminContext'
import { SECTION_COPY } from '../../data/siteContent'
import ProductCard from '../ui/ProductCard'
import SectionHeader from '../ui/SectionHeader'
import Reveal from '../ui/Reveal'
import Icon from '../ui/Icon'
import { useAddToCart } from '../ui/useAddToCart'
import { useSectionAdmin } from '../ui/useSectionAdmin'

function CarouselSection({ products, sectionId, copy }) {
  const { isAdmin } = useAdmin()
  const admin = useSectionAdmin(sectionId)
  const { add, added } = useAddToCart()
  const railRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [edges, setEdges] = useState({ start: true, end: false })

  const items = products || []

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth
      setProgress(max > 0 ? el.scrollLeft / max : 0)
      setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 })
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { el.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [items.length])

  if (items.length === 0 && !isAdmin) return null

  const scrollBy = (dir) => {
    const el = railRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section className="rail-sec" aria-labelledby={`h-${sectionId}`}>
      <div className="container">
        <Reveal>
          <SectionHeader
            id={`h-${sectionId}`}
            copy={copy || SECTION_COPY[sectionId]}
            admin={isAdmin ? admin : null}
            action={items.length > 2 && (
              <div className="rail-arrows">
                <button onClick={() => scrollBy(-1)} disabled={edges.start} aria-label="Anterior"><Icon name="chevronLeft" size={20} /></button>
                <button onClick={() => scrollBy(1)} disabled={edges.end} aria-label="Siguiente"><Icon name="chevron" size={20} /></button>
              </div>
            )}
          />
        </Reveal>
        {items.length === 0 && <p className="admin-empty">Sin productos. Usa “Agregar producto”.</p>}
      </div>

      <div className="rail" ref={railRef} tabIndex={0} aria-label="Productos, desliza para ver más">
        {items.map((p, i) => (
          <div className="rail__item" key={p.id}>
            <ProductCard
              product={p}
              index={i}
              onAdd={add}
              added={added[p.id]}
              onDelete={admin.remove}
              style={{ animationDelay: `${i * 60}ms` }}
            />
          </div>
        ))}
      </div>

      {items.length > 2 && (
        <div className="container">
          <div className="rail-progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${Math.max(0.12, progress)})` }} />
          </div>
        </div>
      )}
    </section>
  )
}

export default CarouselSection
