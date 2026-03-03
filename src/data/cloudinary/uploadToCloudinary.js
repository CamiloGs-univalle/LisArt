// src/data/cloudinary/uploadToCloudinary.js
const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const uploadToCloudinary = async (file) => {
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)
  form.append('folder', 'lisart')

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form }
  )
  if (!res.ok) throw new Error(`Cloudinary HTTP ${res.status}`)
  const data = await res.json()
  if (!data.secure_url) throw new Error('Sin URL de Cloudinary')
  return data.secure_url
}