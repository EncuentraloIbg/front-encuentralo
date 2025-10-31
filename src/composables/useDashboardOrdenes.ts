// src/composables/useDashboardOrdenes.ts
import { ref } from 'vue'
import { get, ApiError } from '@/services/http'

type OrdenEstado = 'recibido' | 'entregado' | 'cancelada' | 'rechazada'

type OrdenResumen = {
  id: number
  codigo: string
  consecutivo: number
  estado: OrdenEstado
  created_at?: string
  createdAt?: string
  cliente_nombre?: string
  razon_social_nombre?: string
}

type Paginated<T> = {
  meta: { total: number; perPage: number; currentPage: number; lastPage: number }
  data: T[]
}

type HistRow = {
  id: number
  estado: OrdenEstado
  createdAt?: string
  created_at?: string
  codigo: string
  clienteNombre: string
  razonSocial: string
}

type HistPaginated = Paginated<HistRow>

/** Lo que consume ListaActividad */
export type ActividadItem = {
  id: string | number
  evento: string
  asignadoA: string
  fecha: string
  icono?: string
  color?: string
}

const coalesceDate = (o: { createdAt?: string; created_at?: string }) => o.createdAt || o.created_at

const isToday = (iso?: string) => {
  if (!iso) return false
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return false
  const n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
}

const isWithinLastDays = (iso?: string, days = 30) => {
  if (!iso) return false
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return false
  const now = Date.now()
  const diff = now - d.getTime()
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000
}

/* Look & feel neutro (gris) */
/* Look & feel neutro (gris) */
const ESTADO_COLOR: Record<OrdenEstado, string> = {
  recibido: 'grey-darken-2',
  entregado: 'grey-darken-2',
  cancelada: 'grey-darken-2',
  rechazada: 'grey-darken-2',
}
const estadoColor = (e: OrdenEstado): string => ESTADO_COLOR[e]

const stripPrefix = (code: string) => code.replace(/^[A-Z]+-/, '') // quita "OEC-", "OGC-", etc.

export function useDashboardOrdenes() {
  const metricas = ref({
    ordenesAbiertas: 0,
    ordenesCerradasMes: 0,
    ordenesHoyAbiertas: 0,
    ordenesHoyCerradas: 0,
  })
  const actividadReciente = ref<ActividadItem[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)

  async function cargarDatosTablero() {
    cargando.value = true
    error.value = null
    try {
      // 1) Últimas órdenes (para abiertas/cerradas últimos 30 días + actividad)
      const ordResp = await get<Paginated<OrdenResumen>>('/v1/ordenes', {
        params: { page: 1, perPage: 50 },
      })
      const ordenes = ordResp.data ?? []

      const abiertas = ordenes.filter((o) => o.estado === 'recibido').length
      const cerradasMes = ordenes.filter((o) => {
        const f = coalesceDate(o)
        return o.estado !== 'recibido' && isWithinLastDays(f, 30)
      }).length

      actividadReciente.value = ordenes.slice(0, 10).map((o) => {
        const fecha = coalesceDate(o)
        const codigoSinPrefijo = stripPrefix(o.codigo || '')
        const cliente = o.cliente_nombre || ''
        const rs = o.razon_social_nombre || ''
        return {
          id: o.id,
          evento: `Orden ${codigoSinPrefijo} — ${o.estado.toUpperCase()}`,
          asignadoA: [cliente, rs].filter(Boolean).join(' · '),
          fecha: fecha ? new Date(fecha).toLocaleString('es-CO') : '—',
          icono: 'mdi-clipboard-list-outline',
          color: estadoColor(o.estado),
        }
      })

      // 2) Historial del día (para hoy abiertas/cerradas)
      const histResp = await get<HistPaginated>('/v1/ordenes/historial', {
        params: { page: 1, perPage: 100 },
      })
      const hist = histResp.data ?? []

      const abiertasHoy = hist.filter((h) => h.estado === 'recibido' && isToday(coalesceDate(h))).length
      const cerradasHoy = hist.filter(
        (h) =>
          (h.estado === 'entregado' || h.estado === 'cancelada' || h.estado === 'rechazada') &&
          isToday(coalesceDate(h))
      ).length

      metricas.value = {
        ordenesAbiertas: abiertas,
        ordenesCerradasMes: cerradasMes,
        ordenesHoyAbiertas: abiertasHoy,
        ordenesHoyCerradas: cerradasHoy,
      }
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : (e as Error).message
    } finally {
      cargando.value = false
    }
  }

  return { metricas, actividadReciente, cargando, error, cargarDatosTablero }
}
