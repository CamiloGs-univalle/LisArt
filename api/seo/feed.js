// GET /:negocio/google.xml — productos del negocio en el formato de Google Merchant Center.
// El dueño pega este enlace una vez en Merchant Center y sus productos se actualizan solos.
import { merchantFeedXml } from '../../src/lib/seo.js'
import { loadCatalog, originOf } from '../_lib/seo.js'
import { isPremium } from '../../src/lib/billingCore.js'

export default async function handler(req, res) {
  const slug = String(req.query.slug || '').toLowerCase()
  try {
    const data = await loadCatalog(slug)
    if (!data || data.tenant.status === 'suspended') return res.status(404).send('Catálogo no encontrado')
    // Google Compras es del plan Premium
    if (!isPremium(data.tenant)) return res.status(403).send('Disponible en el plan Premium')
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400')
    return res.status(200).send(merchantFeedXml(data.tenant, data.products, { origin: originOf(req), slug }))
  } catch (e) {
    console.error('[feed]', e)
    return res.status(500).send('error')
  }
}
