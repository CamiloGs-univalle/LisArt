// Editor de textos de la página (para la administradora).
// Todo lo que se guarde aquí reemplaza los textos por defecto de siteContent.js.
import { useEffect, useState } from 'react'
import './AdminContentEditor.css'
import { useSettingsCtx } from '../../contexts/SettingsContext'
import { useSiteContent, DEFAULT_CONTENT } from '../../hooks/useSiteContent'

export default function AdminContentEditor() {
  const { updateContent, content = {} } = useSettingsCtx()
  const current = useSiteContent()
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  // Copia editable de los textos actuales
  useEffect(() => {
    setDraft({
      hero: { ...current.hero },
      faq: current.faq.map(f => ({ ...f })),
      announcements: current.announcements.map(a => a.text),
      pagos: current.pagos,
      envios: current.envios,
      cartNote: current.cartNote,
      perks: [...current.perks],
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!draft) return null

  const setHero = (k, v) => setDraft(d => ({ ...d, hero: { ...d.hero, [k]: v } }))
  const setFaq = (i, k, v) => setDraft(d => ({ ...d, faq: d.faq.map((f, j) => (j === i ? { ...f, [k]: v } : f)) }))
  const moveFaq = (i, dir) => setDraft(d => {
    const faq = [...d.faq]; const j = i + dir
    if (j < 0 || j >= faq.length) return d
    ;[faq[i], faq[j]] = [faq[j], faq[i]]
    return { ...d, faq }
  })
  const setAnn = (i, v) => setDraft(d => ({ ...d, announcements: d.announcements.map((a, j) => (j === i ? v : a)) }))

  const save = async () => {
    setSaving(true)
    try {
      await updateContent({
        ...content,
        ...draft,
        faq: draft.faq.filter(f => f.q.trim() && f.a.trim()),
        announcements: draft.announcements.filter(a => a.trim()),
        perks: draft.perks.filter(a => a.trim()),
      })
      setMsg('✓ Textos guardados')
      setTimeout(() => setMsg(''), 2500)
    } catch {
      alert('No se pudieron guardar los textos. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const restore = () => {
    if (!window.confirm('¿Volver a los textos originales? Se perderán tus cambios sin guardar.')) return
    setDraft({
      hero: { ...DEFAULT_CONTENT.hero },
      faq: DEFAULT_CONTENT.faq.map(f => ({ ...f })),
      announcements: [...DEFAULT_CONTENT.announcements],
      pagos: DEFAULT_CONTENT.pagos,
      envios: DEFAULT_CONTENT.envios,
      cartNote: DEFAULT_CONTENT.cartNote,
      perks: [...DEFAULT_CONTENT.perks],
    })
  }

  return (
    <section className="ad-card ce">
      <h2>📝 Textos de la página</h2>
      <p className="ad-hint">Cambia aquí los textos sin tocar código. Al terminar toca <strong>Guardar textos</strong> y se verán de inmediato en el catálogo.</p>

      {/* Título principal */}
      <details className="ce-block" open>
        <summary>Título principal (inicio)</summary>
        <p className="ce-preview">
          {draft.hero.titleStart} <em>{draft.hero.titleEmphasis}</em> {draft.hero.titleEnd}
        </p>
        <div className="ce-grid">
          <label><span>Inicio del título</span><input className="ad-input" value={draft.hero.titleStart} onChange={e => setHero('titleStart', e.target.value)} /></label>
          <label><span>Palabras destacadas (letra caligráfica rosada)</span><input className="ad-input" value={draft.hero.titleEmphasis} onChange={e => setHero('titleEmphasis', e.target.value)} /></label>
          <label><span>Final del título</span><input className="ad-input" value={draft.hero.titleEnd} onChange={e => setHero('titleEnd', e.target.value)} /></label>
          <label><span>Etiqueta pequeña de arriba</span><input className="ad-input" value={draft.hero.sticker} onChange={e => setHero('sticker', e.target.value)} /></label>
        </div>
        <label className="ce-full"><span>Texto debajo del título</span>
          <textarea className="ad-input ce-area" rows={3} value={draft.hero.subtitle} onChange={e => setHero('subtitle', e.target.value)} />
        </label>
        <div className="ce-grid">
          <label><span>Botón principal</span><input className="ad-input" value={draft.hero.primaryCta} onChange={e => setHero('primaryCta', e.target.value)} /></label>
          <label><span>Botón de WhatsApp</span><input className="ad-input" value={draft.hero.secondaryCta} onChange={e => setHero('secondaryCta', e.target.value)} /></label>
        </div>
      </details>

      {/* Pagos, envíos, nota del pedido */}
      <details className="ce-block" open>
        <summary>Pagos, envíos y pedido</summary>
        <label className="ce-full"><span>Medios de pago (círculo “Medios de pago”)</span>
          <textarea className="ad-input ce-area" rows={3} value={draft.pagos} onChange={e => setDraft(d => ({ ...d, pagos: e.target.value }))} />
        </label>
        <label className="ce-full"><span>Envíos (círculo “Envíos”)</span>
          <textarea className="ad-input ce-area" rows={3} value={draft.envios} onChange={e => setDraft(d => ({ ...d, envios: e.target.value }))} />
        </label>
        <label className="ce-full"><span>Nota dentro del pedido (encima del botón de WhatsApp)</span>
          <textarea className="ad-input ce-area" rows={2} value={draft.cartNote} onChange={e => setDraft(d => ({ ...d, cartNote: e.target.value }))} />
        </label>
      </details>

      {/* Ventajas en el detalle de producto */}
      <details className="ce-block">
        <summary>Ventajas que se ven al abrir un producto</summary>
        {draft.perks.map((a, i) => (
          <div className="ce-row" key={i}>
            <input className="ad-input" value={a} onChange={e => setDraft(d => ({ ...d, perks: d.perks.map((x, j) => (j === i ? e.target.value : x)) }))} />
            <button className="ad-btn ad-btn-danger ad-btn-sm" onClick={() => setDraft(d => ({ ...d, perks: d.perks.filter((_, j) => j !== i) }))} aria-label="Quitar">🗑</button>
          </div>
        ))}
        <button className="ad-btn ad-btn-ghost" onClick={() => setDraft(d => ({ ...d, perks: [...d.perks, ''] }))}>+ Agregar ventaja</button>
      </details>

      {/* Barra de anuncios */}
      <details className="ce-block">
        <summary>Mensajes de la barra rosada de arriba</summary>
        <p className="ad-hint">El “Anuncio” de arriba sale primero; después pasan estos mensajes.</p>
        {draft.announcements.map((a, i) => (
          <div className="ce-row" key={i}>
            <input className="ad-input" value={a} onChange={e => setAnn(i, e.target.value)} placeholder="Ej: Envíos a todo Cali" />
            <button className="ad-btn ad-btn-danger ad-btn-sm" onClick={() => setDraft(d => ({ ...d, announcements: d.announcements.filter((_, j) => j !== i) }))} aria-label="Quitar mensaje">🗑</button>
          </div>
        ))}
        <button className="ad-btn ad-btn-ghost" onClick={() => setDraft(d => ({ ...d, announcements: [...d.announcements, ''] }))}>+ Agregar mensaje</button>
      </details>

      {/* Preguntas frecuentes */}
      <details className="ce-block" open>
        <summary>Preguntas frecuentes ({draft.faq.length})</summary>
        {draft.faq.map((f, i) => (
          <div className="ce-faq" key={i}>
            <div className="ce-faq__head">
              <strong>Pregunta {i + 1}</strong>
              <span>
                <button className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => moveFaq(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
                <button className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => moveFaq(i, 1)} disabled={i === draft.faq.length - 1} aria-label="Bajar">↓</button>
                <button className="ad-btn ad-btn-danger ad-btn-sm" onClick={() => setDraft(d => ({ ...d, faq: d.faq.filter((_, j) => j !== i) }))} aria-label="Eliminar pregunta">🗑</button>
              </span>
            </div>
            <input className="ad-input" value={f.q} onChange={e => setFaq(i, 'q', e.target.value)} placeholder="Pregunta" />
            <textarea className="ad-input ce-area" rows={3} value={f.a} onChange={e => setFaq(i, 'a', e.target.value)} placeholder="Respuesta" />
          </div>
        ))}
        <button className="ad-btn ad-btn-ghost" onClick={() => setDraft(d => ({ ...d, faq: [...d.faq, { q: '', a: '' }] }))}>+ Agregar pregunta</button>
      </details>

      <div className="ad-row-between ce-actions">
        <button className="ad-btn ad-btn-ghost" onClick={restore}>Volver a los textos originales</button>
        <span className="ad-message">{msg}</span>
        <button className="ad-btn ad-btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar textos'}
        </button>
      </div>
    </section>
  )
}
