import { get, post, patch, del, upload } from './http'

/* ===== Tipos ===== */

export type EstadoUsuario = 'activo' | 'inactivo'

export interface Usuario {
  id: number
  razonSocialId?: number
  razon_social_id?: number
  nombres: string
  apellidos: string
  correo: string
  telefono: string | null
  direccion?: string | null
  estado?: EstadoUsuario
  avatar_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface UsuariosQuery {
  q?: string
  estado?: EstadoUsuario
  razon_social_id?: number
  page?: number
  perPage?: number
}

export interface Paginated<T> {
  meta: { total: number; perPage: number; currentPage: number; lastPage: number }
  data: T[]
}

/** Crear */
export interface UsuarioCreate {
  razon_social_id: number
  nombres: string
  apellidos: string
  correo: string
  password: string
  telefono?: string | null
  direccion?: string | null
  estado?: EstadoUsuario
  avatar_url?: string | null
}

/** Update genérico (PATCH /usuarios/:id) */
export type UsuarioUpdate = Partial<{
  razon_social_id: number
  nombres: string
  apellidos: string
  correo: string
  password: string
  telefono: string | null
  direccion: string | null
  estado: EstadoUsuario
  avatar_url: string | null
}>

/** Update de MI perfil (PUT /usuarios/me) */
export type UsuarioMeUpdate = Partial<{
  nombres: string
  apellidos: string
  telefono: string | null
  direccion: string | null
  avatar_url: string | null
}>

/* ===== Services ===== */

/** GET /api/v1/me  */
export function getMe(): Promise<{ user: Usuario | null }> {
  return get<{ user: Usuario | null }>('/v1/me')
}

/** GET /api/v1/usuarios */
export function listarUsuarios(q: UsuariosQuery = {}): Promise<Paginated<Usuario>> {
  const params = {
    q: q.q,
    estado: q.estado,
    razon_social_id: q.razon_social_id,
    page: q.page,
    perPage: q.perPage,
  } satisfies Record<string, string | number | boolean | null | undefined>

  return get<Paginated<Usuario>>('/v1/usuarios', { params })
}

/** GET /api/v1/usuarios/:id */
export function obtenerUsuario(id: number): Promise<Usuario> {
  return get<Usuario>(`/v1/usuarios/${id}`)
}

/** POST /api/v1/usuarios */
export function crearUsuario(payload: UsuarioCreate): Promise<Usuario> {
  return post<Usuario, UsuarioCreate>('/v1/usuarios', payload)
}

/** PATCH /api/v1/usuarios/:id */
export function actualizarUsuario(id: number, payload: UsuarioUpdate): Promise<Usuario> {
  return patch<Usuario, UsuarioUpdate>(`/v1/usuarios/${id}`, payload)
}

/** PATCH /api/v1/usuarios/:id/activar */
export function activarUsuario(id: number): Promise<{ message: string; user: Usuario }> {
  return patch<{ message: string; user: Usuario }>(`/v1/usuarios/${id}/activar`)
}

/** PATCH /api/v1/usuarios/:id/inactivar */
export function inactivarUsuario(id: number): Promise<{ message: string; user: Usuario }> {
  return patch<{ message: string; user: Usuario }>(`/v1/usuarios/${id}/inactivar`)
}

/** DELETE /api/v1/usuarios/:id */
export function eliminarUsuario(id: number): Promise<{ message: string } | undefined> {
  return del<{ message: string } | undefined>(`/v1/usuarios/${id}`)
}

/** POST /api/v1/uploads/fotos — subir imagen y devolver URL */
export async function uploadAvatar(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('foto', file)
  const res = await upload<{ data: Array<{ url: string }> }>('/v1/uploads/fotos', fd)
  const first = res?.data?.[0]
  if (!first?.url) throw new Error('No se recibió URL del archivo subido')
  return first.url
}

/** PUT /api/v1/usuarios/me — actualizar MI perfil */
export function updateMyProfile(
  payload: UsuarioMeUpdate
): Promise<{
  message: string
  user: { id: number; nombres: string; apellidos: string; correo: string; avatar_url: string | null }
}> {
  return post<
    {
      message: string
      user: { id: number; nombres: string; apellidos: string; correo: string; avatar_url: string | null }
    },
    UsuarioMeUpdate
  >('/v1/usuarios/me?_method=PUT', payload)
}
