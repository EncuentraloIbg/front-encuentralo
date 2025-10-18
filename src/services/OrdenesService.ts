// src/services/ordenesService.ts

/** Valida y normaliza un id antes de construir la URL */
function ensureId(idLike: unknown): number {
  const id = Number(idLike)
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error('ID de orden inválido')
  }
  return id
}

/** Base API (LOCAL): host del backend + /api/v1 */
const API_ORIGIN = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3333').replace(/\/$/, '')
export const API_BASE = `${API_ORIGIN}/api/v1`

/** Helper: serializa query params simples */
function toQuery(params?: Record<string, unknown>): string {
  if (!params) return ''
  const usp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    usp.set(k, String(v))
  })
  const s = usp.toString()
  return s ? `?${s}` : ''
}

/* ===== Tipos ===== */
export type OrdenEstado = 'recibido' | 'entregado' | 'cancelada' | 'rechazada'

export interface ClienteIn {
  documento: string
  nombre: string
  telefono?: string
  correo?: string
  whatsapp_opt_in?: boolean
  direccion?: string | null
  tipo_cliente?: 'persona' | 'empresa' | null
}

export interface EquipoIn {
  tipo_equipo_id: number
  marca: string
  modelo: string
  serie_imei: string
  specs?: string | null
}

export interface OrdenIn {
  estado_estetico?: string | null
  fallo_reportado?: string | null
  observaciones_cliente?: string | null
  pass_desbloqueo?: string | null
  autoriza_respaldo?: boolean | null
  autoriza_apertura?: boolean | null
  mojado?: boolean | null
  diagnostico_costo?: number | null
  anticipo?: number | null
  metodo_pago_id?: number | null
  fecha_entrega_acordada?: string | null // ISO
}

export interface AccesorioIn {
  accesorio_id: number
  detalle?: string | null
}

export interface FotoIn {
  url: string
  descripcion?: string | null
}

export interface ArchivoIn {
  url: string
  nombre_archivo: string
  tipo: string
}

export interface CrearOrdenPayload {
  razon_social_id: number
  cliente: ClienteIn
  equipo: EquipoIn
  orden?: OrdenIn
  accesorios?: AccesorioIn[]
  fotos?: FotoIn[]
  archivos?: ArchivoIn[]
}

/* ===== Respuestas (tipos esperados) ===== */
export interface CrearOrdenResponse {
  id: number
  codigo: string
  consecutivo: number
  estado: OrdenEstado
}

export interface OrdenResumen {
  id: number
  codigo: string
  consecutivo: number
  estado: OrdenEstado
  created_at?: string
}

export interface Paginated<T> {
  meta: { total: number; perPage: number; currentPage: number; lastPage: number }
  data: T[]
}

export interface RazonSocial {
  id: number
  nombre: string
  prefijoOrden: string
  activo: boolean
}

export interface Cliente {
  id: number
  nombre: string
  documento: string
  telefono?: string
  correo?: string
}

export interface Equipo {
  id: number
  tipoEquipoId: number
  marca: string
  modelo: string
  serieImei: string
  specs?: string | null
}

export interface MetodoPago {
  id: number
  nombre: string
  activo: boolean
}

export interface MotivoEstado {
  id: number
  nombre: string
  estado_aplicable: OrdenEstado
  activo: boolean
}

export interface HistorialOrden {
  id: number
  estado: OrdenEstado
  usuarioId: number | null
  motivoEstadoId?: number | null
  motivoTexto?: string | null
  created_at?: string
}

export interface OrdenDetalle extends OrdenResumen {
  razonSocial?: RazonSocial
  cliente?: Cliente
  equipo?: Equipo
  metodoPago?: MetodoPago
  motivoEstado?: MotivoEstado
  fotos?: FotoIn[]
  archivos?: ArchivoIn[]
  historial?: HistorialOrden[]
  accesorios?: AccesorioIn[]
}

/* ====== AUTH (descriptores) ====== */
export function reqLogin(payload: { correo: string; password: string }) {
  return { method: 'POST', url: `${API_BASE}/login`, body: payload }
}
export function reqForgotPassword(payload: { correo: string }) {
  return { method: 'POST', url: `${API_BASE}/forgot-password`, body: payload }
}
export function reqResetPassword(payload: { token: string; password: string }) {
  return { method: 'POST', url: `${API_BASE}/reset-password`, body: payload }
}
export function reqMe() {
  return { method: 'GET', url: `${API_BASE}/me` }
}

/* ====== ÓRDENES (descriptores) ====== */
export function reqCrearOrden(payload: CrearOrdenPayload) {
  return { method: 'POST', url: `${API_BASE}/ordenes`, body: payload }
}

export function reqListarOrdenes(params?: {
  estado?: OrdenEstado
  razon_social_id?: number
  fecha_desde?: string // ISO yyyy-mm-dd
  fecha_hasta?: string // ISO yyyy-mm-dd
  page?: number
  perPage?: number
  q?: string // búsqueda por texto (código, cliente, documento…)
}) {
  return { method: 'GET', url: `${API_BASE}/ordenes${toQuery(params)}` }
}

export function reqObtenerOrden(idLike: unknown) {
  const id = ensureId(idLike)
  return { method: 'GET', url: `${API_BASE}/ordenes/${id}` }
}

export function reqActualizarOrden(
  idLike: unknown,
  payload: Partial<OrdenIn> & {
    metodo_pago_id?: number | null
    fecha_entrega_acordada?: string | null
  }
) {
  const id = ensureId(idLike)
  return { method: 'PATCH', url: `${API_BASE}/ordenes/${id}`, body: payload }
}

export function reqCerrarOrden(
  idLike: unknown,
  payload: {
    estado: 'entregado' | 'cancelada' | 'rechazada'
    fecha_cierre: string // ISO
    motivo_estado_id?: number | null
    motivo_estado_texto?: string | null
  }
) {
  const id = ensureId(idLike)
  return { method: 'POST', url: `${API_BASE}/ordenes/${id}/cerrar`, body: payload }
}

export function reqAgregarAccesorios(idLike: unknown, accesorios: AccesorioIn[]) {
  const id = ensureId(idLike)
  return { method: 'POST', url: `${API_BASE}/ordenes/${id}/accesorios`, body: { accesorios } }
}

export function reqAgregarFotos(idLike: unknown, fotos: FotoIn[]) {
  const id = ensureId(idLike)
  return { method: 'POST', url: `${API_BASE}/ordenes/${id}/fotos`, body: { fotos } }
}

export function reqAgregarArchivos(idLike: unknown, archivos: ArchivoIn[]) {
  const id = ensureId(idLike)
  return { method: 'POST', url: `${API_BASE}/ordenes/${id}/archivos`, body: { archivos } }
}

/* ====== CATÁLOGOS (descriptores) ====== */
export function reqTiposEquipo() {
  return { method: 'GET', url: `${API_BASE}/catalogos/tipos-equipo` }
}
export function reqAccesorios() {
  return { method: 'GET', url: `${API_BASE}/catalogos/accesorios` }
}
export function reqMetodosPago() {
  return { method: 'GET', url: `${API_BASE}/catalogos/metodos-pago` }
}
export function reqMotivosEstado() {
  return { method: 'GET', url: `${API_BASE}/catalogos/motivos-estado` }
}
/** Razones sociales */
export function reqRazonesSociales() {
  return { method: 'GET', url: `${API_BASE}/catalogos/razones-sociales` }
}

/* ====== Siguiente consecutivo ====== */
export function reqSiguienteConsecutivo(razon_social_id: number) {
  return {
    method: 'GET',
    url: `${API_BASE}/ordenes/siguiente-consecutivo?razon_social_id=${encodeURIComponent(
      String(razon_social_id)
    )}`,
  }
}
