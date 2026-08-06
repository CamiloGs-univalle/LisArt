import { useState, useRef, useEffect } from 'react'
import './Header.css'

function Header({ searchTerm = '', onSearchChange, cartCount = 0, onOpenCart }) {
  const [activeSearch, setActiveSearch] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (activeSearch) {
      inputRef.current?.focus()
    }
  }, [activeSearch])

  const toggleSearch = () => {
    if (activeSearch) {
      onSearchChange?.('')
    }
    setActiveSearch(!activeSearch)
  }

  return (
    <>
      <header className={`header ${collapsed ? 'collapsed' : ''}`}>

        <div className="header-left">
          <div 
            className="menu-icon"
            onClick={() => setCollapsed(true)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className={`search-wrapper ${activeSearch ? 'active' : ''}`}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar productos..."
            className="search-input"
            value={searchTerm}
            onChange={e => onSearchChange?.(e.target.value)}
          />
        </div>

        <div className="header-right">
          <div
            className={`header-icon search-button ${activeSearch ? 'active' : ''}`}
            onClick={toggleSearch}
          >
            {activeSearch ? '✕' : '🔍'}
          </div>

          <button className="header-icon cart-button" onClick={onOpenCart}>
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>

      </header>

      {/* BOTÓN REVEAL FUERA DEL HEADER */}
      <div 
        className={`reveal-button ${collapsed ? 'visible' : ''}`}
        onClick={() => setCollapsed(false)}
      >
        ↓
      </div>
    </>
  )
}

export default Header
