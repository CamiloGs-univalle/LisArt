// Texto editable de la página (no de productos).
// Clientes: ven el texto normal.
// Administradora: lo ve con línea punteada; toca → escribe → Enter (o tocar fuera) guarda.
//
// path: dónde se guarda dentro de settings/home.content, ej. "hero.titleStart",
//       "faq.2.q", "sec.parejas.title". fallback: texto por defecto.
import { useEffect, useRef, useState } from 'react'
import { useAdmin } from '../admin/AdminContext'
import { useSettingsCtx } from '../../contexts/SettingsContext'
import { DEFAULT_CONTENT } from '../../hooks/useSiteContent'

const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)))

export const getPath = (obj, path) =>
  path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)

// Devuelve una copia de content con el valor cambiado en "path".
// Si la parte de arriba no existe aún (ej. "faq"), parte de los textos por defecto.
export const setPath = (content, path, value) => {
  const next = clone(content || {}) || {}
  const keys = path.split('.')
  if (next[keys[0]] === undefined && DEFAULT_CONTENT[keys[0]] !== undefined) {
    next[keys[0]] = clone(DEFAULT_CONTENT[keys[0]])
  }
  let o = next
  keys.slice(0, -1).forEach((k, i) => {
    if (o[k] == null || typeof o[k] !== 'object') o[k] = /^\d+$/.test(keys[i + 1]) ? [] : {}
    o = o[k]
  })
  o[keys[keys.length - 1]] = value
  return next
}

export function useEditableText() {
  const { content = {}, updateContent } = useSettingsCtx()
  const read = (path, fallback = '') => {
    const v = getPath(content, path)
    return v === undefined || v === null ? fallback : v
  }
  const write = (path, value) => updateContent(setPath(content, path, value))
  return { read, write }
}

export default function EditText({
  path,
  fallback = '',
  as: Tag = 'span',
  className = '',
  multiline = false,
  inButton = false,   // si el texto está dentro de un botón/enlace se edita con una ventanita
  placeholder = 'Escribe aquí…',
}) {
  const { isAdmin } = useAdmin()
  const { read, write } = useEditableText()
  const value = read(path, fallback)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const ref = useRef(null)

  useEffect(() => { if (!editing) setDraft(value) }, [value, editing])
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus()
      const n = ref.current.value.length
      ref.current.setSelectionRange?.(n, n)
    }
  }, [editing])

  if (!isAdmin) {
    if (value === '' || value == null) return null
    return <Tag className={className}>{value}</Tag>
  }

  const save = async (v) => {
    const clean = String(v ?? '').trim()
    setEditing(false)
    if (clean === String(value).trim()) return
    setSaving(true)
    try { await write(path, clean) }
    catch { alert('No se pudo guardar el texto. Intenta de nuevo.') }
    finally { setSaving(false) }
  }

  const start = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (inButton) {
      const v = window.prompt('Escribe el nuevo texto:', value)
      if (v !== null) save(v)
      return
    }
    setEditing(true)
  }

  if (editing) {
    const common = {
      ref,
      value: draft,
      className: `${className} edit-field`,
      placeholder,
      onChange: (e) => setDraft(e.target.value),
      onBlur: () => save(draft),
      onClick: (e) => e.stopPropagation(),
      onKeyDown: (e) => {
        if (e.key === 'Escape') { setDraft(value); setEditing(false) }
        if (e.key === 'Enter' && (!multiline || e.ctrlKey || e.metaKey)) { e.preventDefault(); save(draft) }
      },
    }
    return multiline
      ? <textarea {...common} rows={Math.min(8, Math.max(2, Math.ceil(String(draft).length / 40)))} />
      : <input {...common} type="text" size={Math.max(6, String(draft).length + 1)} />
  }

  return (
    <Tag
      className={`${className} edit-me ${saving ? 'is-saving' : ''} ${!value ? 'is-empty' : ''}`}
      onClick={start}
      title="Toca para editar"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') start(e) }}
    >
      {value || <span className="edit-ph">{placeholder}</span>}
    </Tag>
  )
}
