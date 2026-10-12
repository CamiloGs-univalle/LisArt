// Registro de plantillas disponibles para nuevos catálogos
import regalos from './regalos'
import general from './general'
import editorial from './editorial'
import moda from './moda'
import tecnologia from './tecnologia'
import minimal from './minimal'
import comida from './comida'
import belleza from './belleza'
import eventos from './eventos'
import joyeria from './joyeria'
import variedades from './variedades'

export const TEMPLATES = { regalos, general, editorial, moda, tecnologia, minimal, comida, belleza, eventos, joyeria, variedades }
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

// Estructuras de página disponibles (cómo se organiza el catálogo)
export const LAYOUTS = {
  clasico: { label: 'Clásico', description: 'Portada con fotos, secciones variadas y mucha personalidad.' },
  velora: { label: 'Tienda minimal', description: 'Limpio y comercial: producto estrella con tallas y colores, cuadrícula de productos.' },
  terrain: { label: 'Streetwear', description: 'Retícula con líneas, títulos grandes, franja de cifras y colección en carrusel.' },
  editorial: { label: 'Editorial', description: 'Estilo revista: nombre gigante, círculo con foto, productos numerados.' },
  menu: { label: 'Menú / Carta', description: 'Restaurantes, cafés y postres: categorías fijas arriba, platos con foto y pedido rápido.' },
  servicios: { label: 'Servicios y citas', description: 'Belleza, spa, consultorios y profesionales: servicios con duración, proceso y botón para agendar.' },
  bento: { label: 'Bento moderno', description: 'Tecnología y marcas jóvenes: portada en mosaico, brillo interactivo y catálogo con pestañas.' },
  lookbook: { label: 'Lookbook inmersivo', description: 'Moda, arte y decoración: portada a pantalla completa, colección que cambia al bajar y galerías horizontales.' },
  tienda: { label: 'Tienda grande', description: 'Muchos productos (ferretería, papelería, variedades): búsqueda, filtros por precio, ordenar y categorías al lado.' },
  lujo: { label: 'Boutique de lujo', description: 'Joyería, perfumes y marcas premium: oscuro y dorado, letras finas, piezas en zigzag y asesoría privada.' },
  historias: { label: 'Historias', description: 'Como Instagram: círculos por categoría y cada producto en una historia a pantalla completa. Ideal para vender por celular.' },
  escaparate: { label: 'Escaparate 3D', description: 'Carrusel con profundidad que gira con el dedo; el fondo cambia al color del producto. Muy llamativo.' },
  revista: { label: 'Revista con capítulos', description: 'Portada de revista, índice y capítulos a pantalla completa con páginas que suben encima. Para marcas con historia.' },
  mesa: { label: 'Mesa de productos', description: 'Collage de polaroids que se arrastran y se ordenan, notas adhesivas y tablero de fotos. Para lo hecho a mano.' },
}
