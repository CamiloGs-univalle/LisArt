// GET /sitemap.xml — todos los catálogos activos y sus productos.
// Se arma solo: cuando un negocio agrega o cambia un producto, aparece aquí.
import { sitemapXml, publicProducts } from '../../src/lib/seo.js'
import { listDocs } from '../_lib/firestore.js'
import { isPremium } from '../../src/lib/billingCore.js'
import { originOf, SLUG_RE, RESERVED } from '../_lib/seo.js'

const day = (v) => (v ? String(v).slice(0, 10) : undefined)

export default async function handler(req, res) {
  const origin = originOf(req)
  if (req.query.robots) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=86400')
    return res.status(200).send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /super\nDisallow: /admin\nDisallow: /login\n\nSitemap: ${origin}/sitemap.xml\n`)
  }
  try {
    const tenants = (await listDocs('tenants')).filter(t =>
      SLUG_RE.test(t.id) && !RESERVED.includes(t.id) && t.status !== 'suspended' && !t.demo && t.noindex !== true)
    const entries = [{ loc: `${origin}/` }]
    for (const t of tenants) {
      // Básico: solo la página del catálogo. Premium: también cada producto.
      if (!isPremium(t)) { entries.push({ loc: `${origin}/${t.id}`, lastmod: day(t._updateTime) }); continue }
      const products = publicProducts(await listDocs(`tenants/${t.id}/products`, { max: 1000 }))
      const latest = [t._updateTime, ...products.map(p => p._updateTime)].filter(Boolean).sort().at(-1)
      entries.push({ loc: `${origin}/${t.id}`, lastmod: day(latest) })
      products.forEach(p => entries.push({ loc: `${origin}/${t.id}?p=${encodeURIComponent(p.id)}`, lastmod: day(p._updateTime) }))
    }
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).send(sitemapXml(entries))
  } catch (e) {
    console.error('[sitemap]', e)
    return res.status(500).send('error')
  }
}
