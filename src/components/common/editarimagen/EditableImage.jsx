import { useState, useEffect, useRef } from 'react'
import { useAdmin } from '../../admin/AdminContext'

function EditableImage({
    id,
    defaultImage,
    alt,
    className,
    containerClassName
}) {
    const { isAdmin } = useAdmin()
    const [image, setImage] = useState(defaultImage)
    const [isHovering, setIsHovering] = useState(false)
    const fileInputRef = useRef(null)

    const storageKey = `lisart_image_${id}`

    useEffect(() => {
        const saved = localStorage.getItem(storageKey)
        if (saved) setImage(saved)
    }, [storageKey])

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return

        const reader = new FileReader()
        reader.onloadend = () => {
            localStorage.setItem(storageKey, reader.result)
            setImage(reader.result)
        }
        reader.readAsDataURL(file)
    }

    const handleClick = () => {
        if (!isAdmin) return
        fileInputRef.current?.click()
    }

    return (
        <div
            className={`${containerClassName || ''} ${isAdmin ? 'is-admin' : ''}`}
            onClick={handleClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <img src={image} alt={alt} className={className} />

            {isAdmin && isHovering && (
                <div className="editable-overlay">
                    <span>📷 Cambiar imagen</span>
                </div>
            )}

            {isAdmin && (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFile(e.target.files[0])}
                />
            )}
        </div>
    )
}

export default EditableImage