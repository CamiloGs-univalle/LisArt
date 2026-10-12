// ─────────────────────────────────────────────────────────────
// Presupuesto de rendimiento (se ejecuta después de `vite build`).
// Mide lo que descarga cada tipo de visitante (comprimido con gzip, como
// lo entrega Vercel) y FALLA si algo supera el límite. Así ninguna mejora
// futura vuelve la página pesada sin que nos demos cuenta.
//
//   npm run perf          → construye y revisa
//   node scripts/perf-budget.mjs --json  → resultado en JSON (para CI)
// ─────────────────────────────────────────────────────────────
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const DIST = 'dist'
const ASSETS = join(DIST, 'assets')

// Límites en KB comprimidos (gzip). Súbelos solo con una buena razón.
const BUDGET = {
  firstLoadJs: 190,   // lo que baja CUALQUIER visitante antes de ver algo
  firstLoadCss: 15,
  portfolioJs: 25,    // página de GS Solutions (además de lo anterior)
  portfolioCss: 25,
  catalogJs: 55,      // catálogo base (además de lo anterior)
  catalogCss: 28,
  skinJs: 8,          // cada estructura de catálogo
  skinCss: 6,
  chunkJs: 100,       // ningún archivo JS propio por encima de esto (librerías: ver primera carga)
}

if (!existsSync(ASSETS)) { console.error('✖ No existe dist/. Ejecuta primero: npx vite build'); process.exit(1) }

const kb = (n) => Math.round(n / 102.4) / 10
const gz = (file) => gzipSync(readFileSync(join(ASSETS, file)), { level: 9 }).length
const files = readdirSync(ASSETS)
const size = Object.fromEntries(files.map(f => [f, gz(f)]))
const pick = (re) => files.filter(f => re.test(f))
const sum = (list) => list.reduce((a, f) => a + size[f], 0)

// Lo que index.html pide al abrir (script de entrada + precargas + estilos)
const html = readFileSync(join(DIST, 'index.html'), 'utf8')
const initial = [...html.matchAll(/\/assets\/([^"']+\.(?:js|css))/g)].map(m => m[1])
const firstJs = initial.filter(f => f.endsWith('.js'))
const firstCss = initial.filter(f => f.endsWith('.css'))

const rows = []
const check = (name, bytes, limit) => rows.push({ name, kb: kb(bytes), limit, ok: kb(bytes) <= limit })

check('Primera carga · JS', sum(firstJs), BUDGET.firstLoadJs)
check('Primera carga · CSS', sum(firstCss), BUDGET.firstLoadCss)
check('Portafolio · JS', sum(pick(/^PortfolioPage-.*\.js$/)), BUDGET.portfolioJs)
check('Portafolio · CSS', sum(pick(/^PortfolioPage-.*\.css$/)), BUDGET.portfolioCss)
check('Catálogo · JS', sum(pick(/^CatalogPage-.*\.js$/)), BUDGET.catalogJs)
check('Catálogo · CSS', sum(pick(/^CatalogPage-.*\.css$/)), BUDGET.catalogCss)
for (const f of pick(/^[A-Z][a-z]+View-.*\.(js|css)$/)) {
  const isJs = f.endsWith('.js')
  check(`Estructura ${f.split('-')[0]} · ${isJs ? 'JS' : 'CSS'}`, size[f], isJs ? BUDGET.skinJs : BUDGET.skinCss)
}
for (const f of pick(/^(?!vendor-).*\.js$/)) if (kb(size[f]) > BUDGET.chunkJs) check(`Archivo grande ${f}`, size[f], BUDGET.chunkJs)

const fails = rows.filter(r => !r.ok)
if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ ok: !fails.length, rows }, null, 2))
} else {
  const w = Math.max(...rows.map(r => r.name.length))
  console.log('\nPresupuesto de rendimiento (KB comprimidos)\n')
  for (const r of rows) console.log(`${r.ok ? '✔' : '✖'} ${r.name.padEnd(w)}  ${String(r.kb).padStart(6)} / ${r.limit}`)
  const total = kb(sum(firstJs) + sum(firstCss))
  console.log(`\nPrimera visita total: ${total} KB · ${files.length} archivos en dist/assets`)
  console.log(fails.length ? `\n✖ ${fails.length} límite(s) superado(s). Divide el código (lazy) u optimiza antes de publicar.\n` : '\n✔ Todo dentro del presupuesto.\n')
}
process.exit(fails.length ? 1 : 0)
