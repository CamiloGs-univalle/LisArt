// Datos y efectos visuales del portafolio
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { watchPortfolio } from '@/services/portfolio.service'
import { withDefaults } from './defaults'

// Contenido en tiempo real (con valores iniciales mientras carga)
export function usePortfolio() {
  const [data, setData] = useState(() => withDefaults(null))
  useEffect(() => watchPortfolio((d) => setData(withDefaults(d)), () => {}), [])
  return data
}

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Ajusta el tamaño de la letra para que el texto ocupe exactamente el ancho disponible
export function useFitText(text) {
  const box = useRef(null)
  const inner = useRef(null)
  useLayoutEffect(() => {
    const el = box.current, span = inner.current
    if (!el || !span) return
    const fit = () => {
      span.style.fontSize = '100px'
      const ratio = el.clientWidth / Math.max(1, span.scrollWidth)
      span.style.fontSize = `${Math.max(24, Math.floor(100 * ratio * 0.995))}px`
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, [text])
  return [box, inner]
}

// Aparición al hacer scroll: agrega .is-in a los elementos [data-reveal]
export function useReveal(root, deps = []) {
  useEffect(() => {
    const el = root.current
    if (!el) return
    const items = el.querySelectorAll('[data-reveal]:not(.is-in)')
    if (reduced() || !('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('is-in')); return }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) } })
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' })
    items.forEach(i => io.observe(i))
    return () => io.disconnect()
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

// Publica la posición del scroll como variable CSS (--sy) para efectos de paralaje
export function useScrollVar(root) {
  useEffect(() => {
    const el = root.current
    if (!el || reduced()) return
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => el.style.setProperty('--sy', String(Math.min(window.scrollY, 1600))))
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [root])
}
