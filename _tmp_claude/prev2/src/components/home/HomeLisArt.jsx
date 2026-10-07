// src/components/home/HomeLisArt.jsx
import { useState, useMemo } from 'react'
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
import ListSection from '../product/List_Section'
import ProductSheet from '../product/ProductSheet'
import { PromoCircles, PromoGrandes, PromoMedianos } from '../common/MockupSection'
import { Highlights, Ribbon, HowToOrder, Story, Faq } from './InfoSections'
import { ProductsProvider, useProductsCtx } from '../../contexts/ProductsContext'
import { useSettingsCtx } from '../../contexts/SettingsContext'
import { useCart } from '../../contexts/CartContext'
import CartDrawer from '../cart/CartDrawer'
import CartBar from '../cart/CartBar'
import SocialLinks from './Navegative/Social_links'
import { categories } from '../../data/products'

const matchesCategory = (p, catId) => {
  if (catId === 'todos') return true
  const cat = categories.find(c => c.id === catId)
  if (!cat?.keywords) return true
  const haystack = `${p.section || ''} ${p.name || ''} ${p.category || ''}`.toLowerCase()
  return cat.keywords.some(k => haystack.includes(k))
}

const scrollToCatalog = () =>
  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

function SkeletonGrid() {
  return (
    <div className="container skeleton-grid" aria-label="Cargando productos">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="sk-img" />
          <div className="sk-line" />
          <div className="sk-line short" />
        </div>
      ))}
    </div>
  )
}

function HomeContent() {
  const [activeCategory, setActiveCategory] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const { isAdmin } = useAdmin()
  const { loading, error, products, getBySection, getFeatured } = useProductsCtx()
  const { announcement } = useSettingsCtx()
  const { count } = useCart()

  const featured = getFeatured()
  const cajas = getBySection('carousel_cajas')
  const arreglos = getBySection('grid_arreglos')
  const regalos = getBySection('list_regalos')

  // Imágenes para el collage del hero (las más representativas)
  const heroImages = useMemo(() => {
    const pool = [featured, ...cajas, ...arreglos, ...regalos, ...products]
      .filter(p => p?.image && !String(p.image).includes('placehold.co'))
      .map(p => p.image)
    return [...new Set(pool)].slice(0, 3)
  }, [featured, cajas, arreglos, regalos, products])

  const storyImage = useMemo(() => {
    const pool = products.filter(p => p.image && !String(p.image).includes('placehold.co'))
    return pool[Math.min(3, pool.length - 1)]?.image
  }, [products])

  // Cuántos productos hay por categoría (las vacías se ocultan)
  const categoryCounts = useMemo(() => {
    const out = {}
    categories.forEach(c => { out[c.id] = products.filter(p => matchesCategory(p, c.id)).length })
    return out
  }, [products])

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

  const resultsTitle = searchTerm.trim()
    ? `“${searchTerm.trim()}”`
    : categories.find(c => c.id === activeCategory)?.name || 'Resultados'

  const clearFilters = () => { setSearchTerm(''); setActiveCategory('todos') }

  return (
    <div className="page">
      <a href="#catalogo" className="sr-only">Saltar al catálogo</a>

      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        cartCount={count}
        announcement={announcement}
        onOpenLogin={() => setShowLogin(true)}
        onOpenDashboard={() => setShowDashboard(true)}
      />

      <main>
        {!isFiltering && <WelcomeSection images={heroImages} onExplore={scrollToCatalog} />}

        {!isFiltering && <Highlights onCatalog={scrollToCatalog} />}

        <div id="catalogo" />
        <Categories
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          counts={categoryCounts}
        />

        {loading && <SkeletonGrid />}

        {error && (
          <p className="state-msg state-msg--error" role="alert">
            No pudimos cargar el catálogo en este momento. Intenta de nuevo en unos segundos.
            {isAdmin && <><br /><small>Firebase: {error}</small></>}
          </p>
        )}

        {!loading && !isFiltering && (
          <div className="catalog">
            <PromoCircles />
            <FeaturedProduct product={featured} />
            <CarouselSection products={cajas} sectionId="carousel_cajas" />
            <GridSection products={arreglos} sectionId="grid_arreglos" layout="editorial" />
            <Ribbon />
            <PromoGrandes />
            <ListSection products={regalos} sectionId="list_regalos" />
            <PromoMedianos />
            <HowToOrder onStart={scrollToCatalog} />
            <Story image={storyImage} />
            <Faq />
          </div>
        )}

        {!loading && isFiltering && (
          <div className="catalog">
            <ResultsSection products={filtered} title={resultsTitle} onClear={clearFilters} />
            <HowToOrder onStart={clearFilters} />
          </div>
        )}
      </main>

      <SocialLinks />

      <AdminWelcomeEditor />
      <AdminLogin open={showLogin} onClose={() => setShowLogin(false)} />
      <AdminDashboard open={showDashboard} onClose={() => setShowDashboard(false)} />

      <ProductSheet />
      <CartDrawer />
      <CartBar />
    </div>
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
