import { createContext, useContext } from 'react'
import { useSettings } from '../hooks/useSettings'

const Ctx = createContext(null)

export function SettingsProvider({ children }) {
  const store = useSettings()
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useSettingsCtx() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSettingsCtx debe usarse dentro de <SettingsProvider>')
  return ctx
}
