// Punto de entrada de la aplicación: sesión + rutas
import { lazy, Suspense } from 'react'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { useRoute } from './router'
import CatalogPage from '@/features/catalog/CatalogPage'
import PlatformHome from '@/features/platform/PlatformHome'
import StatusScreen from '@/shared/ui/StatusScreen'

// Las páginas de administración se cargan solo cuando se necesitan,
// así el catálogo abre más rápido para los clientes.
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const SuperAdminPage = lazy(() => import('@/features/superadmin/SuperAdminPage'))

function Routes() {
  const route = useRoute()
  switch (route.name) {
    case 'login': return <LoginPage />
    case 'super': return <SuperAdminPage />
    case 'catalog': return <CatalogPage slug={route.slug} />
    default: return <PlatformHome />
  }
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<StatusScreen loading />}>
        <Routes />
      </Suspense>
    </AuthProvider>
  )
}
