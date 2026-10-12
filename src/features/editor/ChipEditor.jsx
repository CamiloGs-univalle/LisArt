// Lista de palabras editable como "chips": escribir + Enter para agregar,
// ✕ para quitar y flechas para cambiar el orden.
import { useState } from 'react'
import './ChipEditor.css'

export default function ChipEditor({ value = [], onChange, placeholder = 'Escribe y presiona Enter', max = 16 }) {
  const [text, setText] = useState('')
  const add = () => {
    const parts = text.split(',').map(t => t.trim()).filter(Boolean)
    if (!parts.length) return
    onChange([...value, ...parts].slice(0, max))
    setText('')
  }
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= value.length) return
    const next = [...value]; [next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className="chipe">
      <ul className="chipe__list">
        {value.map((w, i) => (
          <li key={`${w}-${i}`} className="chipe__chip">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Mover ${w} a la izquierda`}>‹</button>
            <span>{w}</span>
            <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`Mover ${w} a la derecha`}>›</button>
            <button type="button" className="chipe__x" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Quitar ${w}`}>✕</button>
          </li>
        ))}
        {value.length === 0 && <li className="chipe__empty">Sin palabras: la cinta no se muestra.</li>}
      </ul>
      {value.length < max && (
        <div className="chipe__add">
          <input className="ad-input" value={text} placeholder={placeholder} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }} />
          <button type="button" className="ad-btn ad-btn-primary ad-btn-sm" onClick={add} disabled={!text.trim()}>Agregar</button>
        </div>
      )}
    </div>
  )
}
