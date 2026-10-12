// ─────────────────────────────────────────────────────────────
// Página pública del catálogo de un negocio (tusitio.com/<negocio>)
// Orden de proveedores: negocio → datos (tiempo real) → edición → carrito → interfaz
// ─────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect, useRef } from 'react'
import { useBillingSettings } from '@/features/billing/useBilling'
import { billingState } from '@/lib/billingCore'
import { TenantProvider, useTenant } from '@/features/tenant/TenantProvider'
import { SettingsProvider, useSettingsCtx } from '@/features/catalog/data/SettingsProvider'
import { ProductsProvider, useProductsCtx } from '@/features/catalog/data/ProductsProvider'
import { EditorProvider, useAdmin } from '@/features/editor/EditorProvider'
import { CartProvider, useCart } from '@/features/cart/CartProvider'
import { UIProvider, useUI } from '@/features/catalog/UIProvider'
import Header from '@/features/catalog/components/Header'
import Hero from '@/features/catalog/components/Hero'
import SectionNav from '@/features/catalog/components/SectionNav'
import ResultsSection from '@/features/catalog/components/ResultsSection'
import ProductSheet from '@/features/catalog/components/ProductSheet'
import Footer from '@/features/catalog/components/Footer'
import { MarketingSections } from '@/features/marketing/Boost'
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
import BackToTop from '@/shared/ui/BackToTop'
import ScrollProgress from '@/shared/ui/ScrollProgress'
import { initFx } from '@/lib/fx'
import '@/styles/fx.css'
import '@/styles/cardstyles.css'
import VeloraView from '@/features/catalog/skins/VeloraView'
import TerrainView from '@/features/catalog/skins/TerrainView'
import EditorialView from '@/features/catalog/skins/EditorialView'
import ProductView from '@/features/catalog/skins/ProductView'
import MenuView from '@/features/catalog/skins/MenuView'
import ServiciosView from '@/features/catalog/skins/ServiciosView'
import BentoView from '@/features/catalog/skins/BentoView'
import LookbookView from '@/features/catalog/skins/LookbookView'
import TiendaView from '@/features/catalog/skins/TiendaView'
import LujoView from '@/features/catalog/skins/LujoView'
import HistoriasView from '@/features/catalog/skins/HistoriasView'
import EscaparateView from '@/features/catalog/skins/EscaparateView'
import RevistaView from '@/features/catalog/skins/RevistaView'
import MesaView from '@/features/catalog/skins/MesaView'

// Panel del dueño: false = cerrado · true = abierto · 'plan' | … = abierto en esa pestaña.
// Al volver de un pago en línea (?pago=REF) se abre solo en «Mi plan».
function usePanel() {
  const { canEdit } = useAdmin()
  const [panel, setPanel] = useState(false)
  useEffect(() => {
    if (canEdit && new URLSearchParams(window.location.search).has('pago')) setPanel('plan')
  }, [canEdit])
  return { panel, openPanel: (tab) => setPanel(typeof tab === 'string' ? tab : true), closePanel: () => setPanel(false) }
}

// Estructuras de página alternativas (el negocio elige una en Panel → Diseño)
const SKINS = { velora: VeloraView, terrain: TerrainView, editorial: EditorialView, menu: MenuView, servicios: ServiciosView, bento: BentoView, lookbook: LookbookView, tienda: TiendaView, lujo: LujoView, historias: HistoriasView, escaparate: EscaparateView, revista: RevistaView, mesa: MesaView }

function SkinView({ layout }) {
  const { panel, openPanel, closePanel } = usePanel()
  const { cardStyle } = useSettingsCtx()
  const Skin = SKINS[layout]
  return (
    <div className={`page page--${layout} cs-${cardStyle}`}>
      <Skin onOpenDashboard={openPanel} />
      <EditorPanel open={!!panel} initialTab={typeof panel === 'string' ? panel : undefined} onClose={closePanel} />
      <ProductView variant={layout} />
      <PhotoManager />
      <SectionsPicker />
      <EditorBar onOpenPanel={openPanel} />
      <CartDrawer />
      <CartBar />
      <BackToTop />
      <ScrollProgress />
    </div>
  )
}

// Enlace directo a un producto (?p=id): lo abre apenas cargan los productos
function useProductDeepLink() {
  const { products, loading } = useProductsCtx()
  const { openProduct } = useUI()
  const done = useRef(false)
  useEffect(() => {
    if (done.current || loading) return
    done.current = true
    const id = new URLSearchParams(window.location.search).get('p')
    const p = id && products.find(x => x.id === id)
    if (p) openProduct(p)
  }, [products, loading, openProduct])
}

function CatalogSwitch() {
  const { layout } = useTenant()
  useProductDeepLink()
  return SKINS[layout] ? <SkinView layout={layout} /> : <CatalogView />
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

function CatalogView() {
  const [showAll, setShowAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { panel, openPanel, closePanel } = usePanel()
  const { isAdmin } = useAdmin()
  const { loading, error } = useProductsCtx()
  const { sections, publicSections, visibleProducts: products } = useCatalog()
  const { announcement, cardStyle } = useSettingsCtx()
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
    <div className={`page cs-${cardStyle}`}>
      <a href="#catalogo" className="sr-only">Saltar al catálogo</a>

      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        cartCount={count}
        announcement={announcement}
        onOpenDashboard={openPanel}
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

      <MarketingSections />
      <Footer />

      <EditorPanel open={!!panel} initialTab={typeof panel === 'string' ? panel : undefined} onClose={closePanel} />

      <ProductSheet />
      <StoryViewer />
      <PhotoManager />
      <SectionsPicker />
      <EditorBar onOpenPanel={openPanel} />
      <CartDrawer />
      <CartBar />
      <BackToTop />
      <ScrollProgress />
    </div>
  )
}

// Muestra el catálogo solo si el negocio existe y está activo
function TenantGate({ children }) {
  const { loading, notFound, tenant } = useTenant()
  const { canEdit } = useAdmin()
  const billingSettings = useBillingSettings()
  if (loading) return <StatusScreen loading />
  if (notFound) return (
    <StatusScreen icon="🔎" eyebrow="Error 404" title="No encontramos este catálogo" text="Revisa que la dirección esté bien escrita o pídele el enlace correcto al negocio.">
      <a className="btn btn--ghost" href="/">Ir al inicio</a>
    </StatusScreen>
  )
  // Pausa automática por falta de pago (después de los días de gracia)
  const unpaid = billingState(tenant.billing, billingSettings).state === 'overdue'
  if ((tenant.status !== 'active' || unpaid) && !canEdit) {
    return (
      <StatusScreen icon="🌙" eyebrow={tenant.name} title="Volvemos pronto" text="Este catálogo no está disponible en este momento. Mientras tanto, puedes escribirnos directamente.">
        {tenant.whatsapp && <a className="btn btn--wa" href={`https://wa.me/${tenant.whatsapp}`} target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>}
      </StatusScreen>
    )
  }
  return children
}

export default function CatalogPage({ slug }) {
  useEffect(() => initFx(), [])
  return (
    <TenantProvider slug={slug} key={slug}>
      <SettingsProvider>
        <ProductsProvider>
          <EditorProvider>
            <TenantGate>
              <CartProvider>
                <UIProvider>
                  <CatalogSwitch />
                </UIProvider>
              </CartProvider>
            </TenantGate>
          </EditorProvider>
        </ProductsProvider>
      </SettingsProvider>
    </TenantProvider>
  )
}
