import { createContext, useContext, useEffect, useState } from 'react'
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import app from '../../data/firebase/config'

const AdminContext = createContext()

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || null

export function AdminProvider({ children }) {
  const auth = getAuth(app)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const allowed = user && (!ADMIN_EMAIL || user.email === ADMIN_EMAIL)
      setIsAdmin(Boolean(allowed))
      setAuthLoading(false)
    })
    return unsub
  }, [auth])

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const allowed = !ADMIN_EMAIL || cred.user.email === ADMIN_EMAIL
    setIsAdmin(allowed)
    if (!allowed) await signOut(auth)
    return allowed
  }

  const logout = async () => {
    await signOut(auth)
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
