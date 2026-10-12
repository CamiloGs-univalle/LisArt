import { useEffect, useRef, useState } from 'react'
import { useTenant } from '@/features/tenant/TenantProvider'
import { isPremium } from '@/lib/billingCore'
import { useCart } from '@/features/cart/CartProvider'
import { useUI } from '@/features/catalog/UIProvider'
import { formatPrice } from '@/lib/format'
import Icon from '@/shared/ui/Icon'
import './CartDrawer.css'
import { useSiteContent } from '@/features/tenant/useSiteContent'
import EditText from '@/features/editor/EditText'
import { GoalBar, CartUpsell } from '@/features/marketing/Boost'

function CartDrawer() {
  const { cartOpen: open, closeCart: onClose } = useUI()
  const { items, lineKey, changeQty, removeFromCart, clearCart, total, count, checkoutUrl, info, updateInfo, discount, finalTotal, rewards, placeOrder, restoreOrder, lastOrder } = useCart()
  const closeRef = useRef(null)
  const { cartNote } = useSiteContent()
  const { tenant } = useTenant()
  const reviewUrl = isPremium(tenant) && /^https:\/\//.test(tenant?.googleReviewUrl || '') ? tenant.googleReviewUrl : ''
  const [sent, setSent] = useState(false)

  // La vista «pedido enviado» solo dura mientras el carrito sigue abierto
  useEffect(() => { if (!open) setSent(false) }, [open])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="cart-overlay" onClick={onClose} role="presentation">
      <aside className="cart" role="dialog" aria-modal="true" aria-labelledby="cart-title" onClick={e => e.stopPropagation()}>
        <header className="cart__head">
          <div>
            <p className="eyebrow">{sent && lastOrder ? 'Pedido enviado' : `${count} ${count === 1 ? 'pieza' : 'piezas'}`}</p>
            <h2 id="cart-title" className="display cart__title"><EditText path="cart.title" fallback="Tu" /> <em><EditText path="cart.emphasis" fallback="pedido" /></em></h2>
          </div>
          <button ref={closeRef} className="cart__close" onClick={onClose} aria-label="Cerrar pedido">
            <Icon name="close" />
          </button>
        </header>

        {sent && lastOrder ? (
          <div className="cart__sent" role="status">
            <span className="cart__sent-icon" aria-hidden="true"><Icon name="check" size={34} /></span>
            <p className="display">¡Pedido <em>listo</em>!</p>
            <span>Se abrió WhatsApp con tu pedido de {lastOrder.count} {lastOrder.count === 1 ? 'producto' : 'productos'} por <b className="num">{formatPrice(lastOrder.total)}</b>. Solo falta tocar <b>Enviar</b> allá.</span>
            <a className="btn btn--wa btn--block" href={lastOrder.url} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" /> Abrir WhatsApp de nuevo</a>
            <button className="btn btn--primary btn--block" onClick={onClose}>Seguir viendo el catálogo</button>
            <button className="cart__undo" onClick={() => { restoreOrder(); setSent(false) }}>No lo envié, volver a mi pedido</button>
            {reviewUrl && (
              <a className="cart__review" href={reviewUrl} target="_blank" rel="noopener noreferrer">
                <span aria-hidden="true">⭐</span>
                <span><strong>¿Te gustó la atención?</strong> Déjanos tu reseña en Google, nos ayuda muchísimo.</span>
              </a>
            )}
          </div>
        ) : items.length === 0 ? (
          <div className="cart__empty">
            <span className="cart__empty-icon"><Icon name="gift" size={34} /></span>
            <p className="display">Tu pedido está <em>vacío</em></p>
            <span>Explora el catálogo y elige ese detalle especial.</span>
            <button className="btn btn--primary" onClick={onClose}>
              Ver catálogo <Icon name="arrow" />
            </button>
            {lastOrder && (
              <div className="cart__last">
                <span>Tu último pedido: {lastOrder.count} {lastOrder.count === 1 ? 'producto' : 'productos'} · <b className="num">{formatPrice(lastOrder.total)}</b></span>
                <a href={lastOrder.url} target="_blank" rel="noopener noreferrer">Reenviar por WhatsApp</a>
                <button type="button" onClick={restoreOrder}>Volver a pedirlo</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="cart__scroll">
              <GoalBar />
              <ul className="cart__items">
                {items.map(item => (
                  <li className="ci" key={lineKey(item)}>
                    {item.image ? <img src={item.image} alt="" className="ci__img" loading="lazy" /> : <span className="ci__img ci__img--empty" aria-hidden="true"><Icon name={String(item.id).startsWith('combo:') ? 'gift' : 'cart'} size={22} /></span>}
                    <div className="ci__info">
                      <p className="ci__name">{item.name}</p>
                      {item.detail && <p className="ci__opts">Incluye: {item.detail}</p>}
                      {(item.size || item.color) && <p className="ci__opts">{[item.size && `Talla ${item.size}`, item.color].filter(Boolean).join(' · ')}</p>}
                      <p className="ci__unit">{formatPrice(item.price)} c/u</p>
                      <div className="ci__row">
                        <div className="qty qty--sm">
                          <button onClick={() => changeQty(lineKey(item), -1)} aria-label={`Quitar uno de ${item.name}`}><Icon name="minus" size={16} /></button>
                          <span>{item.qty}</span>
                          <button onClick={() => changeQty(lineKey(item), 1)} aria-label={`Agregar uno de ${item.name}`}><Icon name="plus" size={16} /></button>
                        </div>
                        <strong className="ci__sub">{formatPrice(item.price * item.qty)}</strong>
                      </div>
                    </div>
                    <button className="ci__remove" onClick={() => removeFromCart(lineKey(item))} aria-label={`Eliminar ${item.name}`}>
                      <Icon name="trash" size={18} />
                    </button>
                  </li>
                ))}
              </ul>

              <CartUpsell />

              <details className="cart__extra" open={!!(info.name || info.date || info.note)}>
                <summary>
                  <span><Icon name="sparkle" size={16} /> Añade detalles <small>(opcional)</small></span>
                  <Icon name="chevron" size={18} className="cart__extra-chev" />
                </summary>
                <div className="cart__fields">
                  <label>
                    <span>Tu nombre</span>
                    <input type="text" value={info.name} onChange={e => updateInfo('name', e.target.value)} placeholder="¿Cómo te llamas?" autoComplete="name" />
                  </label>
                  <label>
                    <span>Fecha de entrega</span>
                    <input type="text" value={info.date} onChange={e => updateInfo('date', e.target.value)} placeholder="Ej: sábado 14 en la mañana" />
                  </label>
                  <label>
                    <span>Dedicatoria o detalles</span>
                    <textarea rows={3} value={info.note} onChange={e => updateInfo('note', e.target.value)} placeholder="Colores, nombres, mensaje para la tarjeta…" />
                  </label>
                </div>
              </details>

              <button className="cart__clear" onClick={() => { if (window.confirm('¿Vaciar todo el pedido?')) clearCart() }}>Vaciar pedido</button>
            </div>

            <footer className="cart__foot">
              {discount > 0 && (
                <div className="cart__total cart__total--sub">
                  <span>Subtotal <s className="num">{formatPrice(total)}</s></span>
                  <span className="cart__save num">−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="cart__total">
                <span>Total productos</span>
                <strong className="num">{formatPrice(finalTotal)}</strong>
              </div>
              {rewards.length > 0 && <p className="cart__reward">🎁 Ganaste: <b>{rewards.join(' + ')}</b></p>}
              {cartNote && <p className="cart__note">{cartNote}</p>}
              <a className="btn btn--wa btn--block cart__cta" href={checkoutUrl()} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.preventDefault(); const o = placeOrder(); if (o) window.open(o.url, '_blank', 'noopener'); setSent(true) }}>
                <Icon name="whatsapp" /> <EditText path="cart.cta" fallback="Enviar pedido por WhatsApp" inButton />
              </a>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}

export default CartDrawer
