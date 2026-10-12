// Editor del portafolio (página principal). Solo el super administrador.
import { useEffect, useRef, useState } from 'react'
import { watchPortfolio, savePortfolio } from '@/services/portfolio.service'
import { PORTFOLIO_DEFAULTS, PORTFOLIO_ICONS, withDefaults } from '@/features/portfolio/defaults'
import { THEME_PRESETS } from '@/features/tenant/themes'
import { uploadImage } from '@/lib/cloudinary'
import { normalizePhone } from '@/lib/format'
import { friendlyError } from '@/services/auth.service'
import { SOLUTIONS, withEstimator } from '@/features/portfolio/gs/data'

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
        <a className="btn btn--ghost" href="/" target="_blank" rel="noopener noreferrer">Ver mi página ↗</a>
      </div>

      <Group title="Marca GS Solutions" open>
        <div className="sa-row">
          <Field label="Nombre de la empresa"><input {...bind('brand')} /></Field>
          <Field label="Qué significa (debajo del logo)"><input {...bind('brandLong')} /></Field>
        </div>
        <Field label="Frase pequeña de arriba"><input {...bind('heroKicker')} /></Field>
        <div className="sa-row">
          <Field label="Título principal"><input {...bind('heroTitleA')} /></Field>
          <Field label="Final del título (en color)"><input {...bind('heroTitleB')} /></Field>
        </div>
        <Field label="Texto de la portada"><textarea rows={3} {...bind('heroText')} /></Field>
        <Field label="Tu cargo (junto a tu nombre y foto)"><input {...bind('founderRole')} /></Field>
        <p className="pf-muted">El WhatsApp y el correo donde llegan las citas se configuran abajo, en «Contacto». Sin WhatsApp, las solicitudes llegan solo a este panel.</p>
      </Group>

      <AboutGroup draft={draft} set={set} />

      <EstimatorGroup value={draft.estimator} onChange={(v) => set('estimator', v)} />

      <Group title="Portada (textos anteriores)">
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

/* ── Quién está detrás (sobre mí) ─────────────────────────── */
const toLines = (list, keys) => (list || []).map(it => keys.map(k => it[k] || '').join(' | ')).join('\n')
const fromLines = (text, keys) => text.split('\n').map(l => l.split('|').map(x => x.trim())).filter(parts => parts.some(Boolean))
  .map(parts => Object.fromEntries(keys.map((k, i) => [k, parts[i] || ''])))
const toList = (text) => text.split(',').map(x => x.trim()).filter(Boolean)

function AboutGroup({ draft, set }) {
  const a = draft.about
  const up = (k, v) => set('about', { ...a, [k]: v })
  return (
    <Group title="Quién está detrás (sobre mí)">
      <p className="pf-muted">Tu presentación personal en la página: foto, hoja de vida, herramientas e idiomas. En las listas, escribe un elemento por línea y separa las partes con «|».</p>
      <ImageField label="Tu foto" hint="Se muestra dentro del arco. Si es un PNG sin fondo, marca la casilla para que quede sobre el círculo." value={draft.photo} onChange={(v) => set('photo', v)} folder="portafolio" />
      {draft.photo && (
        <label className="pe-check"><input type="checkbox" checked={!!draft.photoCutout} onChange={(e) => set('photoCutout', e.target.checked)} /> Mi foto es un PNG sin fondo</label>
      )}
      <div className="sa-row">
        <Field label="Saludo"><input value={a.hello || ''} onChange={(e) => up('hello', e.target.value)} /></Field>
        <Field label="Ubicación"><input value={a.location || ''} onChange={(e) => up('location', e.target.value)} /></Field>
      </div>
      <Field label="Sobre mí"><textarea rows={4} value={a.bio || ''} onChange={(e) => up('bio', e.target.value)} /></Field>
      <Field label="Frase (cita)"><input value={a.tagline || ''} onChange={(e) => up('tagline', e.target.value)} /></Field>
      <Field label="Etiquetas sobre la foto (máx. 2, separadas por coma)" hint="Ej: Desarrollador de software, Colombia"><input value={(a.chips || []).join(', ')} onChange={(e) => up('chips', toList(e.target.value))} /></Field>
      <Field label="Formación" hint="Una por línea: Años | Institución | Programa. Ej: 2019 – 2024 | Universidad del Valle | Ingeniería de Sistemas">
        <textarea rows={3} defaultValue={toLines(a.education, ['years', 'title', 'place'])} onBlur={(e) => up('education', fromLines(e.target.value, ['years', 'title', 'place']))} />
      </Field>
      <Field label="Experiencia" hint="Una por línea: Años | Cargo · Empresa | Qué hiciste">
        <textarea rows={4} defaultValue={toLines(a.experience, ['years', 'title', 'text'])} onBlur={(e) => up('experience', fromLines(e.target.value, ['years', 'title', 'text']))} />
      </Field>
      <Field label="Cualidades (separadas por coma)"><input value={(a.tags || []).join(', ')} onChange={(e) => up('tags', toList(e.target.value))} /></Field>
      <Field label="Herramientas que manejas (separadas por coma)"><input value={(a.tools || []).join(', ')} onChange={(e) => up('tools', toList(e.target.value))} /></Field>
      <Field label="Idiomas" hint="Uno por línea: Idioma | Nivel. Ej: Inglés | Intermedio">
        <textarea rows={2} defaultValue={toLines(a.languages, ['name', 'level'])} onBlur={(e) => up('languages', fromLines(e.target.value, ['name', 'level']))} />
      </Field>
      <Field label="Gustos e intereses (opcional, separados por coma)" hint="Si lo dejas vacío, no aparece."><input value={(a.hobbies || []).join(', ')} onChange={(e) => up('hobbies', toList(e.target.value))} /></Field>
      <p className="pf-muted">Tus redes (GitHub, LinkedIn, Instagram) se toman de la sección «Contacto».</p>
    </Group>
  )
}

/* ── Precios del cotizador ────────────────────────────────── */
function EstimatorGroup({ value, onChange }) {
  const cfg = withEstimator(value)
  const num = (v) => Math.max(0, Number(v) || 0)
  const setSys = (id, k, v) => onChange({ ...cfg, systems: { ...cfg.systems, [id]: { ...cfg.systems[id], [k]: v } } })
  const setExtra = (id, k, v) => onChange({ ...cfg, extras: cfg.extras.map(x => (x.id === id ? { ...x, [k]: num(v) } : x)) })
  const setSize = (id, v) => onChange({ ...cfg, sizes: cfg.sizes.map(x => (x.id === id ? { ...x, factor: Math.max(0.5, Number(v) || 1) } : x)) })
  return (
    <Group title="Cotizador (precios en pesos)">
      <p className="pf-muted">Rangos que ve el cliente al armar su sistema. Los 3 primeros módulos vienen incluidos; cada módulo extra suma el valor de abajo.</p>
      <div className="pe-est">
        <div className="pe-est__row pe-est__row--head"><span>Sistema</span><span>Desde</span><span>Hasta</span><span>Semanas</span></div>
        {SOLUTIONS.map(s => {
          const v = cfg.systems[s.id]
          return (
            <div key={s.id} className="pe-est__row">
              <span>{s.name}</span>
              <input type="number" min={0} step={100000} value={v.min} onChange={(e) => setSys(s.id, 'min', num(e.target.value))} aria-label={`${s.name} desde`} />
              <input type="number" min={0} step={100000} value={v.max} onChange={(e) => setSys(s.id, 'max', num(e.target.value))} aria-label={`${s.name} hasta`} />
              <span className="pe-est__weeks">
                <input type="number" min={1} value={v.weeks[0]} onChange={(e) => setSys(s.id, 'weeks', [Math.max(1, num(e.target.value)), v.weeks[1]])} aria-label="Semanas mínimo" />
                <input type="number" min={1} value={v.weeks[1]} onChange={(e) => setSys(s.id, 'weeks', [v.weeks[0], Math.max(1, num(e.target.value))])} aria-label="Semanas máximo" />
              </span>
            </div>
          )
        })}
      </div>
      <div className="sa-row">
        <Field label="Módulo extra · desde"><input type="number" min={0} step={50000} value={cfg.moduleMin} onChange={(e) => onChange({ ...cfg, moduleMin: num(e.target.value) })} /></Field>
        <Field label="Módulo extra · hasta"><input type="number" min={0} step={50000} value={cfg.moduleMax} onChange={(e) => onChange({ ...cfg, moduleMax: num(e.target.value) })} /></Field>
        <Field label="Soporte mensual desde"><input type="number" min={0} step={50000} value={cfg.supportFrom} onChange={(e) => onChange({ ...cfg, supportFrom: num(e.target.value) })} /></Field>
      </div>
      <div className="sa-row">
        {cfg.sizes.map(z => <Field key={z.id} label={`${z.label} (multiplica ×)`}><input type="number" min={0.5} step={0.05} value={z.factor} onChange={(e) => setSize(z.id, e.target.value)} /></Field>)}
      </div>
      <div className="pe-est">
        <div className="pe-est__row pe-est__row--head pe-est__row--x"><span>Extra</span><span>Desde</span><span>Hasta</span></div>
        {cfg.extras.map(x => (
          <div key={x.id} className="pe-est__row pe-est__row--x">
            <span>{x.label}</span>
            <input type="number" min={0} step={100000} value={x.min} onChange={(e) => setExtra(x.id, 'min', e.target.value)} aria-label={`${x.label} desde`} />
            <input type="number" min={0} step={100000} value={x.max} onChange={(e) => setExtra(x.id, 'max', e.target.value)} aria-label={`${x.label} hasta`} />
          </div>
        ))}
      </div>
      <button type="button" className="btn btn--ghost" onClick={() => onChange(null)}>Volver a los precios iniciales</button>
    </Group>
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
