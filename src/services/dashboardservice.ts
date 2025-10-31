import { get } from './http'

/** ===== Tipos que devuelve tu backend ===== */
export interface DashboardMetricsApi {
  pendientes: number
  recibidasHoy: number
  recibidasMes: number
  entregadasUlt30: number
  canceladasUlt30: number
  rechazadasUlt30: number
}

export interface DashboardActividadApi {
  id: number
  estado: 'recibido' | 'entregado' | 'cancelada' | 'rechazada'
  createdAt: string | null
  createdAtRelative: string | null
  orden: {
    id: number
    codigo: string
    estado: string
    createdAt: string | null
    razonSocial: string | null
    cliente: string | null
  } | null
}

export interface DashboardApiResponse {
  filters: { razon_social_id: number | null; desde: string | null; hasta: string | null }
  metrics: DashboardMetricsApi
  actividadReciente: DashboardActividadApi[]
  ultimasOrdenes: Array<{
    id: number
    codigo: string
    estado: string
    createdAt: string | null
    razonSocial: string | null
    cliente: string | null
  }>
}

/** ===== Tipos que consume el front ===== */
export interface MetricasUI {
  ordenesAbiertas: number
  ordenesCerradasMes: number
  ordenesHoy: number
}

export interface ActividadItemUI {
  id: number
  titulo: string
  estado: string
  empresa: string
  asignadoA: string
  evento: string
  fecha: string
}

/** ===== Servicio ===== */
export default class DashboardOrdenesService {
  static async fetch(): Promise<{
    metricas: MetricasUI
    actividad: ActividadItemUI[]
    bruto: DashboardApiResponse
  }> {
    const json = await get<DashboardApiResponse>('/v1/dashboard')

    const m = json.metrics
    const metricas: MetricasUI = {
      ordenesAbiertas: m.pendientes,
      ordenesCerradasMes: (m.entregadasUlt30 ?? 0) + (m.canceladasUlt30 ?? 0) + (m.rechazadasUlt30 ?? 0),
      ordenesHoy: m.recibidasHoy,
    }

    const actividad: ActividadItemUI[] = (json.actividadReciente ?? []).map((h) => {
      const code = h.orden?.codigo ?? `#${h.orden?.id ?? h.id}`
      const estado = (h.estado || h.orden?.estado || '').toUpperCase()
      const cliente = h.orden?.cliente ?? 'Cliente'
      const rs = h.orden?.razonSocial ?? '—'
      return {
        id: h.orden?.id ?? h.id,
        titulo: code,
        estado,
        empresa: rs,
        asignadoA: cliente,
        evento: `Orden ${code} — ${estado}`,
        fecha: h.createdAtRelative || h.createdAt || '—',
      }
    })

    return { metricas, actividad, bruto: json }
  }
}
