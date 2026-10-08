// Firebase Admin (SOLO en el servidor de Vercel, nunca en el navegador).
// Necesita la variable FIREBASE_SERVICE_ACCOUNT con el JSON de la cuenta de servicio
// (Firebase → Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada).
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { readFileSync } from 'node:fs'

function readServiceAccount() {
  // En local también se puede indicar la ruta del archivo .json
  const file = process.env.FIREBASE_SERVICE_ACCOUNT_FILE
  if (!process.env.FIREBASE_SERVICE_ACCOUNT && file) {
    let text
    try { text = readFileSync(file, 'utf8') } catch {
      throw httpError(500, `No se encontró el archivo de la llave en "${file}". Revisa la ruta en .env.local (usa / en vez de \\).`)
    }
    return parseKey(text, 'el archivo de la llave')
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw httpError(500, 'Falta la llave de Firebase Admin (variable FIREBASE_SERVICE_ACCOUNT).')
  // Se acepta el JSON tal cual o codificado en base64
  const text = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
  return parseKey(text, 'FIREBASE_SERVICE_ACCOUNT')
}

function parseKey(text, where) {
  let key
  try { key = JSON.parse(text.replace(/^\uFEFF/, '')) } catch {
    throw httpError(500, `El contenido de ${where} no es un JSON válido. Pega el archivo completo, desde { hasta }.`)
  }
  if (key.type !== 'service_account' || !key.private_key || !key.client_email) {
    throw httpError(500, `${where} no parece una llave de cuenta de servicio de Firebase.`)
  }
  const expected = process.env.VITE_FIREBASE_PROJECT_ID
  if (expected && key.project_id !== expected) {
    throw httpError(500, `La llave es del proyecto "${key.project_id}" pero la app usa "${expected}". Genera la llave en el proyecto correcto.`)
  }
  return key
}

export function adminAuth() {
  if (!getApps().length) {
    const key = readServiceAccount()
    try { initializeApp({ credential: cert(key) }) } catch (e) {
      throw httpError(500, `La llave de Firebase Admin no es válida: ${e.message}`)
    }
  }
  return getAuth()
}

export const superEmails = () =>
  (process.env.SUPERADMIN_EMAILS || process.env.VITE_SUPERADMIN_EMAILS || 'camilo13369@gmail.com')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

// Verifica que quien llama sea el super administrador (token de Firebase)
export async function requireSuper(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) throw httpError(401, 'Inicia sesión de nuevo.')
  const auth = adminAuth() // si falta la llave, el error se informa tal cual
  let decoded
  try { decoded = await auth.verifyIdToken(token) } catch (e) {
    const code = e?.errorInfo?.code || e?.code || ''
    if (code === 'auth/argument-error' && /aud|audience|project/i.test(e.message)) {
      throw httpError(500, 'La llave de Firebase Admin es de otro proyecto distinto al de la app.')
    }
    if (/credential|certificate|private key|PEM/i.test(e.message || '')) throw httpError(500, `Problema con la llave de Firebase Admin: ${e.message}`)
    throw httpError(401, 'Tu sesión venció. Cierra sesión y vuelve a entrar.')
  }
  if (!decoded.email_verified || !superEmails().includes((decoded.email || '').toLowerCase())) {
    throw httpError(403, 'Solo el super administrador puede hacer esto.')
  }
  return decoded
}

export function httpError(status, message) {
  const e = new Error(message)
  e.status = status
  return e
}
