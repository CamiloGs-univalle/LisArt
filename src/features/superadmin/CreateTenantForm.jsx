// Formulario para crear el catálogo de un cliente nuevo + su cuenta de acceso
import { useEffect, useState } from 'react'
import { slugify, tempPassword, normalizePhone, waLink } from '@/lib/format'
import { isSlugAvailable, createTenant, updateTenant, deleteTenant, RESERVED_SLUGS } from '@/services/tenants.service'
import { createOwnerAccount } from '@/services/users.service'
import { friendlyError } from '@/services/auth.service'
import { TEMPLATES, DEFAULT_TEMPLATE } from '@/features/tenant/templates'
import { THEME_PRESETS } from '@/features/tenant/themes'
import { catalogUrl } from '@/app/router'

const EMPTY = { name: '', slug: '', email: '', password: '', whatsapp: '', city: '', template: DEFAULT_TEMPLATE, preset: TEMPLATES[DEFAULT_TEMPLATE].theme }

export default function CreateTenantForm({ onCancel, onCreated }) {
  const [f, setF] = useState(() => ({ ...EMPTY, password: tempPassword() }))
  const [slugTouched, setSlugTouched] = useState(false)
  const [slugState, setSlugState] = useState('idle') // idle | checking | ok | taken | invalid | error
  const [slugError, setSlugError] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  const set = (k) => (e) => setF(prev => ({ ...prev, [k]: e.target.value }))

  // El enlace se arma solo a partir del nombre (se puede cambiar)
  useEffect(() => { if (!slugTouched) setF(prev => ({ ...prev, slug: slugify(prev.name) })) }, [f.name, slugTouched])

  // Verifica que el enlace esté libre (con una pequeña espera mientras se escribe)
  useEffect(() => {
    const s = f.slug
    if (!s) return setSlugState('idle')
    if (s.length < 3 || RESERVED_SLUGS.includes(s)) return setSlugState('invalid')
    setSlugState('checking')
    let alive = true
    const t = setTimeout(async () => {
      try { const ok = await isSlugAvailable(s); if (alive) setSlugState(ok ? 'ok' : 'taken') }
      catch (err) { if (alive) { setSlugState('error'); setSlugError(friendlyError(err, 'No se pudo verificar el enlace. Revisa tu conexión.')) } }
    }, 400)
    return () => { alive = false; clearTimeout(t) }
  }, [f.slug])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (slugState === 'error') return setError(slugError)
    if (slugState === 'checking') return setError('Espera un momento, estamos verificando el enlace.')
    if (slugState !== 'ok') return setError('Elige un enlace disponible para el catálogo.')
    if (f.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    setBusy(true)
    try {
      const email = f.email.trim().toLowerCase()
      // 1) Catálogo (reserva el enlace)
      await createTenant(f.slug, {
        name: f.name.trim(),
        whatsapp: normalizePhone(f.whatsapp),
        city: f.city.trim(),
        template: f.template,
        theme: { preset: f.preset },
        ownerEmail: email,
      })
      // 2) Cuenta del dueño. Si falla, se deshace el catálogo para no dejar nada a medias.
      let uid
      try {
        uid = await createOwnerAccount({ email, password: f.password, tenantId: f.slug, name: f.name })
      } catch (err) {
        await deleteTenant(f.slug).catch(() => {})
        throw err
      }
      await updateTenant(f.slug, { ownerUid: uid })
      setDone({ name: f.name.trim(), slug: f.slug, email, password: f.password, whatsapp: normalizePhone(f.whatsapp) })
      onCreated?.(f.name.trim())
    } catch (err) {
      setError(friendlyError(err, 'No se pudo crear el catálogo. Revisa tu conexión y los permisos de Firestore.'))
    } finally {
      setBusy(false)
    }
  }

  if (done) return <CreatedCard data={done} onClose={onCancel} onAnother={() => { setDone(null); setSlugTouched(false); setF({ ...EMPTY, password: tempPassword() }) }} />

  const slugMsg = {
    checking: ['', 'Verificando…'],
    ok: ['is-ok', '✓ Disponible'],
    taken: ['is-bad', 'Ya existe un catálogo con ese enlace'],
    invalid: ['is-bad', 'Mínimo 3 letras; no puede ser una palabra reservada'],
    error: ['is-bad', slugError],
    idle: ['', ''],
  }[slugState]

  return (
    <form className="sa-form pf-card" onSubmit={submit}>
      <div className="sa-form__head">
        <h2 className="display">Nuevo catálogo</h2>
        <button type="button" className="sa-x" onClick={onCancel} aria-label="Cerrar">✕</button>
      </div>

      <fieldset>
        <legend>1. El negocio</legend>
        <label className="pf-field">
          <span>Nombre del negocio</span>
          <input required value={f.name} onChange={set('name')} placeholder="Ej. Flores Ana" autoFocus />
        </label>
        <label className="pf-field">
          <span>Enlace del catálogo</span>
          <div className="sa-slug">
            <em>{window.location.host}/</em>
            <input required value={f.slug} onChange={(e) => { setSlugTouched(true); setF(p => ({ ...p, slug: slugify(e.target.value) })) }} placeholder="flores-ana" />
          </div>
          <small className={`sa-slug-msg ${slugMsg[0]}`}>{slugMsg[1] || 'Solo letras, números y guiones.'}</small>
        </label>
        <div className="sa-row">
          <label className="pf-field">
            <span>WhatsApp de pedidos</span>
            <input required inputMode="tel" value={f.whatsapp} onChange={set('whatsapp')} placeholder="300 123 4567" />
          </label>
          <label className="pf-field">
            <span>Ciudad</span>
            <input value={f.city} onChange={set('city')} placeholder="Cali" />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>2. Estilo inicial <small>(el cliente lo puede cambiar después)</small></legend>
        <div className="sa-options">
          {Object.values(TEMPLATES).map(t => (
            <label key={t.id} className={`sa-opt ${f.template === t.id ? 'is-on' : ''}`}>
              <input type="radio" name="template" value={t.id} checked={f.template === t.id}
                onChange={() => setF(p => ({ ...p, template: t.id, preset: t.theme }))} />
              <strong>{t.label}</strong>
              <small>{t.description}</small>
            </label>
          ))}
        </div>
        <div className="sa-presets" role="radiogroup" aria-label="Colores">
          {Object.entries(THEME_PRESETS).map(([id, p]) => (
            <button type="button" key={id} role="radio" aria-checked={f.preset === id} className={`sa-preset ${f.preset === id ? 'is-on' : ''}`} onClick={() => setF(prev => ({ ...prev, preset: id }))}>
              <span className="sa-preset__dots">{[p.primary, p.blush, p.ink].map(c => <i key={c} style={{ background: c }} />)}</span>
              {p.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>3. Acceso del cliente</legend>
        <label className="pf-field">
          <span>Correo del cliente</span>
          <input required type="email" autoComplete="off" value={f.email} onChange={set('email')} placeholder="cliente@correo.com" />
        </label>
        <label className="pf-field">
          <span>Contraseña temporal</span>
          <div className="sa-slug">
            <input required minLength={6} value={f.password} onChange={set('password')} />
            <button type="button" className="sa-mini" onClick={() => setF(p => ({ ...p, password: tempPassword() }))}>Generar</button>
          </div>
          <small>Se la compartes al cliente; luego puede cambiarla con «¿Olvidaste tu contraseña?».</small>
        </label>
      </fieldset>

      {error && <p className="pf-error">{error}</p>}
      <div className="sa-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn btn--primary" disabled={busy}>{busy ? 'Creando…' : 'Crear catálogo'}</button>
      </div>
    </form>
  )
}

// Resultado: datos para entregar al cliente
function CreatedCard({ data, onClose, onAnother }) {
  const [copied, setCopied] = useState(false)
  const url = catalogUrl(data.slug)
  const loginUrl = `${window.location.origin}/admin`
  const message = `¡Hola! 🎉 Tu catálogo de *${data.name}* ya está listo.\n\n🔗 Catálogo: ${url}\n🔐 Para editarlo entra a: ${loginUrl}\nCorreo: ${data.email}\nContraseña temporal: ${data.password}\n\nDesde ahí puedes subir tus productos, fotos, precios y cambiar colores y textos.`

  const copy = async () => {
    try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* sin permiso */ }
  }

  return (
    <div className="sa-form pf-card sa-done">
      <p className="sa-done__icon" aria-hidden="true">🎉</p>
      <h2 className="display">¡Catálogo creado!</h2>
      <p className="pf-muted">Comparte estos datos con tu cliente:</p>
      <pre className="sa-msg">{message}</pre>
      <div className="sa-form__actions sa-form__actions--wrap">
        <button className="btn btn--ink" onClick={copy}>{copied ? '¡Copiado!' : 'Copiar mensaje'}</button>
        {data.whatsapp && <a className="btn btn--wa" href={waLink(data.whatsapp, message)} target="_blank" rel="noopener noreferrer">Enviar por WhatsApp</a>}
        <a className="btn btn--ghost" href={url} target="_blank" rel="noopener noreferrer">Ver catálogo</a>
      </div>
      <div className="sa-form__actions">
        <button className="btn btn--ghost" onClick={onAnother}>Crear otro</button>
        <button className="btn btn--primary" onClick={onClose}>Listo</button>
      </div>
    </div>
  )
}
