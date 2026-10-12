// Sección de productos con "abanico de diseños": si el dueño eligió un estilo
// para esta sección (o un estilo de tarjeta para todo el catálogo), se usa uno de
// los 13 estilos compartidos; si no, se dibuja el diseño propio de la estructura.
// En modo edición muestra arriba el selector de estilo.
import { useState } from 'react'
import { useTenant } from '@/features/tenant/TenantProvider'
import { useAdmin } from '@/features/editor/EditorProvider'
import { useSettingsCtx } from '@/features/catalog/data/SettingsProvider'
import { useAddToCart } from '@/features/cart/useAddToCart'
import { LAYOUTS } from '@/features/catalog/layouts/Layouts'
import { LayoutPreview } from '@/features/editor/AdminTools'
import { sectionStyleFor } from '@/lib/design'
import Icon from '@/shared/ui/Icon'
import './SectionBlock.css'

export function useSectionStyle(secId) {
  const { layout } = useTenant()
  const { sectionStyles, cardStyle } = useSettingsCtx()
  const chosen = sectionStyleFor(sectionStyles, layout, secId)
  // Con un estilo de tarjeta elegido, las secciones "automáticas" usan el catálogo compartido
  return chosen !== 'auto' ? chosen : cardStyle !== 'auto' ? 'catalogo' : 'auto'
}

export default function SectionBlock({ sec, children, className = '' }) {
  const style = useSectionStyle(sec.id)
  const { add, added } = useAddToCart()
  const Layout = style !== 'auto' ? (LAYOUTS[style] || LAYOUTS.catalogo).C : null
  return (
    <>
      <SectionStyleBar sec={sec} />
      {Layout
        ? <div className={`kt-lx kt-lx--${style} ${className}`}><Layout items={sec.items} add={add} added={added} /></div>
        : children}
    </>
  )
}

// Selector de estilo sobre la sección (solo en modo edición)
export function SectionStyleBar({ sec }) {
  const { layout } = useTenant()
  const { canEdit, editMode } = useAdmin()
  const { sectionStyles, setSectionStyle } = useSettingsCtx()
  const [open, setOpen] = useState(false)
  if (!canEdit || !editMode || sec.special) return null
  const value = sectionStyleFor(sectionStyles, layout, sec.id)
  const pick = (id) => { setSectionStyle(layout, sec.id, id); setOpen(false) }
  return (
    <div className="sb-bar">
      <button className="sb-bar__btn" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <Icon name="layout" size={16} /> Diseño de «{sec.name}»: <strong>{value === 'auto' ? 'Automático' : LAYOUTS[value]?.label}</strong>
        <Icon name={open ? 'arrowUp' : 'arrowDown'} size={14} />
      </button>
      {open && (
        <div className="sb-panel" role="radiogroup" aria-label={`Diseño de ${sec.name}`}>
          <button type="button" role="radio" aria-checked={value === 'auto'} className={`sb-opt ${value === 'auto' ? 'is-on' : ''}`} onClick={() => pick('auto')}>
            <span className="sb-opt__auto" aria-hidden="true"><Icon name="sparkle" size={22} /></span>
            <span>Automático</span>
          </button>
          {Object.entries(LAYOUTS).map(([id, l]) => (
            <button key={id} type="button" role="radio" aria-checked={value === id} className={`sb-opt ${value === id ? 'is-on' : ''}`} onClick={() => pick(id)} title={l.hint}>
              <LayoutPreview id={id} />
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
