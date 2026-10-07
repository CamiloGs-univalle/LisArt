// Producto destacado — bloque editorial oscuro
import { useState } from 'react'
import './FeaturedProduct.css'
import { contactWhatsApp } from '../../data/products'
import { useAdmin } from '../admin/AdminContext'
import { useProductsCtx } from '../../contexts/ProductsContext'
import EditableImage from '../common/editarimagen/EditableImage'
import EditableText from '../common/editartexto/EditableText'
import { useAddToCart } from '../ui/useAddToCart'
import Reveal from '../ui/Reveal'
import Icon from '../ui/Icon'
import { PriceTag, Personalization, ctaLabel } from '../layouts/parts'

function FeaturedProduct({ product }) {
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
          <span className="sticker feat__stamp" aria-hidden="true">★ Destacado</span>
        </div>

        <div className="feat__info">
          <p className="eyebrow feat__eyebrow">El favorito del momento</p>

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
                <button className="btn feat__ask" onClick={() => contactWhatsApp(product.name, product.price)}>
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
