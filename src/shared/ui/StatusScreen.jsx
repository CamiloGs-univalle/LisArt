// Pantalla simple para estados: cargando, no encontrado, sin permiso…
import './StatusScreen.css'

export default function StatusScreen({ loading = false, title, text, children }) {
  return (
    <main className="status" aria-busy={loading || undefined}>
      {loading ? (
        <div className="status__spinner" role="status" aria-label="Cargando" />
      ) : (
        <div className="status__card">
          {title && <h1 className="display status__title">{title}</h1>}
          {text && <p className="status__text">{text}</p>}
          {children}
        </div>
      )}
    </main>
  )
}
