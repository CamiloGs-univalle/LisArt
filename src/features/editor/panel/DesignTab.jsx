// Pestaña "Diseño": tema de colores y fuentes del catálogo (vista previa en vivo)
import { useEffect, useState } from 'react'
import { useTenant } from '@/features/tenant/TenantProvider'
import { THEME_PRESETS, FONTS, resolveTheme, applyTheme } from '@/features/tenant/themes'

const COLOR_FIELDS = [
  { k: 'primary', label: 'Color principal' },
  { k: 'primaryDeep', label: 'Principal oscuro' },
  { k: 'primarySoft', label: 'Principal suave' },
  { k: 'paper', label: 'Fondo' },
  { k: 'blush', label: 'Fondo de detalles' },
  { k: 'ink', label: 'Texto' },
  { k: 'gold', label: 'Detalles dorados' },
]

export default function DesignTab() {
  const { tenant, update, template } = useTenant()
  const saved = tenant?.theme || { preset: template.theme }
  const [theme, setTheme] = useState(saved)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const t = resolveTheme(theme)

  // Vista previa en vivo: se aplica mientras eliges; si no guardas, se revierte al cerrar
  useEffect(() => { applyTheme(theme) }, [theme])
  useEffect(() => () => applyTheme(tenant?.theme || { preset: template.theme }), []) // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (preset) => setTheme({ preset })
  const set = (k, v) => setTheme(cur => ({ ...cur, [k]: v }))

  const save = async () => {
    setSaving(true)
    try { await update({ theme }); setMsg('✓ Diseño guardado'); setTimeout(() => setMsg(''), 2500) }
    catch { alert('No se pudo guardar el diseño.') }
    finally { setSaving(false) }
  }

  return (
    <section className="ad-card">
      <h2>🎨 Diseño</h2>
      <p className="ad-hint">Elige un estilo listo y, si quieres, ajusta colores y letras. Lo ves en vivo detrás de este panel.</p>

      <div className="dt-presets">
        {Object.entries(THEME_PRESETS).map(([id, p]) => (
          <button key={id} type="button" className={`dt-preset ${theme.preset === id ? 'is-on' : ''}`} onClick={() => pick(id)}>
            <span className="dt-swatch" style={{ background: p.paper }}>
              <i style={{ background: p.primary }} /><i style={{ background: p.primarySoft }} /><i style={{ background: p.ink }} />
            </span>
            <span style={{ fontFamily: `'${p.fontDisplay}', serif` }}>{p.label}</span>
          </button>
        ))}
      </div>

      <details className="ce-block">
        <summary>Ajustar colores</summary>
        <div className="dt-colors">
          {COLOR_FIELDS.map(f => (
            <label key={f.k} className="dt-color">
              <input type="color" value={t[f.k]} onChange={e => set(f.k, e.target.value)} />
              <span>{f.label}</span>
            </label>
          ))}
        </div>
      </details>

      <details className="ce-block">
        <summary>Ajustar letras</summary>
        <div className="bt-grid">
          {[['fontDisplay', 'Títulos', FONTS.display], ['fontScript', 'Palabra destacada', FONTS.script], ['fontUi', 'Textos', FONTS.ui]].map(([k, label, list]) => (
            <label key={k} className="bt-field">
              <span>{label}</span>
              <select className="ad-input" value={t[k]} onChange={e => set(k, e.target.value)}>
                {Object.keys(list).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
          ))}
        </div>
      </details>

      <div className="dt-preview">
        <p className="eyebrow">Vista previa</p>
        <p className="display dt-preview__title">Así se ven tus <em>títulos</em></p>
        <p>Y así se ve el texto normal de tu catálogo.</p>
        <button type="button" className="btn btn--primary">Botón principal</button>
      </div>

      <div className="ad-row-between">
        <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setTheme(saved)}>Deshacer cambios</button>
        <span className="ad-message">{msg}</span>
        <button type="button" className="ad-btn ad-btn-primary" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar diseño'}</button>
      </div>
    </section>
  )
}
