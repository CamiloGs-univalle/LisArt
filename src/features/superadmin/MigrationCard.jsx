// Pasa los datos de la primera versión (un solo catálogo) al catálogo de LisArt
// en la nueva estructura. Se usa una sola vez.
import { useEffect, useState } from 'react'
import { PLATFORM } from '@/config/platform'
import { legacyDataSummary, importLegacyData } from '@/services/migration.service'
import { createTenant, updateTenant } from '@/services/tenants.service'
import { useAuth } from '@/features/auth/AuthProvider'
import { uploadImage, dataUrlToFile } from '@/lib/cloudinary'
import { normalizePhone, tempPassword } from '@/lib/format'
import { createOwnerAccount } from '@/services/users.service'
import { friendlyError } from '@/services/auth.service'
import { hasLegacyProject, legacyProjectId } from '@/lib/firebase'

const SLUG = PLATFORM.defaultTenant || 'lisart'

export default function MigrationCard({ onDone }) {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [form, setForm] = useState({ name: 'Creaciones LisArt', whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '', city: 'Cali', ownerEmail: '', password: tempPassword() })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { legacyDataSummary().then(setSummary).catch(() => setSummary({ products: 0, hasSettings: false, failed: true })) }, [])

  const run = async () => {
    setBusy(true); setError('')
    try {
      // Cuenta de la dueña (opcional: si se deja vacío, solo tú puedes editarlo)
      const ownerEmail = form.ownerEmail.trim().toLowerCase()
      const ownerUid = ownerEmail
        ? await createOwnerAccount({ email: ownerEmail, password: form.password, tenantId: SLUG, name: form.name })
        : user.uid
      await createTenant(SLUG, {
        name: form.name.trim(), whatsapp: normalizePhone(form.whatsapp), city: form.city.trim(),
        template: 'regalos', theme: { preset: 'rosa' },
        ownerUid, ownerEmail: ownerEmail || user.email,
      })
      const res = await importLegacyData(SLUG)
      // El logo antes se guardaba solo en el navegador; si está en este equipo, se sube a la nube
      const localLogo = localStorage.getItem('lisart_logo')
      if (localLogo?.startsWith('data:')) {
        const url = await uploadImage(dataUrlToFile(localLogo, 'logo.png'), `catalogos/${SLUG}`)
        await updateTenant(SLUG, { logo: url })
      }
      onDone?.(`Listo: ${res.products} productos pasaron al catálogo /${SLUG}` + (ownerEmail ? ` · acceso: ${ownerEmail} / ${form.password}` : ''))
    } catch (err) {
      setError(friendlyError(err, 'No se pudo completar. Revisa que las reglas de Firestore estén publicadas e inténtalo de nuevo.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="sa-migrate pf-card">
      <h2 className="display">Activa el catálogo de LisArt</h2>
      <p className="pf-muted">
        Copiamos {summary ? <strong>{summary.products} productos</strong> : 'los productos'}, los estilos y los textos de la versión anterior
        al nuevo catálogo <strong>/{SLUG}</strong>. A partir de ahí todos los dispositivos ven lo mismo, en tiempo real.
      </p>
      <p className="pf-muted">Origen: proyecto de Firebase <strong>{legacyProjectId}</strong>{hasLegacyProject && ' (anterior)'}.</p>
      {summary?.failed && <p className="pf-error">No se pudieron leer los datos del proyecto anterior. Revisa las variables VITE_OLD_FIREBASE_* y que sus reglas permitan leer “products” y “settings”.</p>}
      <div className="sa-row">
        <label className="pf-field"><span>Nombre</span><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></label>
        <label className="pf-field"><span>WhatsApp</span><input inputMode="tel" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} /></label>
        <label className="pf-field"><span>Ciudad</span><input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></label>
      </div>
      <div className="sa-row">
        <label className="pf-field"><span>Correo de la dueña (opcional)</span><input type="email" autoComplete="off" value={form.ownerEmail} onChange={e => setForm(f => ({ ...f, ownerEmail: e.target.value }))} placeholder="Para que ella también pueda editar" /></label>
        {form.ownerEmail && <label className="pf-field"><span>Contraseña temporal</span><input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></label>}
      </div>
      <p className="pf-alert">💡 Hazlo desde el dispositivo donde subiste el logo, así también se pasa el logo.</p>
      {error && <p className="pf-error">{error}</p>}
      <button className="btn btn--primary" onClick={run} disabled={busy || !form.name.trim()}>{busy ? 'Copiando…' : 'Copiar datos a /' + SLUG}</button>
    </section>
  )
}
