// Firestore desde el servidor (API REST + cuenta de servicio). Sin dependencias.
// Las escrituras del servidor no pasan por las reglas de seguridad: solo se usan
// para cosas que el navegador no debe poder hacer (ej. confirmar un pago).
import { accessToken, serviceAccount, httpError } from './firebaseAdmin.js'

const base = () => `https://firestore.googleapis.com/v1/projects/${serviceAccount().project_id}/databases/(default)/documents`

function encode(v) {
  if (v === null || v === undefined) return { nullValue: null }
  if (typeof v === 'boolean') return { booleanValue: v }
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }
  if (typeof v === 'string') return { stringValue: v }
  if (v instanceof Date) return { timestampValue: v.toISOString() }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encode) } }
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, encode(x)])) } }
  return { stringValue: String(v) }
}

function decode(v) {
  if (!v) return null
  if ('nullValue' in v) return null
  if ('booleanValue' in v) return v.booleanValue
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue' in v) return v.doubleValue
  if ('stringValue' in v) return v.stringValue
  if ('timestampValue' in v) return v.timestampValue
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decode)
  if ('mapValue' in v) return decodeFields(v.mapValue.fields || {})
  return null
}
const decodeFields = (f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, decode(v)]))

async function call(url, opts = {}) {
  const res = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await accessToken()}`, ...(opts.headers || {}) } })
  if (res.status === 404) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = httpError(500, `Firestore: ${data?.error?.message || res.status}`)
    if (data?.error?.status === 'FAILED_PRECONDITION' || res.status === 409) err.code = 'precondition'
    throw err
  }
  return data
}

export async function getDoc(path) {
  const d = await call(`${base()}/${path}`)
  return d ? { id: path.split('/').pop(), ...decodeFields(d.fields || {}), _updateTime: d.updateTime } : null
}

// Crea o actualiza SOLO los campos indicados (los demás se conservan).
// updateTime: solo escribe si el documento no cambió desde que se leyó.
export async function setFields(path, data, { updateTime } = {}) {
  let mask = Object.keys(data).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&')
  if (updateTime) mask += `&currentDocument.updateTime=${encodeURIComponent(updateTime)}`
  const body = JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, encode(v)])) })
  return call(`${base()}/${path}?${mask}`, { method: 'PATCH', body })
}

// Lista todos los documentos de una colección (paginado)
export async function listDocs(path, { max = 2000 } = {}) {
  const out = []
  let token = ''
  do {
    const d = await call(`${base()}/${path}?pageSize=300${token ? `&pageToken=${encodeURIComponent(token)}` : ''}`)
    if (!d) break
    for (const doc of d.documents || []) out.push({ id: doc.name.split('/').pop(), ...decodeFields(doc.fields || {}), _updateTime: doc.updateTime })
    token = d.nextPageToken || ''
  } while (token && out.length < max)
  return out
}
