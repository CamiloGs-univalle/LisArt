import './GridSection.css'
import ProductCard from '../ui/ProductCard'
import Icon from '../ui/Icon'
import { useAddToCart } from '../ui/useAddToCart'

function ResultsSection({ products, title, onClear }) {
  const { add, added } = useAddToCart()
  const items = products || []

  return (
    <section className="grid-sec container results" aria-live="polite">
      <header className="results__head">
        <div>
          <p className="eyebrow">{items.length} {items.length === 1 ? 'resultado' : 'resultados'}</p>
          <h2 className="display results__title">{title}</h2>
        </div>
        {onClear && (
          <button className="btn btn--ghost results__clear" onClick={onClear}>
            <Icon name="close" size={16} /> Limpiar
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="results__empty">
          <Icon name="sparkle" size={28} />
          <p className="display">No encontramos ese detalle… <em>todavía</em>.</p>
          <span>Prueba otra palabra o escríbenos: lo creamos para ti.</span>
        </div>
      ) : (
        <div className="pgrid">
          {items.map((p, i) => (
            <ProductCard key={p.id} index={i} product={p} onAdd={add} added={added[p.id]} />
          ))}
        </div>
      )}
    </section>
  )
}

export default ResultsSection
