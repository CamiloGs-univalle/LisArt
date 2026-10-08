// Modo edición del catálogo.
// Puede editar: el dueño del negocio o el super administrador.
// "Ver como cliente" oculta las herramientas sin cerrar sesión.
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { useTenant } from '@/features/tenant/TenantProvider'

const Ctx = createContext({ isAdmin: false, canEdit: false, editMode: false })

export function EditorProvider({ children }) {
  const { canEditTenant, logout, user } = useAuth()
  const { tenantId } = useTenant()
  const canEdit = canEditTenant(tenantId)
  const [editMode, setEditMode] = useState(true)

  useEffect(() => { setEditMode(true) }, [user?.uid, tenantId])

  const value = useMemo(() => ({
    canEdit,
    editMode,
    setEditMode,
    // isAdmin = mostrar herramientas de edición ahora mismo
    isAdmin: canEdit && editMode,
    logout,
  }), [canEdit, editMode, logout])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// Nombre histórico: muchos componentes usan useAdmin().isAdmin
export const useAdmin = () => useContext(Ctx)
export const useEditor = useAdmin
