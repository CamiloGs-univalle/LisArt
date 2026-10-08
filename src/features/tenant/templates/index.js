// Registro de plantillas disponibles para nuevos catálogos
import regalos from './regalos'
import general from './general'

export const TEMPLATES = { regalos, general }
export const DEFAULT_TEMPLATE = 'regalos'
export const getTemplate = (id) => TEMPLATES[id] || TEMPLATES[DEFAULT_TEMPLATE]

// Reemplaza {negocio} y {ciudad} (en textos, listas y objetos)
export function fillTemplate(value, vars) {
  if (typeof value === 'string') {
    return value.replace(/\{negocio\}/g, vars.negocio || '').replace(/\{ciudad\}/g, vars.ciudad || 'tu ciudad')
  }
  if (Array.isArray(value)) return value.map(v => fillTemplate(v, vars))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillTemplate(v, vars)]))
  }
  return value
}
