import { useState } from 'react'
import { useProductsCtx } from '../../contexts/ProductsContext'
import { useCart } from '../../contexts/CartContext'
import { useAdmin } from '../admin/AdminContext'
import { formatPrice } from '../../data/products'
import EditableImage from './editarimagen/EditableImage'
import EditableText from './editartexto/EditableText'
import './MockupSection.css'

function PromosSection() {
  const { isAdmin } = useAdmin()
  const { addToCart } = useCart()
  const { createProduct, deleteProduct, getBySection } = useProductsCtx()
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState({})
  const [added, setAdded] = useState({})

  const grandes = getBySection('promos_grande')
  const medianos = getBySection('promos_mediano')
  const circulos = getBySection('promos_circulo')

  const handleAddToCart = (product) => {
    addToCart(product)
    setAdded(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1200)
  }

  const handleAddProduct = async (sectionId) => {
    if (creating[sectionId]) return
    setCreating(prev => ({ ...prev, [sectionId]: true }))
    try {
      await createProduct(sectionId)
    } catch (err) {
      console.error('Error creando producto:', err)
      alert('Error al crear el producto.')
    } finally {
      setCreating(prev => ({ ...prev, [sectionId]: false }))
    }
  }

  const handleDelete = async (e, productId) => {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar este producto?')) return
    try {
      await deleteProduct(productId)
      if (selected?.id === productId) setSelected(null)
    } catch (err) {
      console.error('Error eliminando:', err)
      alert('Error al eliminar.')
    }
  }

  const openDetail = (product) => {
    if (!isAdmin) setSelected(product)
  }
  const closeDetail = () => setSelected(null)

  return (
    <section className="promos-section">
      <div className="promos-inner">
        <div className="promos-header">
          <h2 className="promos-title">✨ Destacados para ti</h2>
          <p className="promos-subtitle">Los favoritos de nuestros clientes</p>
        </div>

        {/* ── GRANDES ──────────────────────── */}
        <div className="promos-block">
          <div className="promos-block-header">
            <h3 className="promos-block-title">Tarjetas Grandes</h3>
            {isAdmin && (
              <button className="promos-admin-add" onClick={() => handleAddProduct('promos_grande')} disabled={creating['promos_grande']}>
                {creating['promos_grande'] ? '⏳...' : '+ Agregar'}
              </button>
            )}
          </div>
          {grandes.length === 0 && isAdmin && (
            <p className="promos-empty">Sin productos. Haz click en "+ Agregar".</p>
          )}
          <div className="promos-grid">
            {grandes.map(p => (
              <div key={p.id} className="promos-card promos-card--grande">
                <div className="promos-card-image">
                  <EditableImage
                    id={`pg_img_${p.id}`}
                    productId={p.id}
                    defaultImage={p.image}
                    alt={p.name}
                    className="promos-card-img"
                    containerClassName="promos-card-image"
                  />
                  {isAdmin ? (
                    <EditableText
                      id={`pg_badge_${p.id}`}
                      productId={p.id}
                      field="badge"
                      defaultValue={p.badge}
                      className="promos-badge"
                      as="span"
                      mode="product"
                    />
                  ) : (
                    p.badge && <span className="promos-badge">{p.badge}</span>
                  )}
                  {isAdmin && (
                    <button className="promos-delete" onClick={(e) => handleDelete(e, p.id)}>✕</button>
                  )}
                </div>
                <div className="promos-card-info">
                  <EditableText
                    id={`pg_name_${p.id}`}
                    productId={p.id}
                    field="name"
                    defaultValue={p.name}
                    className="promos-card-name"
                    as="h4"
                    mode="product"
                  />
                  <EditableText
                    id={`pg_cat_${p.id}`}
                    productId={p.id}
                    field="category"
                    defaultValue={p.category}
                    className="promos-card-category"
                    as="p"
                    mode="product"
                  />
                  <EditableText
                    id={`pg_desc_${p.id}`}
                    productId={p.id}
                    field="description"
                    defaultValue={p.description || ''}
                    className="promos-card-desc"
                    as="p"
                    mode="product"
                  />
                  <div className="promos-card-footer">
                    <EditableText
                      id={`pg_price_${p.id}`}
                      productId={p.id}
                      field="price"
                      defaultValue={p.price}
                      className="promos-card-price"
                      as="span"
                      type="number"
                      format={formatPrice}
                      mode="product"
                    />
                    {!isAdmin && (
                      <button className="promos-card-btn" onClick={() => handleAddToCart(p)}>
                        {added[p.id] ? '✓' : '+'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MEDIANAS ─────────────────────── */}
        <div className="promos-block">
          <div className="promos-block-header">
            <h3 className="promos-block-title">Tarjetas Medianas</h3>
            {isAdmin && (
              <button className="promos-admin-add" onClick={() => handleAddProduct('promos_mediano')} disabled={creating['promos_mediano']}>
                {creating['promos_mediano'] ? '⏳...' : '+ Agregar'}
              </button>
            )}
          </div>
          {medianos.length === 0 && isAdmin && (
            <p className="promos-empty">Sin productos. Haz click en "+ Agregar".</p>
          )}
          <div className="promos-grid promos-grid--mediano">
            {medianos.map(p => (
              <div key={p.id} className="promos-card promos-card--mediano">
                <div className="promos-card-image">
                  <EditableImage
                    id={`pm_img_${p.id}`}
                    productId={p.id}
                    defaultImage={p.image}
                    alt={p.name}
                    className="promos-card-img"
                    containerClassName="promos-card-image"
                  />
                  {isAdmin ? (
                    <EditableText
                      id={`pm_badge_${p.id}`}
                      productId={p.id}
                      field="badge"
                      defaultValue={p.badge}
                      className="promos-badge"
                      as="span"
                      mode="product"
                    />
                  ) : (
                    p.badge && <span className="promos-badge">{p.badge}</span>
                  )}
                  {isAdmin && (
                    <button className="promos-delete" onClick={(e) => handleDelete(e, p.id)}>✕</button>
                  )}
                </div>
                <div className="promos-card-info">
                  <EditableText
                    id={`pm_name_${p.id}`}
                    productId={p.id}
                    field="name"
                    defaultValue={p.name}
                    className="promos-card-name"
                    as="h4"
                    mode="product"
                  />
                  <div className="promos-card-footer">
                    <EditableText
                      id={`pm_price_${p.id}`}
                      productId={p.id}
                      field="price"
                      defaultValue={p.price}
                      className="promos-card-price"
                      as="span"
                      type="number"
                      format={formatPrice}
                      mode="product"
                    />
                    {!isAdmin && (
                      <button className="promos-card-btn" onClick={() => handleAddToCart(p)}>
                        {added[p.id] ? '✓' : '+'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CÍRCULOS ─────────────────────── */}
        <div className="promos-block">
          <div className="promos-block-header">
            <h3 className="promos-block-title">Círculos</h3>
            {isAdmin && (
              <button className="promos-admin-add" onClick={() => handleAddProduct('promos_circulo')} disabled={creating['promos_circulo']}>
                {creating['promos_circulo'] ? '⏳...' : '+ Agregar'}
              </button>
            )}
          </div>
          {circulos.length === 0 && isAdmin && (
            <p className="promos-empty">Sin productos. Haz click en "+ Agregar".</p>
          )}
          <div className="promos-circles-row">
            {circulos.map(p => (
              <div key={p.id} className="promos-circle-item" onClick={() => openDetail(p)}>
                <div className="promos-circle">
                  <EditableImage
                    id={`pc_img_${p.id}`}
                    productId={p.id}
                    defaultImage={p.image}
                    alt={p.name}
                    className="promos-circle-img"
                    containerClassName="promos-circle"
                  />
                  {isAdmin && (
                    <button className="promos-delete promos-delete--circle" onClick={(e) => handleDelete(e, p.id)}>✕</button>
                  )}
                </div>
                <EditableText
                  id={`pc_name_${p.id}`}
                  productId={p.id}
                  field="name"
                  defaultValue={p.name}
                  className="promos-circle-name"
                  as="span"
                  mode="product"
                />
                <EditableText
                  id={`pc_price_${p.id}`}
                  productId={p.id}
                  field="price"
                  defaultValue={p.price}
                  className="promos-circle-price"
                  as="span"
                  type="number"
                  format={formatPrice}
                  mode="product"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="promos-overlay" onClick={closeDetail}>
          <div className="promos-detail" onClick={e => e.stopPropagation()}>
            <button className="promos-detail-close" onClick={closeDetail}>✕</button>
            <div className="promos-detail-image">
              <img src={selected.image} alt={selected.name} />
            </div>
            <div className="promos-detail-body">
              <h3 className="promos-detail-name">{selected.name}</h3>
              <p className="promos-detail-category">{selected.category}</p>
              {selected.description && (
                <p className="promos-detail-desc">{selected.description}</p>
              )}
              <div className="promos-detail-footer">
                <span className="promos-detail-price">{formatPrice(selected.price)}</span>
                <button className="promos-detail-add" onClick={() => { addToCart(selected); closeDetail() }}>
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default PromosSection
