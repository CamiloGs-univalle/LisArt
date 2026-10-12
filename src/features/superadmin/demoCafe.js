// Catálogo de ejemplo: cafetería y pastelería "Café Aurora".
// Sirve para ver cómo luce un catálogo real con todas las estrategias de venta.
// Las fotos se asignan por nombre de archivo (capuchino.jpg → producto "capuchino").
import { P } from '@/services/paths'
import { readDoc, writeDoc, writeMany, patchDoc, now } from '@/services/repo'
import { createTenant, writeAccount } from '@/services/tenants.service'
import { uploadImage } from '@/lib/cloudinary'
import { slugify } from '@/lib/format'
import { publicBilling } from '@/lib/billingCore'

export const DEMO_SLUG = 'cafe-aurora'

const SECTIONS = [
  { id: 'cafes', emoji: '☕', eyebrow: 'Recién molido', title: 'Cafés de', emphasis: 'especialidad', subtitle: 'Granos de origen colombiano, tostados cada semana.', style: 'catalogo' },
  { id: 'frias', emoji: '🧊', eyebrow: 'Para el calor', title: 'Bebidas', emphasis: 'frías', subtitle: 'Refrescantes, cremosas y hechas al momento.', style: 'carrusel' },
  { id: 'pasteleria', emoji: '🍰', eyebrow: 'Hecho en casa', title: 'Nuestra', emphasis: 'pastelería', subtitle: 'Porciones generosas, recetas de la abuela.', style: 'catalogo' },
  { id: 'panaderia', emoji: '🥐', eyebrow: 'Desde las 6 a. m.', title: 'Panadería y', emphasis: 'desayunos', subtitle: 'Pan del día, calientito y crocante.', style: 'catalogo' },
  { id: 'encargos', emoji: '🎂', eyebrow: 'Por encargo', title: 'Tortas para', emphasis: 'celebrar', subtitle: 'Pídela con 2 días de anticipación y la personalizamos.', style: 'catalogo' },
]

// key = nombre del archivo de la foto (sin extensión)
const PRODUCTS = [
  // Cafés
  { key: 'espresso', s: 'cafes', name: 'Espresso doble', price: 5500, d: 'Intenso y con crema dorada. Notas a cacao y panela.', e: '☕' },
  { key: 'americano', s: 'cafes', name: 'Americano', price: 6000, d: 'Espresso alargado con agua caliente. Suave y aromático.', e: '☕' },
  { key: 'capuchino', s: 'cafes', name: 'Capuchino', price: 9500, d: 'Espresso con leche cremosa y espuma sedosa. Con arte latte.', sizes: '8 oz, 12 oz, 16 oz', featured: true, badge: 'El favorito', hl: 'grande', e: '☕' },
  { key: 'latte-vainilla', s: 'cafes', name: 'Latte de vainilla', price: 11000, d: 'Leche texturizada, espresso y vainilla natural.', e: '🥛' },
  { key: 'mocaccino', s: 'cafes', name: 'Mocaccino', price: 11500, old: 13500, offerDays: 3, d: 'Chocolate belga, espresso y crema batida.', e: '🍫' },
  { key: 'cafe-de-olla', s: 'cafes', name: 'Café de olla', price: 7000, d: 'Con panela, canela y clavo. Como en la finca.', e: '🫖' },
  // Bebidas frías
  { key: 'frappe-caramelo', s: 'frias', name: 'Frappé de caramelo', price: 14500, d: 'Café helado, caramelo salado y crema batida.', badge: 'Nuevo', e: '🥤' },
  { key: 'cold-brew', s: 'frias', name: 'Cold brew', price: 10000, d: 'Café extraído en frío por 18 horas. Dulce natural, cero amargo.', e: '🧊' },
  { key: 'limonada-coco', s: 'frias', name: 'Limonada de coco', price: 12000, d: 'Cremosa, refrescante y con coco rallado.', e: '🥥' },
  { key: 'chai-helado', s: 'frias', name: 'Chai latte helado', price: 11000, d: 'Té negro con especias, leche y hielo.', e: '🍵' },
  // Pastelería
  { key: 'torta-chocolate', s: 'pasteleria', name: 'Torta de chocolate', price: 12500, d: 'Bizcocho húmedo de cacao con ganache. Porción generosa.', stock: 4, e: '🍫' },
  { key: 'cheesecake', s: 'pasteleria', name: 'Cheesecake de frutos rojos', price: 13500, d: 'Cremoso, horneado lento, con salsa de frutos rojos.', hl: 'banner', e: '🍓' },
  { key: 'torta-zanahoria', s: 'pasteleria', name: 'Torta de zanahoria', price: 11500, d: 'Con nueces y frosting de queso crema.', e: '🥕' },
  { key: 'tres-leches', s: 'pasteleria', name: 'Tres leches', price: 10000, d: 'Esponjosa y bien bañada. Un clásico.', e: '🍮' },
  { key: 'brownie', s: 'pasteleria', name: 'Brownie con helado', price: 13000, old: 15000, offerDays: 2, d: 'Brownie tibio, helado de vainilla y salsa de chocolate.', e: '🍨' },
  { key: 'macarons', s: 'pasteleria', name: 'Macarons x6', price: 18000, d: 'Pistacho, frambuesa, limón, chocolate, vainilla y café.', stock: 3, e: '🍬' },
  // Panadería y desayunos
  { key: 'croissant', s: 'panaderia', name: 'Croissant de mantequilla', price: 6500, d: 'Hojaldrado, dorado y con mantequilla de verdad.', e: '🥐' },
  { key: 'pan-de-bono', s: 'panaderia', name: 'Pan de bono x3', price: 6000, d: 'Recién horneado, con queso costeño.', e: '🧀' },
  { key: 'almojabana', s: 'panaderia', name: 'Almojábanas x3', price: 7500, d: 'Suaves por dentro, doraditas por fuera.', e: '🥯' },
  { key: 'sandwich', s: 'panaderia', name: 'Sándwich de pollo al pesto', price: 18000, d: 'Pan artesanal, pollo, pesto, tomate y queso mozzarella.', e: '🥪' },
  { key: 'desayuno', s: 'panaderia', name: 'Desayuno Aurora', price: 26000, d: 'Huevos al gusto, arepa, queso, fruta, jugo y café.', badge: 'Completo', e: '🍳' },
  // Tortas por encargo (comparador de 3 opciones)
  { key: 'torta-pequena', s: 'encargos', name: 'Torta pequeña · 10 porciones', price: 78000, d: 'Ideal para una celebración en casa.', perso: 'mensaje, colores y topper', e: '🎂' },
  { key: 'torta-mediana', s: 'encargos', name: 'Torta mediana · 20 porciones', price: 135000, d: 'La más pedida para cumpleaños y oficinas.', perso: 'mensaje, colores y topper', badge: 'Recomendada', e: '🎂' },
  { key: 'torta-grande', s: 'encargos', name: 'Torta grande · 30 porciones', price: 185000, d: 'Para fiestas grandes. Dos pisos.', perso: 'mensaje, colores, topper y flores', e: '🎉' },
]

// Mientras no haya foto: ilustración cálida con el emoji del producto
const PAL = [['#6f4e37', '#c08552'], ['#3e2723', '#a1887f'], ['#8d5524', '#e0ac69'], ['#5d4037', '#d7ccc8'], ['#b5651d', '#f3d2a8'], ['#4e342e', '#bcaaa4']]
function placeholder(p, i) {
  const [a, b] = PAL[i % PAL.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="800" height="1000" fill="url(#g)"/><circle cx="400" cy="440" r="230" fill="rgba(255,255,255,.14)"/><text x="400" y="530" font-size="240" text-anchor="middle">${p.e}</text><text x="400" y="860" font-size="46" font-family="Georgia,serif" text-anchor="middle" fill="rgba(255,255,255,.92)">${p.name.split(' · ')[0].replace(/&/g, '&amp;')}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const days = (n) => new Date(Date.now() + n * 864e5).toISOString()
const productId = (p) => `demo-${p.key}`

// Busca a qué producto corresponde una foto por su nombre de archivo
export function matchPhoto(fileName) {
  const base = slugify(String(fileName).replace(/\.[a-z0-9]+$/i, ''))
  if (!base) return null
  return PRODUCTS.find(p => p.key === base)
    || PRODUCTS.find(p => slugify(p.name) === base)
    || PRODUCTS.find(p => base.includes(p.key) || p.key.includes(base))
    || PRODUCTS.find(p => slugify(p.name).includes(base))
    || null
}

export const demoExists = async () => !!(await readDoc(P.tenant(DEMO_SLUG)))

// Crea (o vuelve a llenar) el catálogo de ejemplo. files = fotos elegidas (opcional).
export async function seedDemoCafe({ user, files = [], onStep = () => {} }) {
  const exists = await demoExists()
  if (!exists) {
    onStep('Creando el catálogo…')
    const billing = { model: 'mensual', price: 0, setupFee: 0, setupPaid: true, trial: false, paidUntil: days(3650), createdAt: new Date().toISOString() }
    await createTenant(DEMO_SLUG, {
      name: 'Café Aurora',
      tagline: 'Cafetería y pastelería artesanal',
      whatsapp: '573001234567',
      city: 'Cali',
      template: 'comida',
      layout: 'menu',
      theme: { preset: 'sabor' },
      ownerUid: user.uid,
      demo: true,
      plan: 'premium',
      billing: publicBilling(billing),
    })
    await writeAccount(DEMO_SLUG, { ownerEmail: user.email, billing })
  }

  // Fotos: se suben y se asignan por nombre
  const photos = {}
  const list = Array.from(files || []).filter(f => f.type?.startsWith('image/'))
  for (const [i, f] of list.entries()) {
    const p = matchPhoto(f.name)
    if (!p) continue
    onStep(`Subiendo fotos ${i + 1} de ${list.length}…`)
    photos[p.key] = await uploadImage(f, `catalogos/${DEMO_SLUG}`)
  }

  onStep('Guardando productos…')
  const current = exists ? await Promise.all(PRODUCTS.map(p => readDoc(P.product(DEMO_SLUG, productId(p))))) : []
  await writeMany(PRODUCTS.map((p, i) => {
    const prev = current[i]
    // Si ya tenía una foto real y no se subió una nueva, se conserva
    const image = photos[p.key] || (prev?.image && !String(prev.image).startsWith('data:') ? prev.image : placeholder(p, i))
    return [P.product(DEMO_SLUG, productId(p)), {
      name: p.name, price: p.price, description: p.d, image,
      section: p.s, sections: [p.s], featured: !!p.featured,
      ...(p.badge ? { badge: p.badge } : {}),
      ...(p.hl ? { highlight: p.hl } : {}),
      ...(p.sizes ? { sizes: p.sizes } : {}),
      ...(p.stock != null ? { stock: p.stock } : {}),
      ...(p.old ? { oldPrice: p.old, offerEnds: days(p.offerDays || 3) } : {}),
      ...(p.perso ? { personalizacion: p.perso, pricePrefix: 'Desde' } : {}),
      ...(prev ? {} : { createdAt: now() }),
      updatedAt: now(),
    }]
  }))

  if (exists) await patchDoc(P.tenant(DEMO_SLUG), { plan: 'premium' })
  onStep('Configurando diseño y ventas…')
  const id = (k) => `demo-${k}`
  await writeDoc(P.settings(DEMO_SLUG), {
    sections: SECTIONS,
    order: [...SECTIONS.map(s => s.id), 'galeria'],
    hidden: ['destacados', 'menu', 'combos', 'postres'],
    announcement: '',
    content: {
      announcements: ['Domicilios en Cali', 'Café recién molido', 'Tortas por encargo con 2 días'],
      hero: {
        sticker: 'Abierto de 6 a. m. a 8 p. m.',
        titleStart: 'Café de origen y',
        titleEmphasis: 'postres caseros',
        titleEnd: 'a tu puerta',
        subtitle: 'Elige tu café, tu antojo dulce o encarga la torta de tu celebración. Arma el pedido y envíalo por WhatsApp.',
        primaryCta: 'Ver la carta',
        secondaryCta: 'Pedir por WhatsApp',
      },
      stats: [{ value: '25–40', label: 'min de entrega' }, { value: '100%', label: 'café colombiano' }, { value: '6 a. m.', label: 'pan recién horneado' }],
      ribbon: ['Café de especialidad', 'Pastelería artesanal', 'Pan del día', 'Tortas por encargo', 'Domicilios'],
      story: { title: 'Hecho con', titleEmphasis: 'amor', text: 'Café Aurora nació en una cocina de barrio con una cafetera y la receta de torta de la abuela. Hoy tostamos nuestro café cada semana y horneamos todo en casa.', sign: 'La familia de Café Aurora' },
      faq: [
        { q: '¿Cuánto tarda el domicilio?', a: 'Entre 25 y 40 minutos según tu zona de Cali.' },
        { q: '¿Con cuánta anticipación pido una torta?', a: 'Con 2 días. Te confirmamos diseño, sabor y hora de entrega por WhatsApp.' },
        { q: '¿Tienen opciones sin lactosa?', a: 'Sí: todas las bebidas se pueden preparar con leche de almendras o deslactosada.' },
      ],
      perks: ['Hecho al momento', 'Domicilios en Cali', 'Leche vegetal sin costo extra'],
      cartNote: 'El domicilio y el pago se confirman por WhatsApp.',
    },
    marketing: {
      goalsEnabled: true,
      goals: [
        { amount: 50000, type: 'shipping', value: 0, label: 'Domicilio gratis' },
        { amount: 100000, type: 'gift', value: 0, label: 'Galleta de regalo' },
      ],
      stockEnabled: true,
      lowStock: 5,
      crossSellEnabled: true,
      compares: [{ id: 'tortas', title: 'Elige el tamaño de tu torta', subtitle: 'Todas incluyen mensaje personalizado', items: [id('torta-pequena'), id('torta-mediana'), id('torta-grande')], recommended: id('torta-mediana'),
        features: [{ label: 'Porciones', values: ['10', '20', '30'] }, { label: 'Pisos', values: ['1', '1', '2'] }, { label: 'Topper personalizado', values: ['Sí', 'Sí', 'Sí'] }, { label: 'Flores naturales', values: ['No', 'No', 'Sí'] }] }],
      combos: [
        { id: 'manana', name: 'Mañana perfecta', items: [id('capuchino'), id('croissant'), id('pan-de-bono')], price: 19000 },
        { id: 'tarde', name: 'Tarde dulce', items: [id('latte-vainilla'), id('cheesecake')], price: 22000 },
      ],
      reviews: [],
    },
    updatedAt: now(),
  }, { merge: true })

  return { created: !exists, photos: Object.keys(photos).length, products: PRODUCTS.length }
}

export const DEMO_PHOTO_NAMES = PRODUCTS.map(p => p.key)
