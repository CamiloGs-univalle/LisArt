// ─────────────────────────────────────────────────────────────
// Firebase: única instancia de la app, base de datos y autenticación.
// Las credenciales vienen de variables de entorno (.env / Vercel).
// ─────────────────────────────────────────────────────────────
import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)

// App secundaria: permite al super administrador crear cuentas nuevas
// sin cerrar su propia sesión (Firebase inicia sesión con la cuenta creada).
export async function withSecondaryAuth(fn) {
  const name = `secondary-${Date.now()}`
  const secondary = initializeApp(firebaseConfig, name)
  try {
    return await fn(getAuth(secondary))
  } finally {
    await deleteApp(secondary)
  }
}

// Proyecto de Firebase ANTERIOR (solo para copiar sus datos una vez).
// Se activa con las variables VITE_OLD_FIREBASE_*; si no existen, se usa la base actual.
const oldConfig = {
  apiKey: import.meta.env.VITE_OLD_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_OLD_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_OLD_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_OLD_FIREBASE_APP_ID,
}
export const hasLegacyProject = !!(oldConfig.projectId && oldConfig.apiKey && oldConfig.projectId !== firebaseConfig.projectId)
export const legacyProjectId = hasLegacyProject ? oldConfig.projectId : firebaseConfig.projectId
let legacy = null
export function legacyDb() {
  if (!hasLegacyProject) return db
  if (!legacy) legacy = getFirestore(initializeApp(oldConfig, 'legacy'))
  return legacy
}

export default app
