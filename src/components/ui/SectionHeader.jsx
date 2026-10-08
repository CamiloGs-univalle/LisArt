import './SectionHeader.css'
import Icon from './Icon'
import EditText from './EditText'

// editKey: si se pasa, la administradora puede editar todos los textos del encabezado
// (se guardan en content.<editKey>.title, .emphasis, etc.)
export default function SectionHeader({ copy = {}, align = 'left', admin, action, id, editKey }) {
  const { eyebrow, num, emphasis, subtitle, color, note, emoji } = copy
  // Texto: editable si hay editKey, normal si no
  const t = (k, label, Tag = 'span', className = '', multiline = false) =>
    editKey
      ? <EditText path={`${editKey}.${k}`} fallback={copy[k] || ''} placeholder={`+ ${label}`} as={Tag} className={className} multiline={multiline} />
      : (copy[k] ? <Tag className={className || undefined}>{copy[k]}</Tag> : null)

  return (
    <header className={`sec-head sec-head--${align}`} style={color ? { '--c': color } : undefined}>
      <div className="sec-head__text">
        {(num || eyebrow || note || emoji || editKey) && (
          <p className="sec-head__eyebrow">
            {num && <span className="sec-head__num">{num}</span>}
            {emoji && <span aria-hidden="true">{emoji}</span>}
            {t('eyebrow', 'texto pequeño', 'span', 'eyebrow')}
            {(note || editKey) && t('note', 'nota', 'span', 'sticker sec-head__note')}
          </p>
        )}
        <h2 className="display sec-head__title" id={id}>
          {t('title', 'título')}{' '}
          {(emphasis || editKey) && <em>{t('emphasis', 'palabra destacada')}</em>}
        </h2>
        {(subtitle || editKey) && t('subtitle', 'descripción', 'p', 'sec-head__sub', true)}
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
