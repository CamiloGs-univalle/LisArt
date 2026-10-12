// ─────────────────────────────────────────────────────────────
// GS Solutions · contenido fijo de la página principal:
// soluciones (con su simulación), cotizador, proceso, habilidades y preguntas.
// Los precios del cotizador se pueden ajustar en /super → Mi portafolio.
// ─────────────────────────────────────────────────────────────

// sim = qué simulación se muestra (ver Sims.jsx)
export const SOLUTIONS = [
  {
    id: 'erp', sim: 'erp', icon: 'grid', color: '#6C8CFF',
    name: 'ERP · Sistema de gestión',
    short: 'Toda tu empresa en un solo lugar.',
    simple: 'Un ERP es el "cerebro" de tu negocio: ventas, compras, inventario, clientes y finanzas conectados. Lo que se vende descuenta inventario solo y los reportes se arman sin Excel.',
    ideal: 'Empresas que manejan todo en hojas de cálculo, WhatsApp y papel.',
    solves: ['Información regada en muchos archivos', 'Errores al pasar datos de un lado a otro', 'No saber cuánto vendes o cuánto tienes en bodega hoy'],
    modules: ['Ventas y facturación', 'Compras y proveedores', 'Inventario y bodegas', 'Clientes', 'Reportes y tableros', 'Usuarios y permisos'],
  },
  {
    id: 'crm', sim: 'crm', icon: 'users', color: '#3DDC97',
    name: 'CRM · Clientes y ventas',
    short: 'Ningún cliente se te vuelve a olvidar.',
    simple: 'Un CRM guarda cada cliente y cada oportunidad de venta. Ves en qué etapa va cada negocio, quién lo atiende y qué falta para cerrarlo.',
    ideal: 'Equipos comerciales, asesores, agencias y servicios.',
    solves: ['Clientes que se pierden por no hacer seguimiento', 'No saber qué vendedor atiende a quién', 'Cotizaciones perdidas en el correo'],
    modules: ['Embudo de ventas', 'Fichas de clientes', 'Cotizaciones', 'Recordatorios y tareas', 'Historial de contacto'],
  },
  {
    id: 'inventario', sim: 'inventario', icon: 'box', color: '#FFB547',
    name: 'Inventario y bodegas',
    short: 'Sabe qué tienes, dónde y cuánto.',
    simple: 'Controla entradas y salidas con códigos QR o de barras. Te avisa cuando algo se está acabando y te dice exactamente en qué estante está.',
    ideal: 'Bodegas, distribuidoras, ferreterías, tiendas con mucho surtido.',
    solves: ['Productos que "desaparecen"', 'Comprar de más o quedarte sin existencias', 'Conteos eternos a mano'],
    modules: ['Entradas y salidas', 'Códigos QR / barras', 'Alertas de existencias', 'Ubicaciones y mapa', 'Conteos y ajustes'],
  },
  {
    id: 'pos', sim: 'pos', icon: 'cart', color: '#FF6B8B',
    name: 'Punto de venta (POS)',
    short: 'Vende rápido, cuadra la caja sin estrés.',
    simple: 'La caja registradora moderna: buscas el producto, cobras en efectivo o transferencia, imprimes el recibo y al final del día la caja se cuadra sola.',
    ideal: 'Tiendas, restaurantes, cafeterías, droguerías.',
    solves: ['Filas lentas al cobrar', 'Descuadres de caja', 'No saber qué se vende más'],
    modules: ['Caja y cobros', 'Recibos', 'Cierre de caja', 'Productos y precios', 'Ventas por día'],
  },
  {
    id: 'catalogo', sim: 'catalogo', icon: 'bag', color: '#C77DFF',
    name: 'Catálogo y tienda online',
    short: 'Tus productos vendiendo 24/7 por WhatsApp.',
    simple: 'Una página con tus productos, precios y fotos. El cliente arma su pedido y te llega listo a WhatsApp. Tú lo editas desde el celular.',
    ideal: 'Emprendimientos, tiendas de ropa, regalos, comida, belleza.',
    solves: ['Mandar fotos una por una por WhatsApp', 'Responder "¿precio?" todo el día', 'No tener una vitrina profesional'],
    modules: ['Catálogo editable', 'Pedidos a WhatsApp', 'Ofertas y combos', 'Aparecer en Google', 'Estadísticas'],
  },
  {
    id: 'reservas', sim: 'reservas', icon: 'calendar', color: '#4CC9F0',
    name: 'Reservas y citas',
    short: 'Tu agenda se llena sola.',
    simple: 'Tus clientes ven los horarios libres y apartan su cita en segundos. Les llega un recordatorio y tú ves tu agenda del día organizada.',
    ideal: 'Spas, consultorios, barberías, talleres, asesorías.',
    solves: ['Citas que se cruzan', 'Clientes que no llegan', 'Perder tiempo agendando por chat'],
    modules: ['Agenda en línea', 'Recordatorios', 'Servicios y profesionales', 'Pagos o abonos', 'Historial del cliente'],
  },
  {
    id: 'helpdesk', sim: 'helpdesk', icon: 'help', color: '#F72585',
    name: 'Mesa de ayuda',
    short: 'Cada solicitud con dueño y fecha.',
    simple: 'Cada problema o solicitud entra como un "ticket": se asigna a alguien, tiene prioridad y se sabe cuánto tardó en resolverse.',
    ideal: 'Áreas de TI, soporte, mantenimiento, servicio al cliente.',
    solves: ['Solicitudes que se pierden en el chat', 'No saber quién está resolviendo qué', 'Clientes sin respuesta'],
    modules: ['Tickets y prioridades', 'Asignación a técnicos', 'Tiempos de respuesta', 'Base de conocimiento', 'Encuestas'],
  },
  {
    id: 'ia', sim: 'ia', icon: 'spark', color: '#7BF1A8',
    name: 'Automatización con IA',
    short: 'Lo repetitivo lo hace la máquina.',
    simple: 'La inteligencia artificial lee correos, documentos o mensajes, los clasifica y crea las tareas por ti. Tu equipo se dedica a lo importante.',
    ideal: 'Equipos que pierden horas copiando, pegando y respondiendo lo mismo.',
    solves: ['Bandejas de correo inmanejables', 'Datos que se copian a mano', 'Respuestas repetidas'],
    modules: ['Lectura de correos', 'Clasificación automática', 'Resúmenes', 'Creación de tareas', 'Asistente para tu equipo'],
  },
  {
    id: 'reportes', sim: 'reportes', icon: 'chart', color: '#FFD166',
    name: 'Reportes y tableros (BI)',
    short: 'Tus números claros, sin Excel.',
    simple: 'Convertimos tus datos (Excel, Google Drive o tu sistema) en tableros con gráficas que se actualizan solos y en informes PDF listos para enviar.',
    ideal: 'Gerentes y dueños que necesitan decidir con datos.',
    solves: ['Informes que tardan días', 'Cifras distintas en cada archivo', 'No ver a tiempo lo que pasa'],
    modules: ['Tablero en vivo', 'Indicadores (KPI)', 'Informes PDF', 'Conexión a Excel / Drive', 'Envío automático'],
  },
  {
    id: 'rrhh', sim: 'rrhh', icon: 'id', color: '#06D6A0',
    name: 'Gestión humana',
    short: 'Tu equipo organizado de punta a punta.',
    simple: 'Hojas de vida, contratos, vacaciones, permisos y documentos del personal en un solo sistema, con solicitudes que se aprueban en un clic.',
    ideal: 'Empresas con personal en varias sedes o turnos.',
    solves: ['Carpetas físicas y documentos perdidos', 'Permisos aprobados por chat', 'Procesos de ingreso lentos'],
    modules: ['Hoja de vida y documentos', 'Ingresos y retiros', 'Vacaciones y permisos', 'Aprobaciones', 'Reportes de personal'],
  },
  {
    id: 'web', sim: 'web', icon: 'globe', color: '#A0C4FF',
    name: 'Página web profesional',
    short: 'Tu negocio presentable en internet.',
    simple: 'Una página rápida y bonita que explica qué haces, muestra tus trabajos y convierte visitas en mensajes de WhatsApp.',
    ideal: 'Profesionales independientes y negocios que empiezan.',
    solves: ['No aparecer en Google', 'Verse poco confiable', 'Depender solo de redes sociales'],
    modules: ['Diseño a la medida', 'Formulario y WhatsApp', 'Aparecer en Google', 'Blog o noticias', 'Dominio y correo'],
  },
]

// Proyectos reales → qué simulación mostrar (si el proyecto no trae "sim")
export function simForProject(pr) {
  const t = `${pr.title} ${pr.category} ${pr.description}`.toLowerCase()
  if (/cat[aá]logo/.test(t)) return 'catalogo'
  if (/compra|sap|erp/.test(t)) return 'erp'
  if (/bodega|qr|inventario|indicador/.test(t)) return 'inventario'
  if (/\bia\b|inteligencia|correo|gmail/.test(t)) return 'ia'
  if (/informe|reporte|excel|pdf/.test(t)) return 'reportes'
  if (/humana|personal|n[oó]mina/.test(t)) return 'rrhh'
  if (/ayuda|ticket|soporte/.test(t)) return 'helpdesk'
  if (/reserva|cita|agenda/.test(t)) return 'reservas'
  return 'web'
}

// Cotizador: precios en pesos colombianos (rangos aproximados)
export const ESTIMATOR_DEFAULTS = {
  systems: {
    web: { min: 900000, max: 2500000, weeks: [1, 3] },
    catalogo: { min: 1200000, max: 3500000, weeks: [1, 3] },
    reservas: { min: 1800000, max: 4500000, weeks: [2, 4] },
    crm: { min: 3000000, max: 8000000, weeks: [3, 7] },
    inventario: { min: 3000000, max: 7000000, weeks: [3, 6] },
    pos: { min: 3500000, max: 8000000, weeks: [3, 7] },
    helpdesk: { min: 2500000, max: 6000000, weeks: [2, 5] },
    ia: { min: 2500000, max: 9000000, weeks: [2, 6] },
    reportes: { min: 2000000, max: 6000000, weeks: [2, 5] },
    rrhh: { min: 4000000, max: 10000000, weeks: [4, 8] },
    erp: { min: 8000000, max: 25000000, weeks: [6, 16] },
  },
  moduleMin: 400000,   // cada módulo extra que elijas
  moduleMax: 1200000,
  sizes: [
    { id: 's', label: '1 a 5 personas', factor: 1 },
    { id: 'm', label: '6 a 20 personas', factor: 1.25 },
    { id: 'l', label: 'Más de 20 personas', factor: 1.6 },
  ],
  extras: [
    { id: 'app', label: 'App instalable en el celular', min: 800000, max: 2000000 },
    { id: 'fe', label: 'Facturación electrónica (DIAN)', min: 1500000, max: 4000000 },
    { id: 'integra', label: 'Conexión con otro sistema (SAP, contable…)', min: 2000000, max: 6000000 },
    { id: 'migra', label: 'Pasar mis datos actuales (Excel…)', min: 500000, max: 1500000 },
    { id: 'capacita', label: 'Capacitación y manuales', min: 300000, max: 800000 },
  ],
  supportFrom: 250000, // soporte mensual opcional
}

export function withEstimator(saved) {
  const d = ESTIMATOR_DEFAULTS
  if (!saved) return d
  return {
    ...d, ...saved,
    systems: Object.fromEntries(Object.entries(d.systems).map(([k, v]) => [k, { ...v, ...(saved.systems?.[k] || {}) }])),
    sizes: d.sizes.map(s => ({ ...s, ...((saved.sizes || []).find(x => x.id === s.id) || {}) })),
    extras: d.extras.map(x => ({ ...x, ...((saved.extras || []).find(y => y.id === x.id) || {}) })),
  }
}

// Cálculo del estimado
export function estimate(cfg, { system, modules = [], size = 's', extras = [] }) {
  const sys = cfg.systems[system]
  if (!sys) return null
  const sol = SOLUTIONS.find(s => s.id === system)
  // Los primeros 3 módulos vienen incluidos; los demás suman
  const extraMods = Math.max(0, modules.length - 3)
  const f = cfg.sizes.find(s => s.id === size)?.factor || 1
  let min = (sys.min + extraMods * cfg.moduleMin) * f
  let max = (sys.max + extraMods * cfg.moduleMax) * f
  const ex = cfg.extras.filter(x => extras.includes(x.id))
  ex.forEach(x => { min += x.min; max += x.max })
  const round = (n) => Math.round(n / 100000) * 100000
  const weeks = [sys.weeks[0] + Math.floor(extraMods / 2) + (ex.length > 1 ? 1 : 0), sys.weeks[1] + extraMods + ex.length]
  return { min: round(min), max: round(max), weeks, sol, extras: ex, extraMods }
}

export const PROCESS = [
  { n: '01', title: 'Charla sin costo', text: 'Nos cuentas cómo trabajas hoy. Detectamos qué te quita tiempo y dinero.', time: '30 min' },
  { n: '02', title: 'Propuesta y prototipo', text: 'Te mostramos cómo se verá tu sistema antes de construirlo, con precio y fechas claras.', time: '3–5 días' },
  { n: '03', title: 'Construcción por etapas', text: 'Cada semana ves avances reales y das tu opinión. Nada de sorpresas al final.', time: 'Semanal' },
  { n: '04', title: 'Lanzamiento y acompañamiento', text: 'Capacitamos a tu equipo, pasamos tus datos y seguimos contigo con soporte.', time: 'Continuo' },
]

export const SKILLS = {
  creative: [
    { name: 'Diseño de experiencia (UX)', level: 92, note: 'Pantallas que cualquiera entiende sin manual' },
    { name: 'Diseño visual e interfaces (UI)', level: 90, note: 'Marcas que se ven profesionales y modernas' },
    { name: 'Animación e interacción', level: 88, note: 'Movimiento que guía y sorprende' },
    { name: 'Prototipos rápidos', level: 90, note: 'Ves tu idea funcionando en días' },
  ],
  pro: [
    { name: 'React · JavaScript · TypeScript', level: 94, note: 'Aplicaciones web rápidas y estables' },
    { name: 'Firebase · Bases de datos en la nube', level: 90, note: 'Datos en tiempo real y seguros' },
    { name: 'APIs e integraciones (SAP B1, Gmail, pagos)', level: 86, note: 'Conectamos tus sistemas' },
    { name: 'Inteligencia artificial y automatización', level: 82, note: 'Procesos que funcionan solos' },
    { name: 'Seguridad y buenas prácticas', level: 85, note: 'Accesos, permisos y respaldo' },
  ],
  tools: ['React', 'TypeScript', 'Firebase', 'Node.js', 'Vercel', 'SAP B1', 'Python', 'IA', 'Figma', 'Git', 'SQL', 'PWA'],
}

export const FAQ = [
  { q: '¿Qué es un sistema a la medida?', a: 'Es un programa hecho para la forma en que trabaja tu negocio, no al revés. Solo tiene lo que necesitas y crece contigo.' },
  { q: '¿Puedo empezar con algo pequeño?', a: 'Sí, y lo recomendamos. Arrancamos con lo que más te duele hoy (por ejemplo, inventario) y luego sumamos módulos.' },
  { q: '¿Funciona en el celular?', a: 'Sí. Todo lo que construimos se adapta a celular, tablet y computador, y se puede instalar como app.' },
  { q: '¿Mis datos están seguros?', a: 'Usamos infraestructura en la nube con copias de seguridad, accesos por usuario y permisos. Tus datos son tuyos.' },
  { q: '¿Cuánto se demora?', a: 'Una página o catálogo, de 1 a 3 semanas. Un sistema como inventario o CRM, de 3 a 7 semanas. Un ERP completo, por etapas de 6 a 16 semanas.' },
  { q: '¿Qué pasa después de entregar?', a: 'Te acompañamos: capacitación, ajustes y soporte mensual opcional para que el sistema siga funcionando y mejorando.' },
]
