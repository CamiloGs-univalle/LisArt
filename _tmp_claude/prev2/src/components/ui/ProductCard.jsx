// Tarjeta de producto única para todo el catálogo.
// variant: 'card' (vertical) · 'list' (horizontal) · 'wide' (editorial grande) · 'compact'
import './ProductCard.css'
import { formatPrice } from '../../data/products'
import { useAdmin } from '../admin/AdminContext'
import { useUI } from '../../contexts/UIContext'
import EditableImage from '../common/editarimagen/EditableImage'
import EditableText from '../common/editartexto/EditableText'
import Icon from './Icon'
import { ACCENTS } from '../../data/siteContent'

export default function ProductCard({
  product: p,
  variant = 'card',
  onAdd,
  added = false,
  onDelete,
  priority = false,
  showDescription = false,
  index = 0,
  style,
}) {
  const { isAdmin } = useAdmin()
  const { openProduct } = useUI()

  const open = () => { if (!isAdmin) openProduct(p) }
  const onKey = (e) => {
    if (!isAdmin && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open() }
  }
  const rating = Number(p.rating)

  return (
    <article
      className={`pc pc--${variant} ${isAdmin ? 'pc--admin' : ''}`}
      onClick={open}
      onKeyDown={onKey}
      tabIndex={isAdmin ? undefined : 0}
      role={isAdmin ? undefined : 'button'}
      aria-label={isAdmin ? undefined : `Ver ${p.name}`}
      style={{ '--c': ACCENTS[index % ACCENTS.length], ...style }}
    >
      <div className="pc__media">
        <EditableImage
          productId={p.id}
          defaultImage={p.image}
          alt={p.name}
          className="pc__img"
          containerClassName="pc__img-wrap"
          priority={priority}
        />

        {(p.badge || isAdmin) && (
          <EditableText
            productId={p.id}
            field="badge"
            defaultValue={p.badge || ''}
            className="pc__badge"
            as="span"
            placeholder="+ etiqueta"
          />
        )}

        {isAdmin && onDelete && (
          <button
            className="pc__delete"
            aria-label="Eliminar producto"
            onClick={e => { e.stopPropagation(); onDelete(p.id) }}
          >
            <Icon name="trash" size={16} />
          </button>
        )}

      </div>

      <div className="pc__body">
        <EditableText
          productId={p.id}
          field="category"
          defaultValue={p.category || ''}
          className="pc__cat"
          as="p"
          placeholder="+ categoría"
        />
        <EditableText
          productId={p.id}
          field="name"
          defaultValue={p.name}
          className="pc__name"
          as="h3"
        />
        {(showDescription || variant === 'wide' || variant === 'list') && (p.description || isAdmin) && (
          <EditableText
            productId={p.id}
            field="description"
            defaultValue={p.description || ''}
            className="pc__desc"
            as="p"
            placeholder="+ descripción"
          />
        )}

        <div className="pc__foot">
          <EditableText
            productId={p.id}
            field="price"
            defaultValue={p.price}
            className="pc__price"
            as="span"
            type="number"
            format={formatPrice}
          />
          {rating > 0 && !isAdmin && (
            <span className="pc__rating" aria-label={`Calificación ${rating}`}>
              <Icon name="star" size={13} /> {rating.toFixed(1)}
            </span>
          )}
          {isAdmin && (
            <EditableText
              productId={p.id}
              field="rating"
              defaultValue={p.rating || ''}
              className="pc__rating"
              as="span"
              placeholder="+ calificación"
            />
          )}
        </div>

        {!isAdmin && (
          <button
            className={`pc__cta ${added ? 'is-added' : ''}`}
            onClick={e => { e.stopPropagation(); onAdd?.(p) }}
            aria-label={`Agregar ${p.name} al pedido`}
          >
            <Icon name={added ? 'check' : 'heart'} size={18} strokeWidth={2.2} />
            <span>{added ? '¡Agregado!' : 'Lo quiero'}</span>
          </button>
        )}
      </div>
    </article>
  )
}
