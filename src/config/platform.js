// ─────────────────────────────────────────────────────────────
// Configuración general de la plataforma de catálogos
// (se puede sobrescribir con variables de entorno en Vercel)
// ─────────────────────────────────────────────────────────────
export const PLATFORM = {
  name: import.meta.env.VITE_PLATFORM_NAME || 'Catálogos Pro',
  // Catálogo que se muestra en la raíz del sitio (tusitio.com/)
  defaultTenant: import.meta.env.VITE_DEFAULT_TENANT ?? 'lisart',
  // Correos con permiso de super administrador (debe coincidir con firestore.rules)
  superAdmins: (import.meta.env.VITE_SUPERADMIN_EMAILS || 'camilo13369@gmail.com')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
}
