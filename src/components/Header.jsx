import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div className="header-right">
        <div className="header-icon">🔍</div>
        <div className="header-icon">🛒</div>
      </div>
    </header>
  )
}

export default Header
