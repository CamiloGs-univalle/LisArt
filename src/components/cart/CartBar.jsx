// Barra inferior fija con el pedido + aviso "Agregado" + botón flotante de WhatsApp
import './CartBar.css'
import { useCart } from '../../contexts/CartContext'
import { useUI } from '../../contexts/UIContext'
import { useAdmin } from '../admin/AdminContext'
import { formatPrice, WHATSAPP_NUMBER } from '../../data/products'
import Icon from '../ui/Icon'

export default function CartBar() {
  const { count, total, items } = useCart()
  const { openCart, toast, cartOpen, product } = useUI()
  const { isAdmin } = useAdmin()

  if (isAdmin) return null
  const hidden = cartOpen || !!product
  const thumbs = items.slice(-3).reverse()

  return (
    <>
      {toast && (
        <div className="toast" key={toast.key} role="status" aria-live="polite">
          {toast.image && <img src={toast.image} alt="" />}
          <div>
            <strong>Agregado a tu pedido</strong>
            <span>{toast.title}</span>
          </div>
          <button onClick={openCart}>Ver</button>
        </div>
      )}

      {count > 0 ? (
        <div className={`cartbar ${hidden ? 'is-hidden' : ''}`}>
          <button className="cartbar__btn" onClick={openCart} aria-label={`Ver pedido: ${count} piezas, total ${formatPrice(total)}`}>
            <span className="cartbar__thumbs" aria-hidden="true">
              {thumbs.map(i => <img key={i.id} src={i.image} alt="" />)}
            </span>
            <span className="cartbar__txt">
              <small>{count} {count === 1 ? 'pieza' : 'piezas'}</small>
              <strong>{formatPrice(total)}</strong>
            </span>
            <span className="cartbar__go">
              Ver pedido <Icon name="arrow" size={18} />
            </span>
          </button>
        </div>
      ) : (
        <a
          className={`wa-fab ${hidden ? 'is-hidden' : ''}`}
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola LisArt 👋 Quiero información sobre un regalo.')}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escríbenos por WhatsApp"
        >
          <Icon name="whatsapp" size={28} />
        </a>
      )}
    </>
  )
}
