// Almacén en memoria SOLO para desarrollo (window.__DEMO__).
// Permite revisar el diseño y probar flujos sin tocar la base real.
export const isDemo = () => import.meta.env.DEV && typeof window !== 'undefined' && !!window.__DEMO__

const store = new Map()     // path → data
const listeners = new Set() // () => void
let seeded = false
let counter = 0

function seed() {
  if (seeded || !isDemo()) return
  seeded = true
  Object.entries(window.__DEMO__.docs || {}).forEach(([p, d]) => store.set(p, d))
}
const emit = () => listeners.forEach(fn => fn())
const childrenOf = (col) => [...store.entries()]
  .filter(([p]) => p.startsWith(col + '/') && !p.slice(col.length + 1).includes('/'))
  .map(([p, d]) => ({ id: p.slice(col.length + 1), ...d }))

export const demo = {
  read(path) { seed(); const d = store.get(path); return d ? { id: path.split('/').pop(), ...d } : null },
  list(col) { seed(); return childrenOf(col) },
  watchDoc(path, cb) {
    seed()
    const fn = () => cb(this.read(path))
    listeners.add(fn); setTimeout(fn, 0)
    return () => listeners.delete(fn)
  },
  watchCollection(col, cb) {
    seed()
    const fn = () => cb(childrenOf(col))
    listeners.add(fn); setTimeout(fn, 0)
    return () => listeners.delete(fn)
  },
  write(path, data, merge) {
    seed()
    store.set(path, merge ? { ...(store.get(path) || {}), ...data } : { ...data })
    emit()
  },
  add(col, data) { const id = `demo${++counter}`; this.write(`${col}/${id}`, data, false); return id },
  remove(path) { store.delete(path); emit() },
}
