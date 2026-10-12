// Solicitudes de la página GS Solutions (citas, información y cotizaciones).
// Cualquiera puede crear una (sin sesión); solo el super administrador las ve.
import { addToCollection, watchCollection, patchDoc, removeDoc, now } from './repo'

export const LEAD_TYPES = { cita: 'Agendar cita', info: 'Pedir información', cotizacion: 'Cotización' }
const s = (v, n) => String(v || '').trim().slice(0, n)

export const createLead = (d) => addToCollection('leads', {
  type: LEAD_TYPES[d.type] ? d.type : 'info',
  name: s(d.name, 80),
  company: s(d.company, 80),
  phone: s(d.phone, 30),
  email: s(d.email, 120),
  date: s(d.date, 20),
  slot: s(d.slot, 30),
  message: s(d.message, 1000),
  summary: s(d.summary, 1500),
  status: 'new',
  createdAt: now(),
})

export const watchLeads = (cb, onError) => watchCollection('leads', cb, onError)
export const updateLead = (id, patch) => patchDoc(`leads/${id}`, patch)
export const removeLead = (id) => removeDoc(`leads/${id}`)
