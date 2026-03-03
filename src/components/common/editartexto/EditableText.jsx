// src/components/common/editartexto/EditableText.jsx
// Misma API de props que el original. Lógica corregida para guardar vía contexto.

import { useState } from 'react'
import { useAdmin } from '../../admin/AdminContext'
import { useProductsCtx } from '../../../contexts/ProductsContext'

function EditableText({
    id,            // conservado para compatibilidad (no se usa en Firebase)
    productId,
    field,
    defaultValue,
    className,
    as: Tag = 'span',
    type = 'text',
    format,
    mode = 'product'
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
                const val = type === 'number' ? Number(draft) : String(draft)
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
                className={className}
                type={type === 'number' ? 'number' : 'text'}
                value={draft}
                autoFocus
                disabled={saving}
                onChange={e => setDraft(e.target.value)}
                onBlur={save}
                onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
                style={{ opacity: saving ? 0.6 : 1, width: '100%', fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit', border: '1px dashed #ff69b4', borderRadius: 4, padding: '2px 4px', background: 'white' }}
            />
        )
    }

    return (
        <Tag
            className={`${className || ''} ${isAdmin ? 'editable-text' : ''}`.trim()}
            onClick={() => isAdmin && setEditing(true)}
            title={isAdmin ? '✏️ Click para editar' : undefined}
            style={isAdmin ? { cursor: 'text', outline: '1px dashed rgba(255,105,180,0.4)', borderRadius: 3 } : undefined}
        >
            {format ? format(type === 'number' ? Number(draft) : draft) : draft}
        </Tag>
    )
}

export default EditableText