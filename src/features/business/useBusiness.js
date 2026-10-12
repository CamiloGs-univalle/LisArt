// Datos privados del negocio en tiempo real (solo dueño / super)
import { useEffect, useState } from 'react'
import { useTenant } from '@/features/tenant/TenantProvider'
import { watchBusiness, watchSales, watchQuotes } from '@/services/business.service'
import { BUSINESS_DEFAULTS } from '@/lib/business'

const byDateDesc = (a, b) => String(b.date || b.createdAt || '').localeCompare(String(a.date || a.createdAt || ''))

export function useBusinessData() {
  const { tenantId } = useTenant()
  const [biz, setBiz] = useState(null)
  const [sales, setSales] = useState(null)
  const [quotes, setQuotes] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const fail = () => setError('No se pudieron cargar tus cuentas. Revisa que las reglas de Firestore estén publicadas.')
    const a = watchBusiness(tenantId, setBiz, fail)
    const b = watchSales(tenantId, (l) => setSales([...l].sort(byDateDesc)), fail)
    const c = watchQuotes(tenantId, (l) => setQuotes([...l].sort(byDateDesc)), fail)
    return () => { a(); b(); c() }
  }, [tenantId])
  return {
    tenantId,
    loading: biz === null || sales === null || quotes === null,
    error,
    costs: biz?.costs || {},
    targetMargin: biz?.targetMargin ?? BUSINESS_DEFAULTS.targetMargin,
    quoteCounter: biz?.quoteCounter || 0,
    sales: sales || [],
    quotes: quotes || [],
  }
}
