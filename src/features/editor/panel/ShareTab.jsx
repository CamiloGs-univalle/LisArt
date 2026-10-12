// Pestaña "Compartir": enlace, código QR y mensajes listos para redes
import { useState } from 'react'
import { useTenant } from '@/features/tenant/TenantProvider'
import { catalogUrl } from '@/app/router'

const qrSrc = (url, size = 480) => `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=12&data=${encodeURIComponent(url)}`

export default function ShareTab() {
  const { tenantId, brand } = useTenant()
  const url = catalogUrl(tenantId)
  const [copied, setCopied] = useState('')
  const messages = [
    { id: 'wa', label: 'Estado de WhatsApp', text: `✨ ¡Ya tenemos catálogo en línea! Mira todos nuestros productos y pide por WhatsApp en un clic 👉 ${url}` },
    { id: 'ig', label: 'Biografía de Instagram / TikTok', text: `🛍️ Catálogo y pedidos 👇\n${url}` },
    { id: 'cl', label: 'Mensaje para clientes', text: `¡Hola! Te comparto el catálogo de ${brand.name || 'nuestra tienda'}: ${url}\nEliges lo que te gusta y me llega el pedido por WhatsApp 😊` },
  ]

  const copy = async (id, text) => {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(''), 1800) } catch { /* sin permiso */ }
  }
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: brand.name, text: messages[2].text, url }) } catch { /* cancelado */ } }
    else copy('link', url)
  }

  return (
    <div className="sh">
      <section className="ad-card sh-hero">
        <div className="sh-qr">
          <img src={qrSrc(url)} alt={`Código QR del catálogo ${brand.name}`} width="200" height="200" loading="lazy" />
        </div>
        <div className="sh-body">
          <h2>📣 Comparte tu catálogo</h2>
          <p className="ad-hint">Imprime el código QR para tu mostrador, empaques o tarjetas: al escanearlo, tus clientes llegan directo a tu catálogo.</p>
          <div className="sh-link">
            <code>{url.replace(/^https?:\/\//, '')}</code>
            <button className="ad-btn ad-btn-sm ad-btn-ghost" onClick={() => copy('link', url)}>{copied === 'link' ? '¡Copiado!' : 'Copiar'}</button>
          </div>
          <div className="sh-actions">
            <button className="ad-btn ad-btn-primary" onClick={share}>Compartir</button>
            <a className="ad-btn ad-btn-ghost" href={qrSrc(url, 1000)} target="_blank" rel="noopener noreferrer" download={`qr-${tenantId}.png`}>Descargar QR</a>
          </div>
        </div>
      </section>

      <section className="ad-card">
        <h2>Textos listos para publicar</h2>
        <ul className="sh-msgs">
          {messages.map(m => (
            <li key={m.id}>
              <div><strong>{m.label}</strong><p>{m.text}</p></div>
              <button className="ad-btn ad-btn-sm ad-btn-ghost" onClick={() => copy(m.id, m.text)}>{copied === m.id ? '¡Copiado!' : 'Copiar'}</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
