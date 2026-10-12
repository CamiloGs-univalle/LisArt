// Opiniones de Google que se muestran en el catálogo (plan Premium).
// El dueño copia aquí su calificación y algunas reseñas reales de su ficha de Google.
import { useEffect, useState } from 'react'
import { useTenant } from '@/features/tenant/TenantProvider'

const MAX = 10
const blank = () => ({ id: Math.random().toString(36).slice(2, 9), name: '', stars: 5, text: '', when: '' })

export default function GoogleReviewsEditor() {
  const { tenant, update } = useTenant()
  const [rating, setRating] = useState('')
  const [count, setCount] = useState('')
  const [list, setList] = useState([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!tenant) return
    setRating(tenant.googleRating ?? '')
    setCount(tenant.googleReviewCount ?? '')
    setList(Array.isArray(tenant.googleReviews) ? tenant.googleReviews : [])
  }, [tenant])

  const setItem = (i, k, v) => setList(l => l.map((r, j) => (j === i ? { ...r, [k]: v } : r)))

  const save = async (e) => {
    e.preventDefault()
    const r = rating === '' ? null : Math.round(Math.min(5, Math.max(1, Number(rating))) * 10) / 10
    const c = count === '' ? null : Math.max(0, Math.floor(Number(count)))
    const reviews = list.filter(x => x.text.trim() && x.name.trim()).slice(0, MAX)
      .map(x => ({ id: x.id, name: x.name.trim().slice(0, 60), stars: Math.min(5, Math.max(1, Number(x.stars) || 5)), text: x.text.trim().slice(0, 600), when: x.when.trim().slice(0, 30) }))
    setSaving(true)
    try {
      await update({ googleRating: Number.isFinite(r) ? r : null, googleReviewCount: Number.isFinite(c) ? c : null, googleReviews: reviews })
      setMsg('✓ Opiniones guardadas'); setTimeout(() => setMsg(''), 2500)
    } catch { alert('No se pudo guardar. Intenta de nuevo.') }
    finally { setSaving(false) }
  }

  return (
    <form className="ad-card" onSubmit={save}>
      <h2>⭐ Opiniones de Google en tu catálogo</h2>
      <p className="ad-hint">
        Copia tu calificación y algunas reseñas <strong>reales</strong> de tu ficha de Google. En el catálogo se ven con el botón
        «Escribir una reseña», que abre directamente el formulario de Google.
      </p>
      <div className="bt-grid">
        <label className="bt-field"><span>Calificación en Google (ej. 4.8)</span>
          <input className="ad-input" type="number" min="1" max="5" step="0.1" inputMode="decimal" value={rating} onChange={e => setRating(e.target.value)} placeholder="4.8" /></label>
        <label className="bt-field"><span>Número de reseñas en Google</span>
          <input className="ad-input" type="number" min="0" inputMode="numeric" value={count} onChange={e => setCount(e.target.value)} placeholder="37" /></label>
      </div>

      <div className="gr-list">
        {list.map((r, i) => (
          <fieldset key={r.id} className="gr-item">
            <legend className="sr-only">Reseña {i + 1}</legend>
            <div className="gr-item__row">
              <input className="ad-input" value={r.name} onChange={e => setItem(i, 'name', e.target.value)} placeholder="Nombre como sale en Google" aria-label="Nombre" />
              <select className="ad-input" value={r.stars} onChange={e => setItem(i, 'stars', Number(e.target.value))} aria-label="Estrellas">
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
              </select>
              <input className="ad-input" value={r.when} onChange={e => setItem(i, 'when', e.target.value)} placeholder="Ej: hace 2 semanas" aria-label="Cuándo" />
              <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setList(l => l.filter((_, j) => j !== i))} aria-label={`Quitar reseña ${i + 1}`}>✕</button>
            </div>
            <textarea className="ad-input" rows={2} value={r.text} onChange={e => setItem(i, 'text', e.target.value)} placeholder="Texto de la reseña, tal cual en Google" aria-label="Texto de la reseña" />
          </fieldset>
        ))}
      </div>
      {list.length < MAX && <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setList(l => [...l, blank()])}>＋ Agregar reseña de Google</button>}

      <div className="ad-row-between">
        <span className="ad-message">{msg}</span>
        <button className="ad-btn ad-btn-primary" type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar opiniones'}</button>
      </div>
    </form>
  )
}
