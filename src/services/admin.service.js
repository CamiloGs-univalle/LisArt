// Acciones que requieren permisos de servidor (Firebase Admin en Vercel /api)
import { auth } from '@/lib/firebase'
import { isDemo } from './demo'

async function callAdmin(path, body) {
  if (isDemo()) { await new Promise(r => setTimeout(r, 300)); return { ok: true } }
  const token = await auth.currentUser?.getIdToken()
  if (!token) throw new Error('Inicia sesión de nuevo.')
  let res
  try {
    res = await fetch(`/api/admin/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Sin conexión. Revisa tu internet.')
  }
  const text = await res.text()
  let data = {}
  try { data = text ? JSON.parse(text) : {} } catch { /* respuesta que no es JSON (ej. la función falló al arrancar) */ }
  if (!res.ok) {
    if (data.error) throw new Error(data.error)
    if (res.status === 404) throw new Error('El servidor no está disponible. Reinicia "npm run dev".')
    throw new Error(`El servidor falló (${res.status}): ${text.slice(0, 160) || 'sin detalle'}. Revisa Vercel → Logs.`)
  }
  return data
}

// Cambia la contraseña de un dueño de catálogo y cierra sus sesiones abiertas
export const setUserPassword = (email, password) => callAdmin('set-password', { email, password })
