// src/components/common/editartexto/EditableText.jsx

import { useState, useEffect } from 'react'
import { useAdmin } from '../../admin/AdminContext'
import { db } from '../../../data/firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

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

    // 🔥 Cargar valor desde Firestore cuando el componente monta
    useEffect(() => {
        const fetchValue = async () => {
            try {
                const docRef = doc(db, 'site_content', id)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const data = docSnap.data()
                    setValue(
                        type === 'number'
                            ? Number(data.value)
                            : data.value
                    )
                } else {
                    // Si no existe el documento, lo crea con defaultValue
                    await setDoc(docRef, {
                        value: String(defaultValue)
                    })
                }
            } catch (error) {
                console.error('Error cargando texto:', error)
            }
        }

        fetchValue()
    }, [id, type, defaultValue])

    // 💾 Guardar en Firestore
    const saveValue = async () => {
        try {
            const docRef = doc(db, 'site_content', id)

            await setDoc(docRef, {
                value: String(value)
            })

            setIsEditing(false)
        } catch (error) {
            console.error('Error guardando texto:', error)
        }
    }

    const Tag = as

    // 🔐 Modo edición (solo admin)
    if (isAdmin && isEditing) {
        return (
            <input
                className={className}
                type={type}
                value={value}
                autoFocus
                onChange={(e) =>
                    setValue(
                        type === 'number'
                            ? Number(e.target.value)
                            : e.target.value
                    )
                }
                onBlur={saveValue}
                onKeyDown={(e) => e.key === 'Enter' && saveValue()}
            />
        )
    }

    // 👁 Vista normal
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