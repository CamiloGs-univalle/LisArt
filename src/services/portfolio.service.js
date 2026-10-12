// Contenido del portafolio (página principal). Solo el super administrador lo edita.
import { P } from './paths'
import { watchDoc, writeDoc, now } from './repo'

export const watchPortfolio = (cb, onError) => watchDoc(P.portfolio(), cb, onError)

export function savePortfolio(data) {
  const { id: _id, updatedAt: _u, ...content } = data // eslint-disable-line no-unused-vars
  return writeDoc(P.portfolio(), { ...content, updatedAt: now() }, { merge: false })
}
