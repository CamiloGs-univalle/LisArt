// Producto destacado — bloque editorial oscuro
import { useState } from 'react'
import './FeaturedProduct.css'
import { useWhatsApp } from '@/features/tenant/useWhatsApp'
import { useAdmin } from '@/features/editor/EditorProvider'
import { useProductsCtx } from '@/features/catalog/data/ProductsProvider'
import EditableImage from '@/features/editor/EditableImage'
import EditableText from '@/features/editor/EditableField'
import { useAddToCart } from '@/features/cart/useAddToCart'
import Reveal from '@/shared/ui/Reveal'
import Icon from '@/shared/ui/Icon'
import EditText from '@/features/editor/EditText'
import { PriceTag, Personalization, ctaLabel } from '@/features/catalog/layouts/parts'

function FeaturedProduct({ product }) {
  const wa = useWhatsApp()
  const { isAdmin } = useAdmin()
  const { createProduct } = useProductsCtx()
  const { add, added } = useAddToCart()
  const [creating, setCreating] = useState(false)

  if (!product) {
    if (!isAdmin) return null
    return (
      <section className="container feat-empty">
        <p className="admin-empty">Sin producto destacado aún.</p>
        <button
          className="admin-chip"
          disabled={creating}
          onClick={async () => {
            setCreating(true)
            try { await createProduct('featured') }
            catch { alert('Error. Verifica las reglas de Firestore.') }
            finally { setCreating(false) }
          }}
        >
          <Icon name="plus" size={16} /> {creating ? 'Creando…' : 'Crear producto destacado'}
        </button>
      </section>
    )
  }

  const isAdded = added[product.id]

  return (
    <section className="container feat-wrap" aria-label="Producto destacado">
      <Reveal className="feat">
        <div className="feat__media">
          <EditableImage
            productId={product.id}
            defaultImage={product.image}
            alt={product.name}
            className="feat__img"
            containerClassName="feat__img-wrap"
          />
          <span className="sticker feat__stamp">★ <EditText path="feat.stamp" fallback="Destacado" /></span>
        </div>

        <div className="feat__info">
          <EditText path="feat.eyebrow" fallback="El favorito del momento" as="p" className="eyebrow feat__eyebrow" />

          {(product.badge || isAdmin) && (
            <EditableText productId={product.id} field="badge" defaultValue={product.badge || ''} className="feat__badge" as="span" placeholder="+ etiqueta" />
          )}

          <EditableText productId={product.id} field="name" defaultValue={product.name} className="feat__name display" as="h2" />

          <EditableText
            productId={product.id}
            field="category"
            defaultValue={product.category || ''}
            className="feat__cat"
            as="p"
            placeholder="+ categoría"
          />

          <EditableText
            productId={product.id}
            field="description"
            defaultValue={product.description || ''}
            className="feat__desc"
            as="p"
            placeholder="+ descripción"
          />

          <Personalization p={product} className="perso feat__perso" />

          <div className="feat__buy">
            <PriceTag p={product} className="feat__price" />
            {!isAdmin && (
              <div className="feat__btns">
                <button className={`btn btn--rose ${isAdded ? 'is-added' : ''}`} onClick={() => add(product)}>
                  <Icon name={isAdded ? 'check' : 'bag'} /> {isAdded ? '¡Agregado!' : ctaLabel(product)}
                </button>
                <button className="btn feat__ask" onClick={() => wa.askProduct(product)}>
                  <Icon name="whatsapp" /> Preguntar
                </button>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export default FeaturedProduct
