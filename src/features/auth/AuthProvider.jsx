// Sesión del usuario + su perfil (rol y negocio asignado)
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { watchAuth, logout as doLogout } from '@/services/auth.service'
import { watchUserProfile, ensureSuperProfile, ROLES } from '@/services/users.service'
import { PLATFORM } from '@/config/platform'
import { findTenantOwnedBy } from '@/services/tenants.service'

const Ctx = createContext(null)

const isSuperEmail = (user) => {
  if (!user?.email) return false
  const verified = user.emailVerified || user.providerData?.some(p => p.providerId === 'google.com')
  return verified && PLATFORM.superAdmins.includes(user.email.toLowerCase())
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)       // undefined = cargando
  const [profile, setProfile] = useState(undefined)
  const [ownedTenant, setOwnedTenant] = useState(null) // respaldo: negocio con ownerUid = esta cuenta

  useEffect(() => watchAuth((u) => { setUser(u || null); if (!u) setProfile(null) }), [])

  useEffect(() => {
    if (!user) return
    setProfile(undefined)
    return watchUserProfile(user.uid, (p) => setProfile(p || null), () => setProfile(null))
  }, [user])

  // El super administrador queda registrado con su rol en la base de datos
  useEffect(() => {
    if (user && profile === null && isSuperEmail(user)) ensureSuperProfile(user.uid, user.email).catch(() => {})
  }, [user, profile])

  // Si el perfil no dice qué negocio tiene, se busca el negocio que la tiene como dueña
  useEffect(() => {
    setOwnedTenant(null)
    if (!user || profile === undefined || profile?.tenantId || isSuperEmail(user)) return
    let alive = true
    findTenantOwnedBy(user.uid).then(id => { if (alive) setOwnedTenant(id) }).catch(() => {})
    return () => { alive = false }
  }, [user, profile])

  const value = useMemo(() => {
    const isSuper = isSuperEmail(user) || profile?.role === ROLES.SUPER
    return {
      user,
      profile,
      loading: user === undefined || (user && profile === undefined),
      isSuper,
      tenantId: profile?.tenantId || ownedTenant || null,
      canEditTenant: (slug) => !!user && (isSuper || (profile?.tenantId || ownedTenant) === slug),
      logout: doLogout,
    }
  }, [user, profile, ownedTenant])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
