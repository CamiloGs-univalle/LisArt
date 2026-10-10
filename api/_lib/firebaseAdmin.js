// ─────────────────────────────────────────────────────────────
// Acceso de administrador a Firebase Authentication, SIN librerías externas
// (solo node:crypto + fetch). Así no hay dependencias vulnerables ni
// problemas de compatibilidad en Vercel.
//
//   · verifyIdToken  → valida la sesión de quien llama (token de Firebase)
//   · accessToken    → token de Google firmado con la cuenta de servicio
//   · setPasswordByEmail → cambia la contraseña y cierra sesiones abiertas
//
// La llave viene de FIREBASE_SERVICE_ACCOUNT (JSON o base64) en Vercel,
// o de FIREBASE_SERVICE_ACCOUNT_FILE (ruta al .json) en local.
// ─────────────────────────────────────────────────────────────
import { createSign, createVerify, createPrivateKey } from 'node:crypto'
import { readFileSync } from 'node:fs'

export function httpError(status, message) {
  const e = new Error(message)
  e.status = status
  return e
}

export const superEmails = () =>
  (process.env.SUPERADMIN_EMAILS || process.env.VITE_SUPERADMIN_EMAILS || 'camilo13369@gmail.com')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

/* ── Llave de la cuenta de servicio ───────────────────────── */
let cachedKey = null

export function serviceAccount() {
  if (cachedKey) return cachedKey
  const file = process.env.FIREBASE_SERVICE_ACCOUNT_FILE
  let text, where
  if (!process.env.FIREBASE_SERVICE_ACCOUNT && file) {
    where = 'el archivo de la llave'
    try { text = readFileSync(file, 'utf8') } catch {
      throw httpError(500, `No se encontró el archivo de la llave en "${file}". Revisa la ruta en .env.local (usa / en vez de \\).`)
    }
  } else {
    where = 'FIREBASE_SERVICE_ACCOUNT'
    const raw = (process.env.FIREBASE_SERVICE_ACCOUNT || '').trim()
    if (!raw) throw httpError(500, 'Falta la llave de Firebase Admin: crea la variable FIREBASE_SERVICE_ACCOUNT (en Production) y vuelve a desplegar.')
    text = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
  }

  let key
  try { key = JSON.parse(text.replace(/^\uFEFF/, '')) } catch {
    throw httpError(500, `El contenido de ${where} no es un JSON válido. Pega el archivo completo, desde { hasta }.`)
  }
  if (key.type !== 'service_account' || !key.private_key || !key.client_email || !key.project_id) {
    throw httpError(500, `${where} no parece una llave de cuenta de servicio de Firebase.`)
  }
  const expected = process.env.VITE_FIREBASE_PROJECT_ID
  if (expected && key.project_id !== expected) {
    throw httpError(500, `La llave es del proyecto "${key.project_id}" pero la app usa "${expected}". Genera la llave en el proyecto correcto.`)
  }
  try { createPrivateKey(key.private_key) } catch {
    throw httpError(500, `La clave privada dentro de ${where} está dañada. Vuelve a copiar el archivo completo.`)
  }
  cachedKey = key
  return key
}

/* ── Utilidades JWT ───────────────────────────────────────── */
const b64url = (input) => Buffer.from(input).toString('base64url')
const fromB64url = (s) => Buffer.from(s, 'base64url')
const nowSec = () => Math.floor(Date.now() / 1000)

/* ── Token de acceso de Google (OAuth 2 con la cuenta de servicio) ── */
let cachedToken = { value: '', exp: 0 }

export async function accessToken() {
  if (cachedToken.value && cachedToken.exp - 60 > nowSec()) return cachedToken.value
  const key = serviceAccount()
  const iat = nowSec()
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: key.private_key_id }))
  const claims = b64url(JSON.stringify({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/cloud-platform',
    aud: key.token_uri || 'https://oauth2.googleapis.com/token',
    iat,
    exp: iat + 3600,
  }))
  const signature = createSign('RSA-SHA256').update(`${header}.${claims}`).sign(key.private_key, 'base64url')

  const res = await fetch(key.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${signature}`,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.access_token) {
    const reason = data.error_description || data.error || res.status
    throw httpError(500, `Google rechazó la llave de la cuenta de servicio (${reason}). Puede que la hayas eliminado: genera una nueva.`)
  }
  cachedToken = { value: data.access_token, exp: iat + (data.expires_in || 3600) }
  return cachedToken.value
}

/* ── Verificación del token de sesión de Firebase ─────────── */
const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
let cachedCerts = { value: null, exp: 0 }

async function googleCerts() {
  if (cachedCerts.value && cachedCerts.exp > Date.now()) return cachedCerts.value
  const res = await fetch(CERTS_URL)
  if (!res.ok) throw httpError(503, 'No se pudo validar la sesión (Google no respondió). Intenta de nuevo.')
  const maxAge = Number((res.headers.get('cache-control') || '').match(/max-age=(\d+)/)?.[1] || 3600)
  cachedCerts = { value: await res.json(), exp: Date.now() + maxAge * 1000 }
  return cachedCerts.value
}

export async function verifyIdToken(token) {
  const projectId = serviceAccount().project_id
  const parts = String(token).split('.')
  if (parts.length !== 3) throw httpError(401, 'Sesión inválida. Inicia sesión de nuevo.')
  let header, payload
  try {
    header = JSON.parse(fromB64url(parts[0]).toString('utf8'))
    payload = JSON.parse(fromB64url(parts[1]).toString('utf8'))
  } catch { throw httpError(401, 'Sesión inválida. Inicia sesión de nuevo.') }

  if (header.alg !== 'RS256' || !header.kid) throw httpError(401, 'Sesión inválida. Inicia sesión de nuevo.')
  const certs = await googleCerts()
  const cert = certs[header.kid]
  if (!cert) throw httpError(401, 'Tu sesión venció. Cierra sesión y vuelve a entrar.')
  const valid = createVerify('RSA-SHA256').update(`${parts[0]}.${parts[1]}`).verify(cert, fromB64url(parts[2]))
  if (!valid) throw httpError(401, 'Sesión inválida. Inicia sesión de nuevo.')

  const now = nowSec()
  if (payload.aud !== projectId || payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw httpError(401, 'La sesión es de otro proyecto de Firebase. Revisa que la llave y la app sean del mismo proyecto.')
  }
  if (typeof payload.exp !== 'number' || payload.exp <= now) throw httpError(401, 'Tu sesión venció. Cierra sesión y vuelve a entrar.')
  if (typeof payload.iat !== 'number' || payload.iat > now + 300) throw httpError(401, 'Sesión inválida. Revisa la hora de tu computador.')
  if (!payload.sub || typeof payload.sub !== 'string') throw httpError(401, 'Sesión inválida. Inicia sesión de nuevo.')
  return { ...payload, uid: payload.sub }
}

// Verifica que quien llama sea el super administrador
export async function requireSuper(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) throw httpError(401, 'Inicia sesión de nuevo.')
  serviceAccount() // si falta o está mal la llave, se informa primero
  const decoded = await verifyIdToken(token)
  if (decoded.email_verified !== true || !superEmails().includes(String(decoded.email || '').toLowerCase())) {
    throw httpError(403, 'Solo el super administrador puede hacer esto.')
  }
  return decoded
}

/* ── Firebase Authentication (Identity Toolkit) ───────────── */
async function identityToolkit(action, body) {
  const projectId = serviceAccount().project_id
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await accessToken()}` },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error?.message || `HTTP ${res.status}`
    if (/PERMISSION_DENIED|insufficient/i.test(msg)) throw httpError(500, 'La cuenta de servicio no tiene permiso sobre Authentication.')
    if (/WEAK_PASSWORD/.test(msg)) throw httpError(400, 'La contraseña es muy débil.')
    throw httpError(500, `Firebase respondió: ${msg}`)
  }
  return data
}

// Cambia la contraseña y cierra todas las sesiones abiertas de esa cuenta
export async function setPasswordByEmail(email, password) {
  const found = await identityToolkit('lookup', { email: [email] })
  const user = found.users?.[0]
  if (!user) throw httpError(404, 'No existe una cuenta con ese correo en Firebase Authentication.')
  await identityToolkit('update', { localId: user.localId, password, validSince: String(nowSec()) })
  return user.localId
}
