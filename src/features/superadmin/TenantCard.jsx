// Tarjeta de un catálogo en la lista del super administrador
import { useState } from 'react'
import { navigate, catalogPath, catalogUrl } from '@/app/router'
import { resolveTheme } from '@/features/tenant/themes'
import { getTemplate } from '@/features/tenant/templates'
import { PLATFORM } from '@/config/platform'
import { billingState, MODELS, formatDay } from '@/lib/billingCore'

export default function TenantCard({ tenant: t, onToggle, onChangePassword, billingSettings }) {
  const bs = billingState(t.billing, billingSettings)
  const [copied, setCopied] = useState(false)
  const theme = resolveTheme(t.theme || { preset: getTemplate(t.template).theme })
  const suspended = t.status === 'suspended'
  const unpaid = !suspended && bs.state === 'overdue'
  const url = catalogUrl(t.id)

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* sin permiso */ }
  }

  return (
    <article className={`sa-card ${suspended ? 'is-off' : ''}`}>
      <div className="sa-card__head">
        <span className="sa-card__logo" style={{ background: theme.blush, color: theme.primaryDeep }}>
          {t.logo ? <img src={t.logo} alt="" /> : (t.name || t.id).slice(0, 2).toUpperCase()}
        </span>
        <div className="sa-card__id">
          <h2>{t.name || t.id}</h2>
          <button className="sa-card__url" onClick={copy} title="Copiar enlace">
            /{t.id} <small>{copied ? '¡Copiado!' : 'Copiar'}</small>
          </button>
        </div>
        <span className={`sa-badge ${suspended || unpaid ? 'is-off' : ''}`}>{suspended ? (t.suspendedReason === 'pago' ? 'Pausado por pago' : 'Suspendido') : unpaid ? 'Pausado' : 'Activo'}</span>
      </div>

      <dl className="sa-card__meta">
        <div><dt>Dueño</dt><dd>{t.ownerEmail || '—'}</dd></div>
        <div><dt>WhatsApp</dt><dd>{t.whatsapp || '—'}</dd></div>
        <div><dt>Plantilla</dt><dd>{getTemplate(t.template).label}</dd></div>
        <div className="sa-card__plan"><dt>Plan</dt><dd>{t.plan === 'premium' && <em className="bp-premium" style={{ marginLeft: 0 }}>Premium</em>}<span className={`bp-chip bp-chip--${bs.state}`}>{bs.label}</span> <small>{t.billing ? `${MODELS[t.billing.model]?.short || ''} · hasta ${formatDay(t.billing.paidUntil)}` : ''}</small></dd></div>
        <div><dt>Colores</dt><dd className="sa-swatches">{[theme.primary, theme.blush, theme.ink].map((c, k) => <i key={k} style={{ background: c }} />)}</dd></div>
      </dl>

      <div className="sa-card__actions">
        <button className="btn btn--ink" onClick={() => navigate(catalogPath(t.id))}>Abrir y editar</button>
        <button className="btn btn--ghost" onClick={onChangePassword} disabled={!t.ownerEmail || PLATFORM.superAdmins.includes(t.ownerEmail.toLowerCase())} title={t.ownerEmail && PLATFORM.superAdmins.includes(t.ownerEmail.toLowerCase()) ? 'Este catálogo es tuyo: no tiene una cuenta de cliente' : 'Asignar una contraseña nueva'}>Contraseña</button>
        <button className={`btn btn--ghost ${suspended ? '' : 'sa-danger'}`} onClick={onToggle}>{suspended ? 'Activar' : 'Suspender'}</button>
      </div>
    </article>
  )
}
