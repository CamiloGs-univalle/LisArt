// src/components/home/HomeLisArt.jsx

import { useState, useEffect } from 'react'

/* COMPONENTES */
import SplashScreen from './Hearder/SplashScreen'
import Header from './Hearder/Header'
import WelcomeSection from './Hearder/WelcomeSection'
import AdminWelcomeEditor from '../admin/AdminWelcomeEditor'
import { useAdmin } from '../admin/AdminContext'
import Categories from '../Categories'
import FeaturedProduct from '../product/FeaturedProduct'
import CarouselSection from '../product/CarouselSection'
import GridSection from '../product/GridSection'

/* DATA */
import { productsData } from '../../data/products'



function HomeLisArt() {

  const [showSplash, setShowSplash] = useState(true)
  const [activeCategory, setActiveCategory] = useState('todos')

  const { isAdmin, toggleAdmin } = useAdmin()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2200)

    return () => clearTimeout(timer)
  }, [])

  const handleCategoryChange = (category) => {
    setActiveCategory(category)
  }

  return (
    <>
      {/* Splash Screen */}
      {showSplash && <SplashScreen />}
      <div className={`main-container ${showSplash ? 'hidden' : ''}`}>
        {/* Header */}
        <Header />
        {/* Sección Bienvenida */}
        <WelcomeSection />
        {/* Editor SOLO visible en modo admin */}
        {isAdmin && <AdminWelcomeEditor />}
      </div>

      <Categories
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div className="products-wrapper">
        <FeaturedProduct product={productsData.featured} />

        <CarouselSection
          title="🎁 Sorpresas Especiales"
          products={productsData.cajas}
        />

        <GridSection
            title="🌸 Arreglos y Bouquets"
            sectionId="detalles"
            products={[
              ...productsData.arreglos,
              ...productsData.bouquets.slice(0, 2)
            ]}
          />

      </div>



      {/* BOTÓN DE PRUEBA PARA CAMBIAR MODO ADMIN */}
      <button
        onClick={toggleAdmin}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 999,
          padding: '10px 15px',
          borderRadius: '20px',
          backgroundColor: isAdmin ? '#ff4d4d' : '#333',
          color: '#fff',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {isAdmin ? 'Salir Admin' : 'Entrar Admin'}
      </button>
    </>
  )
}

export default HomeLisArt

/* Splash Screen
      {showSplash && <SplashScreen />}

      <div className={`main-container ${showSplash ? 'hidden' : ''}`}>

        
        <Header />

        
        <WelcomeSection />

       
        <Categories
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

       
        <div className="products-wrapper">

          <FeaturedProduct product={productsData.featured} />

          <CarouselSection
            title="🎁 Sorpresas Especiales"
            products={productsData.cajas}
          />

          <GridSection
            title="🌸 Arreglos y Bouquets"
            products={[
              ...productsData.arreglos,
              ...productsData.bouquets.slice(0, 2)
            ]}
          />

          <ListSection
            title="🎓 Graduación"
            products={productsData.graduacion}
          />

          <CarouselSection
            title="🎵 Placas Spotify"
            products={productsData.spotify}
          />

          <GridSection
            title="✨ Más Regalos"
            products={productsData.regalos}
          />

        </div>

  
        <BottomNav />

      </div>


      <WhatsAppButton />
    </>
  )
}*/