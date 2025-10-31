import { get, patch, upload } from './http'

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
  meta?: Record<string, unknown>
}

/* ===== Service ===== */
const RazonSocialService = {
  /** Trae la empresa (razón social). El back responde { data: RazonSocialDTO } */
  getMiEmpresa(razon_social_id?: number): Promise<{ data: RazonSocialDTO }> {
    return get<{ data: RazonSocialDTO }>('/v1/mi-empresa', {
      params: razon_social_id ? { razon_social_id } : undefined,
    })
  },

  /** Lista razones sociales (usa ?activo=true para solo activas) */
  listarRazonesSociales(
    q = '',
    activo?: boolean,
    page = 1,
    perPage = 50
  ): Promise<Paginated<RazonSocialDTO>> {
    return get<Paginated<RazonSocialDTO>>('/v1/razones-sociales', {
      params: { q, activo, page, perPage },
    })
  },

  /** Actualiza por ID. El back responde el modelo plano */
  updateEmpresa(id: number, payload: RazonSocialUpdatePayload): Promise<RazonSocialDTO> {
    return patch<RazonSocialDTO, RazonSocialUpdatePayload>(`/v1/razones-sociales/${id}`, payload)
  },

  /** Sube avatar y devuelve la URL relativa (primera del array) */
  async uploadAvatar(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('foto', file)
    const res = await upload<{ data: Array<{ url: string }> }>('/v1/uploads/fotos', fd)
    const first = res?.data?.[0]
    if (!first?.url) throw new Error('No se recibió URL del archivo subido')
    return first.url
  },
}

export default RazonSocialService
