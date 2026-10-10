// POST /api/admin/set-password  { email, password }
// El super administrador cambia la contraseña de un dueño de catálogo.
// Además cierra todas las sesiones abiertas de esa cuenta.
//
// GET /api/admin/set-password → diagnóstico (sin datos secretos) para revisar la configuración.
import { requireSuper, superEmails, httpError, serviceAccount, accessToken, setPasswordByEmail } from '../_lib/firebaseAdmin.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'GET') return diagnose(res)
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })
  try {
    await requireSuper(req)
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    if (!email) throw httpError(400, 'Falta el correo.')
    if (password.length < 8) throw httpError(400, 'La contraseña debe tener al menos 8 caracteres.')
    if (superEmails().includes(email)) throw httpError(400, 'La contraseña del super administrador se cambia desde "¿Olvidaste tu contraseña?".')

    const result = await setPasswordByEmail(email, password, { createIfMissing: body.createIfMissing === true })
    return res.status(200).json({ ok: true, ...result })
  } catch (e) {
    const status = e.status || 500
    if (!e.status) console.error('[set-password]', e)
    // Errores conocidos se muestran tal cual; los inesperados solo en desarrollo
    const showRaw = e.status || process.env.NODE_ENV !== 'production'
    return res.status(status).json({
      code: e.code,
      error: showRaw ? (e.status ? e.message : `Error del servidor: ${e.message}`) : 'Error en el servidor. Revisa los registros (Logs) en Vercel.',
    })
  }
}

async function diagnose(res) {
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT || '').trim()
  const info = {
    node: process.version,
    appProject: process.env.VITE_FIREBASE_PROJECT_ID || null,
    keyPresent: !!raw || !!process.env.FIREBASE_SERVICE_ACCOUNT_FILE,
    keyLooksLikeJson: raw ? raw.startsWith('{') && raw.endsWith('}') : null,
  }
  try {
    info.keyProject = serviceAccount().project_id
    info.keyValid = true
    await accessToken()
    info.googleAccepted = true
  } catch (e) {
    info.keyValid = info.keyValid || false
    info.problem = e.message
  }
  return res.status(200).json(info)
}
