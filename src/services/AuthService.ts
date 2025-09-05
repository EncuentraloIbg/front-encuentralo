// src/services/AuthService.ts
import { authSetStore } from '@/stores/AuthStore'

export type ApiMessage = { message: string }
export type LoginResponse = { type: 'bearer'; token: string; user: unknown }

type ErrorPayload = { message?: string; error?: string }
type TokenShape = string | { value?: string }
type LoginOk = { type: 'bearer'; token: TokenShape; user: unknown }

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:3333/api'

function isJsonResponse(resp: Response): boolean {
  const ct = resp.headers.get('content-type') || ''
  return ct.includes('application/json')
}
async function safeJson<T>(resp: Response): Promise<T | null> {
  if (!isJsonResponse(resp)) return null
  try { return (await resp.json()) as T } catch { return null }
}
function getMessage(input: unknown, fallback: string): string {
  if (input && typeof input === 'object') {
    const obj = input as Record<string, unknown>
    const msg = obj['message']
    const err = obj['error']
    if (typeof msg === 'string') return msg
    if (typeof err === 'string') return err
  }
  return fallback
}
function normalizeToken(token: TokenShape | null | undefined): string {
  if (typeof token === 'string') return token
  if (token && typeof (token as any).value === 'string') return (token as any).value
  return ''
}
function isLoginOk(input: unknown): input is LoginOk {
  if (!input || typeof input !== 'object') return false
  const obj = input as Record<string, unknown>
  return obj['type'] === 'bearer' && 'token' in obj
}

export default class AuthService {
  /** Iniciar sesión (POST /api/login) */
  async login(correo: string, password: string): Promise<LoginResponse> {
    const resp = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: correo.trim().toLowerCase(), password }),
    })

    const data = await safeJson<LoginOk | ErrorPayload>(resp)
    if (!resp.ok) throw new Error(getMessage(data, 'Error en la autenticación'))
    if (!isLoginOk(data)) throw new Error('Respuesta inesperada del servidor.')

    const token = normalizeToken(data.token)
    if (!token) throw new Error('No se recibió un token válido del servidor.')

    return { type: 'bearer', token, user: data.user ?? null }
  }

  /** Recuperar contraseña (POST /api/forgot-password) */
  async forgotPassword(correo: string): Promise<ApiMessage> {
    const resp = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo }),
    })
    const data = await safeJson<ApiMessage | ErrorPayload>(resp)
    if (!resp.ok) throw new Error(getMessage(data, 'No se pudo enviar el correo'))
    return { message: getMessage(data, 'Hemos enviado las instrucciones a tu correo.') }
  }

  /** Restablecer contraseña (POST /api/reset-password) */
  async resetPassword(token: string, password: string): Promise<ApiMessage> {
    const resp = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await safeJson<ApiMessage | ErrorPayload>(resp)
    if (!resp.ok) throw new Error(getMessage(data, 'No se pudo restablecer la contraseña'))
    return { message: getMessage(data, 'Contraseña actualizada correctamente.') }
  }

  /** Verificar sesión (GET /api/me) */
  async me(): Promise<{ user: unknown }> {
    const authStore = authSetStore()
    const token = authStore.token
    if (!token) throw new Error('No hay token de autenticación disponible para verificar la sesión.')

    const resp = await fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await safeJson<{ user: unknown } & ErrorPayload>(resp)
    if (!resp.ok) {
      if (resp.status === 401) throw new Error('Token de autenticación expirado o inválido.')
      throw new Error(getMessage(data, 'Error al obtener el usuario.'))
    }
    if (!data || typeof data !== 'object' || !('user' in data)) {
      throw new Error('Respuesta inesperada del servidor al consultar /me.')
    }
    return { user: (data as any).user }
  }
}
