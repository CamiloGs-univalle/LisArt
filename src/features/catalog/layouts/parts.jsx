// Piezas compartidas por todos los estilos de sección
import { useAdmin } from '@/features/editor/EditorProvider'
import { useUI } from '@/features/catalog/UIProvider'
import { formatPrice } from '@/lib/format'
import { getImages } from '@/lib/images'
import EditableImage from '@/features/editor/EditableImage'
import EditableText from '@/features/editor/EditableField'
import Icon from '@/shared/ui/Icon'

// Devuelve una función que da las props para abrir el detalle del producto (solo clientes)
export function useOpener() {
  const { isAdmin } = useAdmin()
  const { openProduct } = useUI()
  return (p, label) => isAdmin ? {} : {
    role: 'button',
    tabIndex: 0,
    'aria-label': label || `Ver ${p.name}`,
    onClick: () => openProduct(p),
    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProduct(p) } },
  }
}

// Foto del producto: editable para la admin + botones de fotos / eliminar.
// Para clientes muestra un indicador si el producto tiene varias fotos.
export function ProductMedia({ p, className = '', imgClass = 'lx-img', width = 700, priority, onDelete, showCount = true, children }) {
  const { isAdmin } = useAdmin()
  const { openPhotos, openSectionsPicker } = useUI()
  const count = getImages(p).length

  return (
    <EditableImage
      productId={p.id}
      defaultImage={p.image}
      alt={p.name}
      className={imgClass}
      containerClassName={`lx-media ${className}`}
      width={width}
      priority={priority}
    >
      {children}
      {!isAdmin && showCount && count > 1 && (
        <span className="lx-count" aria-label={`${count} fotos`}>
          <Icon name="images" size={13} strokeWidth={2} /> {count}
        </span>
      )}
      {isAdmin && (
        <span className="lx-admin" onClick={e => e.stopPropagation()}>
          <button type="button" className="lx-admin__btn" onClick={() => openPhotos(p.id)} title="Administrar fotos">
            <Icon name="images" size={15} /> {count}
          </button>
          <button type="button" className="lx-admin__btn" onClick={() => openSectionsPicker(p.id)} title="Secciones donde aparece">
            <Icon name="tag" size={15} />
          </button>
          {onDelete && (
            <button type="button" className="lx-admin__btn lx-admin__btn--danger" onClick={() => onDelete(p.id)} title="Eliminar producto">
              <Icon name="trash" size={15} />
            </button>
          )}
        </span>
      )}
    </EditableImage>
  )
}

export function Name({ p, className = 'lx-name', as = 'h3' }) {
  return <EditableText productId={p.id} field="name" defaultValue={p.name} className={className} as={as} />
}

export function Price({ p, className = 'lx-price' }) {
  return <EditableText productId={p.id} field="price" defaultValue={p.price} className={className} as="span" type="number" format={formatPrice} />
}

export function Category({ p, className = 'lx-cat' }) {
  return <EditableText productId={p.id} field="category" defaultValue={p.category || ''} className={className} as="p" placeholder="+ categoría" />
}

export function Description({ p, className = 'lx-desc' }) {
  const { isAdmin } = useAdmin()
  if (!p.description && !isAdmin) return null
  return <EditableText productId={p.id} field="description" defaultValue={p.description || ''} className={className} as="p" placeholder="+ descripción" />
}

export function Badge({ p, className = 'lx-badge' }) {
  const { isAdmin } = useAdmin()
  if (!p.badge && !isAdmin) return null
  return <EditableText productId={p.id} field="badge" defaultValue={p.badge || ''} className={className} as="span" placeholder="+ etiqueta" />
}

// Botón de agregar: redondo ("round") o con texto ("pill")
export function AddButton({ p, add, added, variant = 'round', className = '' }) {
  const { isAdmin } = useAdmin()
  if (isAdmin) return null
  const isAdded = !!added?.[p.id]
  return (
    <button
      type="button"
      className={`lx-add lx-add--${variant} ${isAdded ? 'is-added' : ''} ${className}`}
      onClick={e => { e.stopPropagation(); add(p) }}
      aria-label={`Agregar ${p.name} al pedido`}
    >
      <Icon name={isAdded ? 'check' : variant === 'round' ? 'plus' : 'bag'} size={variant === 'round' ? 20 : 17} strokeWidth={2.2} />
      {variant !== 'round' && <span>{isAdded ? '¡Agregado!' : ctaLabel(p)}</span>}
    </button>
  )
}

// Precio con prefijo opcional ("Desde"). Si el precio es 0, se muestra "Precio a cotizar".
export function PriceTag({ p, className = 'lx-price' }) {
  const { isAdmin } = useAdmin()
  const n = Number(p.price) || 0
  if (isAdmin) {
    return (
      <span className={`price-tag ${className}`}>
        <EditableText productId={p.id} field="pricePrefix" defaultValue={p.pricePrefix || ''} className="price-tag__prefix" as="span" placeholder="+ Desde" />
        <EditableText productId={p.id} field="price" defaultValue={p.price} className="price-tag__value" as="span" type="number" format={formatPrice} />
      </span>
    )
  }
  if (n <= 0) return <span className={`price-tag price-tag--quote ${className}`}>Precio a cotizar</span>
  return (
    <span className={`price-tag ${className}`}>
      {p.pricePrefix && <small className="price-tag__prefix">{p.pricePrefix}</small>}
      <span className="price-tag__value">{formatPrice(n)}</span>
    </span>
  )
}

// Qué se le puede personalizar al producto
export function Personalization({ p, className = 'perso' }) {
  const { isAdmin } = useAdmin()
  if (!p.personalizacion && !isAdmin) return null
  return (
    <p className={className}>
      <Icon name="sparkle" size={14} />
      <span><strong>Personalizamos:</strong>{' '}
        <EditableText productId={p.id} field="personalizacion" defaultValue={p.personalizacion || ''} as="span" placeholder="fotos + mensaje + diseño" />
      </span>
    </p>
  )
}

export const ctaLabel = (p) => (Number(p.price) > 0 ? 'Pedir' : 'Cotizar')
