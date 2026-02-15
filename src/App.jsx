import { useState, useEffect } from 'react'
import './App.css'
import SplashScreen from './components/SplashScreen'
import Header from './components/Header'
import WelcomeSection from './components/WelcomeSection'
import Categories from './components/Categories'
import FeaturedProduct from './components/FeaturedProduct'
import CarouselSection from './components/CarouselSection'
import GridSection from './components/GridSection'
import ListSection from './components/ListSection'
import BottomNav from './components/BottomNav'
import WhatsAppButton from './components/WhatsAppButton'
import { productsData } from './data/products'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [activeCategory, setActiveCategory] = useState('todos')

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
            products={[...productsData.arreglos, ...productsData.bouquets.slice(0, 2)]}
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
}

export default App
