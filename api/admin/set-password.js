// POST /api/admin/set-password  { email, password }
// El super administrador cambia la contraseña de un dueño de catálogo.
// Además cierra todas las sesiones abiertas de esa cuenta.
import { adminAuth, requireSuper, superEmails, httpError } from '../_lib/firebaseAdmin.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })
  try {
    await requireSuper(req)
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    if (!email) throw httpError(400, 'Falta el correo.')
    if (password.length < 8) throw httpError(400, 'La contraseña debe tener al menos 8 caracteres.')
    if (superEmails().includes(email)) throw httpError(400, 'La contraseña del super administrador se cambia desde "¿Olvidaste tu contraseña?".')

    const auth = adminAuth()
    let user
    try { user = await auth.getUserByEmail(email) } catch (e) {
      if ((e?.errorInfo?.code || e?.code) === 'auth/user-not-found') throw httpError(404, 'No existe una cuenta con ese correo en Firebase Authentication.')
      throw e
    }
    await auth.updateUser(user.uid, { password })
    await auth.revokeRefreshTokens(user.uid)
    return res.status(200).json({ ok: true })
  } catch (e) {
    const status = e.status || 500
    if (!e.status) console.error('[set-password]', e)
    // Errores conocidos (e.status) se muestran tal cual; en desarrollo también los inesperados
    const showRaw = e.status || process.env.NODE_ENV !== 'production'
    return res.status(status).json({ error: showRaw ? (e.status ? e.message : `Error del servidor: ${e.message}`) : 'Error en el servidor. Revisa los registros (Logs) en Vercel.' })
  }
}
