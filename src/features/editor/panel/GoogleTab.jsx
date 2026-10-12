// Pestaña "Google": cómo se ve el negocio en Google y en WhatsApp, qué le falta,
// datos del negocio para Google (tipo, dirección, horario) y enlaces para
// Google Compras y reseñas. Todo se publica solo desde el catálogo.
import { useEffect, useMemo, useState } from 'react'
import { useTenant } from '@/features/tenant/TenantProvider'
import { useProductsCtx } from '@/features/catalog/data/ProductsProvider'
import { buildSeo, seoScore, BUSINESS_TYPES, businessType, DAYS, hoursLabel } from '@/lib/seo'
import { isPremium, PLANS, monthlyTotal, formatCOP } from '@/lib/billingCore'
import { useBillingSettings } from '@/features/billing/useBilling'
import { useAuth } from '@/features/auth/AuthProvider'
import GoogleReviewsEditor from './GoogleReviewsEditor'

const EMPTY_HOURS = { days: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], open: '08:00', close: '18:00' }

export default function GoogleTab({ goTo }) {
  const { tenant, tenantId, update } = useTenant()
  const { products } = useProductsCtx()
  const [d, setD] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [copied, setCopied] = useState('')
  const settings = useBillingSettings()
  const { isSuper } = useAuth()
  const premium = isPremium(tenant)

  useEffect(() => {
    if (!tenant) return
    setD({
      businessType: businessType(tenant),
      seoDescription: tenant.seoDescription || tenant.tagline || '',
      address: tenant.address || '',
      hours: tenant.hours?.days ? tenant.hours : null,
      mapsUrl: tenant.mapsUrl || '',
      googleReviewUrl: tenant.googleReviewUrl || '',
    })
  }, [tenant])

  // La vista previa usa lo que está escribiendo (antes de guardar)
  const preview = useMemo(() => ({ ...(tenant || {}), ...d, hours: d.hours || undefined }), [tenant, d])
  const seo = useMemo(() => buildSeo(preview, products, { origin: window.location.origin, slug: tenantId }), [preview, products, tenantId])
  const { score, checks } = useMemo(() => seoScore(preview, products), [preview, products])
  const feedUrl = `${window.location.origin}/${tenantId}/google.xml`
  const host = window.location.host

  const set = (k) => (e) => setD(x => ({ ...x, [k]: e.target.value }))
  const toggleDay = (day) => setD(x => {
    const h = x.hours || EMPTY_HOURS
    const days = h.days.includes(day) ? h.days.filter(v => v !== day) : [...h.days, day]
    return { ...x, hours: { ...h, days } }
  })
  const copy = async (text, id) => {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(''), 1800) } catch { window.prompt('Copia este enlace:', text) }
  }

  const save = async (e) => {
    e.preventDefault()
    const bad = ['mapsUrl', 'googleReviewUrl'].find(k => d[k] && !/^https:\/\//.test(d[k].trim()))
    if (bad) return alert('Los enlaces de Google deben empezar por https://')
    setSaving(true)
    try {
      await update({
        businessType: d.businessType,
        seoDescription: d.seoDescription.trim().slice(0, 300),
        address: d.address.trim(),
        hours: d.hours && d.hours.days.length ? d.hours : null,
        mapsUrl: d.mapsUrl.trim(),
        googleReviewUrl: d.googleReviewUrl.trim(),
      })
      setMsg('✓ Guardado. Google lo verá en su próxima visita.'); setTimeout(() => setMsg(''), 3000)
    } catch { alert('No se pudo guardar. Intenta de nuevo.') }
    finally { setSaving(false) }
  }

  if (!tenant) return null
  const level = score >= 85 ? 'ok' : score >= 60 ? 'mid' : 'low'

  return (
    <div className="gg">
      {/* Puntaje */}
      <section className="ad-card gg-score">
        <div className={`gg-ring gg-ring--${level}`} style={{ '--p': score }} role="img" aria-label={`Tu negocio está ${score}% listo para Google`}>
          <strong>{score}</strong><small>/100</small>
        </div>
        <div>
          <h2>🔎 Tu negocio en Google</h2>
          <p className="ad-hint">
            {premium
              ? 'Tu catálogo ya le muestra a Google tu negocio, tus productos y sus precios, y se actualiza solo cada vez que cambias algo. Entre más completo, mejor puedes aparecer cuando alguien busca lo que vendes.'
              : 'Este puntaje mide qué tan listo está tu catálogo para Google. En el plan Básico, Google solo ve el nombre, la descripción y la foto de tu catálogo; con Premium ve también tus productos, precios, dirección y horario.'}
          </p>
        </div>
        <ul className="gg-checks">
          {checks.map(c => (
            <li key={c.id} className={c.ok ? 'is-ok' : ''}>
              <span aria-hidden="true">{c.ok ? '✓' : '○'}</span>
              <div><strong>{c.label}</strong>{!c.ok && <small>{c.tip}</small>}</div>
            </li>
          ))}
        </ul>
      </section>

      {!premium && (
        <section className="ad-card gg-up">
          <span className="gg-up__tag">Plan Premium</span>
          <h2>Aparece mejor en Google</h2>
          <p className="ad-hint">Con Premium, tu catálogo le entrega a Google tus productos con precio, tu dirección y tu horario, y se actualiza solo cada vez que cambias algo.</p>
          <ul className="gg-up__list">{PLANS.premium.features.map(f => <li key={f}>{f}</li>)}</ul>
          <div className="gg-up__cta">
            <button type="button" className="ad-btn ad-btn-primary" onClick={() => goTo?.('plan', { plan: 'premium' })}>Activar Premium · {formatCOP(monthlyTotal(tenant.billing || {}, settings, 'premium'))}/mes</button>
            {isSuper && <small>Como super administrador también lo activas en Cobros → Plan.</small>}
          </div>
        </section>
      )}

      {/* Vistas previas */}
      <section className="ad-card">
        <h2>👀 {premium ? 'Así te ven' : 'Así te verías con Premium'}</h2>
        <p className="gg-cap">En Google</p>
        <div className="gg-serp">
          <small>{host} › {tenantId}</small>
          <strong>{seo.title}</strong>
          <p>{seo.description}</p>
          {(preview.address || hoursLabel(preview.hours)) && <p className="gg-serp__meta">{[preview.address && `${preview.address}${preview.city ? `, ${preview.city}` : ''}`, hoursLabel(preview.hours)].filter(Boolean).join(' · ')}</p>}
        </div>
        <p className="gg-cap">Al compartir el enlace por WhatsApp</p>
        <div className="gg-wa">
          {seo.image ? <img src={seo.image} alt="" /> : <span className="gg-wa__ph" aria-hidden="true">🖼️</span>}
          <div><strong>{seo.title}</strong><p>{seo.description}</p><small>{host}</small></div>
        </div>
      </section>

      {premium && <>
      {/* Datos del negocio para Google */}
      <form className="ad-card" onSubmit={save}>
        <h2>🏪 Datos para Google</h2>
        <div className="bt-grid">
          <label className="bt-field">
            <span>Tipo de negocio</span>
            <select className="ad-input" value={d.businessType || 'Store'} onChange={set('businessType')}>
              {Object.entries(BUSINESS_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>
          <label className="bt-field">
            <span>Dirección (opcional)</span>
            <input className="ad-input" value={d.address || ''} onChange={set('address')} placeholder="Ej: Cra 100 #11-60, Ciudad Jardín" />
          </label>
          <label className="bt-field bt-field--full">
            <span>Descripción para Google <small className="gg-count">{(d.seoDescription || '').length}/160</small></span>
            <textarea className="ad-input" rows={2} maxLength={300} value={d.seoDescription || ''} onChange={set('seoDescription')}
              placeholder="Ej: Spa en el sur de Cali: masajes relajantes, faciales y uñas. Agenda por WhatsApp." />
          </label>
        </div>

        <fieldset className="gg-hours">
          <legend>Horario de atención</legend>
          <label className="gg-hours__on">
            <input type="checkbox" checked={!!d.hours} onChange={e => setD(x => ({ ...x, hours: e.target.checked ? (tenant.hours?.days ? tenant.hours : EMPTY_HOURS) : null }))} />
            Mostrar horario
          </label>
          {d.hours && (
            <>
              <div className="gg-days" role="group" aria-label="Días que abres">
                {DAYS.map(([k, l]) => (
                  <button type="button" key={k} aria-pressed={d.hours.days.includes(k)} className={d.hours.days.includes(k) ? 'is-on' : ''} onClick={() => toggleDay(k)}>{l}</button>
                ))}
              </div>
              <div className="gg-times">
                <label>Abre <input className="ad-input" type="time" value={d.hours.open} onChange={e => setD(x => ({ ...x, hours: { ...x.hours, open: e.target.value } }))} /></label>
                <label>Cierra <input className="ad-input" type="time" value={d.hours.close} onChange={e => setD(x => ({ ...x, hours: { ...x.hours, close: e.target.value } }))} /></label>
              </div>
            </>
          )}
        </fieldset>

        <div className="bt-grid">
          <label className="bt-field">
            <span>Enlace de tu ubicación en Google Maps (opcional)</span>
            <input className="ad-input" type="url" value={d.mapsUrl || ''} onChange={set('mapsUrl')} placeholder="https://maps.app.goo.gl/…" />
          </label>
          <label className="bt-field">
            <span>Enlace para pedir reseñas en Google (opcional)</span>
            <input className="ad-input" type="url" value={d.googleReviewUrl || ''} onChange={set('googleReviewUrl')} placeholder="https://g.page/r/…/review" />
          </label>
        </div>
        <p className="ad-hint">Con el enlace de reseñas, después de cada pedido tus clientes ven el botón «Déjanos tu reseña en Google».</p>

        <div className="ad-row-between">
          <span className="ad-message">{msg}</span>
          <button className="ad-btn ad-btn-primary" type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>

      <GoogleReviewsEditor />

      {/* Google Compras */}
      <section className="ad-card">
        <h2>🛒 Tus productos en Google Compras</h2>
        <p className="ad-hint">Gratis. Tus productos con foto y precio pueden salir en la pestaña «Compras» de Google. Lo haces una sola vez y después se actualiza solo.</p>
        <div className="gg-copy">
          <input className="ad-input" readOnly value={feedUrl} onFocus={e => e.target.select()} aria-label="Enlace de tus productos para Google" />
          <button type="button" className="ad-btn ad-btn-primary" onClick={() => copy(feedUrl, 'feed')}>{copied === 'feed' ? '✓ Copiado' : 'Copiar'}</button>
        </div>
        <ol className="gg-steps">
          <li>Entra a <a href="https://merchants.google.com" target="_blank" rel="noreferrer">merchants.google.com</a> con tu cuenta de Google y crea tu negocio (Colombia, pesos).</li>
          <li>Ve a <strong>Productos → Agregar productos → Fuente de datos → Archivo programado (URL)</strong>.</li>
          <li>Pega el enlace de arriba y elige que se revise <strong>cada día</strong>.</li>
          <li>Google revisa tus productos en unos días. Solo entran los que tienen foto y precio.</li>
        </ol>
      </section>

      {/* Ficha de Google Maps */}
      <section className="ad-card">
        <h2>📍 Tu ficha en Google Maps</h2>
        <p className="ad-hint">Es la tarjeta con tu ubicación, horario y reseñas que sale cuando buscan tu negocio. Es gratis y es tuya.</p>
        <ol className="gg-steps">
          <li>Entra a <a href="https://business.google.com" target="_blank" rel="noreferrer">business.google.com</a> y busca tu negocio. Si no existe, créalo.</li>
          <li>Verifícalo (Google te pide un video corto, una llamada o un código). Solo el dueño puede hacerlo.</li>
          <li>En «Sitio web» pega el enlace de tu catálogo: <button type="button" className="gg-link" onClick={() => copy(`${window.location.origin}/${tenantId}`, 'cat')}>{copied === 'cat' ? '✓ copiado' : `${host}/${tenantId}`}</button></li>
          <li>En «Pedir reseñas» copia tu enlace y pégalo arriba en «Enlace para pedir reseñas».</li>
        </ol>
        <p className="ad-hint">Las reseñas solo las pueden escribir tus clientes desde su cuenta de Google. El catálogo les deja el botón a la mano para que lo hagan.</p>
      </section>
      </>}
    </div>
  )
}
