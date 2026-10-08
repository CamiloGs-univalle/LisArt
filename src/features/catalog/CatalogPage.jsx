// ─────────────────────────────────────────────────────────────
// Página pública del catálogo de un negocio (tusitio.com/<negocio>)
// Orden de proveedores: negocio → datos (tiempo real) → edición → carrito → interfaz
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react'
import { TenantProvider, useTenant } from '@/features/tenant/TenantProvider'
import { SettingsProvider, useSettingsCtx } from '@/features/catalog/data/SettingsProvider'
import { ProductsProvider, useProductsCtx } from '@/features/catalog/data/ProductsProvider'
import { EditorProvider, useAdmin } from '@/features/editor/EditorProvider'
import { CartProvider, useCart } from '@/features/cart/CartProvider'
import { UIProvider } from '@/features/catalog/UIProvider'
import Header from '@/features/catalog/components/Header'
import Hero from '@/features/catalog/components/Hero'
import SectionNav from '@/features/catalog/components/SectionNav'
import ResultsSection from '@/features/catalog/components/ResultsSection'
import ProductSheet from '@/features/catalog/components/ProductSheet'
import Footer from '@/features/catalog/components/Footer'
import { Highlights, HowToOrder, Story, Faq } from '@/features/catalog/components/InfoSections'
import CatalogSections from '@/features/catalog/layouts/CatalogSections'
import StoryViewer from '@/features/catalog/layouts/StoryViewer'
import { useCatalog, GALLERY_ID } from '@/features/catalog/layouts/useCatalog'
import EditorPanel from '@/features/editor/panel/EditorPanel'
import EditorBar from '@/features/editor/EditorBar'
import { PhotoManager, SectionsPicker } from '@/features/editor/AdminTools'
import CartDrawer from '@/features/cart/CartDrawer'
import CartBar from '@/features/cart/CartBar'
import StatusScreen from '@/shared/ui/StatusScreen'

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

function CatalogView() {
  const [showAll, setShowAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
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
        onOpenDashboard={() => setShowDashboard(true)}
      />

      <main>
        {!isFiltering && <Hero images={heroImages} onExplore={scrollToCatalog} />}

        {!isFiltering && <Highlights onCatalog={scrollToCatalog} />}

        <div id="catalogo" />
        <SectionNav
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

      <Footer />

      <EditorPanel open={showDashboard} onClose={() => setShowDashboard(false)} />

      <ProductSheet />
      <StoryViewer />
      <PhotoManager />
      <SectionsPicker />
      <EditorBar onOpenPanel={() => setShowDashboard(true)} />
      <CartDrawer />
      <CartBar />
    </div>
  )
}

// Muestra el catálogo solo si el negocio existe y está activo
function TenantGate({ children }) {
  const { loading, notFound, tenant } = useTenant()
  const { canEdit } = useAdmin()
  if (loading) return <StatusScreen loading />
  if (notFound) return <StatusScreen title="Catálogo no encontrado" text="Revisa que la dirección esté bien escrita." />
  if (tenant.status !== 'active' && !canEdit) {
    return <StatusScreen title="Catálogo no disponible" text="Este catálogo no está disponible por ahora. Vuelve pronto." />
  }
  return children
}

export default function CatalogPage({ slug }) {
  return (
    <TenantProvider slug={slug} key={slug}>
      <SettingsProvider>
        <ProductsProvider>
          <EditorProvider>
            <TenantGate>
              <CartProvider>
                <UIProvider>
                  <CatalogView />
                </UIProvider>
              </CartProvider>
            </TenantGate>
          </EditorProvider>
        </ProductsProvider>
      </SettingsProvider>
    </TenantProvider>
  )
}
