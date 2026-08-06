import { useCart } from '../../contexts/CartContext'
import { formatPrice } from '../../data/products'
import './CartDrawer.css'

function CartDrawer({ open, onClose }) {
  const { items, setQty, removeFromCart, clearCart, total, checkout } = useCart()

  if (!open) return null

  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="cart-head">
          <h2>🛒 Tu carrito</h2>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty-emoji">💔</span>
            <p>Tu carrito está vacío</p>
            <button className="cart-empty-btn" onClick={onClose}>
              Ver catálogo
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.name} className="cart-item-img" />

                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">{formatPrice(item.price)}</p>

                    <div className="cart-qty">
                      <button onClick={() => setQty(item.id, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => setQty(item.id, item.qty + 1)}>+</button>
                    </div>
                  </div>

                  <div className="cart-item-right">
                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item.id)}
                    >
                      🗑
                    </button>
                    <p className="cart-item-subtotal">{formatPrice(item.price * item.qty)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-foot">
              <div className="cart-total-row">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <button className="cart-checkout" onClick={checkout}>
                Comprar por WhatsApp
              </button>
              <button className="cart-clear" onClick={clearCart}>
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

export default CartDrawer
