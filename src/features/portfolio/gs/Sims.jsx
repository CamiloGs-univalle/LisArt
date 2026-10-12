// Simulaciones animadas de cada sistema. Cada una cuenta una historia corta en pasos
// (abajo se lee qué está pasando) para que cualquiera entienda qué hace el sistema.
// Los datos son de ejemplo: solo para mostrar el funcionamiento.
import { useEffect, useState } from 'react'
import './sims.css'

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const money = (n) => `$ ${Math.round(n).toLocaleString('es-CO')}`

// Reloj rápido para detalles (números que suben, cursores…)
export function useTick(ms = 1400, on = true) {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (!on) return
    const id = setInterval(() => setT(x => x + 1), reduced() ? ms * 2.5 : ms)
    return () => clearInterval(id)
  }, [ms, on])
  return t
}

export default function Sim({ kind, title, color = '#6C8CFF', big = false }) {
  const def = SIMS[kind] || SIMS.web
  const n = def.steps.length
  const [s, setS] = useState(0)
  const [hold, setHold] = useState(false)
  useEffect(() => { setS(0) }, [kind])
  useEffect(() => {
    if (hold) return
    const id = setTimeout(() => setS(x => (x + 1) % n), reduced() ? 5200 : def.ms || 2600)
    return () => clearTimeout(id)
  }, [s, hold, n, def.ms])
  const C = def.C
  return (
    <div className={`gs-sim gs-sim--${kind} ${big ? 'gs-sim--big' : ''}`} style={{ '--c': color }} role={big ? 'group' : 'img'} aria-label={`Simulación de ${title || kind}: ${def.steps.join(', ')}`}
      onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
      <div className="gs-sim__bar" aria-hidden="true"><i /><i /><i /><span>{title || kind}</span><b className="gs-sim__live">● en vivo</b></div>
      <div className="gs-sim__body" aria-hidden="true"><C s={s} /></div>
      <div className="gs-sim__cap" aria-hidden="true">
        <span className="gs-sim__n">{s + 1}/{n}</span>
        <span key={s} className="gs-sim__txt">{def.steps[s]}</span>
        <span className="gs-sim__dots">{def.steps.map((_, k) => (big ? <button type="button" aria-label={`Paso ${k + 1}`} key={k} className={k === s ? 'is-on' : k < s ? 'is-done' : ''} onClick={(e) => { e.stopPropagation(); setS(k); setHold(true) }} /> : <i key={k} className={k === s ? 'is-on' : k < s ? 'is-done' : ''} />))}</span>
      </div>
    </div>
  )
}

/* Piezas comunes */
const Kpi = ({ label, value, delta, up = true }) => (
  <div className="sm-kpi"><small>{label}</small><b>{value}</b>{delta && <em className={up ? 'is-up' : 'is-down'}>{up ? '▲' : '▼'} {delta}</em>}</div>
)
const Pill = ({ tone = 'c', children }) => <span className={`sm-pill sm-pill--${tone}`}>{children}</span>

/* ── ERP: un pedido recorre todo el sistema ── */
function Erp({ s }) {
  const t = useTick(900)
  const mods = ['Ventas', 'Inventario', 'Facturación', 'Reportes']
  const sales = 3240000 + (s >= 3 ? 1850000 : 0)
  const bars = [44, 58, 50, 66, 61, 74, s >= 3 ? 96 : 70]
  return (
    <div className="sm-erp">
      <aside className="sm-side">
        <b className="sm-logo">◆ Mi Empresa</b>
        {['Tablero', 'Ventas', 'Compras', 'Inventario', 'Facturación', 'Clientes', 'Reportes'].map((x, i) => (
          <span key={x} className={(s === 0 && i === 1) || (s === 1 && i === 3) || (s === 2 && i === 4) || (s === 3 && i === 0) ? 'is-on' : ''}>{x}</span>
        ))}
      </aside>
      <div className="sm-main">
        <div className="sm-flow">{mods.map((m, i) => <span key={m} className={i === s ? 'is-on' : i < s ? 'is-done' : ''}>{i < s ? '✓ ' : ''}{m}</span>)}</div>
        <div className="sm-kpis">
          <Kpi label="Ventas del mes" value={money(sales)} delta={s >= 3 ? '12%' : '8%'} />
          <Kpi label="Pedidos" value={41 + (s >= 0 ? 1 : 0)} delta="5" />
          <Kpi label="Stock bajo" value={s >= 1 ? 3 : 2} delta={s >= 1 ? '1' : null} up={false} />
        </div>
        <div className="sm-grid2">
          <div className="sm-panel">
            {s === 0 && <div className="sm-order sm-in"><Pill tone="new">Nuevo pedido</Pill><b>#1042 · Hotel Mar</b><span>12 toallas · 6 sábanas</span><strong>{money(1850000)}</strong></div>}
            {s === 1 && <div className="sm-stockmove sm-in"><small>Bodega principal</small>{[['Toalla blanca', 120, 108], ['Sábana doble', 40, 34]].map(([n, a, b]) => <p key={n}><span>{n}</span><s>{a}</s><b>{b}</b></p>)}<Pill tone="ok">Inventario actualizado</Pill></div>}
            {s === 2 && <div className="sm-invoice sm-in"><small>Factura electrónica</small><b>FE-2031</b><p><span>Subtotal</span><span>{money(1554622)}</span></p><p><span>IVA 19%</span><span>{money(295378)}</span></p><p className="is-total"><span>Total</span><span>{money(1850000)}</span></p><Pill tone="ok">✓ Enviada a la DIAN y al cliente</Pill></div>}
            {s === 3 && <div className="sm-done sm-in"><span className="sm-check">✓</span><b>Todo conectado</b><small>Pedido, inventario, factura y tablero sin digitar dos veces</small></div>}
          </div>
          <div className="sm-panel">
            <small className="sm-ptitle">Ventas por día</small>
            <div className="sm-bars">{bars.map((h, i) => <i key={i} style={{ height: `${h}%` }} className={i === 6 && s >= 3 ? 'is-hot' : ''} />)}</div>
            <div className="sm-axis">{['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <span key={i}>{d}</span>)}</div>
          </div>
        </div>
        <div className="sm-ticker"><span key={t}>{['Ana registró una compra · hace 2 min', 'Factura FE-2030 pagada · hace 5 min', 'Proveedor Textiles SA confirmó entrega', 'Juan creó un cliente nuevo'][t % 4]}</span></div>
      </div>
    </div>
  )
}

/* ── CRM: una oportunidad avanza hasta cerrarse ── */
function Crm({ s }) {
  const cols = [['Nuevo', 2], ['Propuesta', 3], ['Negociación', 2], ['Ganado', 4]]
  const others = [['Colegio Andes', 4600000, 0], ['Hotel Mar', 1200000, 1], ['Clínica Sur', 2050000, 2], ['Ferretería JP', 2900000, 3], ['Café Aurora', 3750000, 1]]
  return (
    <div className="sm-crm">
      <div className="sm-crm__top">
        <Kpi label="En proceso" value={money(14300000)} />
        <Kpi label="Ganado este mes" value={money(s >= 3 ? 12850000 : 9200000)} delta={s >= 3 ? '40%' : '12%'} />
        <Kpi label="Tasa de cierre" value={s >= 3 ? '38%' : '33%'} />
      </div>
      <div className="sm-crm__board">
        {cols.map(([c, k], ci) => (
          <div key={c} className="sm-crm__col">
            <small>{c} <em>{k + (ci === s ? 1 : 0)}</em></small>
            {ci === s && (
              <div className={`sm-deal is-star sm-in ${ci === 3 ? 'is-won' : ''}`}>
                <b>Distribuidora Norte</b><span>{money(3650000)}</span>
                <i>{['Llegó por WhatsApp', 'Cotización enviada', 'Llamar el jueves', '¡Cerrado! 🎉'][ci]}</i>
              </div>
            )}
            {others.filter(o => o[2] === ci).map(([n, v]) => <div key={n} className={`sm-deal ${ci === 3 ? 'is-won' : ''}`}><b>{n}</b><span>{money(v)}</span></div>)}
          </div>
        ))}
      </div>
      {s === 2 && <div className="sm-toast">🔔 Recordatorio: llamar a Distribuidora Norte hoy 3:00 p. m.</div>}
      {s === 3 && <div className="sm-confetti" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div>}
    </div>
  )
}

/* ── Inventario: escanear, ubicar, descontar, alertar ── */
function Inventario({ s }) {
  const items = [['Guantes de nitrilo', 'A-01', 120, 120], ['Cinta industrial', 'A-04', 64, 64], ['Etiquetas térmicas', 'C-07', 18, s >= 2 ? 6 : 18], ['Cajas 40×40', 'B-02', 300, 300]]
  return (
    <div className="sm-inv">
      <div className="sm-inv__left">
        <div className={`sm-scan ${s === 0 ? 'is-on' : ''}`}><div className="sm-qr" /><i className="sm-laser" /><small>{s === 0 ? 'Escaneando…' : 'C-07 · Etiquetas térmicas'}</small></div>
        <div className="sm-map">
          <small>Bodega · mapa</small>
          <div className="sm-map__grid">{['A-01', 'A-04', 'B-02', 'B-05', 'C-03', 'C-07'].map(l => <span key={l} className={l === 'C-07' && s >= 1 ? 'is-on' : ''}>{l}</span>)}</div>
          {s >= 1 && <p className="sm-in">📍 Estante C · nivel 7</p>}
        </div>
      </div>
      <div className="sm-inv__right">
        <div className="sm-table">
          <p className="sm-table__h"><span>Producto</span><span>Ubicación</span><span>Existencias</span></p>
          {items.map(([n, l, max, q]) => {
            const low = q < max * 0.35
            return (
              <p key={n} className={`${n.startsWith('Etiquetas') && s >= 1 ? 'is-hl' : ''} ${low ? 'is-low' : ''}`}>
                <span>{n}</span><span>{l}</span>
                <span className="sm-qty"><i style={{ '--w': `${Math.min(100, q / max * 100)}%` }} /><b>{q}</b></span>
              </p>
            )
          })}
        </div>
        {s === 2 && <div className="sm-move sm-in">Salida registrada: <b>−12 und</b> · pedido #1042</div>}
        {s === 3 && <div className="sm-alert sm-in"><b>⚠ Quedan 6 etiquetas</b><span>Sugerido: pedir 100 und a Proveedor Rótulos</span><em>Crear orden de compra</em></div>}
      </div>
    </div>
  )
}

/* ── Punto de venta ── */
function Pos({ s }) {
  const menu = [['Capuchino', 9500, '☕'], ['Croissant', 6500, '🥐'], ['Brownie', 13000, '🍫'], ['Jugo natural', 8000, '🧃'], ['Sándwich', 18000, '🥪'], ['Té chai', 7000, '🍵']]
  const lines = s === 0 ? menu.slice(0, 2) : menu.slice(0, 3)
  const total = lines.reduce((a, l) => a + l[1], 0)
  return (
    <div className="sm-pos">
      <div className="sm-pos__menu">
        <div className="sm-pos__cats">{['Todo', 'Bebidas', 'Panadería', 'Postres'].map((c, i) => <span key={c} className={i === 0 ? 'is-on' : ''}>{c}</span>)}</div>
        <div className="sm-pos__grid">{menu.map(([n, p, e], i) => <span key={n} className={(s === 0 && i === 1) || (s === 1 && i === 2) ? 'is-tap' : ''}><i>{e}</i><b>{n}</b><small>{money(p)}</small></span>)}</div>
      </div>
      <div className="sm-pos__ticket">
        <small>Venta #{2210 + (s === 3 ? 1 : 0)} · Mesa 4</small>
        {lines.map(([n, p]) => <p key={n} className="sm-in"><span>1 × {n}</span><b>{money(p)}</b></p>)}
        <p className="sm-pos__total"><span>Total</span><b>{money(total)}</b></p>
        {s === 2 && <div className="sm-pay sm-in">{['Efectivo', 'Nequi', 'Tarjeta'].map((m, i) => <span key={m} className={i === 1 ? 'is-on' : ''}>{m}</span>)}</div>}
        {s === 3 && <div className="sm-paid sm-in">✓ Pagado con Nequi · recibo enviado</div>}
        <div className="sm-pos__day"><span>Hoy</span><b>{money(1184000 + (s === 3 ? total : 0))}</b><span>{86 + (s === 3 ? 1 : 0)} ventas</span></div>
      </div>
    </div>
  )
}

/* ── Catálogo con pedido a WhatsApp ── */
function Catalogo({ s }) {
  const prods = [['Vestido lino', 129000, '#F2B8A2'], ['Bolso tejido', 78000, '#BFD8F2'], ['Blusa satín', 89000, '#D9C4E8'], ['Sandalias', 99000, '#F6D7A7']]
  const inCart = s === 0 ? 0 : s === 1 ? 2 : 2
  return (
    <div className="sm-cat">
      <div className="sm-phone">
        <div className="sm-phone__notch" />
        <div className="sm-phone__head"><b>Mi Tienda</b><span className={s === 1 ? 'is-bump' : ''}>🛒 {inCart}</span></div>
        {s < 2 ? (
          <div className="sm-phone__grid">{prods.map(([n, p, c], i) => <div key={n} className={s === 1 && i < 2 ? 'is-added' : ''}><i style={{ background: c }} /><b>{n}</b><small>{money(p)}</small><em>{s === 1 && i < 2 ? '✓' : '+'}</em></div>)}</div>
        ) : (
          <div className="sm-phone__cart sm-in">
            <small>Tu pedido</small>
            {prods.slice(0, 2).map(([n, p, c]) => <p key={n}><i style={{ background: c }} /><span>{n}</span><b>{money(p)}</b></p>)}
            <p className="is-total"><span>Total</span><b>{money(207000)}</b></p>
            <span className={`sm-wabtn ${s === 2 ? 'is-pulse' : ''}`}>Enviar pedido por WhatsApp</span>
          </div>
        )}
      </div>
      <div className="sm-chat">
        <div className="sm-chat__head"><i>🟢</i><b>WhatsApp · Mi Tienda</b></div>
        {s >= 3 ? (
          <div className="sm-bubble sm-in">Hola 👋 Quiero este pedido:<br />1. Vestido lino × 1 — $ 129.000<br />2. Bolso tejido × 1 — $ 78.000<br /><b>Total: $ 207.000</b><br />📍 Entrega en Cali</div>
        ) : <p className="sm-chat__wait">{s === 2 ? 'El cliente está enviando su pedido…' : 'Esperando pedidos…'}</p>}
        {s >= 3 && <div className="sm-bubble sm-bubble--me sm-in">¡Gracias! Te lo enviamos hoy 🚚</div>}
      </div>
    </div>
  )
}

/* ── Reservas ── */
function Reservas({ s }) {
  const days = ['Lun 14', 'Mar 15', 'Mié 16', 'Jue 17', 'Vie 18']
  const hours = ['9:00', '10:30', '2:00', '4:00']
  const busy = { '0-0': 'Ana', '1-2': 'Luis', '2-1': 'Sara', '3-3': 'Tomás', '4-0': 'Eva', '1-0': 'Mía' }
  return (
    <div className="sm-res">
      <div className="sm-res__cal">
        <div className="sm-res__grid">
          <span />{days.map(d => <small key={d}>{d}</small>)}
          {hours.map((h, hi) => [<small key={h}>{h}</small>, ...days.map((d, di) => {
            const k = `${di}-${hi}`
            const mine = di === 2 && hi === 2
            return <span key={k} className={busy[k] ? 'is-busy' : mine && s >= 2 ? 'is-new' : mine && s === 1 ? 'is-pick' : ''}>{busy[k] || (mine && s >= 2 ? 'Laura' : '')}</span>
          })])}
        </div>
      </div>
      <div className="sm-res__book">
        {s === 0 && <div className="sm-in"><small>1. Elige el servicio</small>{['Masaje relajante · 60 min', 'Facial hidratante · 45 min', 'Manicure spa · 40 min'].map((x, i) => <p key={x} className={`sm-opt ${i === 0 ? 'is-on' : ''}`}>{x}</p>)}</div>}
        {s === 1 && <div className="sm-in"><small>2. Elige día y hora</small><p className="sm-opt is-on">Mié 16 · 2:00 p. m.</p><p className="sm-opt">Mié 16 · 4:00 p. m.</p><p className="sm-opt">Jue 17 · 9:00 a. m.</p></div>}
        {s === 2 && <div className="sm-in sm-res__ok"><span className="sm-check">✓</span><b>Cita confirmada</b><small>Laura · Masaje relajante<br />Mié 16 · 2:00 p. m.</small></div>}
        {s === 3 && <div className="sm-in sm-res__ok"><span className="sm-check">🔔</span><b>Recordatorio enviado</b><small>«Hola Laura, te esperamos mañana a las 2:00 p. m.»</small></div>}
      </div>
    </div>
  )
}

/* ── Mesa de ayuda ── */
function Helpdesk({ s }) {
  const status = ['Nuevo', 'Asignado', 'En proceso', 'Resuelto']
  const rest = [['#311', 'Clave de correo', 'Media', 'Resuelto', 'Leo'], ['#312', 'Instalar programa', 'Baja', 'En proceso', 'Sara'], ['#313', 'Pantalla parpadea', 'Alta', 'Asignado', 'Juan']]
  return (
    <div className="sm-help">
      <div className="sm-help__kpis"><Kpi label="Abiertos" value={s === 3 ? 6 : 7} /><Kpi label="Resueltos hoy" value={s === 3 ? 13 : 12} delta={s === 3 ? '1' : null} /><Kpi label="Tiempo promedio" value="1 h 40 min" /></div>
      <div className="sm-help__list">
        <div className={`sm-ticket is-star ${s === 3 ? 'is-ok' : ''}`}>
          <b>#314</b>
          <span><strong>La impresora de contabilidad no imprime</strong><small>Prioridad alta · {s >= 1 ? 'Técnico: Ana' : 'Sin asignar'} · ⏱ {['0:02', '0:15', '0:48', '1:05'][s]}</small></span>
          <Pill tone={['new', 'c', 'warn', 'ok'][s]}>{status[s]}</Pill>
        </div>
        {s >= 2 && <div className="sm-note sm-in"><b>Ana:</b> {s === 2 ? 'Revisando el cable de red y el controlador…' : 'Listo, se reinstaló el controlador. ✓'}</div>}
        {rest.map(([id, n, p, st, who]) => (
          <div key={id} className="sm-ticket"><b>{id}</b><span><strong>{n}</strong><small>Prioridad {p} · Técnico: {who}</small></span><Pill tone={st === 'Resuelto' ? 'ok' : st === 'En proceso' ? 'warn' : 'c'}>{st}</Pill></div>
        ))}
      </div>
      {s === 3 && <div className="sm-toast">⭐ El usuario calificó la atención: 5/5</div>}
    </div>
  )
}

/* ── IA que lee y organiza correos ── */
function Ia({ s }) {
  const mails = [['Proveedor ABC', 'Factura agosto #4471', 'Factura', 'Contabilidad'], ['Cliente Hotel Mar', 'URGENTE: llegó incompleto', 'Urgente', 'Servicio'], ['Colegio Andes', 'Cotización de 40 sillas', 'Venta', 'Comercial'], ['Andrés P.', 'Hoja de vida – auxiliar', 'RR. HH.', 'Gestión humana']]
  const summary = 'El cliente Hotel Mar reporta que el pedido #1042 llegó sin 2 sábanas. Pide reposición antes del viernes.'
  const shown = s >= 1 ? summary : ''
  return (
    <div className="sm-ia">
      <div className="sm-ia__inbox">
        <small>Bandeja de entrada · 4 nuevos</small>
        {mails.map(([from, sub, tag, team], i) => (
          <div key={sub} className={`sm-mail ${i === 1 && s >= 1 ? 'is-sel' : ''} ${s === 0 ? 'is-scan' : ''}`} style={{ '--i': i }}>
            <span><b>{from}</b><small>{sub}</small></span>
            {s >= 2 && <em className="sm-in">{tag} → {team}</em>}
          </div>
        ))}
      </div>
      <div className="sm-ia__panel">
        <div className="sm-ia__bot"><i className="sm-orb" /> <b>Asistente IA</b><small>{['Leyendo 4 correos…', 'Resumiendo', 'Clasificando', 'Tareas creadas'][s]}</small></div>
        {s >= 1 && <div className="sm-ia__sum sm-in"><small>Resumen</small><p className="sm-type">{shown}</p></div>}
        {s >= 3 && (
          <div className="sm-ia__tasks sm-in">
            <small>Tareas creadas</small>
            <p>☐ Enviar 2 sábanas a Hotel Mar · <b>Servicio</b></p>
            <p>☐ Registrar factura #4471 · <b>Contabilidad</b></p>
            <p>☐ Cotizar 40 sillas · <b>Comercial</b></p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Reportes y tableros ── */
function Reportes({ s }) {
  const pts = [30, 38, 34, 47, 44, 56, 61, 58, 70, 76]
  const d = pts.map((v, i) => `${i ? 'L' : 'M'}${i * 22} ${100 - v}`).join(' ')
  const area = `${d} L198 100 L0 100 Z`
  const cats = [['Hoteles', 42], ['Colegios', 27], ['Clínicas', 18], ['Otros', 13]]
  return (
    <div className="sm-rep">
      {s === 0 ? (
        <div className="sm-rep__src sm-in">
          {['ventas_2026.xlsx', 'clientes.csv', 'Google Drive · Informes'].map((f, i) => <p key={f} style={{ '--i': i }}><i>{i === 2 ? '☁' : '▦'}</i>{f}<em>conectado ✓</em></p>)}
          <small>Uniendo tus datos en un solo lugar…</small>
        </div>
      ) : (
        <>
          <div className="sm-kpis">
            <Kpi label="Ingresos" value={money(48600000)} delta="18%" />
            <Kpi label="Clientes activos" value="412" delta="24" />
            <Kpi label="Margen" value="32%" delta="3 pts" />
          </div>
          <div className="sm-grid2">
            <div className="sm-panel"><small className="sm-ptitle">Ingresos · 10 meses</small>
              <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="sm-line"><path className="sm-line__area" d={area} /><path key={s} className="sm-line__path" d={d} /></svg>
            </div>
            <div className="sm-panel"><small className="sm-ptitle">Ventas por sector</small>
              <div className="sm-hbars">{cats.map(([n, v]) => <p key={n}><span>{n}</span><i style={{ '--w': `${v * 2}%` }} /><b>{v}%</b></p>)}</div>
            </div>
          </div>
        </>
      )}
      {s === 3 && <div className="sm-toast">📄 Informe_septiembre.pdf enviado a gerencia</div>}
    </div>
  )
}

/* ── Gestión humana ── */
function Rrhh({ s }) {
  const steps = ['Contrato firmado', 'Exámenes médicos', 'Afiliaciones (EPS, ARL)', 'Entrega de dotación']
  return (
    <div className="sm-hr">
      <div className="sm-hr__card">
        <div className="sm-hr__person"><i>LR</i><span><b>Laura Ríos</b><small>Auxiliar contable · ingresa el lunes</small></span></div>
        <small className="sm-ptitle">Proceso de ingreso</small>
        {steps.map((x, i) => <p key={x} className={`sm-hr__step ${i <= s ? 'is-done' : ''} ${i === s ? 'is-now' : ''}`}><i>{i <= s ? '✓' : i + 1}</i>{x}</p>)}
        <div className="sm-progress"><i style={{ width: `${(s + 1) * 25}%` }} /></div>
      </div>
      <div className="sm-hr__side">
        <div className={`sm-req ${s >= 2 ? 'is-ok' : ''}`}><small>Solicitud</small><b>Luis M. · Vacaciones</b><span>5 días · 20 al 24 de octubre</span><Pill tone={s >= 2 ? 'ok' : 'warn'}>{s >= 2 ? '✓ Aprobada por jefe' : 'Esperando aprobación'}</Pill></div>
        <div className="sm-hr__team"><small>Equipo hoy</small><p><b>48</b> trabajando · <b>3</b> en vacaciones · <b>1</b> incapacidad</p></div>
      </div>
    </div>
  )
}

/* ── Página web ── */
function Web({ s }) {
  return (
    <div className="sm-web">
      <div className="sm-web__url">🔒 tunegocio.com</div>
      <div className="sm-web__view">
        <div className="sm-web__page" style={{ '--y': `${[0, -33.3, -66.6, -66.6][s]}%` }}>
          <section className="sm-web__hero">
            <nav><b>◆ Tu Negocio</b><span>Servicios</span><span>Contacto</span></nav>
            <h4>Soluciones que hacen crecer tu empresa</h4>
            <p>Explica en una frase qué haces y por qué eres la mejor opción.</p>
            <i>Escríbenos por WhatsApp</i>
          </section>
          <section className="sm-web__svc">
            <h5>Nuestros servicios</h5>
            <div>{['Asesoría', 'Instalación', 'Mantenimiento'].map((x, i) => <span key={x}><i style={{ '--i': i }} />{x}</span>)}</div>
          </section>
          <section className="sm-web__form">
            <h5>Cuéntanos qué necesitas</h5>
            <p className="sm-input">{s >= 2 ? 'Laura Pérez' : ''}<i /></p>
            <p className="sm-input">{s >= 2 ? '300 123 4567' : ''}</p>
            <span className={`sm-send ${s === 3 ? 'is-sent' : ''}`}>{s === 3 ? '✓ Mensaje enviado' : 'Enviar'}</span>
          </section>
        </div>
      </div>
      {s === 3 && <div className="sm-toast">💬 Nuevo contacto desde tu página: Laura Pérez</div>}
      <div className="sm-web__badges"><span>⚡ Carga en 1 s</span><span>📱 Celular</span><span>🔎 Google</span></div>
    </div>
  )
}

const SIMS = {
  erp: { C: Erp, steps: ['Entra un pedido de un cliente', 'El inventario se descuenta solo', 'Se genera la factura electrónica', 'El tablero se actualiza al instante'] },
  crm: { C: Crm, steps: ['Llega un cliente nuevo por WhatsApp', 'Se envía la cotización', 'El sistema te recuerda hacer seguimiento', '¡Venta ganada! Todo queda registrado'] },
  inventario: { C: Inventario, steps: ['Escaneas el producto con el celular', 'El sistema te dice dónde está', 'Se registra la salida de bodega', 'Te avisa antes de que se acabe'] },
  pos: { C: Pos, ms: 2400, steps: ['Tocas los productos que pidió el cliente', 'La cuenta se arma sola', 'Eliges cómo paga', 'Cobrado: la caja del día se actualiza'] },
  catalogo: { C: Catalogo, steps: ['El cliente ve tus productos desde el celular', 'Agrega lo que le gusta al carrito', 'Envía el pedido con un toque', 'Te llega a WhatsApp listo para despachar'] },
  reservas: { C: Reservas, steps: ['El cliente elige el servicio', 'Escoge un horario libre', 'La cita queda confirmada en tu agenda', 'El sistema le recuerda su cita'] },
  helpdesk: { C: Helpdesk, steps: ['Llega una solicitud nueva', 'Se asigna a un técnico', 'El técnico la atiende y deja notas', 'Resuelta y calificada por el usuario'] },
  ia: { C: Ia, steps: ['La IA lee todos los correos que llegan', 'Resume lo importante de cada uno', 'Los clasifica y envía al área correcta', 'Crea las tareas para tu equipo'] },
  reportes: { C: Reportes, steps: ['Conectamos tus Excel y archivos', 'Se calculan tus indicadores', 'Tu tablero se actualiza solo', 'El informe en PDF se envía automático'] },
  rrhh: { C: Rrhh, steps: ['Ingresa un trabajador nuevo', 'El sistema guía cada paso del ingreso', 'Las solicitudes se aprueban en un clic', 'Todo el proceso queda completo y archivado'] },
  web: { C: Web, steps: ['Tu cliente te encuentra en Google', 'Conoce tus servicios', 'Te deja sus datos en el formulario', 'Te llega el contacto al instante'] },
}
