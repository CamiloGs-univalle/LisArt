import { useState } from 'react'
import './BottomNav.css'

function BottomNav() {
  const [activeNav, setActiveNav] = useState('home')

  const navItems = [
    { id: 'home', icon: '🏠', label: 'Inicio' },
    { id: 'search', icon: '🔍', label: 'Buscar' },
    { id: 'cart', icon: '🛒', label: 'Carrito' },
    { id: 'favorites', icon: '❤️', label: 'Favoritos' },
    { id: 'profile', icon: '👤', label: 'Perfil' }
  ]

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <div
          key={item.id}
          className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
          onClick={() => setActiveNav(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </div>
      ))}
    </nav>
  )
}

export default BottomNav
