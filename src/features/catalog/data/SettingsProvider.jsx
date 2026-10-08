// Configuración de la página del negocio (estilos, secciones, textos),
// sincronizada EN TIEMPO REAL entre todos los dispositivos.
//  · announcement → texto destacado de la barra superior
//  · layouts      → estilo de cada sección { seccion: 'mosaico' }
//  · sections     → secciones nuevas creadas por el dueño
//  · order        → orden de las secciones
//  · hidden       → secciones ocultas
//  · content      → textos de la página editados por el dueño
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTenant } from '@/features/tenant/TenantProvider'
import { watchSettings, saveSettings, EMPTY_SETTINGS } from '@/services/settings.service'

const Ctx = createContext(null)

export function SettingsProvider({ children }) {
  const { tenantId } = useTenant()
  const [data, setData] = useState(EMPTY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const ref = useRef(data)
  ref.current = data

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    return watchSettings(tenantId, (d) => { setData(d); setLoading(false) }, () => setLoading(false))
  }, [tenantId])

  // Cambio optimista: se ve de inmediato y luego se confirma en la base
  const save = useCallback((patch) => {
    setData(d => ({ ...d, ...patch }))
    return saveSettings(tenantId, patch)
  }, [tenantId])

  const api = useMemo(() => ({
    updateAnnouncement: (text) => save({ announcement: text }),
    updateContent: (content) => save({ content }),
    setLayout: (id, style) => save({ layouts: { ...ref.current.layouts, [id]: style } }),
    setOrder: (order) => save({ order }),
    toggleHidden: (id) => {
      const h = ref.current.hidden || []
      return save({ hidden: h.includes(id) ? h.filter(x => x !== id) : [...h, id] })
    },
    addSection: async (section) => {
      const id = `sec_${Date.now().toString(36)}`
      await save({
        sections: [...ref.current.sections, { id, ...section }],
        layouts: { ...ref.current.layouts, [id]: section.style || 'catalogo' },
      })
      return id
    },
    updateSection: (id, p) => save({ sections: ref.current.sections.map(s => (s.id === id ? { ...s, ...p } : s)) }),
    removeSection: (id) => save({
      sections: ref.current.sections.filter(s => s.id !== id),
      order: ref.current.order.filter(x => x !== id),
    }),
  }), [save])

  const value = {
    loading,
    announcement: data.announcement || '',
    content: data.content || {},
    layouts: data.layouts || {},
    customSections: data.sections || [],
    order: data.order || [],
    hidden: data.hidden || [],
    ...api,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSettingsCtx() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSettingsCtx debe usarse dentro de <SettingsProvider>')
  return ctx
}
