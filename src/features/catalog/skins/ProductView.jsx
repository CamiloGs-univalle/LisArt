// Ficha de producto tipo tienda (para las estructuras Velora, Terrain y Editorial):
// galería con miniaturas, precio, opciones, pestañas de detalle y productos relacionados.
import { useEffect, useRef, useState } from 'react'
import { useUI, productLink } from '@/features/catalog/UIProvider'
import { useCatalog } from '@/features/catalog/layouts/useCatalog'
import { useSiteContent } from '@/features/tenant/useSiteContent'
import { productSections } from '@/lib/catalog'
import ShareButton from '@/shared/ui/ShareButton'
import Icon from '@/shared/ui/Icon'
import { Price, ProductOptions, ThumbGallery } from './shared'
import { OfferNote, StockNote, ProductBoost } from '@/features/marketing/Boost'
import { useSettingsCtx } from '@/features/catalog/data/SettingsProvider'
import './ProductView.css'

export default function ProductView({ variant = 'velora' }) {
  const { product: p, closeProduct, openProduct, openCart } = useUI()
  const { visibleProducts } = useCatalog()
  const { envios, pagos, perks } = useSiteContent()
  const { marketing } = useSettingsCtx()
  const [tab, setTab] = useState('detalles')
  const panel = useRef(null)
  const closeBtn = useRef(null)

  useEffect(() => {
    if (!p) return
    setTab('detalles')
    panel.current?.scrollTo({ top: 0 })
    const prev = document.activeElement
    const onKey = (e) => { if (e.key === 'Escape') closeProduct() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeBtn.current?.focus()
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus?.() }
  }, [p, closeProduct])

  if (!p) return null

  const secs = productSections(p)
  const related = visibleProducts.filter(x => x.id !== p.id && productSections(x).some(s => secs.includes(s))).slice(0, 4)
  const more = related.length ? related : visibleProducts.filter(x => x.id !== p.id).slice(0, 4)

  const tabs = [
    { id: 'detalles', label: 'Detalles', body: p.description || 'Escríbenos por WhatsApp y te contamos todos los detalles de este producto.' },
    p.personalizacion && { id: 'personaliza', label: 'Personalización', body: `Puedes personalizar: ${p.personalizacion}.` },
    { id: 'envio', label: 'Envíos y pagos', body: [envios, pagos].filter(Boolean).join(' ') || 'Coordinamos envío y pago por WhatsApp.' },
  ].filter(Boolean)
  const current = tabs.find(t => t.id === tab) || tabs[0]

  return (
    <div className={`pv pv--${variant}`} role="dialog" aria-modal="true" aria-label={p.name}>
      <div className="pv__bar">
        <button ref={closeBtn} className="pv__back" onClick={closeProduct}><Icon name="chevronLeft" size={20} /> Volver</button>
        <span className="pv__bar-end">
          <ShareButton className="pv__cart" url={productLink(p.id)} title={p.name} text={p.name} label="Compartir producto" />
          <button className="pv__cart" onClick={openCart} aria-label="Ver pedido"><Icon name="cart" size={20} /></button>
        </span>
      </div>
      <div className="pv__scroll" ref={panel}>
        <div className="pv__top">
          <ThumbGallery p={p} />
          <div className="pv__info">
            {p.badge && <span className="pv__chip">{p.badge}</span>}
            <h2 className="pv__name">{p.name}</h2>
            <Price p={p} className="pv__price" stock={false} />
            <OfferNote p={p} />
            <StockNote p={p} />
            {p.description && <p className="pv__desc">{p.description}</p>}
            <hr className="pv__hr" />
            <ProductOptions p={p} />
            <ul className="pv__perks">
              {(perks.length ? perks : ['Atención por WhatsApp']).slice(0, 3).map((t, i) => (
                <li key={i}><Icon name={['truck', 'card', 'chat'][i] || 'check'} size={18} /> <span>{t}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pv__tabs">
          <div className="pv__tablist" role="tablist">
            {tabs.map(t => (
              <button key={t.id} role="tab" aria-selected={current.id === t.id} className={current.id === t.id ? 'is-on' : ''} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
          <p className="pv__tabbody" role="tabpanel">{current.body}</p>
        </div>

        <div className="pv__boost"><ProductBoost p={p} /></div>

        {!marketing.crossSellEnabled && more.length > 0 && (
          <section className="pv__more">
            <h3>También te puede gustar</h3>
            <div className="pv__grid">
              {more.map(x => (
                <button key={x.id} className="pv__card" onClick={() => openProduct(x)}>
                  <span className="pv__card-img"><img src={x.image} alt="" loading="lazy" /></span>
                  <strong>{x.name}</strong>
                  <Price p={x} />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
