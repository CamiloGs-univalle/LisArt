// Cotizador: el cliente arma su sistema y ve un rango de precio y tiempo al instante
import { useEffect, useMemo, useRef, useState } from 'react'
import { SOLUTIONS, estimate } from './data'
import GsIcon from './GsIcon'

const cop = (n) => `$ ${Math.round(n).toLocaleString('es-CO')}`

// Número que se anima al cambiar
function Count({ value }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const start = performance.now(), a = from.current, b = value
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setShown(b); from.current = b; return }
    let raf
    const step = (now) => {
      const k = Math.min(1, (now - start) / 600)
      const e = 1 - Math.pow(1 - k, 3)
      setShown(a + (b - a) * e)
      if (k < 1) raf = requestAnimationFrame(step); else from.current = b
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{cop(shown)}</>
}

export default function Estimator({ cfg, system, setSystem, onRequest }) {
  const sol = SOLUTIONS.find(s => s.id === system) || SOLUTIONS[0]
  const [modules, setModules] = useState(sol.modules.slice(0, 3))
  const [size, setSize] = useState('s')
  const [extras, setExtras] = useState([])
  useEffect(() => { setModules(sol.modules.slice(0, 3)) }, [sol.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => estimate(cfg, { system: sol.id, modules, size, extras }), [cfg, sol.id, modules, size, extras])
  const toggle = (list, setList, v) => setList(list.includes(v) ? list.filter(x => x !== v) : [...list, v])
  const sizeLabel = cfg.sizes.find(s => s.id === size)?.label

  const summary = [
    `Sistema: ${sol.name}`,
    `Módulos: ${modules.join(', ') || '—'}`,
    `Equipo: ${sizeLabel}`,
    r.extras.length ? `Extras: ${r.extras.map(x => x.label).join(', ')}` : '',
    `Estimado: ${cop(r.min)} – ${cop(r.max)} · ${r.weeks[0]}–${r.weeks[1]} semanas`,
  ].filter(Boolean).join('\n')

  return (
    <div className="gs-est">
      <div className="gs-est__opts">
        <fieldset>
          <legend><span>1</span> ¿Qué necesitas?</legend>
          <div className="gs-est__systems">
            {SOLUTIONS.map(s => (
              <button key={s.id} type="button" aria-pressed={s.id === sol.id} className={s.id === sol.id ? 'is-on' : ''} style={{ '--c': s.color }} onClick={() => setSystem(s.id)}>
                <GsIcon name={s.icon} /> {s.name.split(' · ')[0]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend><span>2</span> ¿Qué debe hacer? <small>Los 3 primeros vienen incluidos</small></legend>
          <div className="gs-chips">
            {sol.modules.map(m => (
              <button key={m} type="button" aria-pressed={modules.includes(m)} className={modules.includes(m) ? 'is-on' : ''} onClick={() => toggle(modules, setModules, m)}>{modules.includes(m) ? '✓ ' : '+ '}{m}</button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend><span>3</span> ¿Cuántas personas lo usarán?</legend>
          <div className="gs-seg">
            {cfg.sizes.map(s => <button key={s.id} type="button" aria-pressed={size === s.id} className={size === s.id ? 'is-on' : ''} onClick={() => setSize(s.id)}>{s.label}</button>)}
          </div>
        </fieldset>

        <fieldset>
          <legend><span>4</span> Extras (opcional)</legend>
          <div className="gs-chips">
            {cfg.extras.map(x => (
              <button key={x.id} type="button" aria-pressed={extras.includes(x.id)} className={extras.includes(x.id) ? 'is-on' : ''} onClick={() => toggle(extras, setExtras, x.id)}>{extras.includes(x.id) ? '✓ ' : '+ '}{x.label}</button>
            ))}
          </div>
        </fieldset>
      </div>

      <aside className="gs-est__result" style={{ '--c': sol.color }} aria-live="polite">
        <p className="gs-eyebrow">Tu estimado</p>
        <h3><GsIcon name={sol.icon} /> {sol.name}</h3>
        <p className="gs-est__price"><span className="gs-est__from">Entre</span><b><Count value={r.min} /></b><span className="gs-est__from">y</span><b><Count value={r.max} /></b></p>
        <p className="gs-est__time">⏱ {r.weeks[0]} a {r.weeks[1]} semanas · por etapas</p>
        <ul>
          {modules.map(m => <li key={m}>✓ {m}</li>)}
          {r.extras.map(x => <li key={x.id}>✓ {x.label}</li>)}
          <li>✓ {sizeLabel}</li>
        </ul>
        <p className="gs-est__note">Precio aproximado en pesos colombianos. El valor final se confirma en la charla gratuita. Soporte mensual opcional desde {cop(cfg.supportFrom)}.</p>
        <div className="gs-est__cta">
          <button type="button" className="gs-btn gs-btn--primary" onClick={() => onRequest('cotizacion', summary)}>Recibir mi propuesta</button>
          <button type="button" className="gs-btn gs-btn--ghost" onClick={() => onRequest('cita', summary)}>Agendar charla gratis</button>
        </div>
      </aside>
    </div>
  )
}
