// ─────────────────────────────────────────────────────────────
// Estructura de la base de datos (Firestore)
//
//   tenants/{negocio}                    → datos del negocio (nombre, logo, tema, WhatsApp…)
//   tenants/{negocio}/products/{id}      → productos del catálogo
//   tenants/{negocio}/settings/home      → estilos, secciones, textos, anuncio y estrategias de venta (marketing)
//   tenants/{negocio}/private/business   → PRIVADO: costos de cada producto y margen deseado
//   tenants/{negocio}/sales/{id}         → PRIVADO: ventas registradas
//   tenants/{negocio}/quotes/{id}        → PRIVADO: cotizaciones
//   users/{uid}                          → rol de cada cuenta (superadmin | owner) y su negocio
//   platform/portfolio                   → contenido del portafolio (página principal)
//   platform/billing                     → precios y datos de pago de la plataforma
//   accounts/{negocio}                  → PRIVADO: correo del dueño y plan (precio, modelo, vencimiento)
//   payments/{id}                        → pagos de los planes (Wompi o registrados a mano)
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
  business: (t) => `tenants/${t}/private/business`,
  sales: (t) => `tenants/${t}/sales`,
  sale: (t, id) => `tenants/${t}/sales/${id}`,
  quotes: (t) => `tenants/${t}/quotes`,
  quote: (t, id) => `tenants/${t}/quotes/${id}`,
  users: () => 'users',
  tickets: () => 'tickets',
  portfolio: () => 'platform/portfolio',
  billingSettings: () => 'platform/billing',
  accounts: () => 'accounts',
  account: (t) => `accounts/${t}`,
  payments: () => 'payments',
  payment: (id) => `payments/${id}`,
  ticket: (id) => `tickets/${id}`,
  user: (uid) => `users/${uid}`,
  // Datos de la primera versión (antes de multi-negocio)
  legacyProducts: () => 'products',
  legacySettings: () => 'settings/home',
}
