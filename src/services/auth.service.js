// Inicio y cierre de sesión (Firebase Authentication)
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail,
  GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, sendEmailVerification,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { isDemo } from './demo'

export function watchAuth(cb) {
  if (isDemo()) { setTimeout(() => cb(window.__DEMO__.user || null), 0); return () => {} }
  return onAuthStateChanged(auth, cb)
}

export const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email.trim(), password)
export const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider())
export const logout = () => (isDemo() ? Promise.resolve() : signOut(auth))
export const resetPassword = (email) => sendPasswordResetEmail(auth, email.trim())

// Solo para crear la cuenta del super administrador la primera vez
export async function registerSuperAccount(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
  await sendEmailVerification(cred.user)
  return cred.user
}

// Mensajes de error entendibles
export function authErrorMessage(err) {
  const code = err?.code || ''
  const map = {
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
    'auth/wrong-password': 'Correo o contraseña incorrectos.',
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/invalid-email': 'El correo no es válido.',
    'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
    'auth/email-already-in-use': 'Ese correo ya tiene una cuenta.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
    'auth/network-request-failed': 'Sin conexión. Revisa tu internet.',
    'auth/operation-not-allowed': 'Este método de acceso no está activado. En Firebase → Authentication → Método de acceso, activa "Correo electrónico/contraseña" (y Google).',
    'auth/unauthorized-domain': 'Este dominio no está autorizado. En Firebase → Authentication → Configuración → Dominios autorizados, agrega el dominio de tu página.',
    'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite ventanas emergentes para este sitio.',
    'auth/cancelled-popup-request': 'Cerraste la ventana de Google antes de terminar.',
  }
  return map[code] || 'Ocurrió un error. Intenta de nuevo.'
}

// Mensaje entendible para cualquier error de Firebase (sesión o base de datos)
export function friendlyError(err, fallback = 'Ocurrió un error. Intenta de nuevo.') {
  const code = err?.code || ''
  if (code.startsWith('auth/')) return authErrorMessage(err)
  if (code === 'permission-denied' || code === 'firestore/permission-denied') {
    return 'Firestore no dio permiso. Revisa que pegaste y PUBLICASTE las reglas de firestore.rules en el proyecto correcto.'
  }
  if (code === 'unavailable') return 'Sin conexión con la base de datos. Revisa tu internet.'
  if (code === 'not-found' && /database/i.test(err?.message || '')) return 'No existe la base de datos Firestore en este proyecto. Créala en Firebase → Firestore Database.'
  if (err?.message === 'exists') return 'Ya existe un catálogo con ese enlace.'
  return fallback
}
