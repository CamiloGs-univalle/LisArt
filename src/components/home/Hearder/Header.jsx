import { useState, useRef, useEffect } from 'react'
import './Header.css'

function Header() {
  const [activeSearch, setActiveSearch] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (activeSearch) {
      inputRef.current?.focus()
    }
  }, [activeSearch])

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
          />
        </div>

        <div className="header-right">
          <div
            className={`header-icon search-button ${activeSearch ? 'active' : ''}`}
            onClick={() => setActiveSearch(!activeSearch)}
          >
            {activeSearch ? '✕' : '🔍'}
          </div>

          {!activeSearch && (
            <div className="header-icon">🛒</div>
          )}
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