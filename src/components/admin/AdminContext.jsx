import { createContext, useContext, useEffect, useState } from 'react'

const AdminContext = createContext()

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || 'admin'
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || ''

const STORAGE_KEY = 'lisart_admin_session'

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [authLoading] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, isAdmin ? 'true' : 'false')
    } catch {}
  }, [isAdmin])

  const login = (username, password) => {
    if (username === ADMIN_USER && password === ADMIN_PASS && ADMIN_PASS !== '') {
      setIsAdmin(true)
      return true
    }
    return false
  }

  const logout = () => {
    setIsAdmin(false)
  }

  return (
    <AdminContext.Provider value={{ isAdmin, authLoading, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  return useContext(AdminContext)
}
