// src/components/home/HomeLisArt.jsx
import { useState, useEffect, useMemo } from 'react'
import SplashScreen from './Hearder/SplashScreen'
import Header from './Hearder/Header'
import WelcomeSection from './Hearder/WelcomeSection'
import { useAdmin } from '../admin/AdminContext'
import AdminLogin from '../admin/AdminLogin'
import AdminDashboard from '../admin/AdminDashboard'
import AdminWelcomeEditor from '../admin/AdminWelcomeEditor'
import Categories from '../Categories'
import FeaturedProduct from '../product/FeaturedProduct'
import CarouselSection from '../product/CarouselSection'
import GridSection from '../product/GridSection'
import ResultsSection from '../product/ResultsSection'
import { ProductsProvider, useProductsCtx } from '../../contexts/ProductsContext'
import { useSettingsCtx } from '../../contexts/SettingsContext'
import { useCart } from '../../contexts/CartContext'
import ListSection from '../product/List_Section'
import CartDrawer from '../cart/CartDrawer'
import SocialLinks from './Navegative/Social_links'

const matchesCategory = (p, cat) => {
  const haystack = `${p.section || ''} ${p.name || ''} ${p.category || ''}`.toLowerCase()
  if (cat === 'bouquets') return haystack.includes('bouquet')
  if (cat === 'cajas') return haystack.includes('caja')
  if (cat === 'arreglos') return haystack.includes('arreglo')
  if (cat === 'spotify') return haystack.includes('spotify')
  if (cat === 'graduacion') return haystack.includes('graduac') || haystack.includes('birrete')
  return true
}

// Componente interno para acceder al contexto ya montado
function HomeContent() {
  const [showSplash, setShowSplash] = useState(true)
  const [activeCategory, setActiveCategory] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { isAdmin, authLoading, logout } = useAdmin()
  const { loading, error, products, getBySection, getFeatured } = useProductsCtx()
  const { announcement } = useSettingsCtx()
  const { count } = useCart()

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2200)
    return () => clearTimeout(t)
  }, [])

  const featured = getFeatured()
  const cajas = getBySection('carousel_cajas')
  const arreglos = getBySection('grid_arreglos')

  const isFiltering = activeCategory !== 'todos' || searchTerm.trim() !== ''

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return products.filter(p => {
      if (!matchesCategory(p, activeCategory)) return false
      if (!term) return true
      const haystack = `${p.name || ''} ${p.category || ''} ${p.description || ''} ${p.badge || ''}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [products, searchTerm, activeCategory])

  return (
    <>
      {showSplash && <SplashScreen />}

      <div className={`main-container ${showSplash ? 'hidden' : ''}`}>
        <Header
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          cartCount={count}
          onOpenCart={() => setCartOpen(true)}
        />
        {announcement && (
          <div className="announcement-bar">📢 {announcement}</div>
        )}
        <WelcomeSection />
      </div>

      <Categories activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>✨ Cargando...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', color: 'red', fontSize: 13 }}>
          ❌ Error Firebase: {error} — Verifica las reglas de Firestore.
        </div>
      )}

      {!loading && !isFiltering && (
        <div className="products-wrapper">

          {/* Producto destacado */}
          <FeaturedProduct product={featured} />

          {/* Carrusel — recibe products del contexto */}
          <CarouselSection
            title="🎁 Sorpresas Especiales"
            products={cajas}
            sectionId="carousel_cajas"
          />

          {/* Grid */}
          <GridSection
            title="🌸 Arreglos y Bouquets"
            products={arreglos}
            sectionId="grid_arreglos"
          />

          <ListSection
            title="✨ Regalos Especiales"
            products={getBySection('list_regalos')}
            sectionId="list_regalos"
          />

          <SocialLinks/>

        </div>
      )}

      {!loading && isFiltering && (
        <div className="products-wrapper">
          <ResultsSection
            products={filtered}
            title={searchTerm.trim() ? `Resultados para "${searchTerm.trim()}"` : 'Resultados'}
          />
          <SocialLinks/>
        </div>
      )}

      {!authLoading && (
        <div className="admin-fab">
          {isAdmin ? (
            <>
              <button onClick={() => setShowDashboard(true)}>✦ Panel</button>
              <button onClick={() => logout()}>🔴 Salir</button>
            </>
          ) : (
            <button onClick={() => setShowLogin(true)}>🔑 Admin</button>
          )}
        </div>
      )}

      <AdminWelcomeEditor />

      <AdminLogin open={showLogin} onClose={() => setShowLogin(false)} />
      <AdminDashboard open={showDashboard} onClose={() => setShowDashboard(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

function HomeLisArt() {
  return (
    <ProductsProvider>
      <HomeContent />
    </ProductsProvider>
  )
}

export default HomeLisArt
