// Barra fija de secciones del catálogo (mapa de navegación).
// Al tocar una sección baja hasta ella; se resalta la sección que estás viendo.
import { useEffect, useRef, useState } from 'react'
import './Categories.css'

function Categories({ sections = [], onGo, onShowAll, showAll = false }) {
  const [active, setActive] = useState(null)
  const barRef = useRef(null)

  // Resalta la sección visible mientras se hace scroll
  useEffect(() => {
    if (showAll) return
    const els = sections.map(s => document.getElementById(`sec-${s.id}`)).filter(Boolean)
    if (!els.length) return
    const io = new IntersectionObserver(entries => {
      const vis = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (vis[0]) setActive(vis[0].target.dataset.section)
    }, { rootMargin: '-35% 0px -55% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [sections, showAll])

  // Mantiene visible el chip activo dentro de la barra
  useEffect(() => {
    // (se mueve solo la barra; no se usa scrollIntoView para no frenar el scroll de la página)
    const bar = barRef.current
    const chip = bar?.querySelector('.is-active')
    if (bar && chip) bar.scrollTo({ left: chip.offsetLeft - (bar.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' })
  }, [active, showAll])

  return (
    <nav className="cats" aria-label="Secciones del catálogo">
      <div className="container">
        <div className="cats__scroll" ref={barRef}>
          {sections.map(s => (
            <button
              key={s.id}
              className={`cats__chip ${!showAll && active === s.id ? 'is-active' : ''}`}
              aria-current={!showAll && active === s.id ? 'true' : undefined}
              onClick={() => { setActive(s.id); onGo?.(s.id) }}
            >
              <span className="cats__emoji" aria-hidden="true">{s.emoji}</span>
              {s.name}
            </button>
          ))}
          <button className={`cats__chip cats__chip--all ${showAll ? 'is-active' : ''}`} onClick={onShowAll}>
            Ver todo
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Categories
