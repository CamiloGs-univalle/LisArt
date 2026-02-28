import { useState, useEffect, useRef } from 'react'
import { useAdmin } from '../../admin/AdminContext'

function EditableImage({
    id,
    defaultImage,
    alt,
    className,
    containerClassName
}) {

    // 🔐 Saber si estamos en modo admin
    const { isAdmin } = useAdmin()

    // 🖼 Estado de la imagen actual
    const [image, setImage] = useState(defaultImage)

    // 🖱 Estado para mostrar overlay cuando pasa el mouse
    const [isHovering, setIsHovering] = useState(false)

    // 📁 Referencia al input file oculto
    const fileInputRef = useRef(null)

    // 🔑 Clave única para guardar la URL en localStorage
    const storageKey = `lisart_image_${id}`


    // 🚀 Al montar el componente:
    // revisa si ya hay una URL guardada en localStorage
    useEffect(() => {
        const saved = localStorage.getItem(storageKey)
        if (saved) setImage(saved)
    }, [storageKey])


    // ☁️ Subida REAL a Cloudinary
    const handleFile = async (file) => {

        // ❌ Si no es imagen, salir
        if (!file || !file.type.startsWith('image/')) return

        try {

            // 📦 Crear FormData para enviar archivo
            const formData = new FormData()
            formData.append("file", file)
            formData.append("upload_preset", "LisArt-creaciones")

            // 🌍 Petición a Cloudinary
            const response = await fetch(
                "https://api.cloudinary.com/v1_1/dc4dxizcq/image/upload",
                {
                    method: "POST",
                    body: formData
                }
            )

            // 📥 Convertir respuesta a JSON
            const data = await response.json()

            // ✅ Si se subió correctamente
            if (data.secure_url) {

                console.log("Imagen subida:", data.secure_url)

                // 💾 Guardar SOLO la URL (no base64)
                localStorage.setItem(storageKey, data.secure_url)

                // 🖼 Actualizar imagen en pantalla
                setImage(data.secure_url)

            } else {
                console.error("Error en subida:", data)
            }

        } catch (error) {
            console.error("Error:", error)
        }
    }


    // 🖱 Cuando admin hace click → abre selector
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

            {/* 🖼 Imagen */}
            <img src={image} alt={alt} className={className} />

            {/* ✏️ Overlay solo visible en modo admin */}
            {isAdmin && isHovering && (
                <div className="editable-overlay">
                    <span>📷 Cambiar imagen</span>
                </div>
            )}

            {/* 📁 Input oculto solo para admin */}
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