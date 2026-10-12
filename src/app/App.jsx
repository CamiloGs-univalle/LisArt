// Punto de entrada de la aplicación: sesión + rutas
import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider'
import { useRoute } from './router'
import CatalogPage from '@/features/catalog/CatalogPage'
import PortfolioPage from '@/features/portfolio/PortfolioPage'
import StatusScreen from '@/shared/ui/StatusScreen'
import ErrorBoundary from '@/shared/ui/ErrorBoundary'

// Las páginas de administración se cargan solo cuando se necesitan,
// así el catálogo abre más rápido para los clientes.
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const SuperAdminPage = lazy(() => import('@/features/superadmin/SuperAdminPage'))

function Routes() {
  const route = useRoute()
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
