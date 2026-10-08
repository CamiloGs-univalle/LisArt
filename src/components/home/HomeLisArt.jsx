// src/components/home/HomeLisArt.jsx
import { useState, useMemo } from 'react'
import Header from './Hearder/Header'
import WelcomeSection from './Hearder/WelcomeSection'
import { useAdmin } from '../admin/AdminContext'
import AdminLogin from '../admin/AdminLogin'
import AdminDashboard from '../admin/AdminDashboard'
import AdminWelcomeEditor from '../admin/AdminWelcomeEditor'
import Categories from '../Categories'
import ResultsSection from '../product/ResultsSection'
import ProductSheet from '../product/ProductSheet'
import CatalogSections from '../layouts/CatalogSections'
import StoryViewer from '../layouts/StoryViewer'
import { PhotoManager } from '../layouts/AdminTools'
import { Highlights, HowToOrder, Story, Faq } from './InfoSections'
import { ProductsProvider, useProductsCtx } from '../../contexts/ProductsContext'
import { useSettingsCtx } from '../../contexts/SettingsContext'
import { useCart } from '../../contexts/CartContext'
import CartDrawer from '../cart/CartDrawer'
import CartBar from '../cart/CartBar'
import SocialLinks from './Navegative/Social_links'
import { useCatalog, GALLERY_ID } from '../layouts/useCatalog'
import { SectionsPicker } from '../layouts/AdminTools'

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

// Aviso flotante del modo edición
function EditBanner() {
  const [show, setShow] = useState(() => {
    try { return localStorage.getItem('lisart_edit_tip') !== 'off' } catch { return true }
  })
  if (!show) return null
  return (
    <div className="edit-banner" role="status">
      <span>✏️ <strong>Modo edición:</strong> toca cualquier texto con línea punteada para cambiarlo. Enter guarda, Esc cancela.</span>
      <button onClick={() => { setShow(false); try { localStorage.setItem('lisart_edit_tip', 'off') } catch { /* noop */ } }} aria-label="Cerrar aviso">✕</button>
    </div>
  )
}

function HomeContent() {
  const [showAll, setShowAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const { isAdmin } = useAdmin()
  const { loading, error } = useProductsCtx()
  const { sections, publicSections, visibleProducts: products } = useCatalog()
  const { announcement } = useSettingsCtx()
  const { count } = useCart()

  // Fotos del inicio: primero las de Destacados
  const heroImages = useMemo(() => {
    const dest = sections.find(x => x.id === 'destacados')?.items || []
    const pool = [...dest, ...products].map(p => p.image).filter(u => u && !String(u).includes('placehold.co'))
    return [...new Set(pool)].slice(0, 3)
  }, [sections, products])

  const storyImage = useMemo(() => {
    const pool = products.filter(p => p.image && !String(p.image).includes('placehold.co'))
    return pool[Math.min(3, pool.length - 1)]?.image
  }, [products])

  // Secciones para la barra de navegación (sin la galería)
  const navSections = (isAdmin ? sections.filter(x => !x.hidden) : publicSections).filter(x => x.id !== GALLERY_ID && !x.special && x.items.length > 0)

  const goToSection = (id) => {
    setShowAll(false); setSearchTerm('')
    setTimeout(() => document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  }

  const isFiltering = showAll || searchTerm.trim() !== ''

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return products.filter(p => {
      if (!term) return true
      const haystack = `${p.name || ''} ${p.category || ''} ${p.description || ''} ${p.personalizacion || ''} ${p.badge || ''}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [products, searchTerm])

  const resultsTitle = searchTerm.trim()
    ? `“${searchTerm.trim()}”`
    : 'Todo el catálogo'

  const clearFilters = () => { setSearchTerm(''); setShowAll(false) }

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
          sections={navSections}
          showAll={showAll}
          onGo={goToSection}
          onShowAll={() => { setShowAll(true); scrollToCatalog() }}
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
            <CatalogSections />
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
      <StoryViewer />
      <PhotoManager />
      <SectionsPicker />
      {isAdmin && <EditBanner />}
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
