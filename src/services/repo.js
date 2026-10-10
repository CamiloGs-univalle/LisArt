// ─────────────────────────────────────────────────────────────
// Capa de acceso a datos (Firestore).
// Los servicios usan SOLO estas funciones; así la app no depende
// directamente de Firestore y es fácil de probar (modo demo).
// Todas las lecturas son EN TIEMPO REAL: si alguien edita desde
// otro dispositivo, todos ven el cambio al instante.
// ─────────────────────────────────────────────────────────────
import {
  doc, collection, onSnapshot, getDoc, getDocs, setDoc, updateDoc, addDoc, deleteDoc,
  serverTimestamp, runTransaction, writeBatch, query, where, limit,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { demo, isDemo } from './demo'

const toObj = (snap) => (snap.exists() ? { id: snap.id, ...snap.data() } : null)

export const now = () => (isDemo() ? new Date().toISOString() : serverTimestamp())

// Suscripción a un documento. Devuelve la función para cancelar.
export function watchDoc(path, onData, onError) {
  if (isDemo()) return demo.watchDoc(path, onData)
  return onSnapshot(doc(db, path), (s) => onData(toObj(s)), onError)
}

// Suscripción a una colección completa
export function watchCollection(path, onData, onError) {
  if (isDemo()) return demo.watchCollection(path, onData)
  return onSnapshot(collection(db, path), (q) => onData(q.docs.map(d => ({ id: d.id, ...d.data() }))), onError)
}

// `source` permite leer de otra base de datos (ej. el proyecto anterior al migrar)
export async function readDoc(path, source = db) {
  if (isDemo()) return demo.read(path)
  return toObj(await getDoc(doc(source, path)))
}

export async function readCollection(path, source = db) {
  if (isDemo()) return demo.list(path)
  const q = await getDocs(collection(source, path))
  return q.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Busca documentos de una colección donde campo == valor
export async function findWhere(path, field, value, max = 1) {
  if (isDemo()) return demo.list(path).filter(d => d[field] === value).slice(0, max)
  const q = await getDocs(query(collection(db, path), where(field, '==', value), limit(max)))
  return q.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function writeDoc(path, data, { merge = true } = {}) {
  if (isDemo()) return demo.write(path, data, merge)
  return setDoc(doc(db, path), data, { merge })
}

export async function patchDoc(path, data) {
  if (isDemo()) return demo.write(path, data, true)
  return updateDoc(doc(db, path), data)
}

export async function addToCollection(path, data) {
  if (isDemo()) return demo.add(path, data)
  const ref = await addDoc(collection(db, path), data)
  return ref.id
}

export async function removeDoc(path) {
  if (isDemo()) return demo.remove(path)
  return deleteDoc(doc(db, path))
}

// Crea un documento solo si NO existe (evita sobrescribir)
export async function createDocIfMissing(path, data) {
  if (isDemo()) {
    if (demo.read(path)) throw new Error('exists')
    return demo.write(path, data, false)
  }
  return runTransaction(db, async (tx) => {
    const ref = doc(db, path)
    const snap = await tx.get(ref)
    if (snap.exists()) throw new Error('exists')
    tx.set(ref, data)
  })
}

// Escritura de muchos documentos de una vez (máx. 450 por lote)
export async function writeMany(entries) {
  if (isDemo()) { entries.forEach(([p, d]) => demo.write(p, d, true)); return }
  for (let i = 0; i < entries.length; i += 450) {
    const batch = writeBatch(db)
    entries.slice(i, i + 450).forEach(([p, d]) => batch.set(doc(db, p), d, { merge: true }))
    await batch.commit()
  }
}
