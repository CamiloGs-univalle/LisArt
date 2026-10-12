// ─────────────────────────────────────────────────────────────
// Configuración general de la plataforma de catálogos
// (se puede sobrescribir con variables de entorno en Vercel)
// ─────────────────────────────────────────────────────────────
export const PLATFORM = {
  name: import.meta.env.VITE_PLATFORM_NAME || 'Catálogos Pro',
  // La raíz del sitio (tusitio.com/) muestra el portafolio del dueño de la plataforma.
  // Si se define VITE_HOME_TENANT, la raíz muestra ese catálogo en su lugar.
  homeTenant: import.meta.env.VITE_HOME_TENANT || '',
  // Catálogo que recibe los datos de la primera versión (migración única)
  legacyTenant: 'lisart',
  // Correos con permiso de super administrador (debe coincidir con firestore.rules)
  superAdmins: (import.meta.env.VITE_SUPERADMIN_EMAILS || 'camilo13369@gmail.com')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
}
