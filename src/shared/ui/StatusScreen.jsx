// Pantalla para estados: cargando, no encontrado, no disponible, error…
import './StatusScreen.css'

export default function StatusScreen({ loading = false, icon, eyebrow, title, text, children }) {
  return (
    <main className="status" aria-busy={loading || undefined}>
      {loading ? (
        <div className="status__loader" role="status" aria-label="Cargando">
          <span /><span /><span />
        </div>
      ) : (
        <div className="status__card">
          {icon && <span className="status__icon" aria-hidden="true">{icon}</span>}
          {eyebrow && <p className="status__eyebrow">{eyebrow}</p>}
          {title && <h1 className="display status__title">{title}</h1>}
          {text && <p className="status__text">{text}</p>}
          {children && <div className="status__actions">{children}</div>}
        </div>
      )}
    </main>
  )
}
