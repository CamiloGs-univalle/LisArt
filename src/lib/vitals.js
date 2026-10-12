// ─────────────────────────────────────────────────────────────
// Monitoreo de rendimiento real (Core Web Vitals: LCP, INP, CLS…)
// con Vercel Speed Insights. Mide lo que sienten los visitantes de verdad
// y lo muestra en Vercel → proyecto → Speed Insights.
// · Solo en producción · se carga cuando el navegador está libre
// · no mide los paneles internos (/admin, /super) · sin datos personales
// ─────────────────────────────────────────────────────────────
const PRIVATE = /^\/(admin|login|super)(\/|$)/

export function startVitals() {
  if (!import.meta.env.PROD) return
  const run = () => import('@vercel/speed-insights').then(({ injectSpeedInsights }) => injectSpeedInsights({
    beforeSend: (e) => {
      const path = new URL(e.url).pathname
      if (PRIVATE.test(path)) return null
      return { ...e, url: e.url.split('?')[0] } // sin parámetros (?p=, ?pago=…)
    },
  })).catch(() => { /* sin monitoreo: la página sigue igual */ })
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 4000 })
  else setTimeout(run, 2500)
}
