// Barra flotante para el dueño: cambiar entre "Editar" y "Ver como cliente" y abrir el panel.
import { useState } from 'react'
import { useAdmin } from './EditorProvider'
import { useTenant } from '@/features/tenant/TenantProvider'
import Icon from '@/shared/ui/Icon'
import { useBillingSettings } from '@/features/billing/useBilling'
import { billingState } from '@/lib/billingCore'
import './EditorBar.css'

const TIP_KEY = 'editor-tip-hidden'

export default function EditorBar({ onOpenPanel }) {
  const { canEdit, editMode, setEditMode } = useAdmin()
  const { tenant } = useTenant()
  const billingSettings = useBillingSettings()
  const bill = billingState(tenant?.billing, billingSettings)
  const [tip, setTip] = useState(() => { try { return localStorage.getItem(TIP_KEY) !== '1' } catch { return true } })
  if (!canEdit) return null

  const hideTip = () => { setTip(false); try { localStorage.setItem(TIP_KEY, '1') } catch { /* sin almacenamiento */ } }

  return (
    <div className="eb" role="region" aria-label="Herramientas de edición">
      {tenant?.status === 'suspended' && tenant?.suspendedReason !== 'pago' && (
        <p className="eb__warn">⚠️ Este catálogo está <strong>suspendido</strong>: los clientes no lo pueden ver.</p>
      )}
      {(['soon', 'grace', 'overdue'].includes(bill.state) || tenant?.suspendedReason === 'pago') && (
        <p className={`eb__warn eb__warn--pay eb__warn--${bill.state}`}>
          <span>{bill.state === 'soon'
            ? <>💳 Tu plan <strong>{bill.label.toLowerCase()}</strong>. Renueva para no tener interrupciones.</>
            : bill.state === 'grace'
              ? <>⚠️ Tu plan está <strong>vencido</strong>. Tu catálogo se pausará pronto.</>
              : <>⛔ Tu catálogo está <strong>pausado</strong> por falta de pago: tus clientes no lo ven.</>}</span>
          <button onClick={() => onOpenPanel('plan')}>Pagar ahora</button>
        </p>
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
