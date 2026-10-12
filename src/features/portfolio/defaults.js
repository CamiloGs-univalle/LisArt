// ─────────────────────────────────────────────────────────────
// Contenido inicial del portafolio. Todo se puede cambiar desde
// /super → "Mi portafolio"; lo guardado reemplaza estos valores.
// ─────────────────────────────────────────────────────────────
export const PORTFOLIO_DEFAULTS = {
  // Encabezado
  role: 'Desarrollador de software',
  availability: 'Disponible para nuevos proyectos',
  sideLeft: 'Desarrollo web · Diseño UI/UX',
  sideRight: 'Automatización · Experiencias digitales',

  // Portada
  bigWord: 'PORTAFOLIO',
  greeting: 'Hola, soy',
  firstName: 'Camilo',
  lastName: '',
  title: 'Desarrollador de software & creativo digital',
  intro: 'Diseño y construyo plataformas web, catálogos digitales y herramientas internas con React, Firebase e inteligencia artificial. Soluciones modernas, rápidas y pensadas para que los negocios trabajen mejor.',
  signature: 'Camilo',
  photo: 'https://avatars.githubusercontent.com/u/180302644?v=4',
  badge: 'Disponible · Nuevos proyectos · ',

  // Cinta animada
  marquee: ['Plataformas web', 'Catálogos digitales', 'Automatización con IA', 'Diseño UI/UX', 'React · Firebase', 'Integraciones SAP B1'],

  // Proyectos (de github.com/CamiloGs-univalle)
  projectsTitle: 'Proyectos',
  projectsEmphasis: 'seleccionados',
  projectsIntro: 'Una selección de plataformas que he diseñado y desarrollado de principio a fin: desde la idea hasta producción.',
  githubUrl: 'https://github.com/CamiloGs-univalle',
  projects: [
    { title: 'Catálogos Pro', category: 'Plataforma SaaS · Catálogos digitales', description: 'Plataforma multi-negocio: cada cliente tiene su catálogo con diseño propio, edición en vivo y pedidos por WhatsApp.', tech: 'React, Firebase, Vercel', url: 'https://lis-art.vercel.app/lisart', repo: 'https://github.com/CamiloGs-univalle/LisArt', image: '' },
    { title: 'Plataforma de Compras', category: 'Plataforma empresarial · Multi-empresa', description: 'Flujo de compras con SAP B1, tablero Kanban, historial y correos en un solo hilo.', tech: 'TypeScript, React, SAP B1', url: 'https://plataforma-compras-ten.vercel.app', repo: 'https://github.com/CamiloGs-univalle/plataforma-compras', image: '' },
    { title: 'Siamo Indicador', category: 'Operaciones · Bodegas', description: 'Medición operacional para bodegas con códigos QR, mapa interactivo y temporizador.', tech: 'TypeScript, React, QR', url: 'https://siamo-indicador.vercel.app', repo: 'https://github.com/CamiloGs-univalle/siamo-indicador', image: '' },
    { title: 'Secretaria Operativa IA', category: 'Inteligencia artificial · Productividad', description: 'Centro de control de correo y tareas: la IA lee cada correo de Gmail y organiza el trabajo del equipo.', tech: 'React, Firebase, IA, Gmail', url: 'https://secretaria-operativa-ia.vercel.app', repo: 'https://github.com/CamiloGs-univalle/secretaria-operativa-ia', image: '' },
    { title: 'Informe PT', category: 'Reportes · Gestión de clientes', description: 'Portal de informes mensuales por cliente a partir de Excel o Google Drive, exportables a PDF.', tech: 'React 19, Firebase, Excel, PDF', url: 'https://plataforma-react-sooty.vercel.app', repo: 'https://github.com/CamiloGs-univalle/informe-pt-react', image: '' },
    { title: 'Gestión Humana TI', category: 'Automatización de procesos', description: 'Herramientas para automatizar los procesos del área de gestión humana.', tech: 'JavaScript, React', url: 'https://gestionhumanaproservis.vercel.app', repo: 'https://github.com/CamiloGs-univalle/Gestion-Humana-TI', image: '' },
    { title: 'Mesa de Ayuda', category: 'Soporte TI · Gestión', description: 'Mesa de ayuda para registrar y gestionar los procesos y solicitudes de TI.', tech: 'PHP, MySQL', url: '', repo: 'https://github.com/CamiloGs-univalle/Mesa-de-Ayuda-Desarollo', image: '' },
    { title: 'Proyecto EART · Univalle', category: 'Proyecto universitario', description: 'Proyecto integrador de la Universidad del Valle.', tech: 'JavaScript', url: 'https://proyect-eart-univale-pi-ten.vercel.app/', repo: 'https://github.com/CamiloGs-univalle/proyect-Eart-Univale-PI', image: '' },
  ],

  // Habilidades
  skillsTitle: 'Habilidades',
  skillsEmphasis: '& experiencia',
  skills: [
    { name: 'React · JavaScript', level: 95 },
    { name: 'TypeScript', level: 85 },
    { name: 'Firebase · Firestore', level: 90 },
    { name: 'Diseño UI / UX', level: 90 },
    { name: 'APIs · Vercel Functions', level: 85 },
    { name: 'Python · IA', level: 75 },
  ],
  quote: 'Diseño y construyo herramientas digitales que no solo se ven bien: resuelven problemas reales, ahorran horas de trabajo y hacen crecer a los negocios.',
  services: [
    { icon: 'monitor', title: 'Diseño centrado en el usuario', text: 'Interfaces claras que guían a tus clientes hasta la compra.' },
    { icon: 'code', title: 'Código limpio y moderno', text: 'Sitios rápidos, seguros y fáciles de mantener.' },
    { icon: 'phone', title: '100% adaptable', text: 'Se ve perfecto en celular, tablet y computador.' },
    { icon: 'bolt', title: 'Automatización e IA', text: 'Procesos que antes eran manuales, ahora funcionan solos.' },
  ],

  // Testimonios (la sección solo aparece si agregas al menos uno)
  testimonialsTitle: 'Lo que dicen',
  testimonialsEmphasis: 'mis clientes',
  testimonials: [],

  // Contacto
  ctaTitle: 'Creemos algo',
  ctaEmphasis: 'grandioso',
  ctaText: '¿Tienes un proyecto en mente? Cuéntame tu idea y la hacemos realidad.',
  ctaButton: 'Escríbeme por WhatsApp',
  contact: {
    email: 'camilo13369@gmail.com',
    whatsapp: '',
    website: 'lis-art.vercel.app',
    location: 'Colombia · Trabajo remoto',
    instagram: '',
    github: 'https://github.com/CamiloGs-univalle',
    linkedin: '',
  },
}

// Íconos disponibles para los servicios (dibujados en PortfolioPage)
export const PORTFOLIO_ICONS = ['monitor', 'code', 'phone', 'rocket', 'palette', 'bolt', 'chat', 'mail', 'globe', 'pin', 'cart', 'chart', 'star']

// Mezcla lo guardado con los valores iniciales (campo por campo)
export function withDefaults(saved) {
  const d = PORTFOLIO_DEFAULTS
  if (!saved) return d
  const out = { ...d }
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined || v === null) continue
    out[k] = k === 'contact' ? { ...d.contact, ...v } : v
  }
  return out
}
