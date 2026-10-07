import './Categories.css'
import { categories } from '../data/products'

function Categories({ activeCategory, onCategoryChange }) {
  return (
    <nav className="cats" aria-label="Categorías">
      <div className="container">
        <div className="cats__scroll" role="tablist">
          {categories.map(category => {
            const active = activeCategory === category.id
            return (
              <button
                key={category.id}
                role="tab"
                aria-selected={active}
                className={`cats__chip ${active ? 'is-active' : ''}`}
                onClick={() => {
                  onCategoryChange(category.id)
                  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                {category.name}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Categories
