import { get, post, patch } from './http'

/** Valida y normaliza un id antes de construir la URL */
function ensureId(idLike: unknown): number {
  const id = Number(idLike)
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('ID de orden inválido')
  return id
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
  fecha_entrega_acordada?: string | null
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
  /** Tu vista lo trata como opcional; lo dejamos opcional por compatibilidad */
  tipo?: string | null
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

/* ===== Respuestas ===== */
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
  updated_at?: string // ⬅️ agregado para la vista
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

/** Alias exportado que la vista importa como HistorialItem */
export type HistorialItem = HistorialOrden

export interface OrdenDetalle extends OrdenResumen {
  razonSocial?: RazonSocial
  cliente?: Cliente
  equipo?: Equipo
  metodoPago?: MetodoPago
  motivoEstado?: MotivoEstado

  /** Campos que la vista lee directamente */
  diagnostico_costo?: number | null
  anticipo?: number | null
  fecha_entrega_acordada?: string | null
  autoriza_respaldo?: boolean | null
  autoriza_apertura?: boolean | null
  mojado?: boolean | null
  fallo_reportado?: string | null
  estado_estetico?: string | null
  observaciones_cliente?: string | null

  fotos?: FotoIn[]
  archivos?: ArchivoIn[]
  historial?: HistorialOrden[]
  accesorios?: AccesorioIn[]
}

/* ====== AUTH ====== */
export function login(payload: { correo: string; password: string }) {
  return post<{ type: 'bearer'; token: string; user: unknown }, { correo: string; password: string }>(
    '/v1/login',
    payload,
    { tryRefresh: false, noAuth: true }
  )
}
export function forgotPassword(payload: { correo: string }) {
  return post<{ message: string }, { correo: string }>('/v1/forgot-password', payload, {
    tryRefresh: false,
    noAuth: true,
  })
}
export function resetPassword(payload: { token: string; password: string }) {
  return post<{ message: string }, { token: string; password: string }>(
    '/v1/reset-password',
    payload,
    {
      tryRefresh: false,
      noAuth: true,
    }
  )
}
export function me() {
  return get<{ user: unknown }>('/v1/me')
}

/* ====== ÓRDENES ====== */
export function crearOrden(payload: CrearOrdenPayload) {
  return post<CrearOrdenResponse, CrearOrdenPayload>('/v1/ordenes', payload)
}

export function listarOrdenes(params?: {
  estado?: OrdenEstado
  razon_social_id?: number
  fecha_desde?: string
  fecha_hasta?: string
  page?: number
  perPage?: number
  q?: string
}) {
  return get<Paginated<OrdenResumen>>('/v1/ordenes', { params })
}

export function obtenerOrden(idLike: unknown) {
  const id = ensureId(idLike)
  return get<OrdenDetalle>(`/v1/ordenes/${id}`)
}

export function actualizarOrden(
  idLike: unknown,
  payload: Partial<OrdenIn> & { metodo_pago_id?: number | null; fecha_entrega_acordada?: string | null }
) {
  const id = ensureId(idLike)
  return patch<OrdenDetalle, typeof payload>(`/v1/ordenes/${id}`, payload)
}

export function cerrarOrden(
  idLike: unknown,
  payload: {
    estado: 'entregado' | 'cancelada' | 'rechazada'
    fecha_cierre: string
    motivo_estado_id?: number | null
    motivo_estado_texto?: string | null
  }
) {
  const id = ensureId(idLike)
  return post<OrdenDetalle, typeof payload>(`/v1/ordenes/${id}/cerrar`, payload)
}

export function agregarAccesorios(idLike: unknown, accesorios: AccesorioIn[]) {
  const id = ensureId(idLike)
  return post<OrdenDetalle, { accesorios: AccesorioIn[] }>(`/v1/ordenes/${id}/accesorios`, {
    accesorios,
  })
}

export function agregarFotos(idLike: unknown, fotos: FotoIn[]) {
  const id = ensureId(idLike)
  return post<OrdenDetalle, { fotos: FotoIn[] }>(`/v1/ordenes/${id}/fotos`, { fotos })
}

export function agregarArchivos(idLike: unknown, archivos: ArchivoIn[]) {
  const id = ensureId(idLike)
  return post<OrdenDetalle, { archivos: ArchivoIn[] }>(`/v1/ordenes/${id}/archivos`, { archivos })
}

/* ====== CATÁLOGOS ====== */
export const tiposEquipo = () =>
  get<Array<{ id: number; nombre: string }>>('/v1/catalogos/tipos-equipo')
export const accesorios = () =>
  get<Array<{ id: number; nombre: string }>>('/v1/catalogos/accesorios')
export const metodosPago = () => get<MetodoPago[]>('/v1/catalogos/metodos-pago')
export const motivosEstado = () => get<MotivoEstado[]>('/v1/catalogos/motivos-estado')
export const razonesSociales = () => get<RazonSocial[]>('/v1/catalogos/razones-sociales')

/** Alias para la vista que importa `obtenerMotivosEstado` */
export function obtenerMotivosEstado() {
  return motivosEstado()
}

/* ====== Siguiente consecutivo ====== */
export function siguienteConsecutivo(razon_social_id: number) {
  return get<{ consecutivo: number; codigo: string }>('/v1/ordenes/siguiente-consecutivo', {
    params: { razon_social_id },
  })
}
