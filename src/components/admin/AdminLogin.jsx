import { useState } from 'react'
import { useAdmin } from './AdminContext'
import './AdminLogin.css'

function AdminLogin({ open, onClose }) {
  const { login } = useAdmin()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const ok = login(username.trim(), password)
    if (ok) {
      setUsername('')
      setPassword('')
      onClose()
    } else {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <div className="admin-login-overlay" onClick={onClose}>
      <form
        className="admin-login-card"
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <button type="button" className="admin-login-close" onClick={onClose}>
          ✕
        </button>

        <h2>Iniciar sesión</h2>
        <p className="admin-login-sub">Acceso exclusivo para administradores.</p>

        <input
          type="text"
          placeholder="Usuario"
          value={username}
          autoFocus
          onChange={e => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {error && <p className="admin-login-error">{error}</p>}

        <button type="submit" className="admin-login-btn">
          Ingresar
        </button>
      </form>
    </div>
  )
}

export default AdminLogin
