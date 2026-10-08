// Solicitudes de ayuda (ej. "olvidé mi contraseña") que llegan al super administrador
import { P } from './paths'
import { addToCollection, watchCollection, patchDoc, now } from './repo'

export const TICKET_TYPES = { PASSWORD: 'password' }

// Cualquiera puede crear una solicitud (no necesita sesión)
export const createTicket = ({ email, phone = '', message = '' }) =>
  addToCollection(P.tickets(), {
    type: TICKET_TYPES.PASSWORD,
    email: email.trim().toLowerCase().slice(0, 120),
    phone: phone.trim().slice(0, 30),
    message: message.trim().slice(0, 500),
    status: 'open',
    createdAt: now(),
  })

export const watchTickets = (cb, onError) => watchCollection(P.tickets(), cb, onError)

export const closeTicket = (id, resolution) =>
  patchDoc(P.ticket(id), { status: 'closed', resolution, closedAt: now() })
