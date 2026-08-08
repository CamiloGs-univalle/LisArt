import { useEffect, useRef, useState } from 'react'
import './AdminDashboard.css'
import { useAdmin } from './AdminContext'
import { useProductsCtx } from '../../contexts/ProductsContext'
import { useSettingsCtx } from '../../contexts/SettingsContext'

const SECTION_NAMES = {
  featured: '⭐ Destacado',
  carousel_cajas: '🎁 Sorpresas',
  grid_arreglos: '🌸 Arreglos',
  list_regalos: '✨ Regalos',
  promos_grande: '🖼 Tarjetas Grandes',
  promos_mediano: '📋 Tarjetas Medianas',
  promos_circulo: '⭕ Círculos'
}

const SECTION_ORDER = ['featured', 'carousel_cajas', 'grid_arreglos', 'list_regalos', 'promos_grande', 'promos_mediano', 'promos_circulo']

function AdminDashboard({ open, onClose }) {
  const { logout } = useAdmin()
  const { products, createProduct, deleteProduct, updateField, updateImage } =
    useProductsCtx()
  const { announcement, updateAnnouncement } = useSettingsCtx()

  const [announcementDraft, setAnnouncementDraft] = useState(announcement)
  const [savingAnnouncement, setSavingAnnouncement] = useState(false)
  const [creatingSection, setCreatingSection] = useState(null)
  const [message, setMessage] = useState('')
  const fileRefs = useRef({})

  useEffect(() => {
    if (!open) return
    setAnnouncementDraft(announcement)
    setMessage('')
  }, [open, announcement])

  if (!open) return null

  const sectionName = (s) => SECTION_NAMES[s] || s

  const handleSaveAnnouncement = async () => {
    setSavingAnnouncement(true)
    try {
      await updateAnnouncement(announcementDraft.trim())
      setMessage('✓ Anuncio guardado')
      setTimeout(() => setMessage(''), 2500)
    } catch {
      alert('Error guardando el anuncio. Verifica las reglas de Firestore.')
    } finally {
      setSavingAnnouncement(false)
    }
  }

  const handleCreate = async (sectionId) => {
    setCreatingSection(sectionId)
    try {
      await createProduct(sectionId)
    } catch {
      alert('Error creando el producto. Verifica las reglas de Firestore.')
    } finally {
      setCreatingSection(null)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    try {
      await deleteProduct(productId)
    } catch {
      alert('Error al eliminar el producto.')
    }
  }

  const handleImage = async (productId, file) => {
    if (!file) return
    try {
      await updateImage(productId, file)
    } catch {
      alert('Error subiendo la imagen.')
    }
  }

  const handleField = async (productId, field, value) => {
    try {
      await updateField(productId, field, value)
    } catch {
      alert('Error guardando el campo.')
    }
  }

  const grouped = SECTION_ORDER.map(sectionId => ({
    sectionId,
    items: products.filter(p => p.section === sectionId)
  }))

  return (
    <div className="admin-dash-overlay" onClick={onClose}>
      <div className="admin-dash" onClick={e => e.stopPropagation()}>
        <div className="admin-dash-head">
          <h1>✨ Panel de Administración</h1>
          <div className="admin-dash-head-actions">
            <button className="ad-btn ad-btn-ghost" onClick={onClose}>
              Ver catálogo
            </button>
            <button
              className="ad-btn ad-btn-danger"
              onClick={async () => {
                await logout()
                onClose()
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="admin-dash-body">
          <section className="ad-card">
            <h2>📢 Anuncio</h2>
            <p className="ad-hint">
              Este texto se muestra como banner en la parte superior del catálogo. Déjalo vacío para ocultarlo.
            </p>
            <textarea
              className="ad-announcement-input"
              rows="3"
              value={announcementDraft}
              onChange={e => setAnnouncementDraft(e.target.value)}
              placeholder="Ej: Envíos gratis por compras superiores a $50.000 esta semana 💕"
            />
            <div className="ad-row-between">
              <span className="ad-message">{message}</span>
              <button
                className="ad-btn ad-btn-primary"
                onClick={handleSaveAnnouncement}
                disabled={savingAnnouncement}
              >
                {savingAnnouncement ? 'Guardando...' : 'Guardar anuncio'}
              </button>
            </div>
          </section>

          <section className="ad-card">
            <h2>🛍️ Productos</h2>
            <div className="ad-create-row">
              {SECTION_ORDER.map(sectionId => (
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
                          <tr key={product.id}>
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
                            <td>
                              <button
                                className="ad-btn ad-btn-danger ad-btn-sm"
                                onClick={() => handleDelete(product.id)}
                              >
                                🗑
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
