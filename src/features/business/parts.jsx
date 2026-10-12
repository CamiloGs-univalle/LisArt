// Piezas pequeñas compartidas por las cuentas del negocio
import { useEffect, useRef } from 'react'
import { formatPrice } from '@/lib/format'
import { totalsOf, marginLevel } from '@/lib/business'

// Descuento + envío + resumen de totales
export function TotalsFields({ doc, onChange, showProfit = false }) {
  const t = totalsOf(doc)
  const set = (k, v) => onChange({ ...doc, [k]: v })
  return (
    <div className="bz-totals">
      <div className="bz-totals__inputs">
        <label className="bz-field">
          <span>Descuento</span>
          <div className="bz-join">
            <input className="ad-input" type="number" min="0" inputMode="numeric" value={doc.discount || ''} placeholder="0" onChange={e => set('discount', Number(e.target.value) || 0)} />
            <div className="bz-seg" role="radiogroup" aria-label="Tipo de descuento">
              {[['percent', '%'], ['amount', '$']].map(([k, l]) => (
                <button type="button" key={k} role="radio" aria-checked={(doc.discountType || 'percent') === k} className={(doc.discountType || 'percent') === k ? 'is-on' : ''} onClick={() => set('discountType', k)}>{l}</button>
              ))}
            </div>
          </div>
        </label>
        <label className="bz-field">
          <span>Envío / domicilio</span>
          <input className="ad-input" type="number" min="0" inputMode="numeric" value={doc.shipping || ''} placeholder="0" onChange={e => set('shipping', Number(e.target.value) || 0)} />
        </label>
      </div>
      <dl className="bz-sum">
        <div><dt>Subtotal</dt><dd className="num">{formatPrice(t.subtotal)}</dd></div>
        {t.discount > 0 && <div><dt>Descuento</dt><dd className="num">− {formatPrice(t.discount)}</dd></div>}
        {t.shipping > 0 && <div><dt>Envío</dt><dd className="num">{formatPrice(t.shipping)}</dd></div>}
        <div className="bz-sum__total"><dt>Total</dt><dd className="num">{formatPrice(t.total)}</dd></div>
        {showProfit && t.cost > 0 && (
          <div className={`bz-sum__profit is-${marginLevel(t.margin)}`}><dt>Tu ganancia</dt><dd className="num">{formatPrice(t.profit)} <small>({t.margin}%)</small></dd></div>
        )}
      </dl>
    </div>
  )
}

export function Kpi({ label, value, hint, tone }) {
  return (
    <div className={`bz-kpi ${tone ? `bz-kpi--${tone}` : ''}`}>
      <span className="bz-kpi__label">{label}</span>
      <strong className="bz-kpi__value num">{value}</strong>
      {hint && <small className="bz-kpi__hint">{hint}</small>}
    </div>
  )
}

// Ventana modal sencilla, accesible (Esc para cerrar, foco inicial)
export function Dialog({ title, onClose, children, footer, wide = false }) {
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.querySelector('input, textarea, select, button')?.focus()
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])
  return (
    <div className="bz-dialog" role="presentation" onClick={onClose}>
      <div ref={ref} className={`bz-dialog__panel ${wide ? 'is-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <header className="bz-dialog__head">
          <h3>{title}</h3>
          <button type="button" className="bz-x" onClick={onClose} aria-label="Cerrar">✕</button>
        </header>
        <div className="bz-dialog__body">{children}</div>
        {footer && <footer className="bz-dialog__foot">{footer}</footer>}
      </div>
    </div>
  )
}

export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const shortDate = (v) => {
  if (!v) return '—'
  const d = typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T12:00:00`) : new Date(v?.seconds ? v.seconds * 1000 : v)
  return isNaN(d) ? '—' : d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}
