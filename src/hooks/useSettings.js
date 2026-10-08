import { useEffect, useState, useCallback, useRef } from 'react'
import { db } from '../data/firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const SETTINGS_COL = 'settings'
const HOME_DOC = 'home'

// Configuración de la página (documento settings/home en Firestore):
//  · announcement → texto de la barra superior
//  · layouts      → estilo visual elegido para cada sección { sectionId: 'mosaico' }
//  · sections     → secciones nuevas creadas por la administradora
//  · order        → orden de las secciones en el catálogo
//  · content      → textos editables de la página (título, preguntas, pagos…)
const EMPTY = { announcement: '', layouts: {}, sections: [], order: [], hidden: [], content: {} }

export function useSettings() {
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const dataRef = useRef(EMPTY)
  dataRef.current = data

  const refetch = useCallback(async () => {
    try {
      if (import.meta.env.DEV && window.__LISART_DEMO_SETTINGS__) {
        setData({ ...EMPTY, ...window.__LISART_DEMO_SETTINGS__ })
        return
      }
      const ref = doc(db, SETTINGS_COL, HOME_DOC)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        setData({ ...EMPTY, ...snap.data() })
      } else {
        await setDoc(ref, { announcement: '' })
      }
    } catch (err) {
      console.error('Error cargando settings:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  // Guarda cambios parciales (merge) y actualiza el estado local al instante
  const save = useCallback(async (patch) => {
    const next = { ...dataRef.current, ...patch }
    setData(next)
    if (import.meta.env.DEV && window.__LISART_DEMO_SETTINGS__) return
    await setDoc(doc(db, SETTINGS_COL, HOME_DOC), patch, { merge: true })
  }, [])

  const updateAnnouncement = useCallback((text) => save({ announcement: text }), [save])

  const setLayout = useCallback(
    (sectionId, style) => save({ layouts: { ...dataRef.current.layouts, [sectionId]: style } }),
    [save]
  )

  const addSection = useCallback(async (section) => {
    const id = `sec_${Date.now().toString(36)}`
    const created = { id, ...section }
    await save({
      sections: [...dataRef.current.sections, created],
      layouts: { ...dataRef.current.layouts, [id]: section.style || 'cuadricula' },
    })
    return created
  }, [save])

  const updateSection = useCallback(
    (id, patch) => save({ sections: dataRef.current.sections.map(s => (s.id === id ? { ...s, ...patch } : s)) }),
    [save]
  )

  const removeSection = useCallback(
    (id) => save({
      sections: dataRef.current.sections.filter(s => s.id !== id),
      order: dataRef.current.order.filter(x => x !== id),
    }),
    [save]
  )

  const setOrder = useCallback((order) => save({ order }), [save])

  // Ocultar / mostrar una sección (ej. Navidad fuera de temporada)
  const toggleHidden = useCallback((id) => {
    const h = dataRef.current.hidden || []
    return save({ hidden: h.includes(id) ? h.filter(x => x !== id) : [...h, id] })
  }, [save])

  // Textos de la página editados por la admin (se guardan completos)
  const updateContent = useCallback((content) => save({ content }), [save])

  return {
    announcement: data.announcement,
    content: data.content || {},
    updateContent,
    layouts: data.layouts || {},
    customSections: data.sections || [],
    order: data.order || [],
    hidden: data.hidden || [],
    toggleHidden,
    loading,
    refetch,
    updateAnnouncement,
    setLayout,
    addSection,
    updateSection,
    removeSection,
    setOrder,
  }
}
