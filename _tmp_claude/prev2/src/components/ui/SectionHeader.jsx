import './SectionHeader.css'
import Icon from './Icon'

export default function SectionHeader({ copy = {}, align = 'left', admin, action, id }) {
  const { eyebrow, num, title, emphasis, subtitle, color, note } = copy
  return (
    <header className={`sec-head sec-head--${align}`} style={color ? { '--c': color } : undefined}>
      <div className="sec-head__text">
        {(num || eyebrow || note) && (
          <p className="sec-head__eyebrow">
            {num && <span className="sec-head__num">{num}</span>}
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {note && <span className="sticker sec-head__note">{note}</span>}
          </p>
        )}
        <h2 className="display sec-head__title" id={id}>
          {title} {emphasis && <em>{emphasis}</em>}
        </h2>
        {subtitle && <p className="sec-head__sub">{subtitle}</p>}
      </div>
      <div className="sec-head__aside">
        {action}
        {admin && (
          <button className="admin-chip" onClick={admin.create} disabled={admin.creating}>
            <Icon name="plus" size={16} /> {admin.creating ? 'Creando…' : 'Agregar producto'}
          </button>
        )}
      </div>
    </header>
  )
}
