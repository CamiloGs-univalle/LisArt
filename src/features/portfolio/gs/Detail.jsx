// Ventana de detalle: resumen fácil de entender + simulación del sistema (sin salir de la página)
import { useEffect, useRef } from 'react'
import Sim from './Sims'
import GsIcon from './GsIcon'
import { SOLUTIONS, simForProject } from './data'

const cop = (n) => `$ ${Math.round(n).toLocaleString('es-CO')}`

function useModal(onClose) {
  const ref = useRef(null)
  useEffect(() => {
    const prev = document.activeElement
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); prev?.focus?.() }
  }, [onClose])
  return ref
}

export default function Detail({ item, cfg, onClose, onQuote, onAsk }) {
  const ref = useModal(onClose)
  const isProject = item.kind === 'project'
  const pr = item.data
  const sol = isProject ? SOLUTIONS.find(s => s.sim === (pr.sim || simForProject(pr))) : pr
  const color = sol?.color || '#6C8CFF'
  const from = sol && cfg.systems[sol.id]?.min

  return (
    <div className="gs-modal" role="presentation" onClick={onClose}>
      <div className="gs-modal__panel" role="dialog" aria-modal="true" aria-labelledby="gs-modal-title" tabIndex={-1} ref={ref} onClick={e => e.stopPropagation()} style={{ '--c': color }}>
        <button className="gs-modal__x" onClick={onClose} aria-label="Cerrar"><GsIcon name="close" /></button>
        <div className="gs-modal__sim">
          <Sim kind={isProject ? (pr.sim || simForProject(pr)) : pr.sim} title={isProject ? pr.title : pr.name} color={color} big />
          <p className="gs-modal__hint"><GsIcon name="play" size={14} /> Simulación: así se ve funcionando</p>
        </div>
        <div className="gs-modal__info">
          {isProject ? (
            <>
              <p className="gs-eyebrow">{pr.category || 'Proyecto'}</p>
              <h2 id="gs-modal-title">{pr.title}</h2>
              <p className="gs-modal__lead">{pr.description}</p>
              {sol && <div className="gs-modal__box"><b>Es un sistema de tipo «{sol.name.split(' · ')[0]}»</b><p>{sol.simple}</p></div>}
              {pr.tech && <div className="gs-tags">{pr.tech.split(',').map(t => t.trim()).filter(Boolean).map(t => <span key={t}>{t}</span>)}</div>}
            </>
          ) : (
            <>
              <p className="gs-eyebrow">{pr.short}</p>
              <h2 id="gs-modal-title">{pr.name}</h2>
              <div className="gs-modal__box"><b>En palabras simples</b><p>{pr.simple}</p></div>
              <p className="gs-modal__ideal"><b>Ideal para:</b> {pr.ideal}</p>
              <h3>Lo que te resuelve</h3>
              <ul className="gs-list">{pr.solves.map(x => <li key={x}><GsIcon name="check" size={16} /> {x}</li>)}</ul>
              <h3>Qué puede incluir</h3>
              <div className="gs-tags">{pr.modules.map(m => <span key={m}>{m}</span>)}</div>
            </>
          )}
          {from > 0 && <p className="gs-modal__from">Desde <b>{cop(from)}</b> · se ajusta a lo que necesites</p>}
          <div className="gs-modal__cta">
            {sol && <button className="gs-btn gs-btn--primary" onClick={() => onQuote(sol.id)}>{isProject ? 'Quiero algo así' : 'Cotizar este sistema'} <GsIcon name="arrow" size={18} /></button>}
            <button className="gs-btn gs-btn--ghost" onClick={() => onAsk(isProject ? `Me interesa algo como «${pr.title}».` : `Me interesa un ${pr.name}.`)}>Pedir información</button>
          </div>
        </div>
      </div>
    </div>
  )
}
