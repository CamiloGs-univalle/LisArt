// Botón flotante para volver al inicio en páginas largas
import { useEffect, useState } from 'react'
import Icon from './Icon'

export default function BackToTop() {
  const [on, setOn] = useState(false)
  useEffect(() => {
    let raf = 0
    const check = () => { raf = 0; setOn(window.scrollY > window.innerHeight * 1.5) }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])
  return (
    <button type="button" className={`to-top ${on ? 'is-on' : ''}`} aria-label="Volver arriba" tabIndex={on ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <Icon name="arrowUp" size={20} />
    </button>
  )
}
