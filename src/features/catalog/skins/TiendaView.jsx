// Estructura "Tienda grande" (ferretería, papelería, variedades, supermercado):
// búsqueda protagonista, categorías al lado, filtros (precio, ofertas, disponibles),
// ordenar, vista en cuadrícula o lista y "cargar más".
import { useMemo, useRef, useState } from 'react'
import Icon from '@/shared/ui/Icon'
import EditText from '@/features/editor/EditText'
import { formatPrice } from '@/lib/format'
import { MarketingSections } from '@/features/marketing/Boost'
import { activeOffer, stockInfo } from '@/lib/marketing'
import { useSettingsCtx } from '@/features/catalog/data/SettingsProvider'
import { useCart } from '@/features/cart/CartProvider'
import { useSkin, Price } from './shared'
import { useRevealAll, useScrolled, CartButton, AdminButton, QuickAdd, Img, Faq, Skeleton, Footer } from './kit'
import './Tienda.css'

const SORTS = { rel: 'Destacados', asc: 'Menor precio', desc: 'Mayor precio', az: 'Nombre A–Z', off: 'Mayor descuento' }
const PAGE = 24
const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function TiendaView({ onOpenDashboard }) {
  const s = useSkin()
  const root = useRef(null)
  const top = useRef(null)
  const scrolled = useScrolled(10)
  const { marketing } = useSettingsCtx()
  useRevealAll(root)
  const H = s.content.hero
  const secs = s.sections.filter(x => x.items.length)
  const [cat, setCat] = useState('')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('rel')
  const [onlyOffers, setOnlyOffers] = useState(false)
  const [onlyStock, setOnlyStock] = useState(false)
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [view, setView] = useState('grid')
  const [limit, setLimit] = useState(PAGE)
  const [sheet, setSheet] = useState(false)

  const base = cat ? (secs.find(x => x.id === cat)?.items || []) : s.products
  const list = useMemo(() => {
    const t = norm(q.trim())
    let r = base.filter(p => {
      if (t && !norm(`${p.name} ${p.description} ${p.badge} ${p.category}`).includes(t)) return false
      const price = Number(p.price) || 0
      if (min !== '' && price < Number(min)) return false
      if (max !== '' && price > Number(max)) return false
      if (onlyOffers && !activeOffer(p)) return false
      if (onlyStock && stockInfo(p, marketing)?.out) return false
      return true
    })
    const by = {
      asc: (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0),
      desc: (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0),
      az: (a, b) => String(a.name).localeCompare(String(b.name), 'es'),
      off: (a, b) => (activeOffer(b)?.percent || 0) - (activeOffer(a)?.percent || 0),
    }[sort]
    if (by) r = [...r].sort(by)
    return r
  }, [base, q, min, max, onlyOffers, onlyStock, sort, marketing])

  const active = [cat && secs.find(x => x.id === cat)?.name, q && `“${q}”`, onlyOffers && 'En oferta', onlyStock && 'Disponibles', (min || max) && `${min ? formatPrice(min) : '$ 0'} – ${max ? formatPrice(max) : 'más'}`].filter(Boolean)
  const clear = () => { setCat(''); setQ(''); setOnlyOffers(false); setOnlyStock(false); setMin(''); setMax(''); setLimit(PAGE) }
  const pick = (id) => { setCat(id); setLimit(PAGE); setSheet(false); top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const offers = s.products.filter(p => activeOffer(p)).length

  const filters = (
    <div className="tg-filters">
      <div className="tg-fgroup">
        <p className="tg-fgroup__t">Categorías</p>
        <button className={!cat ? 'is-on' : ''} onClick={() => pick('')}><span>Todo</span><small>{s.products.length}</small></button>
        {secs.map(x => <button key={x.id} className={cat === x.id ? 'is-on' : ''} onClick={() => pick(x.id)}><span>{x.emoji} {x.name}</span><small>{x.items.length}</small></button>)}
      </div>
      <div className="tg-fgroup">
        <p className="tg-fgroup__t">Precio</p>
        <div className="tg-range">
          <label><span>Desde</span><input type="number" inputMode="numeric" min="0" placeholder="$ 0" value={min} onChange={e => { setMin(e.target.value); setLimit(PAGE) }} /></label>
          <label><span>Hasta</span><input type="number" inputMode="numeric" min="0" placeholder="Sin límite" value={max} onChange={e => { setMax(e.target.value); setLimit(PAGE) }} /></label>
        </div>
      </div>
      <div className="tg-fgroup">
        <p className="tg-fgroup__t">Mostrar</p>
        {offers > 0 && <label className="tg-check"><input type="checkbox" checked={onlyOffers} onChange={e => setOnlyOffers(e.target.checked)} /> <span>Solo ofertas <small>({offers})</small></span></label>}
        <label className="tg-check"><input type="checkbox" checked={onlyStock} onChange={e => setOnlyStock(e.target.checked)} /> <span>Solo disponibles</span></label>
      </div>
      <button className="tg-wa" onClick={() => s.wa.open('Hola {negocio} 👋 Estoy buscando un producto que no encuentro en el catálogo.')}>
        <Icon name="whatsapp" size={20} /><span><strong>¿No lo encuentras?</strong><small>Pregúntanos por WhatsApp</small></span>
      </button>
    </div>
  )

  return (
    <div className="kt tg" ref={root}>
      <header className={`tg-head ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="kt-wrap tg-head__in">
          <a href="#top" className="tg-brand">
            {s.brand.logo ? <img src={s.brand.logo} alt="" /> : <span className="tg-brand__mono">{(s.brand.name || '?').slice(0, 1)}</span>}
            <span>{s.brand.name}</span>
          </a>
          <label className="tg-search">
            <Icon name="search" size={18} />
            <input type="search" placeholder={`Buscar entre ${s.products.length} productos…`} value={q} onChange={e => { setQ(e.target.value); setLimit(PAGE) }} aria-label="Buscar productos" />
            {q && <button onClick={() => setQ('')} aria-label="Borrar búsqueda"><Icon name="close" size={16} /></button>}
          </label>
          <div className="tg-head__actions">
            <AdminButton onOpenDashboard={onOpenDashboard} />
            <CartTotal s={s} />
          </div>
        </div>
        <nav className="tg-cats" aria-label="Categorías">
          <div className="kt-wrap tg-cats__in">
            <button className={!cat ? 'is-on' : ''} onClick={() => pick('')}>Todo</button>
            {secs.map(x => <button key={x.id} className={cat === x.id ? 'is-on' : ''} onClick={() => pick(x.id)}>{x.name}</button>)}
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="kt-wrap tg-hero" data-reveal>
          <div>
            <EditText path="hero.sticker" fallback={H.sticker} as="p" className="tg-hero__k" />
            <h1><EditText path="hero.titleStart" fallback={H.titleStart} /> <em><EditText path="hero.titleEmphasis" fallback={H.titleEmphasis} /></em> <EditText path="hero.titleEnd" fallback={H.titleEnd} /></h1>
            <EditText path="hero.subtitle" fallback={H.subtitle} as="p" className="tg-hero__sub" multiline />
          </div>
          <ul className="tg-hero__perks">
            {(s.content.highlights || []).slice(0, 3).map((h, i) => <li key={h.id}><Icon name={['truck', 'card', 'chat'][i]} size={20} /> <span><strong>{h.label || h.title}</strong></span></li>)}
          </ul>
        </section>

        <div className="kt-wrap tg-layout" ref={top}>
          <aside className="tg-side" aria-label="Filtros">{filters}</aside>

          <section className="tg-main" aria-label="Productos">
            <div className="tg-bar">
              <p className="tg-count"><b>{list.length}</b> {list.length === 1 ? 'producto' : 'productos'}</p>
              <button className="tg-filterbtn" onClick={() => setSheet(true)}><Icon name="filter" size={18} /> Filtros{active.length > 0 && <b>{active.length}</b>}</button>
              <label className="tg-sort"><span>Ordenar</span>
                <select value={sort} onChange={e => setSort(e.target.value)}>{Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
              </label>
              <div className="tg-view" role="group" aria-label="Vista">
                <button aria-pressed={view === 'grid'} className={view === 'grid' ? 'is-on' : ''} onClick={() => setView('grid')} aria-label="Cuadrícula"><Icon name="grid" size={18} /></button>
                <button aria-pressed={view === 'list'} className={view === 'list' ? 'is-on' : ''} onClick={() => setView('list')} aria-label="Lista"><Icon name="list" size={18} /></button>
              </div>
            </div>
            {active.length > 0 && (
              <div className="tg-active">
                {active.map(a => <span key={a}>{a}</span>)}
                <button onClick={clear}>Limpiar todo</button>
              </div>
            )}

            {s.loading ? <Skeleton n={8} /> : list.length === 0 ? (
              <div className="tg-none">
                <Icon name="search" size={36} />
                <strong>No encontramos productos con esos filtros</strong>
                <p>Prueba otra palabra o quita algún filtro.</p>
                <div className="tg-none__btns"><button className="kt-btn kt-btn--ghost" onClick={clear}>Quitar filtros</button><button className="kt-btn kt-btn--wa" onClick={() => s.wa.open(`Hola {negocio} 👋 ¿Tienen ${q || 'este producto'}?`)}><Icon name="whatsapp" size={18} /> Preguntar</button></div>
              </div>
            ) : (
              <>
                <div className={`tg-grid tg-grid--${view}`}>
                  {list.slice(0, limit).map((p, i) => <Item key={p.id} p={p} s={s} i={i} marketing={marketing} />)}
                </div>
                {list.length > limit && (
                  <div className="tg-more">
                    <p>Viendo {limit} de {list.length}</p>
                    <span className="tg-more__bar"><i style={{ width: `${(limit / list.length) * 100}%` }} /></span>
                    <button className="kt-btn kt-btn--ghost" onClick={() => setLimit(l => l + PAGE)}>Cargar más productos</button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {sheet && (
        <div className="tg-sheet" role="dialog" aria-modal="true" aria-label="Filtros" onClick={() => setSheet(false)}>
          <div className="tg-sheet__panel" onClick={e => e.stopPropagation()}>
            <header><strong>Filtros</strong><button className="kt-ic" onClick={() => setSheet(false)} aria-label="Cerrar"><Icon name="close" /></button></header>
            {filters}
            <footer><button className="kt-btn kt-btn--ghost" onClick={clear}>Limpiar</button><button className="kt-btn kt-btn--solid" onClick={() => setSheet(false)}>Ver {list.length} productos</button></footer>
          </div>
        </div>
      )}

      <MarketingSections />

      {s.content.faq?.length > 0 && (
        <section className="kt-wrap tg-faq" id="preguntas">
          <h2>Preguntas frecuentes</h2>
          <Faq items={s.content.faq} />
        </section>
      )}

      <Footer s={s} className="tg-foot" go={pick} />
    </div>
  )
}

// Botón del carrito con el total (en tiendas grandes se compra mucho, el total ayuda)
function CartTotal({ s }) {
  const { finalTotal } = useCart()
  return (
    <span className="tg-carttotal">
      <CartButton s={s} />
      {s.count > 0 && <button className="tg-carttotal__sum" onClick={s.openCart}>{formatPrice(finalTotal)}</button>}
    </span>
  )
}

function Item({ p, s, i, marketing }) {
  const offer = activeOffer(p)
  const st = stockInfo(p, marketing)
  return (
    <article className={`tg-item ${st?.out ? 'is-out' : ''}`} style={{ '--d': `${(i % 8) * 0.03}s` }}>
      <button className="tg-item__img" onClick={() => s.openProduct(p)} aria-label={`Ver ${p.name}`}>
        <Img src={p.image} />
        {offer && <span className="tg-item__off">-{offer.percent}%</span>}
        {st?.out && <span className="tg-item__out">Agotado</span>}
      </button>
      <div className="tg-item__body">
        {p.badge && <span className="tg-item__badge">{p.badge}</span>}
        <button className="tg-item__name" onClick={() => s.openProduct(p)}>{p.name}</button>
        {p.description && <p className="tg-item__desc">{p.description}</p>}
        <div className="tg-item__foot">
          <Price p={p} className="tg-item__price" />
          <QuickAdd p={p} openProduct={s.openProduct} icon="cart" label="Agregar" size={16} className="tg-item__add" />
        </div>
      </div>
    </article>
  )
}
