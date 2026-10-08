// Barra flotante para el dueño: cambiar entre "Editar" y "Ver como cliente" y abrir el panel.
import { useState } from 'react'
import { useAdmin } from './EditorProvider'
import { useTenant } from '@/features/tenant/TenantProvider'
import Icon from '@/shared/ui/Icon'
import './EditorBar.css'

const TIP_KEY = 'editor-tip-hidden'

export default function EditorBar({ onOpenPanel }) {
  const { canEdit, editMode, setEditMode } = useAdmin()
  const { tenant } = useTenant()
  const [tip, setTip] = useState(() => { try { return localStorage.getItem(TIP_KEY) !== '1' } catch { return true } })
  if (!canEdit) return null

  const hideTip = () => { setTip(false); try { localStorage.setItem(TIP_KEY, '1') } catch { /* sin almacenamiento */ } }

  return (
    <div className="eb" role="region" aria-label="Herramientas de edición">
      {tenant?.status === 'suspended' && (
        <p className="eb__warn">⚠️ Este catálogo está <strong>suspendido</strong>: los clientes no lo pueden ver.</p>
      )}
      {editMode && tip && (
        <p className="eb__tip">
          <span>✏️ Toca cualquier texto con línea punteada para cambiarlo. <strong>Enter</strong> guarda, <strong>Esc</strong> cancela.</span>
          <button onClick={hideTip} aria-label="Ocultar consejo">✕</button>
        </p>
      )}
      <div className="eb__bar">
        <div className="eb__switch" role="radiogroup" aria-label="Modo">
          <button role="radio" aria-checked={editMode} className={editMode ? 'is-on' : ''} onClick={() => setEditMode(true)}>
            <Icon name="edit" size={16} /> Editar
          </button>
          <button role="radio" aria-checked={!editMode} className={!editMode ? 'is-on' : ''} onClick={() => setEditMode(false)}>
            <Icon name="eye" size={16} /> Vista cliente
          </button>
        </div>
        <button className="eb__panel" onClick={onOpenPanel}>
          <Icon name="settings" size={18} /> <span>Panel</span>
        </button>
      </div>
    </div>
  )
}
