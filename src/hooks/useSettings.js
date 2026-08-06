import { useEffect, useState, useCallback } from 'react'
import { db } from '../data/firebase/config'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

const SETTINGS_COL = 'settings'
const HOME_DOC = 'home'

export function useSettings() {
  const [announcement, setAnnouncement] = useState('')
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    try {
      const ref = doc(db, SETTINGS_COL, HOME_DOC)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        setAnnouncement(snap.data().announcement || '')
      } else {
        await setDoc(ref, { announcement: '' })
        setAnnouncement('')
      }
    } catch (err) {
      console.error('Error cargando settings:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const updateAnnouncement = useCallback(async (text) => {
    await updateDoc(doc(db, SETTINGS_COL, HOME_DOC), { announcement: text })
    setAnnouncement(text)
  }, [])

  return { announcement, loading, updateAnnouncement, refetch }
}
