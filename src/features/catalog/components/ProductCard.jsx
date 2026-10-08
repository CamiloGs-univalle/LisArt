// Tarjeta de producto única para todo el catálogo.
// variant: 'card' (vertical) · 'list' (horizontal) · 'wide' (editorial grande) · 'compact'
import './ProductCard.css'
import { useAdmin } from '@/features/editor/EditorProvider'
import { useUI } from '@/features/catalog/UIProvider'
import { ProductMedia, PriceTag, Personalization, ctaLabel } from '@/features/catalog/layouts/parts'
import EditableText from '@/features/editor/EditableField'
import Icon from '@/shared/ui/Icon'
import { ACCENTS } from '@/features/catalog/constants'

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
        <ProductMedia
          p={p}
          className="pc__img-wrap"
          imgClass="pc__img"
          priority={priority}
          onDelete={onDelete}
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


      </div>

      <div className="pc__body">
        <EditableText productId={p.id} field="name" defaultValue={p.name} className="pc__name" as="h3" />
        {(showDescription || variant === 'wide' || variant === 'list') && (p.description || isAdmin) && (
          <EditableText productId={p.id} field="description" defaultValue={p.description || ''} className="pc__desc" as="p" placeholder="+ descripción (1–2 frases)" />
        )}
        {(showDescription || variant === 'list') && <Personalization p={p} className="perso pc__perso" />}

        <div className="pc__foot">
          <PriceTag p={p} className="pc__price" />
          {rating > 0 && !isAdmin && (
            <span className="pc__rating" aria-label={`Calificación ${rating}`}>
              <Icon name="star" size={13} /> {rating.toFixed(1)}
            </span>
          )}
        </div>

        {!isAdmin && (
          <button
            className={`pc__cta ${added ? 'is-added' : ''}`}
            onClick={e => { e.stopPropagation(); onAdd?.(p) }}
            aria-label={`${ctaLabel(p)} ${p.name}`}
          >
            <Icon name={added ? 'check' : 'bag'} size={18} strokeWidth={2} />
            <span>{added ? '¡Agregado!' : ctaLabel(p)}</span>
          </button>
        )}
      </div>
    </article>
  )
}
