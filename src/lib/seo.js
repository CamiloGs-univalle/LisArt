// SEO de cada catálogo (sin dependencias: lo usan el navegador y el servidor).
//  · Título, descripción y foto para Google y para los enlaces de WhatsApp
//  · Datos estructurados (schema.org): el negocio y sus productos con precio
//  · Mapa del sitio y listado de productos para Google Compras (Merchant Center)
//  · Puntaje: qué le falta a cada negocio para verse mejor en Google
import { isDraft } from './catalog.js'

// Tipo de negocio → tipo de schema.org (lo que entiende Google)
export const BUSINESS_TYPES = {
  Store: 'Tienda',
  CafeOrCoffeeShop: 'Cafetería',
  Bakery: 'Panadería / pastelería',
  Restaurant: 'Restaurante',
  FastFoodRestaurant: 'Comidas rápidas',
  DaySpa: 'Spa',
  BeautySalon: 'Salón de belleza',
  NailSalon: 'Uñas',
  HairSalon: 'Peluquería / barbería',
  ClothingStore: 'Tienda de ropa',
  ShoeStore: 'Zapatería',
  JewelryStore: 'Joyería',
  ElectronicsStore: 'Tecnología',
  Florist: 'Floristería',
  GiftShop: 'Regalos y detalles',
  PetStore: 'Mascotas',
  HealthAndBeautyBusiness: 'Salud y bienestar',
  ProfessionalService: 'Servicios profesionales',
}
const TEMPLATE_TYPE = { comida: 'Restaurant', belleza: 'BeautySalon', moda: 'ClothingStore', tecnologia: 'ElectronicsStore', joyeria: 'JewelryStore', regalos: 'GiftShop', eventos: 'ProfessionalService' }
export const businessType = (t) => (BUSINESS_TYPES[t?.businessType] ? t.businessType : TEMPLATE_TYPE[t?.template] || 'Store')

export const DAYS = [['Mo', 'Lun'], ['Tu', 'Mar'], ['We', 'Mié'], ['Th', 'Jue'], ['Fr', 'Vie'], ['Sa', 'Sáb'], ['Su', 'Dom']]
const validTime = (v) => /^\d{2}:\d{2}$/.test(v || '')
// { days:['Mo',…], open:'08:00', close:'19:00' } → "Mo,Tu,We 08:00-19:00"
export function openingHours(h) {
  if (!h?.days?.length || !validTime(h.open) || !validTime(h.close)) return ''
  const order = DAYS.map(d => d[0]).filter(d => h.days.includes(d))
  return `${order.join(',')} ${h.open}-${h.close}`
}
export function hoursLabel(h) {
  if (!h?.days?.length || !validTime(h.open) || !validTime(h.close)) return ''
  const idx = DAYS.map(d => d[0]).map((d, i) => (h.days.includes(d) ? i : -1)).filter(i => i >= 0)
  const contiguous = idx.every((v, i) => !i || v === idx[i - 1] + 1)
  const days = contiguous && idx.length > 2 ? `${DAYS[idx[0]][1]} a ${DAYS[idx.at(-1)][1]}` : idx.map(i => DAYS[i][1]).join(', ')
  return `${days} · ${h.open} a ${h.close}`
}

const real = (url) => url && /^https?:\/\//.test(url) && !String(url).includes('placehold.co')
const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s }
const priceOf = (p) => Math.round(Number(p?.price) || 0)
const inStock = (p) => !(p?.stock !== '' && p?.stock != null && Number(p.stock) <= 0)
export const publicProducts = (list = []) => list.filter(p => !isDraft(p) && !p.hidden)

export function tenantDescription(t) {
  if (t.seoDescription) return clip(t.seoDescription, 160)
  const where = [t.city].filter(Boolean).join(', ')
  return clip(t.tagline
    ? `${t.tagline}. Mira el catálogo de ${t.name}${where ? ` en ${where}` : ''} y pide por WhatsApp.`
    : `Catálogo de ${t.name}${where ? ` en ${where}` : ''}. Mira precios, elige tus productos y pide por WhatsApp.`, 160)
}

// Todo lo que va en el <head> de la página de un catálogo (o de uno de sus productos)
export function buildSeo(t, products = [], { origin, slug, productId } = {}) {
  const list = publicProducts(products)
  const base = `${origin}/${slug}`
  const type = businessType(t)
  const firstImage = list.map(p => p.image).find(real)
  const business = {
    '@type': type,
    '@id': `${base}#negocio`,
    name: t.name,
    url: base,
    ...(t.tagline || t.seoDescription ? { description: clip(t.seoDescription || t.tagline, 300) } : {}),
    ...(real(t.logo) ? { logo: t.logo } : {}),
    ...(real(t.logo) || firstImage ? { image: real(t.logo) ? t.logo : firstImage } : {}),
    ...(t.whatsapp ? { telephone: `+${String(t.whatsapp).replace(/\D/g, '')}` } : {}),
    ...(t.address || t.city ? { address: { '@type': 'PostalAddress', ...(t.address ? { streetAddress: t.address } : {}), ...(t.city ? { addressLocality: t.city } : {}), addressCountry: 'CO' } } : {}),
    ...(openingHours(t.hours) ? { openingHours: openingHours(t.hours) } : {}),
    ...(t.mapsUrl ? { hasMap: t.mapsUrl } : {}),
    sameAs: [t.instagram, t.facebook, t.tiktok, t.mapsUrl].filter(u => /^https?:\/\//.test(u || '')),
    ...(t.priceRange ? { priceRange: t.priceRange } : {}),
  }
  const product = (p) => ({
    '@type': 'Product',
    '@id': `${base}?p=${encodeURIComponent(p.id)}`,
    name: p.name,
    ...(p.description ? { description: clip(p.description, 500) } : {}),
    ...(real(p.image) ? { image: [p.image, ...(p.images || []).filter(real)].slice(0, 5) } : {}),
    brand: { '@type': 'Brand', name: t.name },
    ...(priceOf(p) > 0 ? {
      offers: {
        '@type': 'Offer',
        url: `${base}?p=${encodeURIComponent(p.id)}`,
        priceCurrency: 'COP',
        price: priceOf(p),
        availability: inStock(p) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: { '@id': `${base}#negocio` },
      },
    } : {}),
  })

  const one = productId && list.find(p => p.id === productId)
  const noindex = t.status === 'suspended' || !!t.demo || t.noindex === true
  if (one) {
    const price = priceOf(one) > 0 ? ` · $ ${priceOf(one).toLocaleString('es-CO')}` : ''
    return {
      title: clip(`${one.name}${price} · ${t.name}`, 70),
      description: clip(one.description ? `${one.description} Pide por WhatsApp a ${t.name}${t.city ? ` en ${t.city}` : ''}.` : `${one.name} de ${t.name}${t.city ? ` en ${t.city}` : ''}. Pide por WhatsApp.`, 160),
      image: real(one.image) ? one.image : real(t.logo) ? t.logo : firstImage || '',
      url: `${base}?p=${encodeURIComponent(one.id)}`,
      type: 'product',
      noindex,
      jsonLd: { '@context': 'https://schema.org', '@graph': [business, product(one)] },
    }
  }
  return {
    title: clip(`${t.name}${t.tagline ? ` · ${t.tagline}` : t.city ? ` · ${t.city}` : ''}`, 70),
    description: tenantDescription(t),
    image: firstImage || (real(t.logo) ? t.logo : ''),
    url: base,
    type: 'website',
    noindex,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        business,
        { '@type': 'ItemList', name: `Catálogo de ${t.name}`, itemListElement: list.slice(0, 60).map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: product(p) })) },
      ],
    },
  }
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Etiquetas para el <head> (el servidor las pone antes de que cargue la app)
export function headTags(seo) {
  return [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<link rel="canonical" href="${esc(seo.url)}" />`,
    seo.noindex ? '<meta name="robots" content="noindex" />' : '',
    `<meta property="og:type" content="${seo.type === 'product' ? 'product' : 'website'}" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:url" content="${esc(seo.url)}" />`,
    seo.image ? `<meta property="og:image" content="${esc(seo.image)}" />` : '',
    `<meta name="twitter:card" content="${seo.image ? 'summary_large_image' : 'summary'}" />`,
    seo.jsonLd ? `<script type="application/ld+json">${JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c')}</script>` : '',
  ].filter(Boolean).join('\n    ')
}

// Mapa del sitio: cada catálogo y cada producto
export function sitemapXml(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(e =>
    `  <url><loc>${esc(e.loc)}</loc>${e.lastmod ? `<lastmod>${esc(e.lastmod)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`
}

// Listado de productos para Google Merchant Center (fichas gratuitas en Google Compras)
export function merchantFeedXml(t, products, { origin, slug }) {
  const base = `${origin}/${slug}`
  const items = publicProducts(products).filter(p => real(p.image) && priceOf(p) > 0)
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${esc(t.name)}</title>
<link>${esc(base)}</link>
<description>${esc(tenantDescription(t))}</description>
${items.map(p => `<item>
  <g:id>${esc(p.id)}</g:id>
  <g:title>${esc(clip(p.name, 150))}</g:title>
  <g:description>${esc(clip(p.description || `${p.name} de ${t.name}`, 4900))}</g:description>
  <g:link>${esc(`${base}?p=${encodeURIComponent(p.id)}`)}</g:link>
  <g:image_link>${esc(p.image)}</g:image_link>
${(p.images || []).filter(real).filter(u => u !== p.image).slice(0, 9).map(u => `  <g:additional_image_link>${esc(u)}</g:additional_image_link>`).join('\n')}
  <g:availability>${inStock(p) ? 'in_stock' : 'out_of_stock'}</g:availability>
  <g:price>${priceOf(p)} COP</g:price>
  <g:condition>new</g:condition>
  <g:brand>${esc(t.name)}</g:brand>
  <g:identifier_exists>no</g:identifier_exists>
</item>`).join('\n')}
</channel>
</rss>
`.replace(/\n\s*\n/g, '\n')
}

// Qué tan completo está el negocio para Google (0–100) y qué le falta
export function seoScore(t = {}, products = []) {
  const list = publicProducts(products)
  const pct = (fn) => (list.length ? list.filter(fn).length / list.length : 0)
  const checks = [
    { id: 'name', ok: !!t.name, w: 8, label: 'Nombre del negocio', tip: 'Escribe el nombre como lo buscan tus clientes.' },
    { id: 'desc', ok: (t.seoDescription || t.tagline || '').length >= 40, w: 12, label: 'Descripción de al menos 40 letras', tip: 'Di qué vendes y dónde: «Spa en el sur de Cali: masajes, faciales y uñas».' },
    { id: 'type', ok: !!BUSINESS_TYPES[t.businessType], w: 6, label: 'Tipo de negocio', tip: 'Así Google sabe si eres un spa, una cafetería, una tienda…' },
    { id: 'logo', ok: real(t.logo), w: 8, label: 'Logo', tip: 'Sube tu logo en «Mi negocio».' },
    { id: 'city', ok: !!t.city, w: 8, label: 'Ciudad', tip: 'La gente busca «… en Cali».' },
    { id: 'address', ok: !!t.address, w: 8, label: 'Dirección', tip: 'Ayuda a aparecer en búsquedas «cerca de mí».' },
    { id: 'hours', ok: !!openingHours(t.hours), w: 8, label: 'Horario de atención', tip: 'Google lo muestra y evita que te escriban cuando estás cerrado.' },
    { id: 'products', ok: list.length >= 6, w: 10, label: 'Al menos 6 productos publicados', tip: 'Más productos = más búsquedas en las que puedes aparecer.' },
    { id: 'photos', ok: pct(p => real(p.image)) >= 0.9, w: 12, label: 'Fotos reales en tus productos', tip: 'Google prefiere productos con foto.' },
    { id: 'prices', ok: pct(p => priceOf(p) > 0) >= 0.8, w: 10, label: 'Precios publicados', tip: 'Con precio, Google puede mostrarlo en el resultado.' },
    { id: 'pdesc', ok: pct(p => (p.description || '').length >= 30) >= 0.7, w: 10, label: 'Descripción en tus productos', tip: 'Una o dos frases con palabras que la gente busca.' },
  ]
  const total = checks.reduce((a, c) => a + c.w, 0)
  const score = Math.round(checks.filter(c => c.ok).reduce((a, c) => a + c.w, 0) / total * 100)
  return { score, checks }
}
