// Configuración de la página de un negocio (estilos, secciones, textos)
import { P } from './paths'
import { watchDoc, writeDoc } from './repo'

export const EMPTY_SETTINGS = { announcement: '', layouts: {}, sections: [], order: [], hidden: [], content: {} }

export const watchSettings = (tenantId, cb, onError) =>
  watchDoc(P.settings(tenantId), (d) => cb({ ...EMPTY_SETTINGS, ...(d || {}) }), onError)

// Guarda solo los campos enviados (merge)
export const saveSettings = (tenantId, patch) => writeDoc(P.settings(tenantId), patch, { merge: true })
