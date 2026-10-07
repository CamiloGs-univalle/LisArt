// Arma el catálogo: cada sección con su título, su estilo y sus productos.
// Las secciones base vienen de fábrica; la admin puede crear más, cambiar
// el estilo de cualquiera y reordenarlas.
import { Fragment } from 'react'
import { useAdmin } from '../admin/AdminContext'
import { useProductsCtx } from '../../contexts/ProductsContext'
import { useSettingsCtx } from '../../contexts/SettingsContext'
import { SECTION_COPY } from '../../data/siteContent'
import SectionHeader from '../ui/SectionHeader'
import Reveal from '../ui/Reveal'
import FeaturedProduct from '../product/FeaturedProduct'
import { useAddToCart } from '../ui/useAddToCart'
import { useSectionAdmin } from '../ui/useSectionAdmin'
import { LAYOUTS } from './Layouts'
import { SectionToolbar, NewSection } from './AdminTools'
import { Ribbon } from '../home/InfoSections'

// Secciones de fábrica y su estilo inicial
export const BUILTIN_SECTIONS = [
  { id: 'promos_circulo', style: 'circulos' },
  { id: 'featured', special: true },
  { id: 'galeria', style: 'infinito', all: true },
  { id: 'carousel_cajas', style: 'historias' },
  { id: 'grid_arreglos', style: 'mosaico' },
  { id: 'promos_grande', style: 'arcos' },
  { id: 'list_regalos', style: 'revista' },
  { id: 'promos_mediano', style: 'polaroid' },
]

function Section({ id, copy, style, products, toolbar, all }) {
  const { isAdmin } = useAdmin()
  const admin = useSectionAdmin(id)
  const { add, added } = useAddToCart()
  const Layout = (LAYOUTS[style] || LAYOUTS.cuadricula).C

  if (products.length === 0 && !isAdmin) return null

  return (
    <section className={`cat-sec cat-sec--${style}`} aria-labelledby={`h-${id}`}>
      {toolbar}
      <div className="container">
        <Reveal>
          <SectionHeader id={`h-${id}`} copy={copy} admin={isAdmin && !all ? admin : null} />
        </Reveal>
        {products.length === 0 && !all && <p className="admin-empty">Sin productos. Usa “Agregar producto”.</p>}
      </div>
      {products.length > 0 && <Layout items={products} add={add} added={added} onDelete={all ? undefined : admin.remove} />}
    </section>
  )
}

export default function CatalogSections() {
  const { isAdmin } = useAdmin()
  const { products: allProducts, getBySection, getFeatured } = useProductsCtx()
  const { layouts, customSections, order, setOrder } = useSettingsCtx()

  // Todas las secciones disponibles
  const all = [
    ...BUILTIN_SECTIONS.map(s => ({ ...s, copy: SECTION_COPY[s.id] || {} })),
    ...customSections.map(s => ({
      id: s.id,
      style: s.style || 'cuadricula',
      custom: s,
      copy: { eyebrow: s.eyebrow, title: s.title, emphasis: s.emphasis, subtitle: s.subtitle },
    })),
  ]
  // Orden guardado por la admin (las que falten van al final)
  const byId = Object.fromEntries(all.map(s => [s.id, s]))
  const ids = [...order.filter(id => byId[id]), ...all.map(s => s.id).filter(id => !order.includes(id))]
  const sections = ids.map(id => byId[id])

  const move = (id, dir) => {
    const i = ids.indexOf(id)
    const j = i + dir
    if (j < 0 || j >= ids.length) return
    const next = [...ids]
    ;[next[i], next[j]] = [next[j], next[i]]
    setOrder(next)
  }

  return (
    <>
      {sections.map((s, i) => {
        const toolbar = isAdmin && !s.special ? (
          <SectionToolbar
            sectionId={s.id}
            style={layouts[s.id] || s.style}
            custom={s.custom}
            onMove={(d) => move(s.id, d)}
            isFirst={i === 0}
            isLast={i === sections.length - 1}
          />
        ) : null

        return (
          <Fragment key={s.id}>
            {s.special ? (
              <FeaturedProduct product={getFeatured()} />
            ) : (
              <Section id={s.id} copy={s.copy} style={layouts[s.id] || s.style} products={s.all ? allProducts : getBySection(s.id)} toolbar={toolbar} all={s.all} />
            )}
            {i === 3 && <Ribbon />}
          </Fragment>
        )
      })}
      {isAdmin && <NewSection />}
    </>
  )
}
