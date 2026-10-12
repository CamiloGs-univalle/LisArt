// Barra fina arriba que muestra cuánto de la página has recorrido
import { useEffect, useRef } from 'react'
import { useUI } from '@/features/catalog/UIProvider'

export default function ScrollProgress() {
  const ref = useRef(null)
  const { product, cartOpen } = useUI()
  useEffect(() => {
    let raf = 0
    const set = () => {
      raf = 0
      const h = document.documentElement.scrollHeight - window.innerHeight
      ref.current?.style.setProperty('--p', h > 0 ? Math.min(1, window.scrollY / h).toFixed(4) : 0)
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(set) }
    set()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [])
  return <div ref={ref} className={`fx-progress ${product || cartOpen ? 'is-off' : ''}`} aria-hidden="true" />
}
