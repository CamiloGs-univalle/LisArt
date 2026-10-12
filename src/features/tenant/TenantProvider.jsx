// Negocio actual: datos, plantilla y tema, en tiempo real.
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { watchTenant, updateTenant } from '@/services/tenants.service'
import { uploadImage } from '@/lib/cloudinary'
import { getTemplate } from './templates'
import { applyTheme } from './themes'

const Ctx = createContext(null)

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', content)
}
function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el) }
  el.href = href
}

// Solo enlaces https:// (evita enlaces «javascript:» guardados en la base de datos)
const safeUrl = (u) => (typeof u === 'string' && /^https:\/\/[^\s]+$/i.test(u.trim()) ? u.trim() : '')

export function TenantProvider({ slug, children }) {
  const [tenant, setTenant] = useState(undefined) // undefined = cargando · null = no existe
  const [error, setError] = useState(null)

  useEffect(() => {
    setTenant(undefined)
    return watchTenant(slug, (t) => setTenant(t), (e) => { setError(e); setTenant(null) })
  }, [slug])

  // Tema del negocio (colores + fuentes)
  useEffect(() => { if (tenant) applyTheme(tenant.theme || { preset: getTemplate(tenant.template).theme }) }, [tenant])

  // Título, descripción, color del navegador e ícono de la pestaña (por negocio)
  useEffect(() => {
    if (!tenant) return
    const title = `${tenant.name}${tenant.tagline ? ` · ${tenant.tagline}` : ''}`
    const desc = tenant.tagline
      ? `${tenant.tagline}. Mira el catálogo de ${tenant.name}${tenant.city ? ` en ${tenant.city}` : ''} y pide por WhatsApp.`
      : `Catálogo de ${tenant.name}${tenant.city ? ` en ${tenant.city}` : ''}. Elige tus productos y pide por WhatsApp.`
    document.title = title
    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', desc)
    if (tenant.logo) setMeta('property', 'og:image', tenant.logo)
    const color = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim()
    if (color) setMeta('name', 'theme-color', color)
    if (tenant.logo) setLink('icon', tenant.logo)
  }, [tenant])

  const value = useMemo(() => {
    const t = tenant || {}
    return {
      tenant,
      tenantId: slug,
      loading: tenant === undefined,
      notFound: tenant === null,
      error,
      template: getTemplate(t.template),
      // Estructura de la página: clasico | velora | terrain | editorial
      layout: t.layout || getTemplate(t.template).layout || 'clasico',
      imageFolder: `catalogos/${slug}`,
      // Acciones (solo dueño o super administrador; lo valida la base de datos)
      update: (patch) => updateTenant(slug, patch),
      uploadLogo: async (file) => {
        const url = await uploadImage(file, `catalogos/${slug}`)
        await updateTenant(slug, { logo: url })
        return url
      },
      // Datos de marca listos para usar en la página
      brand: {
        name: t.name || '',
        tagline: t.tagline || '',
        city: t.city || '',
        whatsapp: t.whatsapp || '',
        logo: t.logo || '',
        instagram: safeUrl(t.instagram),
        tiktok: safeUrl(t.tiktok),
        facebook: safeUrl(t.facebook),
      },
    }
  }, [tenant, slug, error])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTenant() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTenant debe usarse dentro de <TenantProvider>')
  return ctx
}
