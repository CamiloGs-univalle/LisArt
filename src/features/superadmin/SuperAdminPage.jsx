// Panel del super administrador: crea y administra los catálogos de los clientes
import { useEffect, useMemo, useState } from 'react'
import PlatformShell from '@/features/platform/PlatformShell'
import { useAuth } from '@/features/auth/AuthProvider'
import { navigate, Link } from '@/app/router'
import { PLATFORM } from '@/config/platform'
import { watchAllTenants, updateTenant } from '@/services/tenants.service'
import { watchTickets, closeTicket } from '@/services/tickets.service'
import { friendlyError } from '@/services/auth.service'
import CreateTenantForm from './CreateTenantForm'
import TenantCard from './TenantCard'
import MigrationCard from './MigrationCard'
import TicketsPanel from './TicketsPanel'
import PasswordDialog from './PasswordDialog'
import './SuperAdmin.css'

const toMillis = (v) => (v?.toMillis ? v.toMillis() : typeof v === 'string' ? Date.parse(v) || 0 : Number(v) || Date.now())

export default function SuperAdminPage() {
  const { user, isSuper, loading, logout } = useAuth()
  const [tenants, setTenants] = useState(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all') // all | active | suspended
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState('')
  const [tickets, setTickets] = useState([])
  const [pwTarget, setPwTarget] = useState(null) // { email, name, phone, ticketId? }

  // Solo el super administrador puede estar aquí
  useEffect(() => {
    if (!loading && !isSuper) navigate('/admin', { replace: true })
  }, [loading, isSuper])

  useEffect(() => {
    if (!isSuper) return
    return watchAllTenants(
      (list) => setTenants(list.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))),
      (err) => setError(friendlyError(err, 'No se pudo cargar la lista. Revisa que las reglas de Firestore estén publicadas.')),
    )
  }, [isSuper])

  // Solicitudes de ayuda, en tiempo real
  useEffect(() => {
    if (!isSuper) return
    return watchTickets((list) => setTickets(list.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))), () => {})
  }, [isSuper])

  // El número de solicitudes pendientes se ve también en la pestaña del navegador
  const openTickets = tickets.filter(t => t.status === 'open').length
  useEffect(() => {
    if (!isSuper) return
    document.title = `${openTickets ? `(${openTickets}) ` : ''}Super administrador · ${PLATFORM.name}`
  }, [openTickets, isSuper])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (tenants || []).filter(t =>
      (filter === 'all' || (t.status || 'active') === filter) &&
      (!q || [t.id, t.name, t.ownerEmail, t.city].some(v => v?.toLowerCase().includes(q))))
  }, [tenants, query, filter])

  const counts = useMemo(() => {
    const list = tenants || []
    return { all: list.length, active: list.filter(t => (t.status || 'active') === 'active').length, suspended: list.filter(t => t.status === 'suspended').length }
  }, [tenants])

  if (loading || !isSuper) {
    return <PlatformShell title="Super administrador"><main className="pf-center"><p className="pf-muted">Cargando…</p></main></PlatformShell>
  }

  const toggleStatus = async (t) => {
    const next = t.status === 'suspended' ? 'active' : 'suspended'
    if (next === 'suspended' && !window.confirm(`¿Suspender el catálogo de ${t.name}? Sus clientes verán un aviso de "no disponible".`)) return
    await updateTenant(t.id, { status: next })
    setToast(next === 'active' ? `${t.name} está activo de nuevo` : `${t.name} quedó suspendido`)
  }

  // Al cambiar la contraseña desde una solicitud, la solicitud queda resuelta
  const onPasswordChanged = async () => {
    if (pwTarget?.ticketId) await closeTicket(pwTarget.ticketId, 'contraseña asignada').catch(() => {})
  }

  const hasLisart = tenants?.some(t => t.id === PLATFORM.defaultTenant)

  return (
    <PlatformShell title="Super administrador" wide>
      <header className="sa-top">
        <div className="sa-wrap sa-top__in">
          <div>
            <p className="sa-kicker">{PLATFORM.name}</p>
            <h1 className="display sa-title">Mis clientes</h1>
          </div>
          <div className="sa-top__actions">
            <span className="sa-user" title={user?.email}>{user?.email}</span>
            <button className="btn btn--ghost" onClick={async () => { await logout(); navigate('/admin') }}>Salir</button>
          </div>
        </div>
      </header>

      <main className="sa-wrap sa-main">
        <section className="sa-stats" aria-label="Resumen">
          <div><strong>{counts.all}</strong><span>Catálogos</span></div>
          <div><strong>{counts.active}</strong><span>Activos</span></div>
          <div><strong>{counts.suspended}</strong><span>Suspendidos</span></div>
        </section>

        <TicketsPanel tickets={tickets} tenants={tenants} onChangePassword={setPwTarget} onToast={setToast} />

        {tenants && !hasLisart && <MigrationCard onDone={setToast} />}

        {creating ? (
          <CreateTenantForm onCancel={() => setCreating(false)} onCreated={(name) => setToast(`Catálogo de ${name} creado`)} />
        ) : (
          <button className="btn btn--primary sa-new" onClick={() => setCreating(true)}>＋ Crear catálogo para un cliente</button>
        )}

        <section className="sa-list" aria-label="Catálogos">
          <div className="sa-tools">
            <label className="pf-field sa-search">
              <span className="sr-only">Buscar</span>
              <input type="search" placeholder="Buscar por nombre, correo o ciudad" value={query} onChange={e => setQuery(e.target.value)} />
            </label>
            <div className="sa-chips" role="tablist" aria-label="Filtrar">
              {[['all', 'Todos'], ['active', 'Activos'], ['suspended', 'Suspendidos']].map(([id, label]) => (
                <button key={id} role="tab" aria-selected={filter === id} className={`sa-chip ${filter === id ? 'is-on' : ''}`} onClick={() => setFilter(id)}>
                  {label} <b>{counts[id]}</b>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="pf-error">{error}</p>}
          {!tenants && !error && <p className="pf-muted">Cargando catálogos…</p>}
          {tenants && !visible.length && (
            <div className="sa-empty">
              <p>{tenants.length ? 'Ningún catálogo coincide con la búsqueda.' : 'Aún no hay catálogos. Crea el primero con el botón de arriba.'}</p>
            </div>
          )}

          <div className="sa-grid">
            {visible.map(t => (
              <TenantCard key={t.id} tenant={t} onToggle={() => toggleStatus(t)} onChangePassword={() => setPwTarget({ email: t.ownerEmail, name: t.name, phone: t.whatsapp, tenantId: t.id })} />
            ))}
          </div>
        </section>

        <p className="sa-foot pf-muted">
          ¿Necesitas entrar como un cliente? Abre su catálogo: como super administrador puedes editar cualquiera. · <Link to="/admin">Mi cuenta</Link>
        </p>
      </main>

      {pwTarget && <PasswordDialog {...pwTarget} onClose={() => setPwTarget(null)} onDone={onPasswordChanged} />}
      {toast && <div className="sa-toast" role="status">{toast}</div>}
    </PlatformShell>
  )
}
