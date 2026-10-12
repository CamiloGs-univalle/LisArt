// Pestaña "Vender más": estrategias de venta que el dueño activa sin saber de marketing
import { useMemo, useState } from 'react'
import { useSettingsCtx } from '@/features/catalog/data/SettingsProvider'
import { useProductsCtx } from '@/features/catalog/data/ProductsProvider'
import { formatPrice } from '@/lib/format'
import { isDraft } from '@/lib/catalog'
import { GOAL_TYPES, goalLabel, activeOffer, comboInfo, compareInfo, newId } from '@/lib/marketing'
import '@/features/business/Business.css'
import './MarketingTab.css'

function Block({ icon, title, why, on, children, defaultOpen = false }) {
  return (
    <details className="ms" open={defaultOpen}>
      <summary>
        <span className="ms__icon" aria-hidden="true">{icon}</span>
        <span className="ms__title"><strong>{title}</strong><small>{why}</small></span>
        {on !== undefined && <span className={`ms__state ${on ? 'is-on' : ''}`}>{on ? 'Activo' : 'Apagado'}</span>}
        <span className="ms__chev" aria-hidden="true">⌄</span>
      </summary>
      <div className="ms__body">{children}</div>
    </details>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="ms-toggle">
      <input type="checkbox" role="switch" checked={!!checked} onChange={e => onChange(e.target.checked)} />
      <span className="ms-toggle__ui" aria-hidden="true" />
      <span>{label}</span>
    </label>
  )
}

function ProductSelect({ products, value, onChange, placeholder = 'Elige un producto…', exclude = [] }) {
  return (
    <select className="ad-input" value={value || ''} onChange={e => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {products.filter(p => p.id === value || !exclude.includes(p.id)).map(p => <option key={p.id} value={p.id}>{p.name} · {formatPrice(p.price)}</option>)}
    </select>
  )
}

export default function MarketingTab() {
  const { marketing: m, updateMarketing } = useSettingsCtx()
  const { products: all, updateField } = useProductsCtx()
  const products = useMemo(() => all.filter(p => !isDraft(p) && Number(p.price) > 0), [all])
  const save = (patch) => updateMarketing(patch).catch(() => alert('No se pudo guardar. Revisa tu conexión.'))

  return (
    <div className="mt">
      <section className="ad-card mt-intro">
        <h2>🚀 Vender más</h2>
        <p className="ad-hint">Estrategias que usan las grandes tiendas para que tus clientes compren más y elijan con seguridad. Actívalas aquí y aparecen solas en tu catálogo. <strong>Todo usa datos reales</strong>: así generas confianza y tus clientes vuelven.</p>
      </section>

      <GoalsBlock key={JSON.stringify(m.goals)} m={m} save={save} />
      <OffersBlock products={products} updateField={updateField} />
      <StockBlock m={m} save={save} products={all.filter(p => !isDraft(p))} updateField={updateField} />
      <CompareBlockEditor m={m} save={save} products={products} />
      <CombosBlock m={m} save={save} products={products} />
      <Block icon="🧲" title="Lleva también" why="Sugiere productos que combinan en la ficha y en el carrito. Si hay meta de compra, sugiere primero lo que la completa." on={m.crossSellEnabled}>
        <Toggle checked={m.crossSellEnabled} onChange={v => save({ crossSellEnabled: v })} label="Mostrar sugerencias «Lleva también» y «Completa tu pedido»" />
      </Block>
      <ReviewsBlock m={m} save={save} products={products} />
    </div>
  )
}

/* ── Metas de compra ── */
function GoalsBlock({ m, save }) {
  const [goals, setGoals] = useState(m.goals)
  const dirty = JSON.stringify(goals) !== JSON.stringify(m.goals)
  const set = (i, k, v) => setGoals(g => g.map((x, j) => (j === i ? { ...x, [k]: v, ...(k === 'type' || k === 'value' ? { label: '' } : {}) } : x)))
  return (
    <Block icon="🎯" title="Meta de compra" why="«Te faltan $12.000 para envío gratis». La gente agrega un producto más para no perder el premio." on={m.goalsEnabled} defaultOpen={!m.goalsEnabled}>
      <Toggle checked={m.goalsEnabled} onChange={v => save({ goalsEnabled: v, goals })} label="Mostrar la barra de meta en el carrito" />
      <ul className="ms-goals">
        {goals.map((g, i) => (
          <li key={i}>
            <span className="ms-goals__n">{i + 1}</span>
            <label className="bz-field"><span>Si compra desde</span>
              <input className="ad-input" type="number" min="0" inputMode="numeric" value={g.amount} onChange={e => set(i, 'amount', Number(e.target.value) || 0)} />
            </label>
            <label className="bz-field"><span>Gana</span>
              <select className="ad-input" value={g.type} onChange={e => set(i, 'type', e.target.value)}>
                {Object.entries(GOAL_TYPES).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
              </select>
            </label>
            {(g.type === 'percent' || g.type === 'amount') && (
              <label className="bz-field"><span>{g.type === 'percent' ? '% de descuento' : 'Pesos de descuento'}</span>
                <input className="ad-input" type="number" min="0" inputMode="numeric" value={g.value} onChange={e => set(i, 'value', Number(e.target.value) || 0)} />
              </label>
            )}
            {g.type === 'gift' && (
              <label className="bz-field"><span>¿Qué regalo?</span>
                <input className="ad-input" value={g.label} placeholder="Ej. Tarjeta + chocolates" onChange={e => setGoals(x => x.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} />
              </label>
            )}
            <button type="button" className="bz-x" onClick={() => setGoals(x => x.filter((_, j) => j !== i))} aria-label="Quitar meta">✕</button>
          </li>
        ))}
      </ul>
      <div className="bz-row">
        {goals.length < 3 && <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setGoals(g => [...g, { amount: (Number(g.at(-1)?.amount) || 50000) * 2, type: 'gift', value: 0, label: '' }])}>+ Agregar nivel</button>}
        {dirty && <button type="button" className="ad-btn ad-btn-primary ad-btn-sm" onClick={() => save({ goals })}>Guardar metas</button>}
      </div>
      {goals.length > 0 && (
        <p className="ms-preview">Así lo verán: <b>«Te faltan {formatPrice(Math.max(0, (Number(goals[0].amount) || 0) * 0.15))} para {goalLabel(goals[0]).toLowerCase()}»</b></p>
      )}
      <p className="ad-hint">💡 Pon la primera meta un poco arriba de tu venta promedio. Ej.: si la gente compra $60.000, pon envío gratis desde $80.000.</p>
    </Block>
  )
}

/* ── Ofertas con fecha de fin ── */
function OffersBlock({ products, updateField }) {
  const [pick, setPick] = useState('')
  const [before, setBefore] = useState('')
  const [ends, setEnds] = useState('')
  const offers = products.filter(p => Number(p.oldPrice) > Number(p.price))
  const chosen = products.find(p => p.id === pick)
  const add = async () => {
    if (!chosen) return
    if (Number(before) <= Number(chosen.price)) return alert(`El precio «antes» debe ser mayor que el precio actual (${formatPrice(chosen.price)}).`)
    await updateField(chosen.id, 'oldPrice', Number(before))
    await updateField(chosen.id, 'offerEnds', ends ? new Date(ends).toISOString() : null)
    setPick(''); setBefore(''); setEnds('')
  }
  return (
    <Block icon="⏳" title="Ofertas con cuenta regresiva" why="Precio antes/ahora, % de ahorro y un reloj real. La urgencia ayuda a decidir hoy y no «después»." on={offers.some(p => activeOffer(p))}>
      <div className="ms-grid">
        <label className="bz-field"><span>Producto</span><ProductSelect products={products} value={pick} onChange={id => { setPick(id); const p = products.find(x => x.id === id); setBefore(p ? String(Math.round(Number(p.price) * 1.25 / 100) * 100) : '') }} /></label>
        <label className="bz-field"><span>Precio antes</span><input className="ad-input" type="number" inputMode="numeric" value={before} onChange={e => setBefore(e.target.value)} placeholder="Ej. 120000" /></label>
        <label className="bz-field"><span>Termina (opcional)</span><input className="ad-input" type="datetime-local" value={ends} onChange={e => setEnds(e.target.value)} /></label>
      </div>
      {chosen && Number(before) > Number(chosen.price) && <p className="ms-preview">Mostrará <s>{formatPrice(before)}</s> → <b>{formatPrice(chosen.price)}</b> · ahorra {Math.round((1 - chosen.price / before) * 100)}%</p>}
      <button type="button" className="ad-btn ad-btn-primary ad-btn-sm" onClick={add} disabled={!chosen || !before}>Crear oferta</button>
      {offers.length > 0 && (
        <ul className="ms-list">
          {offers.map(p => {
            const o = activeOffer(p)
            return (
              <li key={p.id}>
                {p.image && <img src={p.image} alt="" />}
                <span><strong>{p.name}</strong><small><s>{formatPrice(p.oldPrice)}</s> → {formatPrice(p.price)} · {o ? (p.offerEnds ? `hasta ${new Date(p.offerEnds).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : 'sin fecha de fin') : 'Terminada'}</small></span>
                <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={async () => { await updateField(p.id, 'oldPrice', null); await updateField(p.id, 'offerEnds', null) }}>Quitar</button>
              </li>
            )
          })}
        </ul>
      )}
    </Block>
  )
}

/* ── Inventario / pocas unidades ── */
function StockBlock({ m, save, products, updateField }) {
  return (
    <Block icon="🔥" title="Pocas unidades" why="«¡Quedan 3!» según tu inventario real. Lo escaso se valora más y se compra antes." on={m.stockEnabled}>
      <Toggle checked={m.stockEnabled} onChange={v => save({ stockEnabled: v })} label="Avisar cuando queden pocas unidades" />
      <label className="bz-field ms-inline"><span>Avisar cuando queden</span>
        <input className="ad-input" type="number" min="1" value={m.lowStock} onChange={e => save({ lowStock: Math.max(1, Number(e.target.value) || 1) })} /> <em>o menos</em>
      </label>
      <p className="ad-hint">Escribe cuántas unidades tienes. Déjalo vacío si no llevas inventario de ese producto. Al registrar una venta en <b>Cuentas</b> se descuenta solo. Con 0 aparece como «Agotado».</p>
      <ul className="ms-stock">
        {products.map(p => (
          <li key={p.id}>
            {p.image && <img src={p.image} alt="" />}
            <span>{p.name}</span>
            <input className="ad-input" type="number" min="0" inputMode="numeric" placeholder="—" defaultValue={p.stock ?? ''} aria-label={`Unidades de ${p.name}`}
              onBlur={e => { const raw = e.target.value.trim(); const v = raw === '' ? null : Math.max(0, Math.floor(Number(raw) || 0)); if (v !== (p.stock ?? null)) updateField(p.id, 'stock', v) }} />
          </li>
        ))}
      </ul>
    </Block>
  )
}

/* ── Comparador: precio ancla ── */
function CompareBlockEditor({ m, save, products }) {
  const [edit, setEdit] = useState(null)
  const list = m.compares || []
  const put = (c) => { save({ compares: list.some(x => x.id === c.id) ? list.map(x => (x.id === c.id ? c : x)) : [...list, c] }); setEdit(null) }
  return (
    <Block icon="⚖️" title="Compara y elige (precio ancla)" why="Muestra 3 opciones: económica, recomendada y premium. La premium hace ver la del medio como la mejor decisión." on={list.length > 0}>
      {list.map(c => {
        const info = compareInfo(c, products)
        return (
          <div key={c.id} className="ms-item">
            <span><strong>{c.title || 'Comparador'}</strong><small>{info.items.map(p => p.name).join(' · ')}</small></span>
            <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setEdit(c)}>Editar</button>
            <button type="button" className="bz-x" onClick={() => window.confirm('¿Eliminar comparador?') && save({ compares: list.filter(x => x.id !== c.id) })} aria-label="Eliminar">✕</button>
          </div>
        )
      })}
      {edit ? <CompareForm initial={edit} products={products} onSave={put} onCancel={() => setEdit(null)} />
        : <button type="button" className="ad-btn ad-btn-primary ad-btn-sm" onClick={() => setEdit({ id: newId('cmp'), title: '¿Cuál es para ti?', subtitle: '', items: ['', '', ''], recommended: '', features: [{ label: '', values: ['', '', ''] }] })}>+ Nuevo comparador</button>}
      <p className="ad-hint">💡 Pon 3 versiones del mismo producto (pequeño, mediano, grande). Marca la del medio como recomendada y escribe qué incluye cada una.</p>
    </Block>
  )
}

function CompareForm({ initial, products, onSave, onCancel }) {
  const [c, setC] = useState(() => ({ ...initial, items: [...(initial.items || []), '', '', ''].slice(0, 3) }))
  const setItem = (i, id) => setC(x => ({ ...x, items: x.items.map((y, j) => (j === i ? id : y)) }))
  const setFeat = (i, k, v, col) => setC(x => ({ ...x, features: x.features.map((f, j) => (j !== i ? f : k === 'label' ? { ...f, label: v } : { ...f, values: f.values.map((y, z) => (z === col ? v : y)) })) }))
  const names = c.items.map(id => products.find(p => p.id === id)?.name || '—')
  const submit = () => {
    const items = c.items.filter(Boolean)
    if (items.length < 2) return alert('Elige al menos 2 productos.')
    onSave({ ...c, items, features: c.features.filter(f => f.label.trim()) })
  }
  return (
    <div className="ms-form">
      <div className="ms-grid">
        <label className="bz-field"><span>Título</span><input className="ad-input" value={c.title} onChange={e => setC({ ...c, title: e.target.value })} /></label>
        <label className="bz-field"><span>Subtítulo (opcional)</span><input className="ad-input" value={c.subtitle} onChange={e => setC({ ...c, subtitle: e.target.value })} placeholder="Ej. Todas incluyen tarjeta personalizada" /></label>
      </div>
      <div className="ms-cols">
        {['Económica', 'Recomendada', 'Premium'].map((lbl, i) => (
          <div key={i} className={`ms-col ${c.recommended ? (c.recommended === c.items[i] ? 'is-rec' : '') : i === 1 ? 'is-rec' : ''}`}>
            <p className="ms-col__lbl">{lbl}</p>
            <ProductSelect products={products} value={c.items[i]} onChange={id => setItem(i, id)} exclude={c.items.filter((_, j) => j !== i)} />
            <label className="ms-radio"><input type="radio" name={`rec-${c.id}`} checked={c.recommended ? c.recommended === c.items[i] : i === 1} disabled={!c.items[i]} onChange={() => setC({ ...c, recommended: c.items[i] })} /> Marcar como «El más elegido»</label>
          </div>
        ))}
      </div>
      <p className="bz-sub">¿Qué incluye cada una?</p>
      <div className="ms-feats">
        <div className="ms-feats__row ms-feats__row--head"><span>Característica</span>{names.map((n, i) => <span key={i}>{n}</span>)}<span /></div>
        {c.features.map((f, i) => (
          <div key={i} className="ms-feats__row">
            <input className="ad-input" value={f.label} placeholder="Ej. Tamaño, # de rosas, Envío…" onChange={e => setFeat(i, 'label', e.target.value)} />
            {[0, 1, 2].map(col => <input key={col} className="ad-input" value={f.values?.[col] || ''} placeholder="Sí / No / 12" onChange={e => setFeat(i, 'value', e.target.value, col)} />)}
            <button type="button" className="bz-x" onClick={() => setC(x => ({ ...x, features: x.features.filter((_, j) => j !== i) }))} aria-label="Quitar">✕</button>
          </div>
        ))}
      </div>
      <div className="bz-row">
        <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setC(x => ({ ...x, features: [...x.features, { label: '', values: ['', '', ''] }] }))}>+ Característica</button>
        <span className="bz-spacer" />
        <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={onCancel}>Cancelar</button>
        <button type="button" className="ad-btn ad-btn-primary ad-btn-sm" onClick={submit}>Guardar comparador</button>
      </div>
    </div>
  )
}

/* ── Combos ── */
function CombosBlock({ m, save, products }) {
  const [edit, setEdit] = useState(null)
  const list = m.combos || []
  const put = (c) => { save({ combos: list.some(x => x.id === c.id) ? list.map(x => (x.id === c.id ? c : x)) : [...list, c] }); setEdit(null) }
  return (
    <Block icon="🎁" title="Combos con ahorro" why="Varios productos juntos a mejor precio. Sube el valor de cada pedido y el cliente siente que gana." on={list.length > 0}>
      {list.map(c => {
        const info = comboInfo(c, products)
        return (
          <div key={c.id} className="ms-item">
            <span><strong>{c.name}</strong><small>{info.items.map(p => p.name).join(' + ')} · {formatPrice(info.price)}{info.save ? ` (ahorra ${formatPrice(info.save)})` : ''}</small></span>
            <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setEdit(c)}>Editar</button>
            <button type="button" className="bz-x" onClick={() => window.confirm('¿Eliminar combo?') && save({ combos: list.filter(x => x.id !== c.id) })} aria-label="Eliminar">✕</button>
          </div>
        )
      })}
      {edit ? <ComboForm initial={edit} products={products} onSave={put} onCancel={() => setEdit(null)} />
        : <button type="button" className="ad-btn ad-btn-primary ad-btn-sm" onClick={() => setEdit({ id: newId('cmb'), name: '', description: '', items: ['', ''], price: 0 })}>+ Nuevo combo</button>}
    </Block>
  )
}

function ComboForm({ initial, products, onSave, onCancel }) {
  const [c, setC] = useState(() => ({ ...initial, items: initial.items?.length ? initial.items : ['', ''] }))
  const info = comboInfo({ ...c, items: c.items.filter(Boolean) }, products)
  const suggested = Math.round(info.regular * 0.9 / 100) * 100
  const submit = () => {
    const items = c.items.filter(Boolean)
    if (!c.name.trim()) return alert('Ponle un nombre al combo.')
    if (items.length < 2) return alert('Un combo necesita al menos 2 productos.')
    onSave({ ...c, items, price: Number(c.price) || suggested })
  }
  return (
    <div className="ms-form">
      <div className="ms-grid">
        <label className="bz-field"><span>Nombre del combo</span><input className="ad-input" value={c.name} onChange={e => setC({ ...c, name: e.target.value })} placeholder="Ej. Sorpresa completa" /></label>
        <label className="bz-field"><span>Descripción (opcional)</span><input className="ad-input" value={c.description} onChange={e => setC({ ...c, description: e.target.value })} placeholder="Ideal para aniversarios" /></label>
      </div>
      <p className="bz-sub">Productos del combo</p>
      <div className="ms-combo-items">
        {c.items.map((id, i) => (
          <div key={i} className="bz-row">
            <ProductSelect products={products} value={id} onChange={v => setC(x => ({ ...x, items: x.items.map((y, j) => (j === i ? v : y)) }))} exclude={c.items.filter((_, j) => j !== i)} />
            {c.items.length > 2 && <button type="button" className="bz-x" onClick={() => setC(x => ({ ...x, items: x.items.filter((_, j) => j !== i) }))} aria-label="Quitar">✕</button>}
          </div>
        ))}
        {c.items.length < 5 && <button type="button" className="bz-link" onClick={() => setC(x => ({ ...x, items: [...x.items, ''] }))}>+ Otro producto</button>}
      </div>
      <div className="ms-grid">
        <label className="bz-field"><span>Precio del combo</span><input className="ad-input" type="number" inputMode="numeric" value={c.price || ''} placeholder={suggested ? String(suggested) : ''} onChange={e => setC({ ...c, price: Number(e.target.value) || 0 })} /></label>
        <div className="ms-preview">Por separado: <b>{formatPrice(info.regular)}</b>{info.regular > 0 && <> · Combo: <b>{formatPrice(Number(c.price) || suggested)}</b> · Ahorra <b>{Math.round((1 - (Number(c.price) || suggested) / info.regular) * 100)}%</b></>}</div>
      </div>
      <div className="bz-row">
        <span className="bz-spacer" />
        <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={onCancel}>Cancelar</button>
        <button type="button" className="ad-btn ad-btn-primary ad-btn-sm" onClick={submit}>Guardar combo</button>
      </div>
    </div>
  )
}

/* ── Opiniones ── */
function ReviewsBlock({ m, save, products }) {
  const [r, setR] = useState({ name: '', stars: 5, text: '', productId: '' })
  const list = m.reviews || []
  const add = () => {
    if (!r.name.trim() || !r.text.trim()) return alert('Escribe el nombre y la opinión.')
    save({ reviews: [{ ...r, id: newId('rv'), name: r.name.trim(), text: r.text.trim() }, ...list] })
    setR({ name: '', stars: 5, text: '', productId: '' })
  }
  return (
    <Block icon="⭐" title="Opiniones de clientes" why="Lo que dicen otros compradores convence más que cualquier descripción. Copia mensajes reales que te han enviado." on={list.length > 0}>
      <div className="ms-grid">
        <label className="bz-field"><span>Nombre del cliente</span><input className="ad-input" value={r.name} onChange={e => setR({ ...r, name: e.target.value })} placeholder="Ej. Laura M." /></label>
        <label className="bz-field"><span>Estrellas</span>
          <select className="ad-input" value={r.stars} onChange={e => setR({ ...r, stars: Number(e.target.value) })}>{[5, 4, 3].map(n => <option key={n} value={n}>{'★'.repeat(n)}</option>)}</select>
        </label>
        <label className="bz-field"><span>¿De qué producto? (opcional)</span><ProductSelect products={products} value={r.productId} onChange={v => setR({ ...r, productId: v })} placeholder="De la tienda en general" /></label>
      </div>
      <label className="bz-field"><span>Opinión</span><textarea className="ad-input" rows={2} value={r.text} onChange={e => setR({ ...r, text: e.target.value })} placeholder="Ej. ¡Le encantó a mi mamá! Llegó puntual y súper bien empacado." /></label>
      <button type="button" className="ad-btn ad-btn-primary ad-btn-sm" onClick={add}>Agregar opinión</button>
      {list.length > 0 && (
        <ul className="ms-list">
          {list.map(x => (
            <li key={x.id}>
              <span><strong>{'★'.repeat(x.stars || 5)} {x.name}</strong><small>“{x.text}”{x.productId ? ` · ${products.find(p => p.id === x.productId)?.name || ''}` : ''}</small></span>
              <button type="button" className="bz-x" onClick={() => save({ reviews: list.filter(y => y.id !== x.id) })} aria-label="Eliminar opinión">✕</button>
            </li>
          ))}
        </ul>
      )}
    </Block>
  )
}
