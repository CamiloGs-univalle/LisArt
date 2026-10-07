import './Categories.css'
import { categories } from '../data/products'

const COLORS = ['var(--c-magenta)', 'var(--c-blue)', 'var(--c-orange)', 'var(--c-green)', 'var(--c-purple)', 'var(--c-red)']

function Categories({ activeCategory, onCategoryChange, counts }) {
  // Si aún no hay conteos (cargando), muestra todas; luego oculta las vacías
  const visible = categories.filter(c => c.id === 'todos' || !counts || counts[c.id] > 0 || c.id === activeCategory)

  return (
    <nav className="cats" aria-label="Categorías">
      <div className="container">
        <div className="cats__scroll" role="tablist">
          {visible.map((category, i) => {
            const active = activeCategory === category.id
            return (
              <button
                key={category.id}
                role="tab"
                aria-selected={active}
                className={`cats__chip ${active ? 'is-active' : ''}`}
                style={{ '--c': COLORS[i % COLORS.length] }}
                onClick={() => {
                  onCategoryChange(category.id)
                  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                <span className="cats__emoji" aria-hidden="true">{category.emoji}</span>
                {category.name}
                {counts && category.id !== 'todos' && counts[category.id] > 0 && (
                  <span className="cats__count">{counts[category.id]}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Categories
