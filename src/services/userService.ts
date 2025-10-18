// src/services/userService.ts

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

/* ===== Helpers ===== */

function apiBase() {
  const raw = (import.meta as any)?.env?.VITE_API_BASE_URL ?? 'http://localhost:3333'
  return String(raw).replace(/\/$/, '')
}

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseJson<T>(res: Response): Promise<T | undefined> {
  const text = await res.text()
  if (!text) return undefined
  try { return JSON.parse(text) as T } catch { return undefined }
}

async function ensureOk<T>(res: Response, fallbackMsg: string): Promise<T> {
  if (!res.ok) {
    const data = await parseJson<{ message?: string }>(res)
    const msg = data?.message || `${fallbackMsg} (HTTP ${res.status})`
    throw new Error(msg)
  }
  const data = await parseJson<T>(res)
  return data as T
}

/* ===== Services ===== */

/**
 * GET /api/v1/me
 * - Si no hay sesión (401) → retorna { user: null } sin lanzar error.
 * - En otros errores, lanza con mensaje del backend si existe.
 */
export async function getMe(): Promise<{ user: Usuario | null }> {
  const res = await fetch(`${apiBase()}/api/v1/me`, {
    method: 'GET',
    headers: { ...authHeader() },
  })

  if (res.status === 401) {
    return { user: null }
  }
  return ensureOk<{ user: Usuario | null }>(res, 'Error al obtener usuario autenticado')
}

/** GET /api/v1/usuarios */
export async function listarUsuarios(q: UsuariosQuery = {}): Promise<Paginated<Usuario>> {
  const params = new URLSearchParams()
  if (q.q) params.set('q', q.q)
  if (q.estado) params.set('estado', q.estado)
  if (q.razon_social_id !== undefined) params.set('razon_social_id', String(q.razon_social_id))
  if (q.page) params.set('page', String(q.page))
  if (q.perPage) params.set('perPage', String(q.perPage))

  const url = `${apiBase()}/api/v1/usuarios${params.toString() ? `?${params.toString()}` : ''}`
  const res = await fetch(url, { method: 'GET', headers: { ...authHeader() } })
  return ensureOk<Paginated<Usuario>>(res, 'Error al listar usuarios')
}

/** GET /api/v1/usuarios/:id */
export async function obtenerUsuario(id: number): Promise<Usuario> {
  const res = await fetch(`${apiBase()}/api/v1/usuarios/${id}`, {
    method: 'GET',
    headers: { ...authHeader() },
  })
  return ensureOk<Usuario>(res, 'Error al obtener usuario')
}

/** POST /api/v1/usuarios */
export async function crearUsuario(payload: UsuarioCreate): Promise<Usuario> {
  const res = await fetch(`${apiBase()}/api/v1/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  })
  return ensureOk<Usuario>(res, 'Error al crear usuario')
}

/** PATCH /api/v1/usuarios/:id */
export async function actualizarUsuario(id: number, payload: UsuarioUpdate): Promise<Usuario> {
  const res = await fetch(`${apiBase()}/api/v1/usuarios/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  })
  return ensureOk<Usuario>(res, 'Error al actualizar usuario')
}

/** PATCH /api/v1/usuarios/:id/activar */
export async function activarUsuario(id: number): Promise<{ message: string; user: Usuario }> {
  const res = await fetch(`${apiBase()}/api/v1/usuarios/${id}/activar`, {
    method: 'PATCH',
    headers: { ...authHeader() },
  })
  return ensureOk<{ message: string; user: Usuario }>(res, 'Error al activar usuario')
}

/** PATCH /api/v1/usuarios/:id/inactivar */
export async function inactivarUsuario(id: number): Promise<{ message: string; user: Usuario }> {
  const res = await fetch(`${apiBase()}/api/v1/usuarios/${id}/inactivar`, {
    method: 'PATCH',
    headers: { ...authHeader() },
  })
  return ensureOk<{ message: string; user: Usuario }>(res, 'Error al inactivar usuario')
}

/** DELETE /api/v1/usuarios/:id */
export async function eliminarUsuario(id: number): Promise<{ message: string } | undefined> {
  const res = await fetch(`${apiBase()}/api/v1/usuarios/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() },
  })
  if (res.status === 204) return undefined
  return ensureOk<{ message: string }>(res, 'Error al eliminar usuario')
}

/** POST /api/v1/uploads/fotos — subir imagen y devolver URL (relativa o absoluta según back) */
export async function uploadAvatar(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('foto', file)
  const res = await fetch(`${apiBase()}/api/v1/uploads/fotos`, {
    method: 'POST',
    headers: { ...authHeader() },
    body: fd,
  })
  const data = await ensureOk<{ data: Array<{ url: string }> }>(res, 'Error al subir avatar')
  const first = data?.data?.[0]
  if (!first?.url) throw new Error('No se recibió URL del archivo subido')
  return first.url
}

/** PUT /api/v1/usuarios/me — actualizar MI perfil */
export async function updateMyProfile(payload: UsuarioMeUpdate): Promise<{
  message: string
  user: { id: number; nombres: string; apellidos: string; correo: string; avatar_url: string | null }
}> {
  const res = await fetch(`${apiBase()}/api/v1/usuarios/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  })
  return ensureOk(res, 'Error al actualizar mi perfil')
}
