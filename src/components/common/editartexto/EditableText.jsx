import { useState, useEffect } from 'react'
import { useAdmin } from '../../admin/AdminContext'

function EditableText({
    id,
    defaultValue,
    className,
    as = 'div',
    type = 'text',
    format,
}) {
    const { isAdmin } = useAdmin()
    const [value, setValue] = useState(defaultValue)
    const [isEditing, setIsEditing] = useState(false)

    const storageKey = `lisart_text_${id}`

    useEffect(() => {
        const saved = localStorage.getItem(storageKey)
        if (saved !== null) setValue(type === 'number' ? Number(saved) : saved)
    }, [storageKey, type])

    const saveValue = () => {
        localStorage.setItem(storageKey, value)
        setIsEditing(false)
    }

    const Tag = as

    if (isAdmin && isEditing) {
        return (
            <input
                className={className}
                type={type}
                value={value}
                autoFocus
                onChange={(e) =>
                    setValue(type === 'number' ? Number(e.target.value) : e.target.value)
                }
                onBlur={saveValue}
                onKeyDown={(e) => e.key === 'Enter' && saveValue()}
            />
        )
    }

    return (
        <Tag
            className={`${className} ${isAdmin ? 'editable-text' : ''}`}
            onClick={() => isAdmin && setIsEditing(true)}
        >
            {format ? format(value) : value}
        </Tag>
    )
}

export default EditableText