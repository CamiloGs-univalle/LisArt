// Pestaña "Mi negocio": nombre, logo, WhatsApp, ciudad, redes y anuncio
import { useEffect, useRef, useState } from 'react'
import { useTenant } from '@/features/tenant/TenantProvider'
import { useSettingsCtx } from '@/features/catalog/data/SettingsProvider'
import { normalizePhone } from '@/lib/format'
import { catalogUrl } from '@/app/router'

const FIELDS = [
  { k: 'name', label: 'Nombre del negocio', placeholder: 'Ej: Creaciones LisArt', required: true },
  { k: 'tagline', label: 'Frase corta (aparece en el pie de página)', placeholder: 'Ej: Detalles y regalos personalizados' },
  { k: 'whatsapp', label: 'WhatsApp para recibir pedidos', placeholder: 'Ej: 3001234567', type: 'tel', required: true },
  { k: 'city', label: 'Ciudad', placeholder: 'Ej: Cali' },
  { k: 'instagram', label: 'Instagram (enlace)', placeholder: 'https://instagram.com/tu_negocio' },
  { k: 'tiktok', label: 'TikTok (enlace)', placeholder: 'https://tiktok.com/@tu_negocio' },
  { k: 'facebook', label: 'Facebook (enlace)', placeholder: 'https://facebook.com/tu_negocio' },
]

export default function BusinessTab() {
  const { tenant, tenantId, update, uploadLogo } = useTenant()
  const { announcement, updateAnnouncement } = useSettingsCtx()
  const [draft, setDraft] = useState({})
  const [ann, setAnn] = useState(announcement)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef(null)

  useEffect(() => { setDraft(Object.fromEntries(FIELDS.map(f => [f.k, tenant?.[f.k] || '']))) }, [tenant])
  useEffect(() => { setAnn(announcement) }, [announcement])

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 2500) }

  const save = async (e) => {
    e.preventDefault()
    if (!draft.name?.trim()) return alert('Escribe el nombre del negocio.')
    if (normalizePhone(draft.whatsapp).length < 10) return alert('Revisa el número de WhatsApp.')
    setSaving(true)
    try {
      await update({ ...Object.fromEntries(Object.entries(draft).map(([k, v]) => [k, String(v).trim()])), whatsapp: normalizePhone(draft.whatsapp) })
      await updateAnnouncement(ann.trim())
      flash('✓ Datos guardados')
    } catch { alert('No se pudieron guardar los datos. Intenta de nuevo.') }
    finally { setSaving(false) }
  }

  const onLogo = async (file) => {
    if (!file) return
    setUploading(true)
    try { await uploadLogo(file); flash('✓ Logo actualizado') }
    catch { alert('No se pudo subir el logo.') }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  return (
    <form className="ad-card" onSubmit={save}>
      <h2>🏪 Mi negocio</h2>
      <p className="ad-hint">Tu catálogo está en <a href={catalogUrl(tenantId)} target="_blank" rel="noreferrer"><strong>{catalogUrl(tenantId)}</strong></a></p>

      <div className="bt-logo">
        <div className="bt-logo__img">
          {tenant?.logo ? <img src={tenant.logo} alt="Logo" /> : <span>Sin logo</span>}
        </div>
        <div className="bt-logo__actions">
          <button type="button" className="ad-btn ad-btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Subiendo…' : tenant?.logo ? 'Cambiar logo' : 'Subir logo'}
          </button>
          {tenant?.logo && <button type="button" className="ad-btn ad-btn-ghost" onClick={() => update({ logo: '' })}>Quitar</button>}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => onLogo(e.target.files[0])} />
        </div>
      </div>

      <div className="bt-grid">
        {FIELDS.map(f => (
          <label key={f.k} className="bt-field">
            <span>{f.label}{f.required && ' *'}</span>
            <input className="ad-input" type={f.type || 'text'} value={draft[f.k] || ''} placeholder={f.placeholder}
              onChange={e => setDraft(d => ({ ...d, [f.k]: e.target.value }))} />
          </label>
        ))}
      </div>

      <label className="bt-field bt-field--full">
        <span>📢 Anuncio destacado (sale primero en la barra de arriba; vacío para ocultarlo)</span>
        <textarea className="ad-input" rows={2} value={ann} onChange={e => setAnn(e.target.value)} placeholder="Ej: ¡Pedidos para Amor y Amistad abiertos!" />
      </label>

      <div className="ad-row-between">
        <span className="ad-message">{msg}</span>
        <button className="ad-btn ad-btn-primary" type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar datos'}</button>
      </div>
    </form>
  )
}
