import { useState } from 'react'
import { useAdmin } from './AdminContext'
import './AdminLogin.css'

function AdminLogin({ open, onClose }) {
  const { login } = useAdmin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const ok = await login(email.trim(), password)
      if (ok) {
        setEmail('')
        setPassword('')
        onClose()
      } else {
        setError('Este correo no tiene permisos de administrador.')
      }
    } catch (err) {
      const code = err.code || ''
      if (
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential'
      ) {
        setError('Correo o contraseña incorrectos.')
      } else if (code === 'auth/invalid-email') {
        setError('Correo inválido.')
      } else if (code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Espera un momento e inténtalo de nuevo.')
      } else if (
        code === 'auth/operation-not-allowed' ||
        code === 'auth/configuration-not-found'
      ) {
        setError('El login de email/contraseña no está habilitado en Firebase. Actívalo en la consola.')
      } else {
        setError('Error al iniciar sesión. Verifica la configuración de Firebase.')
      }
    } finally {
      setLoading(false)
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

        <h2>🔐 Acceso Admin</h2>
        <p className="admin-login-sub">Ingresa tus datos para administrar el catálogo.</p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          autoFocus
          onChange={e => setEmail(e.target.value)}
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

        <button type="submit" className="admin-login-btn" disabled={loading}>
          {loading ? 'Verificando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

export default AdminLogin
