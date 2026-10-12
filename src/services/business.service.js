// Cuentas del negocio (PRIVADO): costos de productos, ventas y cotizaciones
import { P } from './paths'
import { watchDoc, watchCollection, writeDoc, patchDoc, addToCollection, removeDoc, bumpCounter, now } from './repo'

// Costos { [productId]: { materiales, manoObra, empaque, otros } } + margen deseado
export const watchBusiness = (t, cb, onError) => watchDoc(P.business(t), (d) => cb(d || {}), onError)
// Se envía el mapa completo de costos (así funciona igual en la base real y en modo demo)
export const saveCosts = (t, costs) => writeDoc(P.business(t), { costs, updatedAt: now() }, { merge: true })
export const saveBusinessPrefs = (t, prefs) => writeDoc(P.business(t), { ...prefs, updatedAt: now() }, { merge: true })

// Ventas
export const watchSales = (t, cb, onError) => watchCollection(P.sales(t), cb, onError)
export const addSale = (t, data) => addToCollection(P.sales(t), { ...data, createdAt: now() })
export const updateSale = (t, id, patch) => patchDoc(P.sale(t, id), { ...patch, updatedAt: now() })
export const removeSale = (t, id) => removeDoc(P.sale(t, id))

// Cotizaciones
export const watchQuotes = (t, cb, onError) => watchCollection(P.quotes(t), cb, onError)
export const addQuote = (t, data) => addToCollection(P.quotes(t), { ...data, createdAt: now() })
export const updateQuote = (t, id, patch) => patchDoc(P.quote(t, id), { ...patch, updatedAt: now() })
export const nextQuoteNumber = (t, known = 0) => bumpCounter(P.business(t), 'quoteCounter', known)
export const removeQuote = (t, id) => removeDoc(P.quote(t, id))
