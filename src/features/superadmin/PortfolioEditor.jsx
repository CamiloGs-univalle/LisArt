// Editor del portafolio (página principal). Solo el super administrador.
import { useEffect, useRef, useState } from 'react'
import { watchPortfolio, savePortfolio } from '@/services/portfolio.service'
import { PORTFOLIO_DEFAULTS, PORTFOLIO_ICONS, withDefaults } from '@/features/portfolio/defaults'
import { THEME_PRESETS } from '@/features/tenant/themes'
import { uploadImage } from '@/lib/cloudinary'
import { normalizePhone } from '@/lib/format'
import { friendlyError } from '@/services/auth.service'

const PRESET_OPTIONS = Object.entries(THEME_PRESETS).map(([id, t]) => [id, t.label])
const ICON_LABELS = { monitor: 'Pantalla', code: 'Código', phone: 'Celular', rocket: 'Cohete', palette: 'Paleta', bolt: 'Rayo', chat: 'Chat', mail: 'Correo', globe: 'Mundo', pin: 'Ubicación', cart: 'Carrito', chart: 'Gráfica', star: 'Estrella' }

export default function PortfolioEditor({ tenants, onToast }) {
  const [draft, setDraft] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [ghBusy, setGhBusy] = useState(false)
  const loaded = useRef(false)

  // Carga una sola vez (mientras editas no se sobrescribe lo que escribes)
  useEffect(() => watchPortfolio((d) => {
    if (loaded.current) return
    loaded.current = true
    setDraft(withDefaults(d))
  }, () => { if (!loaded.current) { loaded.current = true; setDraft(withDefaults(null)) } }), [])

  // Aviso si intentas salir con cambios sin guardar
  useEffect(() => {
    if (!dirty) return
    const on = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', on)
    return () => window.removeEventListener('beforeunload', on)
  }, [dirty])

  if (!draft) return <p className="pf-muted">Cargando portafolio…</p>

  const set = (key, value) => { setDraft(d => ({ ...d, [key]: value })); setDirty(true) }
  const setContact = (key, value) => set('contact', { ...draft.contact, [key]: value })
  const bind = (key) => ({ value: draft[key] ?? '', onChange: (e) => set(key, e.target.value) })

  const save = async () => {
    setBusy(true)
    try {
      await savePortfolio({ ...draft, contact: { ...draft.contact, whatsapp: normalizePhone(draft.contact.whatsapp) } })
      setDirty(false)
      onToast('Portafolio guardado. Ya está publicado.')
    } catch (e) {
      onToast(friendlyError(e, 'No se pudo guardar. Revisa las reglas de Firestore.'))
    } finally { setBusy(false) }
  }

  const reset = () => {
    if (!window.confirm('¿Volver a los textos iniciales? Se reemplaza lo que tienes (al guardar).')) return
    setDraft(structuredClone(PORTFOLIO_DEFAULTS)); setDirty(true)
  }

  // Trae los repositorios públicos (no copiados) del perfil de GitHub que aún no estén en la lista
  const importGithub = async () => {
    const user = (draft.githubUrl || draft.contact.github || '').replace(/\/+$/, '').split('/').pop()
    if (!user) return onToast('Escribe primero el enlace de tu perfil de GitHub.')
    setGhBusy(true)
    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=updated`)
      if (!res.ok) throw new Error()
      const repos = await res.json()
      const have = new Set(draft.projects.map(p => (p.repo || '').toLowerCase()))
      const pretty = (n) => n.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      const extra = repos
        .filter(r => !r.fork && !have.has(r.html_url.toLowerCase()))
        .map(r => ({ title: pretty(r.name), category: r.language ? `Proyecto · ${r.language}` : 'Proyecto', description: r.description || '', tech: [r.language, ...(r.topics || [])].filter(Boolean).slice(0, 4).join(', '), url: r.homepage || '', repo: r.html_url, image: '' }))
      if (!extra.length) return onToast('No hay repositorios nuevos para agregar.')
      set('projects', [...draft.projects, ...extra])
      onToast(`Agregados ${extra.length} proyecto(s) de GitHub. Revísalos y guarda.`)
    } catch {
      onToast('No se pudo leer GitHub. Revisa el usuario e inténtalo de nuevo.')
    } finally { setGhBusy(false) }
  }

  // Agrega como proyectos los catálogos activos que aún no estén en la lista
  const importCatalogs = () => {
    const have = new Set(draft.projects.map(p => p.url))
    const extra = (tenants || [])
      .filter(t => t.status !== 'suspended' && !have.has(`/${t.id}`))
      .map(t => ({ title: t.name || t.id, category: 'Catálogo digital', url: `/${t.id}`, image: '', preset: t.theme?.preset || 'rosa' }))
    if (!extra.length) return onToast('Todos tus catálogos activos ya están en la lista.')
    set('projects', [...draft.projects, ...extra])
    onToast(`Agregados ${extra.length} catálogo(s). Recuerda guardar.`)
  }

  return (
    <div className="pe">
      <div className="pe-intro">
        <p>Lo que cambies aquí se publica en la página principal al presionar <strong>Guardar</strong>.</p>
        <a className="btn btn--ghost" href="/" target="_blank" rel="noopener noreferrer">Ver portafolio ↗</a>
      </div>

      <Group title="Portada" open>
        <div className="sa-row">
          <Field label="Tu nombre"><input {...bind('firstName')} /></Field>
          <Field label="Apellido (opcional)"><input {...bind('lastName')} /></Field>
        </div>
        <div className="sa-row">
          <Field label="Profesión (arriba a la izquierda)"><input {...bind('role')} /></Field>
          <Field label="Título bajo tu nombre"><input {...bind('title')} /></Field>
        </div>
        <Field label="Palabra gigante" hint="Se ajusta sola al ancho de la pantalla. Corta se ve mejor (ej. PORTAFOLIO, CAMILO, DEV)."><input {...bind('bigWord')} /></Field>
        <Field label="Presentación"><textarea rows={3} {...bind('intro')} /></Field>
        <div className="sa-row">
          <Field label="Saludo"><input {...bind('greeting')} /></Field>
          <Field label="Firma (letra manuscrita)"><input {...bind('signature')} /></Field>
        </div>
        <div className="sa-row">
          <Field label="Aviso de disponibilidad"><input {...bind('availability')} /></Field>
          <Field label="Texto del sello giratorio"><input {...bind('badge')} /></Field>
        </div>
        <div className="sa-row">
          <Field label="Texto vertical izquierdo"><input {...bind('sideLeft')} /></Field>
          <Field label="Texto vertical derecho"><input {...bind('sideRight')} /></Field>
        </div>
        <ImageField label="Tu foto" hint="Si no subes foto se muestra tu inicial con un bloque de código." value={draft.photo} onChange={(v) => set('photo', v)} folder="portafolio" />
        {draft.photo && (
          <label className="pe-check">
            <input type="checkbox" checked={!!draft.photoCutout} onChange={(e) => set('photoCutout', e.target.checked)} />
            Mi foto es un PNG sin fondo (sobresale del círculo, como en las revistas)
          </label>
        )}
      </Group>

      <Group title="Cinta animada">
        <Field label="Frases (separadas por coma)">
          <input value={draft.marquee.join(', ')} onChange={(e) => set('marquee', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
        </Field>
      </Group>

      <Group title={`Proyectos (${draft.projects.length})`}>
        <div className="sa-row">
          <Field label="Título"><input {...bind('projectsTitle')} /></Field>
          <Field label="Título en color"><input {...bind('projectsEmphasis')} /></Field>
        </div>
        <Field label="Texto"><textarea rows={2} {...bind('projectsIntro')} /></Field>
        <Field label="Tu perfil de GitHub" hint="Aparece como “Ver todo en GitHub”."><input {...bind('githubUrl')} placeholder="https://github.com/usuario" /></Field>
        <div className="pe-imports">
          <button type="button" className="btn btn--ghost pe-import" onClick={importGithub} disabled={ghBusy}>{ghBusy ? 'Buscando…' : '⤓ Importar proyectos de GitHub'}</button>
          <button type="button" className="btn btn--ghost pe-import" onClick={importCatalogs}>＋ Agregar mis catálogos como proyectos</button>
        </div>
        <ListEditor
          items={draft.projects}
          onChange={(v) => set('projects', v)}
          newItem={{ title: 'Nuevo proyecto', category: '', description: '', tech: '', url: '', repo: '', image: '' }}
          itemLabel={(it) => it.title || 'Proyecto'}
          fields={[
            { key: 'title', label: 'Nombre' },
            { key: 'category', label: 'Tipo (ej. Plataforma web · Logística)' },
            { key: 'description', label: 'Descripción corta (aparece al pasar el mouse)', type: 'textarea' },
            { key: 'tech', label: 'Tecnologías (separadas por coma)', hint: 'Ej. React, Firebase, IA' },
            { key: 'url', label: 'Enlace del proyecto en vivo', hint: 'https://… o un catálogo tuyo (/nombre)' },
            { key: 'repo', label: 'Enlace del código (GitHub)' },
            { key: 'image', label: 'Captura (opcional)', type: 'image', hint: 'Sin captura se dibuja una portada elegante con el nombre.' },
            { key: 'preset', label: 'Si es un catálogo: colores de la vista previa', type: 'select', options: [['', 'Portada tipográfica'], ...PRESET_OPTIONS] },
          ]}
        />
      </Group>

      <Group title="Habilidades y servicios">
        <div className="sa-row">
          <Field label="Título"><input {...bind('skillsTitle')} /></Field>
          <Field label="Título en color"><input {...bind('skillsEmphasis')} /></Field>
        </div>
        <ListEditor
          items={draft.skills}
          onChange={(v) => set('skills', v)}
          newItem={{ name: 'Nueva habilidad', level: 80 }}
          itemLabel={(it) => `${it.name || 'Habilidad'} · ${it.level || 0}%`}
          compact
          fields={[
            { key: 'name', label: 'Habilidad' },
            { key: 'level', label: 'Nivel (%)', type: 'number' },
          ]}
        />
        <Field label="Frase destacada"><textarea rows={3} {...bind('quote')} /></Field>
        <ListEditor
          items={draft.services}
          onChange={(v) => set('services', v)}
          newItem={{ icon: 'star', title: 'Nuevo servicio', text: '' }}
          itemLabel={(it) => it.title || 'Servicio'}
          fields={[
            { key: 'icon', label: 'Ícono', type: 'select', options: PORTFOLIO_ICONS.map(i => [i, ICON_LABELS[i] || i]) },
            { key: 'title', label: 'Título' },
            { key: 'text', label: 'Descripción', type: 'textarea' },
          ]}
        />
      </Group>

      <Group title={`Testimonios (${draft.testimonials.length})`}>
        <p className="pf-muted pe-hint">La sección solo aparece cuando agregas al menos uno. Usa opiniones reales de tus clientes.</p>
        <div className="sa-row">
          <Field label="Título"><input {...bind('testimonialsTitle')} /></Field>
          <Field label="Título en color"><input {...bind('testimonialsEmphasis')} /></Field>
        </div>
        <ListEditor
          items={draft.testimonials}
          onChange={(v) => set('testimonials', v)}
          newItem={{ text: '', name: '', role: '', photo: '' }}
          itemLabel={(it) => it.name || 'Testimonio'}
          fields={[
            { key: 'text', label: 'Lo que dijo', type: 'textarea' },
            { key: 'name', label: 'Nombre' },
            { key: 'role', label: 'Cargo o negocio' },
            { key: 'photo', label: 'Foto (opcional)', type: 'image' },
          ]}
        />
      </Group>

      <Group title="Contacto">
        <div className="sa-row">
          <Field label="Título"><input {...bind('ctaTitle')} /></Field>
          <Field label="Título en color"><input {...bind('ctaEmphasis')} /></Field>
        </div>
        <Field label="Texto"><textarea rows={2} {...bind('ctaText')} /></Field>
        <Field label="Texto del botón de WhatsApp"><input {...bind('ctaButton')} /></Field>
        <div className="sa-row">
          <Field label="Correo"><input type="email" value={draft.contact.email} onChange={(e) => setContact('email', e.target.value)} /></Field>
          <Field label="WhatsApp" hint="Sin él no aparece el botón de WhatsApp."><input inputMode="tel" value={draft.contact.whatsapp} onChange={(e) => setContact('whatsapp', e.target.value)} placeholder="300 123 4567" /></Field>
        </div>
        <div className="sa-row">
          <Field label="Sitio web"><input value={draft.contact.website} onChange={(e) => setContact('website', e.target.value)} placeholder="www.tusitio.com" /></Field>
          <Field label="Ubicación"><input value={draft.contact.location} onChange={(e) => setContact('location', e.target.value)} /></Field>
        </div>
        <div className="sa-row">
          <Field label="Instagram (enlace)"><input value={draft.contact.instagram} onChange={(e) => setContact('instagram', e.target.value)} placeholder="https://instagram.com/…" /></Field>
          <Field label="GitHub (enlace)"><input value={draft.contact.github} onChange={(e) => setContact('github', e.target.value)} placeholder="https://github.com/…" /></Field>
          <Field label="LinkedIn (enlace)"><input value={draft.contact.linkedin} onChange={(e) => setContact('linkedin', e.target.value)} placeholder="https://linkedin.com/in/…" /></Field>
        </div>
      </Group>

      <div className="pe-bar">
        <span className={`pe-status ${dirty ? 'is-dirty' : ''}`}>{dirty ? 'Cambios sin guardar' : 'Todo guardado'}</span>
        <button type="button" className="btn btn--ghost" onClick={reset}>Restaurar</button>
        <button type="button" className="btn btn--primary" disabled={busy || !dirty} onClick={save}>{busy ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </div>
  )
}

/* ── Piezas del formulario ────────────────────────────────── */
function Group({ title, open = false, children }) {
  return (
    <details className="pe-group" open={open}>
      <summary>{title}</summary>
      <div className="pe-group__body">{children}</div>
    </details>
  )
}

function Field({ label, hint, children }) {
  return (
    <label className="pf-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  )
}

function ImageField({ label, hint, value, onChange, folder = 'portafolio' }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const pick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true); setErr('')
    try { onChange(await uploadImage(file, folder)) } catch { setErr('No se pudo subir la imagen.') } finally { setBusy(false) }
  }
  return (
    <div className="pf-field">
      <span>{label}</span>
      <div className="pe-img">
        {value ? <img src={value} alt="" /> : <span className="pe-img__empty">Sin imagen</span>}
        <label className="btn btn--ghost pe-img__btn">
          {busy ? 'Subiendo…' : value ? 'Cambiar' : 'Subir'}
          <input type="file" accept="image/*" hidden onChange={pick} disabled={busy} />
        </label>
        {value && <button type="button" className="pe-link" onClick={() => onChange('')}>Quitar</button>}
      </div>
      {err && <small className="pe-err">{err}</small>}
      {hint && <small>{hint}</small>}
    </div>
  )
}

// Lista editable: agregar, quitar y reordenar elementos
function ListEditor({ items, onChange, fields, newItem, itemLabel, compact = false }) {
  const update = (i, key, value) => onChange(items.map((it, j) => (j === i ? { ...it, [key]: value } : it)))
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const remove = (i) => { if (window.confirm(`¿Quitar "${itemLabel(items[i])}"?`)) onChange(items.filter((_, j) => j !== i)) }
  return (
    <div className="pe-list">
      {items.map((it, i) => (
        <div key={i} className={`pe-item ${compact ? 'pe-item--compact' : ''}`}>
          <div className="pe-item__head">
            <strong>{String(i + 1).padStart(2, '0')} · {itemLabel(it)}</strong>
            <span className="pe-item__tools">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Bajar">↓</button>
              <button type="button" onClick={() => remove(i)} aria-label="Quitar" className="pe-danger">✕</button>
            </span>
          </div>
          <div className={compact ? 'sa-row' : 'pe-item__body'}>
            {fields.map(f => (
              f.type === 'image'
                ? <ImageField key={f.key} label={f.label} hint={f.hint} value={it[f.key]} onChange={(v) => update(i, f.key, v)} />
                : (
                  <Field key={f.key} label={f.label} hint={f.hint}>
                    {f.type === 'textarea' ? <textarea rows={2} value={it[f.key] ?? ''} onChange={(e) => update(i, f.key, e.target.value)} />
                      : f.type === 'select' ? (
                        <select value={it[f.key] ?? ''} onChange={(e) => update(i, f.key, e.target.value)}>
                          {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      ) : f.type === 'number' ? <input type="number" min={0} max={100} value={it[f.key] ?? 0} onChange={(e) => update(i, f.key, Number(e.target.value))} />
                        : <input value={it[f.key] ?? ''} onChange={(e) => update(i, f.key, e.target.value)} />}
                  </Field>
                )
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="pe-add" onClick={() => onChange([...items, structuredClone(newItem)])}>＋ Agregar</button>
    </div>
  )
}
