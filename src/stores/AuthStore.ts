// src/stores/AuthStore.ts
import router from '@/router'
import { defineStore } from 'pinia'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface HttpErrorShape {
  status: number
  statusText: string
  message: string
  data?: unknown
}
class HttpError extends Error implements HttpErrorShape {
  status: number
  statusText: string
  data?: unknown
  constructor(init: HttpErrorShape) {
    super(init.message)
    this.name = 'HttpError'
    this.status = init.status
    this.statusText = init.statusText
    this.data = init.data
  }
}

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
  opts?: { method?: HttpMethod; body?: unknown; signal?: AbortSignal; headers?: Record<string, string> }
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
      data && typeof data === 'object' && 'message' in (data as any) && typeof (data as any).message === 'string'
        ? (data as any).message
        : `HTTP ${res.status} ${res.statusText}`

    throw new HttpError({ status: res.status, statusText: res.statusText, message, data })
  }
  return data as T
}

/* Tipos */
export interface User {
  id: number
  nombre: string
  email: string
  profilePictureUrl?: string
}

interface ApiUser {
  id: number
  nombres?: string
  apellidos?: string
  correo?: string
  email?: string
  profilePictureUrl?: string
  avatar_url?: string
  foto?: string
  foto_perfil?: string
}

interface LoginResponse {
  token: string
  user: ApiUser
}

interface MeResponse {
  user: ApiUser | null
}

/** Backend → Store */
function mapApiUser(apiUser: ApiUser): User {
  const fullName = [apiUser.nombres, apiUser.apellidos].filter(Boolean).join(' ').trim()
  return {
    id: apiUser.id,
    nombre: fullName || apiUser.email || apiUser.correo || '',
    email: apiUser.correo ?? apiUser.email ?? '',
    profilePictureUrl:
      apiUser.avatar_url ??
      apiUser.profilePictureUrl ??
      apiUser.foto ??
      apiUser.foto_perfil ??
      undefined,
  }
}

function getErrorMessage(err: unknown): string {
  if (err instanceof HttpError) return err.message
  if (err instanceof Error) return err.message
  return 'Error desconocido'
}

export const authSetStore = defineStore('auth', {
  state: () => {
    let user: User | null = null
    let token: string | null = null
    let avatarStamp = Date.now() // para cache-busting en imágenes
    try {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('token')
      const storedStamp = localStorage.getItem('avatarStamp')
      if (storedUser) user = JSON.parse(storedUser) as User
      if (storedToken) token = String(storedToken)
      if (storedStamp) avatarStamp = Number(storedStamp)
    } catch (error) {
      console.error('Error al parsear estado desde localStorage:', error)
    }
    return { user, token, avatarStamp }
  },

  actions: {
    async login(userData: { email: string; password: string }): Promise<boolean> {
      try {
        const body = { correo: userData.email, password: userData.password }
        const res = await httpRequest<LoginResponse>('/login', { method: 'POST', body })

        const user = mapApiUser(res.user)
        this.token = res.token
        this.user = user
        this.avatarStamp = Date.now()

        localStorage.setItem('token', res.token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('avatarStamp', String(this.avatarStamp))

        router.push('/dashboard')
        return true
      } catch (e: unknown) {
        console.error('AuthStore.login:', getErrorMessage(e))
        return false
      }
    },

    async logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('avatarStamp')
      router.push('/login')
    },

    async checkAuth() {
      if (!this.token) return

      if (this.user) {
        const path = router.currentRoute.value.path
        if (path === '/login' || path === '/register') router.push('/dashboard')
        return
      }

      try {
        const response = await httpRequest<MeResponse>('/me', { method: 'GET' })
        if (!response.user) return

        this.user = mapApiUser(response.user)
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (error: unknown) {
        if (error instanceof HttpError && (error.status === 401 || error.status === 419)) {
          this.logout()
        } else {
          console.warn('checkAuth:', getErrorMessage(error))
        }
      }
    },

    /** Actualiza MI perfil y refresca el store (además, hace bust de caché del avatar) */
    async updateMyProfile(payload: {
      nombres?: string
      apellidos?: string
      telefono?: string
      direccion?: string
      avatar_url?: string | null
    }) {
      // PUT /api/v1/usuarios/me  👈 esta ruta debe existir
      await httpRequest('/usuarios/me', { method: 'PUT', body: payload })

      // refresca /me y guarda
      const me = await httpRequest<MeResponse>('/me', { method: 'GET' })
      if (me.user) {
        this.user = mapApiUser(me.user)
        this.avatarStamp = Date.now() // bust cache
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('avatarStamp', String(this.avatarStamp))
      }
    },
  },
})
