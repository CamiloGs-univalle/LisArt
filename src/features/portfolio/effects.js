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
    let last = ''
    const fit = () => {
      const prev = span.style.fontSize
      span.classList.add('is-fitting') // medir sin transiciones (si no, mide el tamaño anterior)
      span.style.fontSize = '100px'
      const ratio = el.clientWidth / Math.max(1, span.scrollWidth)
      const next = `${Math.max(24, Math.floor(100 * ratio * 0.985))}px`
      span.style.fontSize = next
      void span.offsetWidth
      span.classList.remove('is-fitting')
      if (next === prev && next === last) return
      last = next
    }
    fit()
    const ro = new ResizeObserver(() => requestAnimationFrame(fit))
    ro.observe(el)
    // Cuando termina de cargar la letra real (más ancha que la provisional), se vuelve a medir
    const onFonts = () => fit()
    document.fonts?.ready.then(fit)
    document.fonts?.addEventListener?.('loadingdone', onFonts)
    const t1 = setTimeout(fit, 400), t2 = setTimeout(fit, 1500)
    return () => { ro.disconnect(); document.fonts?.removeEventListener?.('loadingdone', onFonts); clearTimeout(t1); clearTimeout(t2) }
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
