// Productos de un negocio
import { P } from './paths'
import { watchCollection, addToCollection, patchDoc, removeDoc, now } from './repo'

export const watchProducts = (tenantId, cb, onError) => watchCollection(P.products(tenantId), cb, onError)

export const createProduct = (tenantId, data) =>
  addToCollection(P.products(tenantId), { ...data, createdAt: now(), updatedAt: now() })

export const updateProduct = (tenantId, id, patch) =>
  patchDoc(P.product(tenantId, id), { ...patch, updatedAt: now() })

export const deleteProduct = (tenantId, id) => removeDoc(P.product(tenantId, id))
