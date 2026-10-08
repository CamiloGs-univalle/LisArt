// Negocio actual: datos, plantilla y tema, en tiempo real.
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { watchTenant, updateTenant } from '@/services/tenants.service'
import { uploadImage } from '@/lib/cloudinary'
import { getTemplate } from './templates'
import { applyTheme } from './themes'

const Ctx = createContext(null)

export function TenantProvider({ slug, children }) {
  const [tenant, setTenant] = useState(undefined) // undefined = cargando · null = no existe
  const [error, setError] = useState(null)

  useEffect(() => {
    setTenant(undefined)
    return watchTenant(slug, (t) => setTenant(t), (e) => { setError(e); setTenant(null) })
  }, [slug])

  // Tema del negocio (colores + fuentes)
  useEffect(() => { if (tenant) applyTheme(tenant.theme || { preset: getTemplate(tenant.template).theme }) }, [tenant])

  // Título de la pestaña del navegador
  useEffect(() => {
    if (!tenant) return
    document.title = `${tenant.name}${tenant.tagline ? ` · ${tenant.tagline}` : ''}`
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
        instagram: t.instagram || '',
        tiktok: t.tiktok || '',
        facebook: t.facebook || '',
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
