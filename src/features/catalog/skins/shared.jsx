// ─────────────────────────────────────────────────────────────
// Piezas compartidas por las estructuras de página (Velora, Terrain, Editorial):
// datos del catálogo y el selector de opciones (tallas, colores, cantidad).
// ─────────────────────────────────────────────────────────────
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCatalog, GALLERY_ID, FEATURED_ID } from '@/features/catalog/layouts/useCatalog'
import { useProductsCtx } from '@/features/catalog/data/ProductsProvider'
import { useSettingsCtx } from '@/features/catalog/data/SettingsProvider'
import { useTenant } from '@/features/tenant/TenantProvider'
import { useSiteContent } from '@/features/tenant/useSiteContent'
import { useWhatsApp } from '@/features/tenant/useWhatsApp'
import { useCart } from '@/features/cart/CartProvider'
import { useAddToCart } from '@/features/cart/useAddToCart'
import { useUI } from '@/features/catalog/UIProvider'
import { formatPrice } from '@/lib/format'
import { productSizes, productColors, productDiscount } from '@/lib/catalog'
import { getImages, optimizeImg } from '@/lib/images'
import Icon from '@/shared/ui/Icon'
import Lightbox, { useHoverZoom } from '@/shared/ui/Lightbox'
import { StockNote } from '@/features/marketing/Boost'
import { stockInfo, goalAnnouncement } from '@/lib/marketing'

const isReal = (url) => url && !String(url).includes('placehold.co')

// Todo lo que una estructura necesita para dibujar el catálogo
export function useSkin() {
  const { publicSections, sections, visibleProducts } = useCatalog()
  const { loading } = useProductsCtx()
  const { announcement, marketing } = useSettingsCtx()
  const { brand, tenantId } = useTenant()
  const content = useSiteContent()
  const wa = useWhatsApp()
  const { count } = useCart()
  const { openCart, openProduct } = useUI()

  const productSections = publicSections.filter(s => s.id !== GALLERY_ID && !s.special)
  const featured = sections.find(s => s.id === FEATURED_ID)?.items?.[0]
    || productSections[0]?.items?.[0]
    || visibleProducts[0]
    || null
  const heroImage = useMemo(() => {
    const pool = [featured, ...visibleProducts].map(p => p?.image).filter(isReal)
    return pool[0] || ''
  }, [featured, visibleProducts])

  const goalText = goalAnnouncement(marketing)
  const announcements = [
    ...(announcement ? [{ text: announcement }] : []),
    ...(goalText ? [{ text: goalText }] : []),
    ...content.announcements,
  ]

  return { brand, tenantId, content, wa, count, openCart, openProduct, loading, sections: productSections, products: visibleProducts, featured, heroImage, announcements }
}

// Búsqueda simple sobre los productos visibles
export function useSearch(products) {
  const [term, setTerm] = useState('')
  const results = useMemo(() => {
    const t = term.trim().toLowerCase()
    if (!t) return null
    return products.filter(p => `${p.name || ''} ${p.description || ''} ${p.badge || ''} ${p.category || ''}`.toLowerCase().includes(t))
  }, [products, term])
  return { term, setTerm, results }
}

export function Price({ p, className = '', stock = true }) {
  const d = productDiscount(p)
  const price = Number(p.price) || 0
  return (
    <span className={`sk-price ${className}`}>
      {p.pricePrefix && price > 0 && <small>{p.pricePrefix} </small>}
      <b>{price > 0 ? formatPrice(price) : 'Cotizar'}</b>
      {d && <s>{formatPrice(d.before)}</s>}
      {d && <em className="sk-off">-{d.percent}%</em>}
      {stock && <StockNote p={p} compact />}
    </span>
  )
}

// Selector de opciones + cantidad + botones de pedir. Se usa en la ficha y en portadas.
export function ProductOptions({ p, compact = false, onAdded }) {
  const sizes = productSizes(p)
  const colors = productColors(p)
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [qty, setQty] = useState(1)
  const [warn, setWarn] = useState('')
  const { add, added } = useAddToCart()
  const wa = useWhatsApp()
  const { marketing } = useSettingsCtx()
  const out = stockInfo(p, marketing)?.out

  useEffect(() => { setSize(''); setColor(colors[0]?.name || ''); setQty(1); setWarn('') }, [p?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () => {
    if (sizes.length && !size) { setWarn('Elige una talla'); return }
    setWarn('')
    if (add(p, qty, { size, color })) onAdded?.()
  }

  const ask = () => {
    const opts = [size && `talla ${size}`, color && `color ${color}`].filter(Boolean).join(', ')
    wa.open(`Hola {negocio} 👋 Me interesa *${p.name}*${opts ? ` (${opts})` : ''}. ¿Está disponible?`)
  }

  return (
    <div className={`sk-opts ${compact ? 'sk-opts--compact' : ''}`}>
      {colors.length > 0 && (
        <div className="sk-opts__group">
          <p className="sk-opts__label">Color: <b>{color}</b></p>
          <div className="sk-swatches" role="radiogroup" aria-label="Color">
            {colors.map(c => (
              <button key={c.name} type="button" role="radio" aria-checked={color === c.name} aria-label={c.name} title={c.name}
                className={`sk-swatch ${color === c.name ? 'is-on' : ''}`} style={{ '--sw': c.hex }} onClick={() => setColor(c.name)} />
            ))}
          </div>
        </div>
      )}
      {sizes.length > 0 && (
        <div className="sk-opts__group">
          <p className="sk-opts__label">Talla: <b>{size || '—'}</b></p>
          <div className="sk-sizes" role="radiogroup" aria-label="Talla">
            {sizes.map(s => (
              <button key={s} type="button" role="radio" aria-checked={size === s} className={`sk-size ${size === s ? 'is-on' : ''}`} onClick={() => { setSize(s); setWarn('') }}>{s}</button>
            ))}
          </div>
        </div>
      )}
      {warn && <p className="sk-opts__warn" role="alert">{warn}</p>}
      <div className="sk-opts__buy">
        <div className="sk-qty" aria-label="Cantidad">
          <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Menos"><Icon name="minus" size={16} /></button>
          <span>{qty}</span>
          <button type="button" onClick={() => setQty(q => q + 1)} aria-label="Más"><Icon name="plus" size={16} /></button>
        </div>
        <button type="button" className="sk-add" onClick={submit} disabled={out}>
          <Icon name={added[p.id] ? 'check' : 'cart'} size={18} /> {out ? 'Agotado' : added[p.id] ? 'Agregado' : 'Agregar al pedido'}
        </button>
      </div>
      <button type="button" className="sk-ask" onClick={ask}><Icon name="whatsapp" size={18} /> Preguntar por WhatsApp</button>
    </div>
  )
}

// Galería con miniaturas (vertical en computador, horizontal en celular)
export function ThumbGallery({ p }) {
  const imgs = getImages(p).filter(isReal)
  const [i, setI] = useState(0)
  const [box, setBox] = useState(false)
  const swipe = useRef(null)
  const { zoomClass, handlers } = useHoverZoom()
  useEffect(() => setI(0), [p?.id])
  const list = imgs.length ? imgs : [p.image].filter(Boolean)
  const go = (k) => setI(((k % list.length) + list.length) % list.length)
  return (
    <div className="sk-gal">
      {list.length > 1 && (
        <div className="sk-gal__thumbs" role="tablist" aria-label="Fotos">
          {list.map((u, k) => (
            <button key={u + k} role="tab" aria-selected={i === k} className={i === k ? 'is-on' : ''} onClick={() => setI(k)}>
              <img src={u} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <div className={`sk-gal__main ${zoomClass}`} {...handlers}
        onPointerDown={(e) => { swipe.current = e.clientX }}
        onPointerUp={(e) => {
          const d = swipe.current == null ? 0 : e.clientX - swipe.current
          swipe.current = null
          if (Math.abs(d) > 50 && list.length > 1) go(i + (d < 0 ? 1 : -1))
          else if (list[i]) setBox(true)
        }}>
        {list[i] && <img key={list[i]} src={optimizeImg(list[i], 1200)} alt={p.name} draggable="false" decoding="async" />}
        {p.badge && <span className="sk-badge">{p.badge}</span>}
        {list.length > 1 && <span className="sk-gal__count" aria-hidden="true">{i + 1} / {list.length}</span>}
        <span className="sk-gal__hint" aria-hidden="true"><Icon name="search" size={15} /></span>
      </div>
      {box && <Lightbox images={list} index={i} title={p.name} onClose={() => setBox(false)} />}
    </div>
  )
}
