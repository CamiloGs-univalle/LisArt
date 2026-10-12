// "Abanico de diseños" en Panel → Diseño: estilo de tarjeta y diseño de cada sección
import { useTenant } from '@/features/tenant/TenantProvider'
import { useSettingsCtx } from '@/features/catalog/data/SettingsProvider'
import { useCatalog } from '@/features/catalog/layouts/useCatalog'
import { LAYOUTS } from '@/features/catalog/layouts/Layouts'
import { CARD_STYLES, sectionStyleFor } from '@/lib/design'

export default function DesignFan() {
  const { layout } = useTenant()
  const { cardStyle, setCardStyle, sectionStyles, setSectionStyle, setLayout, layouts } = useSettingsCtx()
  const { sections } = useCatalog()
  const list = sections.filter(s => !s.special)
  const clasico = layout === 'clasico'

  return (
    <div className="df">
      <h3 className="dt-sub">Estilo de las tarjetas</h3>
      <p className="ad-hint">Cómo se ve cada producto. Se aplica a todo el catálogo (en las estructuras con diseño propio, las secciones pasan a usar este estilo).</p>
      <div className="df-cards" role="radiogroup" aria-label="Estilo de tarjeta">
        {Object.entries(CARD_STYLES).map(([id, c]) => (
          <button key={id} type="button" role="radio" aria-checked={cardStyle === id} className={`df-card ${cardStyle === id ? 'is-on' : ''}`} onClick={() => setCardStyle(id)} title={c.hint}>
            <span className={`df-mini df-mini--${id}`} aria-hidden="true"><i /><b /><s /></span>
            <strong>{c.label}</strong>
            <small>{c.hint}</small>
          </button>
        ))}
      </div>

      <h3 className="dt-sub">Diseño de cada sección</h3>
      <p className="ad-hint">Elige cómo se muestran los productos de cada sección: carrusel, mosaico, lista, polaroid, vitrina 3D… {clasico ? '' : '«Automático» usa el diseño propio de la estructura.'} También puedes cambiarlo directo en la página con el modo Editar.</p>
      <ul className="df-secs">
        {list.map(s => {
          const value = clasico ? (layouts[s.id] || s.style) : sectionStyleFor(sectionStyles, layout, s.id)
          return (
            <li key={s.id}>
              <span className="df-secs__name">{s.emoji} {s.name} <small>{s.items.length} productos</small></span>
              <select className="ad-input" value={value} onChange={e => (clasico ? setLayout(s.id, e.target.value) : setSectionStyle(layout, s.id, e.target.value))} aria-label={`Diseño de ${s.name}`}>
                {!clasico && <option value="auto">Automático</option>}
                {Object.entries(LAYOUTS).map(([id, l]) => <option key={id} value={id}>{l.label} — {l.hint}</option>)}
              </select>
            </li>
          )
        })}
      </ul>
      <p className="ad-hint">💡 Para que un producto resalte (grande, a lo ancho o con fondo de color) ve a <b>Productos → ⋯ → Destacar</b>.</p>
    </div>
  )
}
