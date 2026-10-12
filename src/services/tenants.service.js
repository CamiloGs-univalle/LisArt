// Negocios (cada uno tiene su propio catálogo)
import { P } from './paths'
import { watchDoc, watchCollection, readDoc, patchDoc, createDocIfMissing, writeDoc, removeDoc, findWhere, fieldGone, now } from './repo'
import { publicBilling } from '@/lib/billingCore'

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

// Datos privados del negocio (correo del dueño y plan completo): solo dueño y super
export const writeAccount = (slug, data) => writeDoc(P.account(slug), { ...data, updatedAt: now() })

// Pasa el correo del dueño y el plan del documento público a accounts/{negocio}
export async function moveToAccount(tenant, account) {
  const billing = { ...(tenant.billing || {}), ...(account?.billing || {}) }
  const data = {}
  if (tenant.ownerEmail || account?.ownerEmail) data.ownerEmail = account?.ownerEmail || tenant.ownerEmail
  if (tenant.billing || account?.billing) data.billing = billing
  await writeAccount(tenant.id, data)
  const patch = { ownerEmail: fieldGone() }
  if (tenant.billing) patch.billing = publicBilling(billing)
  await patchDoc(P.tenant(tenant.id), patch)
}
// ¿Quedan datos privados en el documento público?
export const needsAccountMove = (t) => !!t.ownerEmail || Object.keys(t.billing || {}).some(k => !['paidUntil', 'trial'].includes(k))

export const updateTenant = (slug, patch) => patchDoc(P.tenant(slug), { ...patch, updatedAt: now() })

// Solo se usa para deshacer un catálogo recién creado si falla la cuenta del dueño
export async function deleteTenant(slug) {
  await removeDoc(P.settings(slug)).catch(() => {})
  await removeDoc(P.account(slug)).catch(() => {})
  await removeDoc(P.tenant(slug))
}

// Negocio cuyo dueño es esta cuenta (respaldo si el perfil no tiene negocio asignado)
export async function findTenantOwnedBy(uid) {
  const [t] = await findWhere(P.tenants(), 'ownerUid', uid)
  return t?.id || null
}
