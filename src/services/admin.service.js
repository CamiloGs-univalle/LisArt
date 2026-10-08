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
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || (res.status === 404 ? 'El servidor no está disponible. Reinicia "npm run dev".' : 'No se pudo completar.'))
  return data
}

// Cambia la contraseña de un dueño de catálogo y cierra sus sesiones abiertas
export const setUserPassword = (email, password) => callAdmin('set-password', { email, password })
