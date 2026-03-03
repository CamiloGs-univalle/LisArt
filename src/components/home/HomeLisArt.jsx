// src/components/home/HomeLisArt.jsx
import { useState, useEffect } from 'react'
import SplashScreen from './Hearder/SplashScreen'
import Header from './Hearder/Header'
import WelcomeSection from './Hearder/WelcomeSection'
import { useAdmin } from '../admin/AdminContext'
import Categories from '../Categories'
import FeaturedProduct from '../product/FeaturedProduct'
import CarouselSection from '../product/CarouselSection'
import GridSection from '../product/GridSection'
import { ProductsProvider, useProductsCtx } from '../../contexts/ProductsContext'
import ListSection from '../product/Listsection'
import SocialLinks from './Navegative/Sociallinks'

// Componente interno para acceder al contexto ya montado
function HomeContent() {
  const [showSplash, setShowSplash] = useState(true)
  const [activeCategory, setActiveCategory] = useState('todos')
  const { isAdmin, toggleAdmin } = useAdmin()
  const { loading, error, getBySection, getFeatured } = useProductsCtx()

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2200)
    return () => clearTimeout(t)
  }, [])

  const featured = getFeatured()
  const cajas = getBySection('carousel_cajas')
  const arreglos = getBySection('grid_arreglos')

  return (
    <>
      {showSplash && <SplashScreen />}

      <div className={`main-container ${showSplash ? 'hidden' : ''}`}>
        <Header />
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

      {!loading && (
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

          <SocialLinks />

        </div>
      )}

      <button
        onClick={toggleAdmin}
        style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 999,
          padding: '10px 15px', borderRadius: '20px',
          backgroundColor: isAdmin ? '#ff4d4d' : '#333',
          color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold'
        }}
      >
        {isAdmin ? '🔴 Salir Admin' : '🔑 Entrar Admin'}
      </button>
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