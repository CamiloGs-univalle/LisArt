// Cuadrícula editorial de productos
import './GridSection.css'
import { useAdmin } from '../admin/AdminContext'
import { SECTION_COPY } from '../../data/siteContent'
import ProductCard from '../ui/ProductCard'
import SectionHeader from '../ui/SectionHeader'
import Reveal from '../ui/Reveal'
import { useAddToCart } from '../ui/useAddToCart'
import { useSectionAdmin } from '../ui/useSectionAdmin'

function GridSection({ products, sectionId, copy, variant = 'card', layout = 'grid' }) {
  const { isAdmin } = useAdmin()
  const admin = useSectionAdmin(sectionId)
  const { add, added } = useAddToCart()
  const items = products || []

  if (items.length === 0 && !isAdmin) return null
  const finalLayout = layout === 'editorial' && items.length < 5 ? 'grid' : layout

  return (
    <section className="grid-sec container" aria-labelledby={`h-${sectionId}`}>
      <Reveal>
        <SectionHeader id={`h-${sectionId}`} copy={copy || SECTION_COPY[sectionId]} admin={isAdmin ? admin : null} />
      </Reveal>

      {items.length === 0 && <p className="admin-empty">Sin productos. Usa “Agregar producto”.</p>}

      <div className={`pgrid pgrid--${finalLayout}`}>
        {items.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 60} className="pgrid__cell">
            <ProductCard
              product={p}
              variant={variant}
              onAdd={add}
              added={added[p.id]}
              onDelete={admin.remove}
            />
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default GridSection
