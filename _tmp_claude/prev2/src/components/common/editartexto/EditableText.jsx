// src/components/common/editartexto/EditableText.jsx
// Texto de producto. Para el admin: clic para editar y guarda en Firebase.

import { useState } from 'react'
import { useAdmin } from '../../admin/AdminContext'
import { useProductsCtx } from '../../../contexts/ProductsContext'

function EditableText({
  productId,
  field,
  defaultValue,
  className,
  as: Tag = 'span',
  type = 'text',
  format,
  placeholder = '',
}) {
  const { isAdmin } = useAdmin()
  const { updateField } = useProductsCtx()

  const [draft, setDraft] = useState(defaultValue)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Sincroniza si el padre actualiza el valor
  if (defaultValue !== draft && !editing) setDraft(defaultValue)

  const save = async () => {
    if (saving) return
    setSaving(true)
    try {
      if (productId && field) {
        const val = type === 'number' ? Number(draft) : String(draft ?? '')
        await updateField(productId, field, val)
      }
    } catch {
      alert('Error guardando. Intenta de nuevo.')
      setDraft(defaultValue)
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  if (isAdmin && editing) {
    return (
      <input
        className={`${className || ''} editable-input`}
        type={type === 'number' ? 'number' : 'text'}
        value={draft ?? ''}
        autoFocus
        disabled={saving}
        onClick={e => e.stopPropagation()}
        onChange={e => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
        style={{ opacity: saving ? 0.6 : 1 }}
      />
    )
  }

  const shown = format ? format(type === 'number' ? Number(draft) : draft) : draft
  if (!isAdmin && (shown === '' || shown == null)) return null

  return (
    <Tag
      className={`${className || ''} ${isAdmin ? 'editable-text' : ''}`.trim()}
      onClick={isAdmin ? (e) => { e.stopPropagation(); setEditing(true) } : undefined}
      title={isAdmin ? 'Clic para editar' : undefined}
    >
      {shown || (isAdmin ? <span style={{ opacity: .45 }}>{placeholder || `+ ${field}`}</span> : null)}
    </Tag>
  )
}

export default EditableText
