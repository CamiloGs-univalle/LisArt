// Panel "Cobros" del super administrador: precios, estado de cada cliente y pagos
import { useEffect, useMemo, useRef, useState } from 'react'
import { useBillingSettings } from '@/features/billing/useBilling'
import { watchAllPayments, saveBillingSettings, recordManualPayment, updateTenantBilling, setTenantPlan } from '@/services/billing.service'
import { updateTenant } from '@/services/tenants.service'
import { MODELS, PLANS, planOf, PAY_MONTHS, billingState, quote, monthlyTotal, formatCOP, formatDay, extendDate } from '@/lib/billingCore'
import { waLink } from '@/lib/format'
import { catalogUrl } from '@/app/router'
import { friendlyError } from '@/services/auth.service'

const STATE_ORDER = { overdue: 0, grace: 1, soon: 2, none: 3, ok: 4 }
const METHODS = [['nequi', 'Nequi'], ['bancolombia', 'Bancolombia'], ['efectivo', 'Efectivo'], ['wompi', 'Wompi'], ['otro', 'Otro']]

export default function BillingPanel({ tenants, onToast }) {
  const settings = useBillingSettings()
  const [payments, setPayments] = useState([])
  const [payFor, setPayFor] = useState(null)
  const [planFor, setPlanFor] = useState(null)

  useEffect(() => watchAllPayments((list) => setPayments(list.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))), () => {}), [])

  const rows = useMemo(() => (tenants || [])
    .map(t => ({ t, st: billingState(t.billing, settings), monthly: t.billing ? monthlyTotal(t.billing, settings, planOf(t)) : 0 }))
    .sort((a, b) => STATE_ORDER[a.st.state] - STATE_ORDER[b.st.state] || (a.st.days ?? 999) - (b.st.days ?? 999)), [tenants, settings])

  const stats = useMemo(() => {
    const month = new Date().toISOString().slice(0, 7)
    const approved = payments.filter(p => p.status === 'approved')
    return {
      mrr: rows.filter(r => r.t.status !== 'suspended' && r.st.state !== 'none').reduce((a, r) => a + r.monthly, 0),
      thisMonth: approved.filter(p => String(p.approvedAt || p.createdAt).startsWith(month)).reduce((a, p) => a + (Number(p.amount) || 0), 0),
      late: rows.filter(r => r.st.state === 'grace' || r.st.state === 'overdue').length,
      soon: rows.filter(r => r.st.state === 'soon').length,
    }
  }, [rows, payments])

  const remind = (t, st) => {
    const q = quote(t.billing || {}, settings, 1, planOf(t))
    const msg = `Hola 👋 Te recuerdo que el plan de tu catálogo *${t.name}* ${st.days < 0 ? `venció el ${formatDay(st.due)}` : `vence el ${formatDay(st.due)}`}.\n\nValor: *${formatCOP(q.total)}*\nPuedes pagar desde tu panel (${catalogUrl(t.id)} → ⚙️ → Mi plan) o por transferencia:\n${settings.manualInstructions}\n\n¡Gracias!`
    if (!t.whatsapp) return onToast('Este cliente no tiene WhatsApp registrado.')
    window.open(waLink(t.whatsapp, msg), '_blank', 'noopener')
  }

  return (
    <div className="bp">
      <section className="sa-stats bp-stats" aria-label="Resumen de cobros">
        <div><strong>{formatCOP(stats.mrr)}</strong><span>Ingreso mensual estimado</span></div>
        <div><strong>{formatCOP(stats.thisMonth)}</strong><span>Cobrado este mes</span></div>
        <div className={stats.soon ? 'is-warn' : ''}><strong>{stats.soon}</strong><span>Por vencer</span></div>
        <div className={stats.late ? 'is-bad' : ''}><strong>{stats.late}</strong><span>Vencidos</span></div>
      </section>

      <section className="bp-card">
        <h2 className="display bp-h">Clientes y planes</h2>
        {!rows.length && <p className="pf-muted">Aún no hay catálogos.</p>}
        <div className="bp-table" role="table" aria-label="Planes de los clientes">
          {rows.map(({ t, st, monthly }) => (
            <div key={t.id} className="bp-row" role="row">
              <div className="bp-row__main">
                <strong>{t.name || t.id}{planOf(t) === 'premium' && <em className="bp-premium">Premium</em>}</strong>
                <small>/{t.id} · {t.billing ? MODELS[t.billing.model]?.short || 'Mensual' : 'Sin plan'}{t.billing && ` · ${formatCOP(monthly)}/mes`}</small>
              </div>
              <div className="bp-row__due">
                <span className={`bp-chip bp-chip--${st.state}`}>{st.label}</span>
                {st.due && <small>Vence {formatDay(st.due)}</small>}
              </div>
              <div className="bp-row__actions">
                <button className="btn btn--ink" onClick={() => setPayFor(t)}>Registrar pago</button>
                {(st.state === 'soon' || st.state === 'grace' || st.state === 'overdue') && <button className="btn btn--ghost" onClick={() => remind(t, st)}>Recordar</button>}
                <button className="btn btn--ghost" onClick={() => setPlanFor(t)}>Plan</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bp-card">
        <h2 className="display bp-h">Últimos pagos</h2>
        {!payments.length && <p className="pf-muted">Todavía no hay pagos registrados.</p>}
        <ul className="bp-pays">
          {payments.slice(0, 25).map(p => (
            <li key={p.id}>
              <span><strong>{p.tenantName || p.tenantId}</strong><small>{formatDay(p.approvedAt || p.createdAt)} · {METHODS.find(m => m[0] === p.method)?.[1] || p.method} · {p.months} {p.months === 1 ? 'mes' : 'meses'}</small></span>
              <span className="bp-pays__amt">{formatCOP(p.amount)}<em className={`bp-chip bp-chip--${p.status === 'approved' ? 'ok' : p.status === 'pending' ? 'soon' : 'overdue'}`}>{{ approved: 'Aprobado', pending: 'Pendiente', declined: 'Rechazado', review: 'Revisar' }[p.status] || p.status}</em></span>
            </li>
          ))}
        </ul>
      </section>

      <SettingsCard settings={settings} onToast={onToast} />

      {payFor && <PaymentDialog tenant={payFor} settings={settings} onClose={() => setPayFor(null)} onToast={onToast} />}
      {planFor && <PlanDialog tenant={planFor} settings={settings} onClose={() => setPlanFor(null)} onToast={onToast} />}
    </div>
  )
}

/* ── Configuración de precios ─────────────────────────────── */
function SettingsCard({ settings, onToast }) {
  const [draft, setDraft] = useState(settings)
  const [busy, setBusy] = useState(false)
  useEffect(() => setDraft(settings), [settings])
  const num = (k) => ({ type: 'number', min: 0, value: draft[k] ?? '', onChange: (e) => setDraft(d => ({ ...d, [k]: Number(e.target.value) })) })
  const save = async () => {
    setBusy(true)
    try { await saveBillingSettings(draft); onToast('Precios guardados') }
    catch (e) { onToast(friendlyError(e, 'No se pudo guardar.')) }
    finally { setBusy(false) }
  }
  return (
    <details className="pe-group">
      <summary>Precios y datos de pago</summary>
      <div className="pe-group__body">
        <p className="pf-muted">Estos valores se usan por defecto. A cada cliente le puedes poner un precio especial desde “Plan”.</p>
        <div className="sa-row">
          <label className="pf-field"><span>Mensualidad (modelo mensual)</span><input {...num('monthlyPrice')} /></label>
          <label className="pf-field"><span>Plan Premium (Google): valor extra al mes</span><input {...num('premiumPrice')} /></label>
          <label className="pf-field"><span>Descuento al pagar 12 meses (%)</span><input {...num('annualDiscount')} /></label>
        </div>
        <div className="sa-row">
          <label className="pf-field"><span>Creación (modelo único)</span><input {...num('setupFee')} /></label>
          <label className="pf-field"><span>Mantenimiento mensual (modelo único)</span><input {...num('maintenancePrice')} /></label>
        </div>
        <div className="sa-row">
          <label className="pf-field"><span>Días de prueba al crear</span><input {...num('trialDays')} /></label>
          <label className="pf-field"><span>Avisar antes de vencer (días)</span><input {...num('warnDays')} /></label>
          <label className="pf-field"><span>Días de gracia antes de pausar</span><input {...num('graceDays')} /></label>
        </div>
        <label className="pf-field"><span>Tu WhatsApp (para comprobantes)</span><input inputMode="tel" value={draft.supportWhatsapp || ''} onChange={(e) => setDraft(d => ({ ...d, supportWhatsapp: e.target.value }))} placeholder="300 123 4567" /></label>
        <label className="pf-field"><span>Datos para pagar por transferencia</span><textarea rows={4} value={draft.manualInstructions || ''} onChange={(e) => setDraft(d => ({ ...d, manualInstructions: e.target.value }))} /><small>Tus clientes ven esto en su panel → Mi plan.</small></label>
        <label className="pe-check"><input type="checkbox" checked={!!draft.wompiEnabled} onChange={(e) => setDraft(d => ({ ...d, wompiEnabled: e.target.checked }))} /> Mostrar el botón “Pagar en línea” (Wompi) a mis clientes</label>
        <p className="pf-alert">Para cobrar en línea crea tu cuenta en Wompi y agrega en Vercel: <code>WOMPI_PUBLIC_KEY</code>, <code>WOMPI_INTEGRITY_SECRET</code> y <code>WOMPI_EVENTS_SECRET</code>. En Wompi pon como URL de eventos <code>{window.location.origin}/api/billing/webhook</code>.</p>
        <div className="sa-form__actions"><button className="btn btn--primary" onClick={save} disabled={busy}>{busy ? 'Guardando…' : 'Guardar precios'}</button></div>
      </div>
    </details>
  )
}

/* ── Ventanas ─────────────────────────────────────────────── */
function useDialog(onClose) {
  const ref = useRef(null)
  useEffect(() => { const d = ref.current; d?.showModal(); return () => d?.close() }, [])
  return { ref, onCancel: (e) => { e.preventDefault(); onClose() }, onClick: (e) => { if (e.target === e.currentTarget) onClose() } }
}

function PaymentDialog({ tenant, settings, onClose, onToast }) {
  const dlg = useDialog(onClose)
  const [months, setMonths] = useState(1)
  const [plan, setPlan] = useState(planOf(tenant))
  const q = quote(tenant.billing || { model: 'mensual' }, settings, months, plan)
  const [amount, setAmount] = useState(q.total)
  const [method, setMethod] = useState('nequi')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => setAmount(q.total), [q.total])
  const save = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      await recordManualPayment({ ...tenant, billing: tenant.billing || { model: 'mensual' } }, { amount, months, method, concepts: q.lines, note, plan })
      onToast(`Pago de ${tenant.name} registrado. Nuevo vencimiento: ${formatDay(extendDate(tenant.billing?.paidUntil, months))}`)
      onClose()
    } catch (err) { onToast(friendlyError(err, 'No se pudo registrar el pago.')) } finally { setBusy(false) }
  }
  return (
    <dialog className="sa-dialog" {...dlg}>
      <form className="sa-dialog__body" onSubmit={save}>
        <div className="sa-form__head"><h2 className="display">Registrar pago</h2><button type="button" className="sa-x" onClick={onClose} aria-label="Cerrar">✕</button></div>
        <p className="pf-muted"><strong>{tenant.name}</strong> · vence {formatDay(tenant.billing?.paidUntil)}</p>
        <div className="bp-months" role="radiogroup" aria-label="Meses">
          {PAY_MONTHS.map(m => <button type="button" key={m} role="radio" aria-checked={months === m} className={`sa-chip ${months === m ? 'is-on' : ''}`} onClick={() => setMonths(m)}>{m} {m === 1 ? 'mes' : 'meses'}</button>)}
        </div>
        <div className="bp-months" role="radiogroup" aria-label="Plan">
          {Object.entries(PLANS).map(([id, p]) => <button type="button" key={id} role="radio" aria-checked={plan === id} className={`sa-chip ${plan === id ? 'is-on' : ''}`} onClick={() => setPlan(id)}>{p.label}</button>)}
        </div>
        <ul className="bp-lines">{q.lines.map((l, i) => <li key={i}><span>{l.label}{l.discount > 0 && <small> (−{formatCOP(l.discount)})</small>}</span><b>{formatCOP(l.amount)}</b></li>)}</ul>
        <div className="sa-row">
          <label className="pf-field"><span>Valor recibido</span><input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></label>
          <label className="pf-field"><span>Medio</span><select value={method} onChange={(e) => setMethod(e.target.value)}>{METHODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        </div>
        <label className="pf-field"><span>Nota (opcional)</span><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej. comprobante #1234" /></label>
        <p className="pf-info">Nuevo vencimiento: <strong>{formatDay(extendDate(tenant.billing?.paidUntil, months))}</strong>{tenant.status === 'suspended' && tenant.suspendedReason === 'pago' && ' · el catálogo se reactiva'}</p>
        <div className="sa-form__actions"><button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button><button className="btn btn--primary" disabled={busy}>{busy ? 'Guardando…' : 'Registrar pago'}</button></div>
      </form>
    </dialog>
  )
}

function PlanDialog({ tenant, settings, onClose, onToast }) {
  const dlg = useDialog(onClose)
  const b = tenant.billing || {}
  const [model, setModel] = useState(b.model || 'mensual')
  const [price, setPrice] = useState(b.price || '')
  const [setupFee, setSetupFee] = useState(b.setupFee || '')
  const [setupPaid, setSetupPaid] = useState(!!b.setupPaid)
  const [due, setDue] = useState(String(b.paidUntil || new Date(Date.now() + settings.trialDays * 864e5).toISOString()).slice(0, 10))
  const [busy, setBusy] = useState(false)
  const [plan, setPlan] = useState(planOf(tenant))
  const save = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      if (plan !== planOf(tenant)) await setTenantPlan(tenant.id, plan)
      await updateTenantBilling(tenant, { model, price: Number(price) || 0, setupFee: Number(setupFee) || 0, setupPaid, paidUntil: new Date(`${due}T23:59:00`).toISOString() })
      onToast('Plan actualizado'); onClose()
    } catch (err) { onToast(friendlyError(err, 'No se pudo guardar.')) } finally { setBusy(false) }
  }
  const pause = async () => {
    if (!window.confirm(`¿Pausar el catálogo de ${tenant.name} por falta de pago? Se reactiva solo cuando pague.`)) return
    await updateTenant(tenant.id, { status: 'suspended', suspendedReason: 'pago' }); onToast('Catálogo pausado'); onClose()
  }
  return (
    <dialog className="sa-dialog" {...dlg}>
      <form className="sa-dialog__body" onSubmit={save}>
        <div className="sa-form__head"><h2 className="display">Plan de {tenant.name}</h2><button type="button" className="sa-x" onClick={onClose} aria-label="Cerrar">✕</button></div>
        <div className="sa-options">
          {Object.entries(MODELS).map(([id, m]) => (
            <label key={id} className={`sa-opt ${model === id ? 'is-on' : ''}`}>
              <input type="radio" name="model" checked={model === id} onChange={() => setModel(id)} />
              <strong>{m.label}</strong>
              <small>{id === 'mensual' ? `${formatCOP(settings.monthlyPrice)} al mes` : `${formatCOP(settings.setupFee)} + ${formatCOP(settings.maintenancePrice)}/mes`}</small>
            </label>
          ))}
        </div>
        <div className="sa-options">
          {Object.entries(PLANS).map(([id, p]) => (
            <label key={id} className={`sa-opt ${plan === id ? 'is-on' : ''}`}>
              <input type="radio" name="plan" checked={plan === id} onChange={() => setPlan(id)} />
              <strong>Plan {p.label}</strong>
              <small>{id === 'premium' ? `+ ${formatCOP(settings.premiumPrice)}/mes · Google` : 'Sin herramientas de Google'}</small>
            </label>
          ))}
        </div>
        <div className="sa-row">
          <label className="pf-field"><span>Precio mensual especial</span><input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Vacío = precio normal" /></label>
          {model === 'unico' && <label className="pf-field"><span>Valor de creación especial</span><input type="number" min={0} value={setupFee} onChange={(e) => setSetupFee(e.target.value)} placeholder="Vacío = precio normal" /></label>}
        </div>
        {model === 'unico' && <label className="pe-check"><input type="checkbox" checked={setupPaid} onChange={(e) => setSetupPaid(e.target.checked)} /> La creación ya está pagada</label>}
        <label className="pf-field"><span>Pagado hasta</span><input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></label>
        <div className="sa-form__actions">
          <button type="button" className="btn btn--ghost sa-danger" onClick={pause}>Pausar por falta de pago</button>
          <button className="btn btn--primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar plan'}</button>
        </div>
      </form>
    </dialog>
  )
}
