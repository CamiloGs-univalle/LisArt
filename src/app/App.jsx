// Punto de entrada de la aplicación: sesión + rutas
import { lazy, Suspense, useEffect } from 'react'
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider'
import { useRoute } from './router'
import StatusScreen from '@/shared/ui/StatusScreen'
import ErrorBoundary from '@/shared/ui/ErrorBoundary'

// Las páginas de administración se cargan solo cuando se necesitan,
// así el catálogo abre más rápido para los clientes. El portafolio y el
// catálogo también van en archivos separados: cada visitante baja solo lo suyo.
const CatalogPage = lazy(() => import('@/features/catalog/CatalogPage'))
const PortfolioPage = lazy(() => import('@/features/portfolio/PortfolioPage'))
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const SuperAdminPage = lazy(() => import('@/features/superadmin/SuperAdminPage'))

// Fuentes por defecto solo para las pantallas que no cargan las suyas
// (el portafolio y cada catálogo traen sus propias fuentes).
const BASE_FONTS = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..600&family=Manrope:wght@400..800&display=swap'
function useBaseFonts(on) {
  useEffect(() => {
    if (!on || document.getElementById('base-fonts')) return
    document.head.appendChild(Object.assign(document.createElement('link'), { id: 'base-fonts', rel: 'stylesheet', href: BASE_FONTS }))
  }, [on])
}

function Routes() {
  const route = useRoute()
  useBaseFonts(route.name === 'login' || route.name === 'super')
  const { isSuper, loading } = useAuth()
  switch (route.name) {
    case 'login': return <LoginPage />
    // El panel de super administrador ni siquiera se descarga si la cuenta no lo es
    case 'super': return loading ? <StatusScreen loading /> : isSuper ? <SuperAdminPage /> : <LoginPage />
    case 'catalog': return <CatalogPage slug={route.slug} />
    default: return <PortfolioPage />
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<StatusScreen loading />}>
          <Routes />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  )
}
