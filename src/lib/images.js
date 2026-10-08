// Utilidades de imágenes

// Todas las fotos de un producto: portada + fotos extra (sin repetir)
export const getImages = (p) => {
  if (!p) return []
  const list = [p.image, ...(Array.isArray(p.images) ? p.images : [])].filter(Boolean)
  return [...new Set(list)]
}

// Pide a Cloudinary una versión liviana y del tamaño justo (ideal para celular).
// Si la foto no es de Cloudinary, se devuelve tal cual.
export const optimizeImg = (url, width = 800) => {
  if (!url || typeof url !== 'string') return url
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  if (/\/upload\/[^/]*(w_|q_auto|f_auto)/.test(url)) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`)
}
