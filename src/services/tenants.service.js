// Negocios (cada uno tiene su propio catálogo)
import { P } from './paths'
import { watchDoc, watchCollection, readDoc, patchDoc, createDocIfMissing, writeDoc, removeDoc, now } from './repo'

export const RESERVED_SLUGS = ['admin', 'super', 'login', 'api', 'app', 'assets', 'static', 'ayuda', 'soporte']

export const watchTenant = (slug, cb, onError) => watchDoc(P.tenant(slug), cb, onError)
export const watchAllTenants = (cb, onError) => watchCollection(P.tenants(), cb, onError)

export async function isSlugAvailable(slug) {
  if (!slug || RESERVED_SLUGS.includes(slug)) return false
  return !(await readDoc(P.tenant(slug)))
}

// Crea el negocio + su documento de configuración vacío
export async function createTenant(slug, data) {
  await createDocIfMissing(P.tenant(slug), {
    status: 'active',
    plan: 'basico',
    ...data,
    createdAt: now(),
    updatedAt: now(),
  })
  await writeDoc(P.settings(slug), { announcement: '', layouts: {}, sections: [], order: [], hidden: [], content: {} })
}

export const updateTenant = (slug, patch) => patchDoc(P.tenant(slug), { ...patch, updatedAt: now() })

// Solo se usa para deshacer un catálogo recién creado si falla la cuenta del dueño
export async function deleteTenant(slug) {
  await removeDoc(P.settings(slug)).catch(() => {})
  await removeDoc(P.tenant(slug))
}
