import { useEffect, useState } from 'react'

// Logo guardado por el admin (localStorage + evento global)
export function useLogo() {
  const [logo, setLogo] = useState(() => {
    try { return localStorage.getItem('lisart_logo') } catch { return null }
  })
  useEffect(() => {
    const onChange = (e) => setLogo(e.detail)
    window.addEventListener('lisart_logo_changed', onChange)
    return () => window.removeEventListener('lisart_logo_changed', onChange)
  }, [])
  return logo
}
