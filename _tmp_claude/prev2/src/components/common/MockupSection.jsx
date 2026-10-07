// Secciones promocionales administrables:
//  · promos_circulo  → fila de círculos tipo "historias"
//  · promos_grande   → tarjetas editoriales grandes
//  · promos_mediano  → cuadrícula compacta
import './MockupSection.css'
import { useProductsCtx } from '../../contexts/ProductsContext'
import { useAdmin } from '../admin/AdminContext'
import { useUI } from '../../contexts/UIContext'
import { formatPrice } from '../../data/products'
import { SECTION_COPY } from '../../data/siteContent'
import EditableImage from './editarimagen/EditableImage'
import EditableText from './editartexto/EditableText'
import GridSection from '../product/GridSection'
import SectionHeader from '../ui/SectionHeader'
import Reveal from '../ui/Reveal'
import Icon from '../ui/Icon'
import { useSectionAdmin } from '../ui/useSectionAdmin'

export function PromoCircles() {
  const { isAdmin } = useAdmin()
  const { openProduct } = useUI()
  const { getBySection } = useProductsCtx()
  const admin = useSectionAdmin('promos_circulo')
  const items = getBySection('promos_circulo')

  if (items.length === 0 && !isAdmin) return null

  return (
    <section className="circles container" aria-labelledby="h-promos_circulo">
      <SectionHeader id="h-promos_circulo" copy={SECTION_COPY.promos_circulo} admin={isAdmin ? admin : null} />
      {items.length === 0 && <p className="admin-empty">Sin productos. Usa “Agregar producto”.</p>}
      <div className="circles__row">
        {items.map((p, i) => (
          <div
            key={p.id}
            className="circle"
            role={isAdmin ? undefined : 'button'}
            tabIndex={isAdmin ? undefined : 0}
            onClick={() => !isAdmin && openProduct(p)}
            onKeyDown={e => { if (!isAdmin && e.key === 'Enter') openProduct(p) }}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="circle__ring">
              <EditableImage
                productId={p.id}
                defaultImage={p.image}
                alt={p.name}
                className="circle__img"
                containerClassName="circle__img-wrap"
              />
              {isAdmin && (
                <button className="circle__del" aria-label="Eliminar" onClick={e => { e.stopPropagation(); admin.remove(p.id) }}>
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
            <EditableText productId={p.id} field="name" defaultValue={p.name} className="circle__name" as="span" />
            <EditableText productId={p.id} field="price" defaultValue={p.price} className="circle__price" as="span" type="number" format={formatPrice} />
          </div>
        ))}
      </div>
    </section>
  )
}

export function PromoGrandes() {
  const { getBySection } = useProductsCtx()
  return <GridSection products={getBySection('promos_grande')} sectionId="promos_grande" variant="wide" layout="wide" />
}

export function PromoMedianos() {
  const { getBySection } = useProductsCtx()
  return <GridSection products={getBySection('promos_mediano')} sectionId="promos_mediano" variant="compact" />
}

// Compatibilidad: el componente por defecto muestra las tres secciones
function PromosSection() {
  return (
    <Reveal>
      <PromoCircles />
      <PromoGrandes />
      <PromoMedianos />
    </Reveal>
  )
}

export default PromosSection
