import { ref } from 'vue'
import { authSetStore } from '@/stores/AuthStore'

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:3333/api'

export interface Metricas {
  ticketsAbiertos: number
  ticketsCerradosMes: number
  nuevosUsuarios: number
}

export interface ActividadItem {
  id: number
  evento: string
  fecha: string
  asignadoA?: string | null
}

export function useTablero() {
  const metricas = ref<Metricas>({
    ticketsAbiertos: 0,
    ticketsCerradosMes: 0,
    nuevosUsuarios: 0,
  })
  const actividadReciente = ref<ActividadItem[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)

  const auth = authSetStore()

  const cargarDatosTablero = async () => {
    cargando.value = true
    error.value = null
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`

      const resp = await fetch(`${API_BASE_URL}/dashboard`, { method: 'GET', headers })
      const data = await resp.json().catch(() => ({}))

      if (!resp.ok) {
        throw new Error(data?.message || `HTTP ${resp.status}`)
      }

      // Soporta "metrics" o "metricas" por si el backend cambia el nombre
      metricas.value = (data.metrics || data.metricas) ?? metricas.value
      actividadReciente.value = data.actividadReciente ?? []
    } catch (e: any) {
      error.value = e?.message || 'Error al cargar datos del tablero'
      actividadReciente.value = []
    } finally {
      cargando.value = false
    }
  }

  return { metricas, actividadReciente, cargando, error, cargarDatosTablero }
}
