// Crea una plantilla nueva a partir de "Tienda general", cambiando solo lo necesario
import general from './general'

export function extendTemplate({ content = {}, ...rest }) {
  return {
    ...general,
    ...rest,
    content: { ...general.content, ...content },
  }
}
