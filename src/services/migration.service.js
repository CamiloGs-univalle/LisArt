// Importa los datos de la primera versión (colecciones "products" y "settings/home"
// en la raíz) hacia un negocio de la nueva estructura. Se usa una sola vez.
// Si están definidas las variables VITE_OLD_FIREBASE_*, los datos se leen del
// proyecto de Firebase anterior y se escriben en el nuevo.
import { P } from './paths'
import { readCollection, readDoc, writeMany, writeDoc } from './repo'
import { legacyDb } from '@/lib/firebase'

export async function legacyDataSummary() {
  const [products, settings] = await Promise.all([readCollection(P.legacyProducts(), legacyDb()), readDoc(P.legacySettings(), legacyDb())])
  return { products: products.length, hasSettings: !!settings }
}

export async function importLegacyData(tenantId) {
  const [products, settings] = await Promise.all([readCollection(P.legacyProducts(), legacyDb()), readDoc(P.legacySettings(), legacyDb())])
  await writeMany(products.map(({ id, ...data }) => [P.product(tenantId, id), data]))
  if (settings) {
    const { id: _ignored, ...rest } = settings // eslint-disable-line no-unused-vars
    await writeDoc(P.settings(tenantId), rest, { merge: true })
  }
  return { products: products.length, settings: !!settings }
}
