// Pestaña "Mi plan": estado del pago, cuánto se debe y cómo pagar (en línea o transferencia)
import { useEffect, useMemo, useState } from 'react'
import { useTenant } from '@/features/tenant/TenantProvider'
import { useBillingSettings } from '@/features/billing/useBilling'
import { watchTenantPayments, watchAccount, startCheckout } from '@/services/billing.service'
import { billingState, quote, monthlyTotal, MODELS, PLANS, planOf, PAY_MONTHS, formatCOP, formatDay } from '@/lib/billingCore'
import { waLink } from '@/lib/format'
import PaymentReturn from './PaymentReturn'

const STATE_COPY = {
  ok: ['Tu catálogo está al día', 'Gracias por tu pago. No tienes que hacer nada por ahora.'],
  soon: ['Tu plan vence pronto', 'Renueva antes del vencimiento para que tu catálogo siga en línea sin interrupciones.'],
  grace: ['Tu plan está vencido', 'Tu catálogo sigue visible unos días más. Paga ahora para evitar que se pause.'],
  overdue: ['Tu catálogo está pausado', 'Tus clientes ven un aviso de «no disponible». Se reactiva automáticamente al confirmar el pago.'],
  none: ['Sin plan asignado', 'Escríbenos para activar tu plan.'],
}
const STATUS_LABEL = { approved: 'Aprobado', pending: 'Pendiente', declined: 'Rechazado', review: 'En revisión' }

export default function PlanTab({ wantPlan }) {
  const { tenant, tenantId } = useTenant()
  const settings = useBillingSettings()
  const [account, setAccount] = useState(null)
  useEffect(() => watchAccount(tenantId, setAccount, () => setAccount(null)), [tenantId])
  // El plan completo es privado (accounts/{negocio}); el negocio solo guarda el vencimiento
  const billing = useMemo(() => (tenant?.billing || account?.billing ? { ...(tenant?.billing || {}), ...(account?.billing || {}) } : null), [tenant?.billing, account?.billing])
  const st = billingState(billing, settings)
  const [months, setMonths] = useState(1)
  const current = planOf(tenant)
  const [plan, setPlan] = useState(wantPlan || current)
  useEffect(() => { if (wantPlan) setPlan(wantPlan) }, [wantPlan])
  const [payments, setPayments] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const q = useMemo(() => quote(billing || {}, settings, months, plan), [billing, settings, months, plan])

  useEffect(() => watchTenantPayments(tenantId, (list) => setPayments(
    [...list].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  ), () => setPayments([])), [tenantId])

  const payOnline = async () => {
    setError(''); setBusy(true)
    try {
      const r = await startCheckout(tenantId, months, plan)
      if (r.demo) { setError('Modo demostración: aquí se abriría el pago seguro de Wompi.'); return }
      window.location.assign(r.url)
    } catch (e) { setError(e.message || 'No se pudo iniciar el pago.') }
    finally { setBusy(false) }
  }

  const receiptMsg = `Hola 👋 Te envío el comprobante de pago del catálogo *${tenant?.name || tenantId}* (/${tenantId}).\nPlan: ${PLANS[plan].label}.\nValor: ${formatCOP(q.total)} · ${q.months} ${q.months === 1 ? 'mes' : 'meses'}.`
  const [title, text] = STATE_COPY[st.state]

  return (
    <div className="pl">
      <PaymentReturn />

      <section className={`ad-card pl-status pl-status--${st.state}`}>
        <div className="pl-status__top">
          <span className={`pl-dot pl-dot--${st.state}`} aria-hidden="true" />
          <div>
            <h2>{title}</h2>
            <p className="ad-hint">{text}</p>
          </div>
        </div>
        <dl className="pl-facts">
          <div><dt>Plan</dt><dd>{PLANS[current].label}{billing?.model ? ` · ${MODELS[billing.model]?.short || ''}` : ''}</dd></div>
          <div><dt>Estado</dt><dd>{st.label}</dd></div>
          <div><dt>Pagado hasta</dt><dd className="num">{formatDay(billing?.paidUntil)}</dd></div>
          <div><dt>Cuota mensual</dt><dd className="num">{formatCOP(monthlyTotal(billing || {}, settings, current))}</dd></div>
        </dl>
      </section>

      <section className="ad-card">
        <h2>Tu plan</h2>
        <div className="pl-plans" role="radiogroup" aria-label="Plan">
          {Object.entries(PLANS).map(([id, p]) => (
            <button key={id} type="button" role="radio" aria-checked={plan === id} className={`pl-plan ${plan === id ? 'is-on' : ''} pl-plan--${id}`} onClick={() => setPlan(id)}>
              <span className="pl-plan__head">
                <strong>{p.label}</strong>
                {p.tag && <em>{p.tag}</em>}
                {current === id && <small>Tu plan actual</small>}
              </span>
              <span className="pl-plan__price num">{formatCOP(monthlyTotal(billing || {}, settings, id))}<small>/mes</small></span>
              <ul>{(id === 'premium' ? ['Todo lo del Básico', ...p.features] : p.features).map(f => <li key={f}>{f}</li>)}</ul>
            </button>
          ))}
        </div>
        {plan !== current && <p className="ad-hint pl-plan__note">{plan === 'premium' ? 'Premium se activa apenas se confirme el pago.' : 'Al pagar en Básico, las herramientas de Google se apagan.'}</p>}
      </section>

      {st.state !== 'none' && (
        <section className="ad-card">
          <h2>{plan !== current ? `Pagar plan ${PLANS[plan].label}` : 'Renovar o adelantar pago'}</h2>
          <p className="ad-hint">Elige cuántos meses quieres pagar. Los meses se suman a tu fecha actual de vencimiento.</p>
          <div className="pl-months" role="radiogroup" aria-label="Meses a pagar">
            {PAY_MONTHS.map(m => (
              <button key={m} type="button" role="radio" aria-checked={months === m} className={months === m ? 'is-on' : ''} onClick={() => setMonths(m)}>
                <strong>{m}</strong> {m === 1 ? 'mes' : 'meses'}
                {m === 12 && settings.annualDiscount > 0 && <em>−{settings.annualDiscount}%</em>}
              </button>
            ))}
          </div>
          <ul className="pl-lines">
            {q.lines.map(l => (
              <li key={l.concept}>
                <span>{l.label}{l.discount > 0 && <small> · ahorras {formatCOP(l.discount)}</small>}</span>
                <span className="num">{formatCOP(l.amount)}</span>
              </li>
            ))}
            <li className="pl-total"><span>Total</span><span className="num">{formatCOP(q.total)}</span></li>
          </ul>

          <div className="pl-pay">
            {settings.wompiEnabled && (
              <div className="pl-way">
                <h3>Pagar en línea</h3>
                <p className="ad-hint">Tarjeta, PSE, Nequi o Bancolombia, con el pago seguro de Wompi. Tu plan se renueva solo al aprobarse.</p>
                <button className="ad-btn ad-btn-primary pl-cta" onClick={payOnline} disabled={busy}>
                  {busy ? 'Abriendo pago seguro…' : `Pagar ${formatCOP(q.total)}`}
                </button>
              </div>
            )}
            {settings.manualInstructions && (
              <div className="pl-way">
                <h3>{settings.wompiEnabled ? 'O por transferencia' : 'Pagar por transferencia'}</h3>
                <pre className="pl-bank">{settings.manualInstructions}</pre>
                {settings.supportWhatsapp
                  ? <a className="ad-btn ad-btn-ghost" href={waLink(settings.supportWhatsapp, receiptMsg)} target="_blank" rel="noopener noreferrer">Enviar comprobante por WhatsApp</a>
                  : <p className="ad-hint">Envía el comprobante a quien administra tu catálogo.</p>}
              </div>
            )}
          </div>
          {error && <p className="pl-error" role="alert">{error}</p>}
        </section>
      )}

      <section className="ad-card">
        <h2>Historial de pagos</h2>
        {payments.length === 0
          ? <p className="ad-hint">Aún no hay pagos registrados.</p>
          : (
            <ul className="pl-history">
              {payments.map(p => (
                <li key={p.id}>
                  <div>
                    <strong className="num">{formatCOP(p.amount)}</strong>
                    <small>{formatDay(p.approvedAt || p.createdAt)} · {p.months} {p.months === 1 ? 'mes' : 'meses'} · {p.method === 'wompi' ? 'En línea' : (p.method || 'Manual')}</small>
                  </div>
                  <span className={`pl-tag pl-tag--${p.status}`}>{STATUS_LABEL[p.status] || p.status}</span>
                </li>
              ))}
            </ul>
          )}
      </section>
    </div>
  )
}
