// Ventana para asignar una contraseña nueva a un dueño de catálogo
import { useEffect, useRef, useState } from 'react'
import { tempPassword, waLink } from '@/lib/format'
import { setUserPassword } from '@/services/admin.service'
import { linkOwnerProfile } from '@/services/users.service'
import { updateTenant } from '@/services/tenants.service'

const newPassword = () => tempPassword() + Math.floor(Math.random() * 90 + 10) // 12 caracteres

export default function PasswordDialog({ email, name, phone, tenantId, onClose, onDone }) {
  const [password, setPassword] = useState(newPassword)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [missing, setMissing] = useState(false) // el correo aún no tiene cuenta
  const [created, setCreated] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    d?.showModal()
    return () => d?.close()
  }, [])

  const loginUrl = `${window.location.origin}/admin`
  const message = created
    ? `Hola${name ? ` ${name}` : ''} 👋 Ya tienes acceso para editar tu catálogo.\n\n🔐 Entra en: ${loginUrl}\nCorreo: ${email}\nContraseña: ${password}\n\nTe recomendamos no compartirla con nadie.`
    : `Hola${name ? ` ${name}` : ''} 👋 Tu contraseña fue cambiada.\n\n🔐 Entra en: ${loginUrl}\nCorreo: ${email}\nContraseña nueva: ${password}\n\nTe recomendamos no compartirla con nadie.`

  const save = async (createIfMissing = false) => {
    if (password.length < 8) return setError('Mínimo 8 caracteres.')
    setBusy(true); setError('')
    try {
      const res = await setUserPassword(email, password, { createIfMissing })
      // La cuenta queda vinculada como dueña del catálogo (repara perfiles incompletos)
      if (res.uid && tenantId) {
        await linkOwnerProfile({ uid: res.uid, email, tenantId, name })
        await updateTenant(tenantId, { ownerUid: res.uid })
      }
      setCreated(!!res.created)
      setDone(true)
      onDone?.(password)
    } catch (err) {
      if (err.code === 'user-not-found') setMissing(true)
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  const submit = (e) => { e.preventDefault(); save(false) }

  const copy = async () => {
    try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* sin permiso */ }
  }

  return (
    <dialog ref={ref} className="sa-dialog" onCancel={(e) => { e.preventDefault(); onClose() }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      {done ? (
        <div className="sa-dialog__body">
          <p className="sa-done__icon" aria-hidden="true">🔐</p>
          <h2 className="display">{created ? 'Cuenta creada' : 'Contraseña cambiada'}</h2>
          <p className="pf-muted">
            {created
              ? <>Creamos la cuenta de <strong>{email}</strong>{tenantId && <> y quedó como dueña de <strong>/{tenantId}</strong></>}. Envíale los datos:</>
              : <>Las sesiones abiertas de <strong>{email}</strong> se cerraron. Envíale los nuevos datos:</>}
          </p>
          <pre className="sa-msg">{message}</pre>
          <div className="sa-form__actions sa-form__actions--wrap">
            <button className="btn btn--ink" onClick={copy}>{copied ? '¡Copiado!' : 'Copiar mensaje'}</button>
            {phone && <a className="btn btn--wa" href={waLink(phone, message)} target="_blank" rel="noopener noreferrer">Enviar por WhatsApp</a>}
            <button className="btn btn--ghost" onClick={onClose}>Listo</button>
          </div>
        </div>
      ) : (
        <form className="sa-dialog__body" onSubmit={submit}>
          <div className="sa-form__head">
            <h2 className="display">Cambiar contraseña</h2>
            <button type="button" className="sa-x" onClick={onClose} aria-label="Cerrar">✕</button>
          </div>
          <p className="pf-muted">{name && <><strong>{name}</strong> · </>}{email}</p>
          <label className="pf-field">
            <span>Contraseña nueva</span>
            <div className="sa-slug">
              <input required minLength={8} value={password} onChange={e => setPassword(e.target.value)} autoComplete="off" spellCheck={false} />
              <button type="button" className="sa-mini" onClick={() => setPassword(newPassword())}>Generar</button>
            </div>
            <small>Al guardar se cerrará la sesión en todos sus dispositivos.</small>
          </label>
          {error && !missing && <p className="pf-error" role="alert">{error}</p>}
          {missing && (
            <div className="pf-alert" role="alert">
              <p><strong>{email}</strong> todavía no tiene cuenta para entrar.</p>
              <p>¿Quieres crearla con esta contraseña{tenantId ? <> y dejarla como dueña de <strong>/{tenantId}</strong></> : ''}?</p>
              <button type="button" className="btn btn--ink sa-create-acc" disabled={busy} onClick={() => save(true)}>
                {busy ? 'Creando…' : 'Crear cuenta'}
              </button>
            </div>
          )}
          <div className="sa-form__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
            {!missing && <button className="btn btn--primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar contraseña'}</button>}
          </div>
        </form>
      )}
    </dialog>
  )
}
