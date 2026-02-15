import './Categories.css'
import { categories } from '../data/products'

function Categories({ activeCategory, onCategoryChange }) {
  return (
    <section className="categories">
      <div className="categories-scroll">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </section>
  )
}

export default Categories
