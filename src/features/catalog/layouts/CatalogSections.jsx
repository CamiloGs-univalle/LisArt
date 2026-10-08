// Arma el catálogo siguiendo el mapa de LisArt:
// ⭐ Destacados · 💕 Para parejas · 🎁 Personalizados · 🌹 Flores & ramos
// 🍓 Comestibles · 🎓 Grados · 🎄 Navidad (+ galería y secciones nuevas)
import { Fragment } from 'react'
import { useAdmin } from '@/features/editor/EditorProvider'
import { useSettingsCtx } from '@/features/catalog/data/SettingsProvider'
import SectionHeader from '@/features/catalog/components/SectionHeader'
import Reveal from '@/shared/ui/Reveal'
import { useAddToCart } from '@/features/cart/useAddToCart'
import { useSectionAdmin } from '@/features/editor/useSectionAdmin'
import { LAYOUTS } from '@/features/catalog/layouts/Layouts'
import { SectionToolbar, NewSection } from '@/features/editor/AdminTools'
import { Ribbon } from '@/features/catalog/components/InfoSections'
import { useCatalog } from '@/features/catalog/layouts/useCatalog'
import FeaturedProduct from '@/features/catalog/components/FeaturedProduct'
import EditText from '@/features/editor/EditText'

function Section({ s, toolbar }) {
  const { isAdmin } = useAdmin()
  const admin = useSectionAdmin(s.id)
  const { add, added } = useAddToCart()
  const Layout = (LAYOUTS[s.style] || LAYOUTS.catalogo).C
  const isGallery = s.special === 'gallery'
  const copy = { emoji: s.emoji, eyebrow: s.eyebrow, title: s.title, emphasis: s.emphasis, subtitle: s.subtitle, note: s.note }

  return (
    <section
      id={`sec-${s.id}`}
      data-section={s.id}
      className={`cat-sec cat-sec--${s.style} ${s.hidden ? 'is-hidden-admin' : ''}`}
      aria-labelledby={`h-${s.id}`}
    >
      {toolbar}
      <div className="container">
        <Reveal>
          <SectionHeader id={`h-${s.id}`} copy={copy} editKey={`sec.${s.id}`} admin={isAdmin && !isGallery ? admin : null} />
        </Reveal>
        {isAdmin && !isGallery && (
          <p className="edit-menu-name">
            Nombre en el menú de arriba: <EditText path={`sec.${s.id}.name`} fallback={s.baseName || s.name} />
          </p>
        )}
        {isAdmin && s.items.length === 0 && !isGallery && (
          <p className="admin-empty">Sin productos. Usa “Agregar producto” o asigna productos existentes con el botón “Secciones” de cada foto.</p>
        )}
      </div>
      {s.items.length > 0 && (
        <Layout items={s.items} add={add} added={added} onDelete={isGallery ? undefined : admin.remove} />
      )}
    </section>
  )
}

export default function CatalogSections() {
  const { isAdmin } = useAdmin()
  const { setOrder } = useSettingsCtx()
  const { sections, publicSections, ids } = useCatalog()
  const list = isAdmin ? sections : publicSections

  const move = (id, dir) => {
    const i = ids.indexOf(id)
    const j = i + dir
    if (j < 0 || j >= ids.length) return
    const next = [...ids]
    ;[next[i], next[j]] = [next[j], next[i]]
    setOrder(next)
  }

  return (
    <>
      {list.map((s, i) => (
        <Fragment key={s.id}>
          {s.special === 'featured' ? (
            <div id={`sec-${s.id}`} data-section={s.id} className={s.hidden ? 'is-hidden-admin' : ''}>
              {isAdmin && (
                <SectionToolbar sectionId={s.id} style="destacado" fixedStyle hidden={s.hidden}
                  onMove={(d) => move(s.id, d)} isFirst={i === 0} isLast={i === list.length - 1} />
              )}
              <FeaturedProduct product={s.items[0] || null} />
            </div>
          ) : (
          <Section
            s={s}
            toolbar={isAdmin ? (
              <SectionToolbar
                sectionId={s.id}
                style={s.style}
                custom={s.custom}
                hidden={s.hidden}
                onMove={(d) => move(s.id, d)}
                isFirst={i === 0}
                isLast={i === list.length - 1}
              />
            ) : null}
          />
          )}
          {i === 3 && <Ribbon />}
        </Fragment>
      ))}
      {isAdmin && <NewSection />}
    </>
  )
}
