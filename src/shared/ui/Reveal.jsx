import { useEffect, useRef, useState } from 'react'

// Aparece suavemente al entrar en pantalla (respeta prefers-reduced-motion vía CSS)
export default function Reveal({ as: Tag = 'div', className = '', delay = 0, style, children, ...rest }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { setVisible(true); return }
    let done = false
    const show = () => {
      if (done) return
      done = true
      setVisible(true)
      io.disconnect()
      window.removeEventListener('scroll', check)
    }
    // Respaldo: si el usuario hace scroll muy rápido y "salta" el elemento
    const check = () => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) show()
    }
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) show() },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.01 }
    )
    io.observe(el)
    window.addEventListener('scroll', check, { passive: true })
    check()
    return () => { io.disconnect(); window.removeEventListener('scroll', check) }
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  )
}
