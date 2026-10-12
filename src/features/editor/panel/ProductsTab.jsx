// Pestaña "Productos": lista rápida para crear, editar y eliminar productos
import { Fragment, useRef, useState } from 'react'
import { useProductsCtx } from '@/features/catalog/data/ProductsProvider'
import { useCatalog } from '@/features/catalog/layouts/useCatalog'
import { productSections } from '@/lib/catalog'
import { HIGHLIGHTS } from '@/lib/design'

export default function ProductsTab() {
  const { products, createProduct, deleteProduct, updateField, updateImage } = useProductsCtx()
  const { sections } = useCatalog()
  const [creatingSection, setCreatingSection] = useState(null)
  const [openId, setOpenId] = useState(null) // producto con "más opciones" abierto
  const fileRefs = useRef({})

  const productSectionsList = sections.filter(s => !s.special)
  const allSections = productSectionsList.map(s => s.id)
  const sectionName = (id) => { const s = productSectionsList.find(x => x.id === id); return s ? `${s.emoji || ''} ${s.name}`.trim() : id }

  const handleCreate = async (sectionId) => {
    setCreatingSection(sectionId)
    try { await createProduct(sectionId) }
    catch { alert('No se pudo crear el producto. Intenta de nuevo.') }
    finally { setCreatingSection(null) }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    try { await deleteProduct(productId) } catch { alert('No se pudo eliminar el producto.') }
  }

  const handleImage = async (productId, file) => {
    if (!file) return
    try { await updateImage(productId, file) } catch { alert('No se pudo subir la imagen.') }
  }

  const handleField = async (productId, field, value) => {
    try { await updateField(productId, field, value) } catch { alert('No se pudo guardar el cambio.') }
  }

  const grouped = allSections.map(sectionId => ({
    sectionId,
    items: products.filter(p => productSections(p).includes(sectionId)),
  }))

  return (
    <section className="ad-card">
      <h2>🛍️ Productos</h2>
      <div className="ad-create-row">
        {allSections.map(sectionId => (
          <button
            key={sectionId}
            className="ad-btn ad-btn-create"
            onClick={() => handleCreate(sectionId)}
            disabled={creatingSection === sectionId}
          >
            {creatingSection === sectionId
              ? '⏳ Creando...'
              : `+ Nuevo en ${sectionName(sectionId)}`}
          </button>
        ))}
      </div>

      {grouped.map(({ sectionId, items }) => (
        <div key={sectionId} className="ad-group">
          <h3 className="ad-group-title">
            {sectionName(sectionId)}{' '}
            <span className="ad-count">{items.length}</span>
          </h3>

          {items.length === 0 ? (
            <p className="ad-empty">Sin productos. Crea uno con el botón de arriba.</p>
          ) : (
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Etiqueta</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(product => (
                    <Fragment key={product.id}>
                    <tr>
                      <td>
                        <div
                          className="ad-thumb"
                          title="Click para cambiar la foto"
                          onClick={() => fileRefs.current[product.id]?.click()}
                        >
                          <img src={product.image} alt={product.name} />
                          <span className="ad-thumb-overlay">📷</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          ref={el => { fileRefs.current[product.id] = el }}
                          onChange={e => handleImage(product.id, e.target.files[0])}
                        />
                      </td>
                      <td>
                        <input
                          className="ad-input"
                          defaultValue={product.name}
                          onBlur={e => {
                            const v = e.target.value.trim()
                            if (v && v !== product.name) handleField(product.id, 'name', v)
                          }}
                        />
                      </td>
                      <td>
                        <input
                          className="ad-input"
                          defaultValue={product.category || ''}
                          onBlur={e => {
                            const v = e.target.value.trim()
                            if (v !== (product.category || '')) handleField(product.id, 'category', v)
                          }}
                        />
                      </td>
                      <td>
                        <input
                          className="ad-input"
                          defaultValue={product.badge || ''}
                          onBlur={e => {
                            const v = e.target.value.trim()
                            if (v !== (product.badge || '')) handleField(product.id, 'badge', v)
                          }}
                        />
                      </td>
                      <td>
                        <input
                          className="ad-input ad-input-price"
                          type="number"
                          defaultValue={product.price}
                          onBlur={e => {
                            const v = Number(e.target.value)
                            if (!Number.isNaN(v) && v !== product.price) handleField(product.id, 'price', v)
                          }}
                        />
                      </td>
                      <td className="ad-actions-cell">
                        <button
                          className="ad-btn ad-btn-ghost ad-btn-sm"
                          aria-expanded={openId === product.id}
                          title="Más opciones: tallas, colores, precio anterior"
                          onClick={() => setOpenId(openId === product.id ? null : product.id)}
                        >
                          {openId === product.id ? '▲' : '⋯'}
                        </button>
                        <button
                          className="ad-btn ad-btn-danger ad-btn-sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                    {openId === product.id && (
                      <tr className="ad-more">
                        <td colSpan={6}>
                          <div className="ad-more-grid">
                            <MoreField label="Precio antes (para mostrar descuento)" type="number" value={product.oldPrice} onSave={v => handleField(product.id, 'oldPrice', v === '' ? null : Number(v))} />
                            <label className="ad-more-field">
                              <span>Destacar este producto</span>
                              <select className="ad-input" defaultValue={product.highlight || ''} onChange={e => handleField(product.id, 'highlight', e.target.value)}>
                                {Object.entries(HIGHLIGHTS).map(([k, h]) => <option key={k} value={k}>{h.label}</option>)}
                              </select>
                            </label>
                            <MoreField label="Unidades disponibles (vacío = sin control)" type="number" value={product.stock} onSave={v => handleField(product.id, 'stock', v === '' ? null : Math.max(0, Math.floor(Number(v) || 0)))} />
                            <MoreField label="Tallas (separadas por coma)" placeholder="S, M, L, XL" value={product.sizes} onSave={v => handleField(product.id, 'sizes', v)} />
                            <MoreField label="Colores (separados por coma)" placeholder="Negro, Gris, Beige #E8DCC4" value={product.colors} onSave={v => handleField(product.id, 'colors', v)} />
                            <MoreField label="Personalización" placeholder="fotos + nombre + mensaje" value={product.personalizacion} onSave={v => handleField(product.id, 'personalizacion', v)} />
                            <MoreField label="Descripción" textarea value={product.description} onSave={v => handleField(product.id, 'description', v)} />
                          </div>
                          <p className="ad-hint">Las tallas y colores aparecen como opciones al pedir y llegan en el mensaje de WhatsApp.</p>
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </section>
  )
}

// Campo que guarda al salir de él (solo si cambió)
function MoreField({ label, value, onSave, type = 'text', placeholder, textarea = false }) {
  const initial = value ?? ''
  const props = {
    className: 'ad-input',
    defaultValue: initial,
    placeholder,
    onBlur: (e) => { const v = e.target.value.trim(); if (v !== String(initial)) onSave(v) },
  }
  return (
    <label className="ad-more-field">
      <span>{label}</span>
      {textarea ? <textarea rows={3} {...props} /> : <input type={type} {...props} />}
    </label>
  )
}
