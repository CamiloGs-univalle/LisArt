// ─────────────────────────────────────────────────────────────
// Efectos globales del catálogo (sin dependencias):
//  · flyToCart: la foto del producto "vuela" al carrito + rebote + vibración
//  · tilt 3D suave y botones magnéticos (solo con mouse)
//  · imágenes que pasan de borrosas a nítidas al cargar
//  · transición continua tarjeta → ficha (View Transitions, si el navegador la tiene)
// Todo respeta "reducir movimiento" del sistema.
// ─────────────────────────────────────────────────────────────
export const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const finePointer = () => !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches

// Último toque/clic: de ahí sale la foto que vuela y la que se expande en la ficha
let last = { el: null, t: 0 }
const FLY_ROOT = 'article, li, [data-fly-root], .sheet__panel, .pv, .vl-spot, .feat, .bn-tile, .mn-hero__dish, .lj-arch'
const CART_TARGETS = '.pv__bar .pv__cart:last-child, .kt-cart, .hdr__bag, .tr-cart, .ed-cart, .vl-cart, .cartbar__btn'

function visible(el) {
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight && getComputedStyle(el).visibility !== 'hidden'
}

export function sourceImage() {
  if (!last.el || Date.now() - last.t > 1500 || !last.el.isConnected) return null
  if (last.el.tagName === 'IMG') return last.el
  const root = last.el.closest(FLY_ROOT) || last.el.parentElement
  const imgs = [...(root?.querySelectorAll('img') || [])].filter(i => i.complete && i.naturalWidth && visible(i))
  return imgs.sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0] || null
}

export function flyToCart(imageUrl) {
  try { navigator.vibrate?.(14) } catch { /* sin vibración */ }
  const target = [...document.querySelectorAll(CART_TARGETS)].find(visible)
  bumpCart(target)
  if (reducedMotion() || !target) return
  const src = sourceImage()
  const from = (src || last.el)?.getBoundingClientRect?.()
  if (!from || (!src && !imageUrl)) return
  const to = target.getBoundingClientRect()
  const size = Math.min(Math.max(Math.min(from.width, from.height), 56), 160)
  const ghost = document.createElement('img')
  ghost.src = src?.currentSrc || src?.src || imageUrl
  ghost.alt = ''
  ghost.className = 'fx-fly'
  Object.assign(ghost.style, { left: `${from.left + from.width / 2 - size / 2}px`, top: `${from.top + from.height / 2 - size / 2}px`, width: `${size}px`, height: `${size}px` })
  document.body.appendChild(ghost)
  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height / 2 - (from.top + from.height / 2)
  const end = 26 / size
  const anim = ghost.animate([
    { transform: 'translate(0, 0) scale(1)', opacity: 1, borderRadius: '18px' },
    { transform: `translate(${dx * 0.55}px, ${dy * 0.15 - 90}px) scale(${0.62})`, opacity: 1, borderRadius: '40%', offset: 0.55 },
    { transform: `translate(${dx}px, ${dy}px) scale(${end})`, opacity: 0.35, borderRadius: '50%' },
  ], { duration: 720, easing: 'cubic-bezier(.45,.05,.3,1)' })
  anim.onfinish = () => { ghost.remove(); bumpCart(target, true) }
}

function bumpCart(target, strong = false) {
  if (!target) return
  target.classList.remove('fx-bump', 'fx-bump--strong')
  void target.offsetWidth // reinicia la animación
  target.classList.add(strong ? 'fx-bump--strong' : 'fx-bump')
  setTimeout(() => target.classList.remove('fx-bump', 'fx-bump--strong'), 700)
}

/* ── Transición tarjeta → ficha ── */
export function withProductTransition(update) {
  const src = sourceImage()
  if (!document.startViewTransition || reducedMotion() || !src) { update(); return }
  const html = document.documentElement
  src.style.viewTransitionName = 'fx-product'
  html.classList.add('fx-vt')
  try {
    const vt = document.startViewTransition(() => { src.style.viewTransitionName = ''; update() })
    vt.finished.finally(() => { src.style.viewTransitionName = ''; html.classList.remove('fx-vt') })
  } catch { src.style.viewTransitionName = ''; html.classList.remove('fx-vt'); update() }
}

/* ── Inicializa los efectos de la página ── */
const TILT = '.bn-card, .sc-card, .lj-card__img, .mn-row, .tg-item, .vl-card__img, .tr-card, .ed-card, .lb-card__img, .mk-plan, .sw-card, .ch-page__img, .mt-item'
const MAGNET = '.kt-btn, .btn--primary, .btn--wa, .sk-add, .lj-btn, .mk-cta, .cart__cta'

export function initFx() {
  const off = []
  const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); off.push(() => t.removeEventListener(ev, fn, opt)) }

  on(document, 'pointerdown', (e) => { last = { el: e.target, t: Date.now() } }, true)

  // Imágenes: de borroso a nítido
  const mark = (img) => {
    if (img.dataset.fx || img.classList.contains('kt-img') || img.closest('.fx-fly')) return
    img.dataset.fx = '1'
    if (img.complete && img.naturalWidth) return
    img.classList.add('fx-blur')
    const done = () => img.classList.remove('fx-blur')
    img.addEventListener('load', done, { once: true })
    img.addEventListener('error', done, { once: true })
  }
  if (!reducedMotion()) {
    document.querySelectorAll('img').forEach(mark)
    const mo = new MutationObserver(list => list.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType !== 1) return
      if (n.tagName === 'IMG') mark(n); else n.querySelectorAll?.('img').forEach(mark)
    })))
    mo.observe(document.body, { childList: true, subtree: true })
    off.push(() => mo.disconnect())
  }

  // Inclinación 3D y botones magnéticos (solo con mouse)
  if (finePointer() && !reducedMotion()) {
    let cur = null, mag = null, raf = 0, ev = null
    const reset = (el, kind) => {
      if (!el) return
      if (kind === 'tilt') { el.style.removeProperty('--fx-rx'); el.style.removeProperty('--fx-ry'); el.classList.remove('fx-tilt') }
      else { el.style.removeProperty('--fx-mx'); el.style.removeProperty('--fx-my'); el.classList.remove('fx-mag') }
    }
    const frame = () => {
      raf = 0
      const e = ev
      const t = e.target.closest?.(TILT)
      if (t !== cur) { reset(cur, 'tilt'); cur = t }
      if (t) {
        const r = t.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
        t.classList.add('fx-tilt')
        t.style.setProperty('--fx-rx', `${(-y * 5).toFixed(2)}deg`)
        t.style.setProperty('--fx-ry', `${(x * 6).toFixed(2)}deg`)
      }
      const m = e.target.closest?.(MAGNET)
      if (m !== mag) { reset(mag, 'mag'); mag = m }
      if (m) {
        const r = m.getBoundingClientRect()
        m.classList.add('fx-mag')
        m.style.setProperty('--fx-mx', `${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px`)
        m.style.setProperty('--fx-my', `${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px`)
      }
    }
    on(document, 'pointermove', (e) => { ev = e; if (!raf) raf = requestAnimationFrame(frame) }, { passive: true })
    on(document, 'pointerleave', () => { reset(cur, 'tilt'); reset(mag, 'mag'); cur = mag = null })
    off.push(() => cancelAnimationFrame(raf))
  }

  return () => off.forEach(f => f())
}
