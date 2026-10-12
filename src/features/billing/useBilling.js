// Precios de la plataforma en tiempo real (con valores por defecto)
import { useEffect, useState } from 'react'
import { watchBillingSettings } from '@/services/billing.service'
import { withBillingDefaults } from '@/lib/billingCore'

export function useBillingSettings() {
  const [settings, setSettings] = useState(() => withBillingDefaults(null))
  useEffect(() => watchBillingSettings((d) => setSettings(withBillingDefaults(d)), () => {}), [])
  return settings
}
