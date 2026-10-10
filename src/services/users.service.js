// Perfiles de usuario: rol y negocio asignado
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { withSecondaryAuth } from '@/lib/firebase'
import { P } from './paths'
import { watchDoc, writeDoc, now } from './repo'
import { isDemo } from './demo'

export const ROLES = { SUPER: 'superadmin', OWNER: 'owner' }

export const watchUserProfile = (uid, cb, onError) => watchDoc(P.user(uid), cb, onError)

// Crea la cuenta del dueño de un negocio SIN cerrar la sesión del super administrador
export async function createOwnerAccount({ email, password, tenantId, name }) {
  let uid
  if (isDemo()) {
    uid = `demo-${Date.now()}`
  } else {
    uid = await withSecondaryAuth(async (secondaryAuth) => {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)
      await signOut(secondaryAuth)
      return cred.user.uid
    })
  }
  await writeDoc(P.user(uid), { email, name: name || '', role: ROLES.OWNER, tenantId, createdAt: now() }, { merge: false })
  return uid
}

export const ensureSuperProfile = (uid, email) =>
  writeDoc(P.user(uid), { email, role: ROLES.SUPER }, { merge: true })

// Vincula una cuenta existente (creada desde el servidor) como dueña de un negocio
export const linkOwnerProfile = ({ uid, email, tenantId, name }) =>
  writeDoc(P.user(uid), { email, name: name || '', role: ROLES.OWNER, tenantId, createdAt: now() }, { merge: true })
