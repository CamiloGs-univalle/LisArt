// Herramientas de la administradora: gestor de fotos, selector de estilos y secciones nuevas
import { useEffect, useRef, useState } from 'react'
import './AdminTools.css'
import { useUI } from '../../contexts/UIContext'
import { useProductsCtx } from '../../contexts/ProductsContext'
import { useSettingsCtx } from '../../contexts/SettingsContext'
import { getImages, optimizeImg } from '../../data/images'
import { LAYOUTS } from './Layouts'
import { useCatalog } from './useCatalog'
import { productSections } from '../../data/catalog'
import Icon from '../ui/Icon'

/* Mini dibujos de cada estilo (para elegir de un vistazo) */
const PREVIEWS = {
  catalogo: <><rect x="4" y="4" width="15" height="14" rx="3" /><rect x="4" y="20" width="12" height="2.5" rx="1" opacity=".5" /><rect x="4" y="25" width="8" height="2.5" rx="1" /><rect x="22" y="4" width="15" height="14" rx="3" /><rect x="22" y="20" width="12" height="2.5" rx="1" opacity=".5" /><rect x="22" y="25" width="8" height="2.5" rx="1" /><rect x="40" y="4" width="15" height="14" rx="3" /><rect x="40" y="20" width="12" height="2.5" rx="1" opacity=".5" /><rect x="40" y="25" width="8" height="2.5" rx="1" /></>,
  infinito: <><path d="M4 8h4v12H4z" opacity=".5" /><rect x="10" y="6" width="10" height="14" rx="5" /><rect x="22" y="8" width="14" height="12" rx="3" /><circle cx="44" cy="14" r="6" /><path d="M52 8h4v12h-4z" opacity=".5" /><rect x="2" y="24" width="12" height="12" rx="3" /><path d="M16 36V28a5 5 0 0 1 10 0v8Z" /><rect x="28" y="24" width="16" height="12" rx="3" /><rect x="46" y="24" width="10" height="12" rx="5" /></>,
  historias: <><rect x="4" y="6" width="14" height="28" rx="3" /><rect x="21" y="6" width="14" height="28" rx="3" /><rect x="38" y="6" width="14" height="28" rx="3" opacity=".5" /></>,
  mosaico: <><rect x="4" y="4" width="22" height="22" rx="3" /><rect x="29" y="4" width="11" height="22" rx="3" /><rect x="43" y="4" width="11" height="10" rx="3" /><rect x="43" y="16" width="11" height="10" rx="3" /><rect x="4" y="29" width="36" height="9" rx="3" /><rect x="43" y="29" width="11" height="9" rx="3" /></>,
  arcos: <><path d="M5 34V16a8 8 0 0 1 16 0v18Z" /><path d="M24 38V20a8 8 0 0 1 16 0v18Z" /><path d="M43 34V16a8 8 0 0 1 16 0v18Z" opacity=".5" /></>,
  coverflow: <><path d="M4 12l10 3v14l-10 3Z" opacity=".5" /><rect x="19" y="6" width="20" height="30" rx="3" /><path d="M54 12l-10 3v14l10 3Z" opacity=".5" /></>,
  formas: <><circle cx="12" cy="13" r="8" /><path d="M31 3l8 10-8 10-8-10Z" /><path d="M44 21V12a6 6 0 0 1 12 0v9Z" /><rect x="5" y="26" width="14" height="12" rx="6" /><path d="M24 38c0-8 6-12 14-12 0 8-6 12-14 12Z" /></>,
  polaroid: <><g transform="rotate(-6 14 20)"><rect x="5" y="8" width="18" height="22" rx="1" /></g><g transform="rotate(5 38 20)"><rect x="29" y="7" width="18" height="22" rx="1" /></g></>,
  revista: <><rect x="4" y="4" width="26" height="16" rx="3" /><rect x="32" y="8" width="22" height="8" rx="2" opacity=".5" /><rect x="28" y="22" width="26" height="16" rx="3" /><rect x="4" y="26" width="22" height="8" rx="2" opacity=".5" /></>,
  carrusel: <><rect x="4" y="6" width="16" height="22" rx="3" /><rect x="23" y="6" width="16" height="22" rx="3" /><rect x="42" y="6" width="12" height="22" rx="3" opacity=".5" /><rect x="4" y="32" width="50" height="2" rx="1" opacity=".5" /></>,
  cuadricula: <><rect x="4" y="4" width="24" height="34" rx="3" /><rect x="31" y="4" width="11" height="15" rx="3" /><rect x="44" y="4" width="11" height="15" rx="3" /><rect x="31" y="22" width="11" height="16" rx="3" /><rect x="44" y="22" width="11" height="16" rx="3" /></>,
  lista: <><rect x="4" y="5" width="12" height="12" rx="3" /><rect x="19" y="8" width="34" height="3" rx="1.5" opacity=".5" /><rect x="4" y="22" width="12" height="12" rx="3" /><rect x="19" y="25" width="34" height="3" rx="1.5" opacity=".5" /></>,
  circulos: <><circle cx="11" cy="20" r="7" /><circle cx="29" cy="20" r="7" /><circle cx="47" cy="20" r="7" /></>,
}

export function LayoutPreview({ id }) {
  return (
    <svg viewBox="0 0 58 42" className="at-preview" aria-hidden="true">{PREVIEWS[id]}</svg>
  )
}

/* Selector de estilo (fila deslizable de opciones con dibujito) */
export function StylePicker({ value, onChange }) {
  return (
    <div className="at-styles" role="radiogroup" aria-label="Estilo de la sección">
      {Object.entries(LAYOUTS).map(([id, l]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          className={`at-style ${value === id ? 'is-on' : ''}`}
          onClick={() => onChange(id)}
          title={l.hint}
        >
          <LayoutPreview id={id} />
          <span>{l.label}</span>
        </button>
      ))}
    </div>
  )
}

/* Barra de admin sobre cada sección */
export function SectionToolbar({ sectionId, style, custom, hidden, onMove, isFirst, isLast, fixedStyle = false }) {
  const { setLayout, updateSection, removeSection, toggleHidden } = useSettingsCtx()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(custom || {})

  return (
    <div className="container">
      <div className="at-bar">
        {fixedStyle ? (
          <span className="at-bar__btn at-bar__btn--main">★ Pieza destacada grande</span>
        ) : (
        <button className="at-bar__btn at-bar__btn--main" onClick={() => setOpen(o => !o)} aria-expanded={open}>
          <Icon name="layout" size={16} /> Estilo: <strong>{LAYOUTS[style]?.label || style}</strong>
          <Icon name={open ? 'arrowUp' : 'arrowDown'} size={14} />
        </button>
        )}
        {hidden && <span className="at-bar__hidden">Oculta</span>}
        <span className="at-bar__sp" />
        <button className="at-bar__btn" onClick={() => toggleHidden(sectionId)} aria-label={hidden ? 'Mostrar sección' : 'Ocultar sección'} title={hidden ? 'Mostrar sección' : 'Ocultar sección (ej. fuera de temporada)'}>
          <Icon name={hidden ? 'eyeOff' : 'eye'} size={16} />
        </button>
        <button className="at-bar__btn" onClick={() => onMove(-1)} disabled={isFirst} aria-label="Subir sección"><Icon name="arrowUp" size={16} /></button>
        <button className="at-bar__btn" onClick={() => onMove(1)} disabled={isLast} aria-label="Bajar sección"><Icon name="arrowDown" size={16} /></button>
        {custom && (
          <>
            <button className="at-bar__btn" onClick={() => { setDraft(custom); setEditing(e => !e) }} aria-label="Editar títulos"><Icon name="edit" size={16} /></button>
            <button
              className="at-bar__btn at-bar__btn--danger"
              onClick={() => { if (window.confirm('¿Eliminar esta sección? Los productos no se borran.')) removeSection(sectionId) }}
              aria-label="Eliminar sección"
            >
              <Icon name="trash" size={16} />
            </button>
          </>
        )}
      </div>

      {open && (
        <div className="at-panel">
          <StylePicker value={style} onChange={(id) => setLayout(sectionId, id)} />
          <p className="at-hint">{LAYOUTS[style]?.hint}</p>
        </div>
      )}

      {editing && custom && (
        <form
          className="at-panel at-form"
          onSubmit={e => { e.preventDefault(); updateSection(sectionId, draft); setEditing(false) }}
        >
          <SectionFields draft={draft} setDraft={setDraft} />
          <button className="btn btn--primary" type="submit">Guardar títulos</button>
        </form>
      )}
    </div>
  )
}

function SectionFields({ draft, setDraft }) {
  const f = (k) => ({ value: draft[k] || '', onChange: e => setDraft(d => ({ ...d, [k]: e.target.value })) })
  return (
    <div className="at-fields">
      <label><span>Título</span><input {...f('title')} placeholder="Ej: Detalles para" required /></label>
      <label><span>Palabra destacada (caligráfica)</span><input {...f('emphasis')} placeholder="Ej: mamá" /></label>
      <label><span>Texto pequeño arriba</span><input {...f('eyebrow')} placeholder="Ej: Nueva colección" /></label>
      <label><span>Descripción</span><input {...f('subtitle')} placeholder="Ej: Regalos llenos de amor para ella." /></label>
    </div>
  )
}

/* Tarjeta para crear una sección nueva */
export function NewSection() {
  const { addSection } = useSettingsCtx()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({ style: 'mosaico' })
  const [saving, setSaving] = useState(false)

  return (
    <section className="container at-new">
      {!open ? (
        <button className="at-new__open" onClick={() => setOpen(true)}>
          <Icon name="plus" size={22} />
          <span><strong>Nueva sección</strong><small>Crea una colección y elige cómo se ven sus fotos</small></span>
        </button>
      ) : (
        <form
          className="at-panel at-form"
          onSubmit={async e => {
            e.preventDefault()
            setSaving(true)
            try {
              await addSection(draft)
              setDraft({ style: 'mosaico' }); setOpen(false)
            } catch { alert('No se pudo crear la sección.') }
            finally { setSaving(false) }
          }}
        >
          <h3 className="display at-form__title">Nueva <em>sección</em></h3>
          <SectionFields draft={draft} setDraft={setDraft} />
          <p className="at-label">Estilo de las fotos</p>
          <StylePicker value={draft.style} onChange={(id) => setDraft(d => ({ ...d, style: id }))} />
          <p className="at-hint">{LAYOUTS[draft.style]?.hint}</p>
          <div className="at-form__actions">
            <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Creando…' : 'Crear sección'}</button>
          </div>
        </form>
      )}
    </section>
  )
}

/* Gestor de fotos de un producto */
export function PhotoManager() {
  const { photosFor, closePhotos } = useUI()
  const { products, addImages, removeImage, setCover } = useProductsCtx()
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)
  const p = products.find(x => x.id === photosFor)

  useEffect(() => {
    if (!photosFor) return
    const onKey = (e) => { if (e.key === 'Escape') closePhotos() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photosFor, closePhotos])

  if (!p) return null
  const imgs = getImages(p)

  const upload = async (files) => {
    if (!files?.length) return
    setBusy(true)
    try { await addImages(p.id, files) }
    catch { alert('Error subiendo las fotos. Intenta de nuevo.') }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = '' }
  }

  return (
    <div className="at-modal" onClick={closePhotos} role="presentation">
      <div className="at-modal__card" role="dialog" aria-modal="true" aria-labelledby="pm-title" onClick={e => e.stopPropagation()}>
        <header className="at-modal__head">
          <div>
            <p className="eyebrow">Fotos del producto</p>
            <h2 id="pm-title" className="display at-modal__title">{p.name}</h2>
          </div>
          <button className="at-modal__close" onClick={closePhotos} aria-label="Cerrar"><Icon name="close" /></button>
        </header>

        <p className="at-hint">La primera es la <strong>portada</strong>. Las demás se ven al deslizar en el detalle y en las historias. Sube varias a la vez.</p>

        <div className="at-photos">
          {imgs.map((url, i) => (
            <figure key={url} className={`at-photo ${i === 0 ? 'is-cover' : ''}`}>
              <img src={optimizeImg(url, 300)} alt="" />
              {i === 0 ? (
                <span className="at-photo__tag">Portada</span>
              ) : (
                <div className="at-photo__actions">
                  <button onClick={() => setCover(p.id, url)}>Hacer portada</button>
                  <button className="danger" onClick={() => { if (window.confirm('¿Quitar esta foto?')) removeImage(p.id, url) }} aria-label="Quitar foto"><Icon name="trash" size={15} /></button>
                </div>
              )}
            </figure>
          ))}
          <button className="at-photo at-photo--add" onClick={() => fileRef.current?.click()} disabled={busy}>
            <Icon name="upload" size={26} />
            <span>{busy ? 'Subiendo…' : 'Agregar fotos'}</span>
          </button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => upload(e.target.files)} />
      </div>
    </div>
  )
}

/* Selector de secciones de un producto (puede estar en varias) */
export function SectionsPicker() {
  const { sectionsFor, closeSectionsPicker } = useUI()
  const { products, setSections, updateField } = useProductsCtx()
  const { sections } = useCatalog()
  const p = products.find(x => x.id === sectionsFor)
  const [sel, setSel] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (p) setSel(productSections(p)) }, [sectionsFor]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) return null
  const options = sections.filter(s => !s.special)
  const toggle = (id) => setSel(cur => cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id])

  const saveIt = async () => {
    if (sel.length === 0) { alert('Elige al menos una sección.'); return }
    setSaving(true)
    try { await setSections(p.id, sel); closeSectionsPicker() }
    catch { alert('No se pudo guardar. Intenta de nuevo.') }
    finally { setSaving(false) }
  }

  return (
    <div className="at-modal" onClick={closeSectionsPicker} role="presentation">
      <div className="at-modal__card" role="dialog" aria-modal="true" aria-labelledby="sp-title" onClick={e => e.stopPropagation()}>
        <header className="at-modal__head">
          <div>
            <p className="eyebrow">¿Dónde aparece?</p>
            <h2 id="sp-title" className="display at-modal__title">{p.name}</h2>
          </div>
          <button className="at-modal__close" onClick={closeSectionsPicker} aria-label="Cerrar"><Icon name="close" /></button>
        </header>
        <p className="at-hint">Marca todas las secciones donde quieres mostrar este producto. Por ejemplo, el Cuadro Spotify puede ir en Destacados, Para parejas y Personalizados.</p>
        <div className="at-checks">
          {options.map(s => (
            <label key={s.id} className={`at-check ${sel.includes(s.id) ? 'is-on' : ''}`}>
              <input type="checkbox" checked={sel.includes(s.id)} onChange={() => toggle(s.id)} />
              <span className="at-check__emoji" aria-hidden="true">{s.emoji}</span>
              <span>{s.name}</span>
              {s.hidden && <small>oculta</small>}
            </label>
          ))}
        </div>
        <label className={`at-check at-check--feat ${p.featured ? 'is-on' : ''}`}>
          <input
            type="checkbox"
            checked={!!p.featured}
            onChange={async () => {
              try {
                if (!p.featured) {
                  for (const o of products.filter(x => x.featured && x.id !== p.id)) await updateField(o.id, 'featured', false)
                }
                await updateField(p.id, 'featured', !p.featured)
              } catch { alert('No se pudo guardar.') }
            }}
          />
          <span className="at-check__emoji" aria-hidden="true">★</span>
          <span>Mostrar como <strong>pieza destacada grande</strong> (solo una)</span>
        </label>
        <div className="at-form__actions">
          <button className="btn btn--ghost" onClick={closeSectionsPicker}>Cancelar</button>
          <button className="btn btn--primary" onClick={saveIt} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  )
}
