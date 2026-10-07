import { useEffect, useRef, useState } from 'react'
import { useAdmin } from '../../admin/AdminContext'
import { useUI } from '../../../contexts/UIContext'
import { BRAND } from '../../../data/siteContent'
import { useLogo } from './useLogo'
import Icon from '../../ui/Icon'
import './Header.css'

function Header({ searchTerm = '', onSearchChange, cartCount = 0, onOpenLogin, onOpenDashboard, announcement }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [bump, setBump] = useState(false)
  const inputRef = useRef(null)
  const prevCount = useRef(cartCount)
  const { isAdmin } = useAdmin()
  const { openCart } = useUI()
  const logo = useLogo()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { if (searchOpen) inputRef.current?.focus() }, [searchOpen])

  // Pequeño rebote del contador cuando se agrega algo
  useEffect(() => {
    if (cartCount > prevCount.current) {
      setBump(true)
      const t = setTimeout(() => setBump(false), 500)
      prevCount.current = cartCount
      return () => clearTimeout(t)
    }
    prevCount.current = cartCount
  }, [cartCount])

  const closeSearch = () => {
    onSearchChange?.('')
    setSearchOpen(false)
  }

  const goCatalog = () => {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {announcement && (
        <div className="announce" role="status">
          <div className="announce__track">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} aria-hidden={i > 0}>
                {announcement} <Icon name="sparkle" size={12} />
              </span>
            ))}
          </div>
        </div>
      )}

      <header className={`hdr ${scrolled ? 'is-scrolled' : ''} ${searchOpen ? 'is-searching' : ''}`}>
        <div className="hdr__inner container">
          <a href="#top" className="hdr__brand" aria-label={`${BRAND.name}, inicio`}>
            {logo ? (
              <img src={logo} alt="" className="hdr__logo" />
            ) : (
              <span className="hdr__mark" aria-hidden="true">L</span>
            )}
            <span className="hdr__word">{BRAND.name}</span>
          </a>

          <nav className="hdr__nav" aria-label="Secciones">
            <a href="#catalogo" onClick={e => { e.preventDefault(); goCatalog() }}>Catálogo</a>
            <a href="#como-pedir">Cómo pedir</a>
            <a href="#preguntas">Preguntas</a>
          </nav>

          <div className="hdr__actions">
            <button
              className="hdr__icon"
              onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
              aria-label={searchOpen ? 'Cerrar búsqueda' : 'Buscar'}
              aria-expanded={searchOpen}
            >
              <Icon name={searchOpen ? 'close' : 'search'} />
            </button>

            <button className="hdr__icon hdr__bag" onClick={openCart} aria-label={`Ver pedido, ${cartCount} productos`}>
              <Icon name="bag" />
              {cartCount > 0 && <span className={`hdr__count ${bump ? 'is-bump' : ''}`}>{cartCount}</span>}
            </button>

            {isAdmin ? (
              <button className="hdr__icon hdr__admin" onClick={onOpenDashboard} aria-label="Panel de administración" title="Panel de administración">
                <Icon name="settings" />
              </button>
            ) : (
              <button className="hdr__icon hdr__login" onClick={onOpenLogin} aria-label="Acceso administrador" title="Acceso administrador">
                <Icon name="user" size={20} />
              </button>
            )}
          </div>
        </div>

        <div className={`hdr__search ${searchOpen ? 'is-open' : ''}`}>
          <div className="container">
            <label className="hdr__field">
              <Icon name="search" size={18} />
              <span className="sr-only">Buscar productos</span>
              <input
                ref={inputRef}
                type="search"
                placeholder="Busca bouquets, cajas, graduación…"
                value={searchTerm}
                onChange={e => onSearchChange?.(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') closeSearch(); if (e.key === 'Enter') goCatalog() }}
                tabIndex={searchOpen ? 0 : -1}
              />
            </label>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
