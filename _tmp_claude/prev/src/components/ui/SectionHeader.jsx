import './SectionHeader.css'
import Icon from './Icon'

export default function SectionHeader({ copy = {}, align = 'left', admin, action, id }) {
  const { eyebrow, title, emphasis, subtitle } = copy
  return (
    <header className={`sec-head sec-head--${align}`}>
      <div className="sec-head__text">
        {eyebrow && <p className="eyebrow sec-head__eyebrow">{eyebrow}</p>}
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
