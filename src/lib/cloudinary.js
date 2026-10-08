// Subida de imágenes a Cloudinary (preset sin firma).
// Cada negocio guarda sus fotos en su propia carpeta: catalogos/<negocio>
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export async function uploadImage(file, folder = 'catalogos') {
  // En modo demo (solo desarrollo) no se sube nada: se usa una vista previa local
  if (import.meta.env.DEV && window.__DEMO__) return URL.createObjectURL(file)

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)
  form.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`Cloudinary HTTP ${res.status}`)
  const data = await res.json()
  if (!data.secure_url) throw new Error('Cloudinary no devolvió la URL')
  return data.secure_url
}

// Convierte un dataURL (ej. logo guardado en el navegador) en archivo
export function dataUrlToFile(dataUrl, name = 'imagen.png') {
  const [meta, b64] = dataUrl.split(',')
  const mime = meta.match(/:(.*?);/)?.[1] || 'image/png'
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new File([arr], name, { type: mime })
}
