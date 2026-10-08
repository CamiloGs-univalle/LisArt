// ─────────────────────────────────────────────────────────────
// Estructura de la base de datos (Firestore)
//
//   tenants/{negocio}                    → datos del negocio (nombre, logo, tema, WhatsApp…)
//   tenants/{negocio}/products/{id}      → productos del catálogo
//   tenants/{negocio}/settings/home      → estilos, secciones, textos editados, anuncio
//   users/{uid}                          → rol de cada cuenta (superadmin | owner) y su negocio
//   tickets/{id}                         → solicitudes de ayuda para el super admin (ej. olvidé mi contraseña)
//
// "negocio" es el identificador de la URL: tusitio.com/lisart → "lisart"
// ─────────────────────────────────────────────────────────────
export const P = {
  tenants: () => 'tenants',
  tenant: (t) => `tenants/${t}`,
  products: (t) => `tenants/${t}/products`,
  product: (t, id) => `tenants/${t}/products/${id}`,
  settings: (t) => `tenants/${t}/settings/home`,
  users: () => 'users',
  tickets: () => 'tickets',
  ticket: (id) => `tickets/${id}`,
  user: (uid) => `users/${uid}`,
  // Datos de la primera versión (antes de multi-negocio)
  legacyProducts: () => 'products',
  legacySettings: () => 'settings/home',
}
