// Crea el catálogo de ejemplo (cafetería y pastelería) para ver cómo luce uno real.
// Las fotos se eligen del computador y se asignan por nombre de archivo.
import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { friendlyError } from '@/services/auth.service'
import { catalogUrl } from '@/app/router'
import { seedDemoCafe, matchPhoto, DEMO_SLUG, DEMO_PHOTO_NAMES } from './demoCafe'

export default function DemoCatalogCard({ exists, onDone }) {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [step, setStep] = useState('')
  const [error, setError] = useState('')
  const [showNames, setShowNames] = useState(false)
  const matched = files.filter(f => matchPhoto(f.name))

  const run = async () => {
    setError('')
    try {
      const r = await seedDemoCafe({ user, files, onStep: setStep })
      onDone?.(`${r.created ? 'Catálogo de ejemplo creado' : 'Catálogo de ejemplo actualizado'}: ${r.products} productos${r.photos ? ` · ${r.photos} fotos` : ''}`)
      setFiles([])
    } catch (e) {
      setError(friendlyError(e, 'No se pudo crear el ejemplo. Revisa la conexión y que las reglas estén publicadas.'))
    } finally { setStep('') }
  }

  return (
    <section className="pf-card sa-demo">
      <h2 className="display">☕ Catálogo de ejemplo</h2>
      <p className="pf-muted">
        «Café Aurora»: cafetería y pastelería con 24 productos, precios, ofertas con cuenta regresiva, combos, comparador de tortas y metas de compra.
        {exists && <> Ya existe en <a href={catalogUrl(DEMO_SLUG)} target="_blank" rel="noreferrer"><strong>/{DEMO_SLUG}</strong></a>; puedes volver a llenarlo o cambiarle las fotos.</>}
      </p>
      <label className="pf-field">
        <span>Fotos (opcional) · se asignan por el nombre del archivo, ej. capuchino.jpg</span>
        <input type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files || []))} />
      </label>
      {files.length > 0 && <p className="pf-info">{matched.length} de {files.length} fotos coinciden con un producto{files.length > matched.length && ` · sin coincidencia: ${files.filter(f => !matchPhoto(f.name)).map(f => f.name).slice(0, 5).join(', ')}`}</p>}
      <button type="button" className="pf-link" onClick={() => setShowNames(v => !v)}>{showNames ? 'Ocultar' : 'Ver'} nombres de archivo que reconoce</button>
      {showNames && <p className="pf-muted sa-demo__names">{DEMO_PHOTO_NAMES.map(n => `${n}.jpg`).join(' · ')}</p>}
      {error && <p className="pf-error">{error}</p>}
      <div className="sa-row">
        <button className="btn btn--primary" onClick={run} disabled={!!step}>{step || (exists ? 'Actualizar el ejemplo' : 'Crear catálogo de ejemplo')}</button>
        {exists && <a className="btn btn--ghost" href={catalogUrl(DEMO_SLUG)} target="_blank" rel="noreferrer">Abrir /{DEMO_SLUG}</a>}
      </div>
    </section>
  )
}
