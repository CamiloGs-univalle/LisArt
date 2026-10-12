// Agendar cita / pedir información: queda guardado en el panel y se abre WhatsApp con el resumen
import { useEffect, useRef, useState } from 'react'
import { createLead, LEAD_TYPES } from '@/services/leads.service'
import { waLink } from '@/lib/format'
import GsIcon from './GsIcon'

const SLOTS = ['Mañana (8–12)', 'Mediodía (12–2)', 'Tarde (2–6)', 'Cualquier hora']
const today = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10) }

export default function ContactForm({ prefill, whatsapp, brand }) {
  const [f, setF] = useState({ type: 'cita', name: '', company: '', phone: '', email: '', date: '', slot: SLOTS[0], message: '', summary: '' })
  const [state, setState] = useState('') // '' | sending | done
  const [err, setErr] = useState('')
  const box = useRef(null)
  useEffect(() => {
    if (!prefill) return
    setF(x => ({ ...x, type: prefill.type || x.type, summary: prefill.summary || '', message: prefill.message ?? x.message }))
    setState(''); setErr('')
  }, [prefill])
  const set = (k) => (e) => { setF(x => ({ ...x, [k]: e.target.value })); setErr('') }

  const submit = async (e) => {
    e.preventDefault()
    if (f.name.trim().length < 2) return setErr('Escribe tu nombre.')
    const phone = f.phone.replace(/\D/g, '')
    if (phone.length < 7 && !/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Déjanos tu WhatsApp o tu correo para contactarte.')
    if (f.type === 'cita' && !f.date) return setErr('Elige el día que prefieres.')
    setState('sending')
    const what = f.type === 'cita' ? 'Quiero agendar una charla 📅' : f.type === 'cotizacion' ? 'Quiero recibir una propuesta 💡' : 'Quiero más información ℹ️'
    const lines = [
      `¡Hola ${brand}! 👋`,
      what,
      '',
      `👤 *Nombre:* ${f.name.trim()}`,
      f.company ? `🏢 *Empresa:* ${f.company.trim()}` : '',
      phone ? `📱 *WhatsApp:* ${f.phone.trim()}` : '',
      f.email ? `✉️ *Correo:* ${f.email.trim()}` : '',
      f.type === 'cita' ? `📅 *Fecha:* ${f.date} · ${f.slot}` : '',
      f.summary ? `\n━━━━━━━━━━━━━━\n${f.summary}\n━━━━━━━━━━━━━━` : '',
      f.message ? `\n💬 ${f.message.trim()}` : '',
    ].filter(Boolean).join('\n')
    // La ventana se abre YA (en el clic): si se abre después de guardar, iPhone/Safari la bloquea
    const win = whatsapp ? window.open('', '_blank') : null
    let saved = true
    try { await createLead({ ...f, phone }) } catch { saved = false }
    if (whatsapp) {
      const url = waLink(whatsapp, lines)
      if (win) { win.opener = null; win.location.href = url } else window.location.href = url
    }
    if (!saved && !whatsapp) { setState(''); return setErr('No se pudo enviar. Revisa tu conexión e intenta de nuevo.') }
    setState('done')
  }

  if (state === 'done') {
    return (
      <div className="gs-form gs-form--done" ref={box} role="status">
        <span className="gs-done"><GsIcon name="check" size={34} /></span>
        <h3>¡Listo, {f.name.split(' ')[0]}!</h3>
        <p>Recibimos tu solicitud{f.type === 'cita' ? ` para el ${f.date} (${f.slot.toLowerCase()})` : ''}. Te contactamos muy pronto{whatsapp ? '; también se abrió WhatsApp con el resumen' : ''}.</p>
        <button type="button" className="gs-btn gs-btn--ghost" onClick={() => setState('')}>Enviar otra solicitud</button>
      </div>
    )
  }

  return (
    <form className="gs-form" onSubmit={submit} ref={box} noValidate>
      <div className="gs-seg gs-seg--type" role="radiogroup" aria-label="¿Qué necesitas?">
        {Object.entries(LEAD_TYPES).map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={f.type === k} className={f.type === k ? 'is-on' : ''} onClick={() => setF(x => ({ ...x, type: k }))}>{l}</button>)}
      </div>
      <div className="gs-form__row">
        <label><span>Nombre *</span><input value={f.name} onChange={set('name')} autoComplete="name" placeholder="Tu nombre" /></label>
        <label><span>Empresa</span><input value={f.company} onChange={set('company')} autoComplete="organization" placeholder="Opcional" /></label>
      </div>
      <div className="gs-form__row">
        <label><span>WhatsApp</span><input value={f.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="300 123 4567" /></label>
        <label><span>Correo</span><input type="email" value={f.email} onChange={set('email')} autoComplete="email" placeholder="tu@correo.com" /></label>
      </div>
      {f.type === 'cita' && (
        <div className="gs-form__row">
          <label><span>Día *</span><input type="date" min={today()} value={f.date} onChange={set('date')} /></label>
          <label><span>Horario</span><select value={f.slot} onChange={set('slot')}>{SLOTS.map(s => <option key={s}>{s}</option>)}</select></label>
        </div>
      )}
      {f.summary && <pre className="gs-form__summary" aria-label="Resumen de tu cotización">{f.summary}</pre>}
      <label><span>Cuéntanos un poco</span><textarea rows={3} value={f.message} onChange={set('message')} maxLength={1000} placeholder="Ej: tenemos una bodega y llevamos todo en Excel…" /></label>
      {err && <p className="gs-form__err" role="alert">{err}</p>}
      <button className="gs-btn gs-btn--primary gs-btn--block" disabled={state === 'sending'}>
        {state === 'sending' ? 'Enviando…' : f.type === 'cita' ? 'Agendar mi charla gratis' : f.type === 'cotizacion' ? 'Pedir mi propuesta' : 'Enviar'} <GsIcon name="arrow" size={18} />
      </button>
      <p className="gs-form__note">Respondemos en menos de 24 horas hábiles. Tus datos solo se usan para contactarte.</p>
    </form>
  )
}
