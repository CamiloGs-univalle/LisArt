// Panel del dueño del catálogo, organizado por pestañas
import { useEffect, useState } from 'react'
import './EditorPanel.css'
import { useAdmin } from '@/features/editor/EditorProvider'
import { useAuth } from '@/features/auth/AuthProvider'
import { useTenant } from '@/features/tenant/TenantProvider'
import { navigate } from '@/app/router'
import BusinessTab from './BusinessTab'
import DesignTab from './DesignTab'
import ContentTab from './ContentTab'
import ProductsTab from './ProductsTab'

const TABS = [
  { id: 'negocio', label: 'Mi negocio', icon: '🏪', C: BusinessTab },
  { id: 'productos', label: 'Productos', icon: '🛍️', C: ProductsTab },
  { id: 'diseno', label: 'Diseño', icon: '🎨', C: DesignTab },
  { id: 'textos', label: 'Textos', icon: '📝', C: ContentTab },
]

export default function EditorPanel({ open, onClose }) {
  const { logout, editMode, setEditMode } = useAdmin()
  const { isSuper, user } = useAuth()
  const { brand } = useTenant()
  const [tab, setTab] = useState('negocio')

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  const Active = TABS.find(t => t.id === tab)?.C || BusinessTab

  return (
    <div className="admin-dash-overlay" onClick={onClose}>
      <div className="admin-dash" role="dialog" aria-modal="true" aria-label="Panel de administración" onClick={e => e.stopPropagation()}>
        <div className="admin-dash-head">
          <div>
            <h1>{brand.name || 'Mi catálogo'}</h1>
            <p className="ad-hint ad-hint--head">{user?.email}{isSuper && ' · Super administrador'}</p>
          </div>
          <div className="admin-dash-head-actions">
            <button className="ad-btn ad-btn-ghost" onClick={() => { setEditMode(!editMode); onClose() }}>
              {editMode ? '👁 Ver como cliente' : '✏️ Volver a editar'}
            </button>
            {isSuper && <button className="ad-btn ad-btn-ghost" onClick={() => navigate('/super')}>⭐ Super admin</button>}
            <button className="ad-btn ad-btn-ghost" onClick={onClose}>Cerrar</button>
            <button className="ad-btn ad-btn-danger" onClick={async () => { await logout(); onClose() }}>Salir</button>
          </div>
        </div>

        <nav className="ad-tabs" role="tablist">
          {TABS.map(t => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={`ad-tab ${tab === t.id ? 'is-on' : ''}`} onClick={() => setTab(t.id)}>
              <span aria-hidden="true">{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>

        <div className="admin-dash-body">
          <Active />
        </div>
      </div>
    </div>
  )
}
