// src/services/RazonSocialService.ts
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

function getBaseUrl(): string {
  const raw = (import.meta as any)?.env?.VITE_API_BASE_URL ?? 'http://localhost:3333'
  return String(raw).replace(/\/$/, '')
}
const API_BASE = `${getBaseUrl()}/api/v1`

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
function isFormData(v: unknown): v is FormData {
  return typeof FormData !== 'undefined' && v instanceof FormData
}
function safeJson(text: string): unknown {
  try { return text ? JSON.parse(text) : undefined } catch { return undefined }
}

async function httpRequest<T>(
  path: string,
  opts?: { method?: HttpMethod; body?: unknown; headers?: Record<string, string>; signal?: AbortSignal }
): Promise<T> {
  const method = opts?.method ?? 'GET'
  const body = opts?.body
  const form = isFormData(body)

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(form ? {} : { 'Content-Type': 'application/json' }),
      ...getAuthHeader(),
      ...(opts?.headers ?? {}),
    },
    body: form ? (body as any) : body !== undefined ? JSON.stringify(body) : undefined,
    signal: opts?.signal,
  })

  if (res.status === 204) return undefined as unknown as T
  const text = await res.text()
  const data = safeJson(text)

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in (data as any) && typeof (data as any).message === 'string'
        ? (data as any).message
        : `HTTP ${res.status} ${res.statusText}`)
    throw new Error(message)
  }
  return data as T
}

/* ===== Tipos ===== */
export interface RazonSocialDTO {
  id: number
  nombre: string
  prefijo_orden: string
  activo: boolean

  avatar_url?: string | null
  banner_url?: string | null
  telefono?: string | null
  correo?: string | null
  direccion?: string | null
  sitio_web?: string | null
  color_hex?: string | null
  descripcion?: string | null

  created_at?: string
  updated_at?: string
}

export type RazonSocialUpdatePayload = Partial<
  Pick<
    RazonSocialDTO,
    | 'nombre'
    | 'prefijo_orden'
    | 'avatar_url'
    | 'telefono'
    | 'correo'
    | 'direccion'
    | 'sitio_web'
    | 'color_hex'
    | 'descripcion'
    | 'activo'
  >
>

export interface Paginated<T> {
  data: T[]
  meta?: any
}

/* ===== Service ===== */
const RazonSocialService = {
  /** Trae la empresa (razón social). El back responde { data: RazonSocialDTO } */
  async getMiEmpresa(razonSocialId?: number): Promise<{ data: RazonSocialDTO }> {
    const qs = razonSocialId ? `?razon_social_id=${razonSocialId}` : ''
    return httpRequest<{ data: RazonSocialDTO }>(`/mi-empresa${qs}`, { method: 'GET' })
  },

  /** Lista razones sociales (usa ?activo=true para solo activas) */
  async listarRazonesSociales(
    q = '',
    activo?: boolean,
    page = 1,
    perPage = 50
  ): Promise<Paginated<RazonSocialDTO>> {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (activo !== undefined) params.set('activo', String(activo))
    params.set('page', String(page))
    params.set('perPage', String(perPage))
    return httpRequest<Paginated<RazonSocialDTO>>(`/razones-sociales?${params.toString()}`)
  },

  /** Actualiza por ID. El back responde el modelo plano (no { data }) */
  async updateEmpresa(id: number, payload: RazonSocialUpdatePayload): Promise<RazonSocialDTO> {
    return httpRequest<RazonSocialDTO>(`/razones-sociales/${id}`, {
      method: 'PATCH',
      body: payload,
    })
  },

  /** Sube avatar y devuelve la URL relativa (primera del array) */
  async uploadAvatar(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('foto', file)
    const res = await httpRequest<{ data: Array<{ url: string }> }>(`/uploads/fotos`, {
      method: 'POST',
      body: fd,
    })
    const first = res?.data?.[0]
    if (!first?.url) throw new Error('No se recibió URL del archivo subido')
    return first.url
  },
}

export default RazonSocialService
