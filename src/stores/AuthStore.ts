// src/stores/AuthStore.ts
import router from '@/router'
import { defineStore } from 'pinia'
import { post, get, request, ApiError } from '@/services/http'

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
  type?: 'bearer'
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
  if (err instanceof ApiError) return `${err.status}: ${err.message}`
  if (err instanceof Error) return err.message
  return 'Error desconocido'
}

/** Helper: header Authorization desde localStorage */
function buildAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const authSetStore = defineStore('auth', {
  state: () => {
    let user: User | null = null
    let token: string | null = null
    let avatarStamp = Date.now()
    try {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('token')
      const storedStamp = localStorage.getItem('avatarStamp')
      if (storedUser) user = JSON.parse(storedUser) as User
      if (storedToken) token = String(storedToken)
      if (storedStamp) avatarStamp = Number(storedStamp)
    } catch (error) {
      console.error('AuthStore: error al restaurar desde localStorage:', error)
    }
    return { user, token, avatarStamp }
  },

  actions: {
    /** Login: envía { correo, password } normalizados */
    async login(userData: { email: string; password: string }): Promise<boolean> {
      try {
        const body = {
          correo: (userData.email ?? '').trim().toLowerCase(),
          password: (userData.password ?? '').trim(),
        }

        // Log ligero del payload (sin password)
        console.log('[AUTH] login →', {
          correo: body.correo,
          passwordLen: body.password.length,
        })

        const res = await post<LoginResponse, typeof body>('/v1/login', body)
        const user = mapApiUser(res.user)

        this.token = res.token
        this.user = user
        this.avatarStamp = Date.now()

        localStorage.setItem('token', res.token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('avatarStamp', String(this.avatarStamp))

        console.log('[AUTH] login ← OK', { user: user.email })

        router.push('/dashboard')
        return true
      } catch (e: unknown) {
        console.error('[AUTH] login ← FAIL', getErrorMessage(e))
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

    /** Verifica y rellena el usuario si hay token */
    async checkAuth() {
      if (!this.token) return

      if (this.user) {
        const path = router.currentRoute.value.path
        if (path === '/login' || path === '/register') router.push('/dashboard')
        return
      }

      try {
        const me = await get<MeResponse>('/v1/me', {
          headers: { ...buildAuthHeaders() },
        })
        if (!me.user) return

        this.user = mapApiUser(me.user)
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (error: unknown) {
        const msg = getErrorMessage(error)
        if (error instanceof ApiError && (error.status === 401 || error.status === 419)) {
          console.warn('[AUTH] checkAuth → no autorizado, cerrando sesión')
          this.logout()
        } else {
          console.warn('[AUTH] checkAuth WARN', msg)
        }
      }
    },

    /** Actualiza MI perfil y refresca el store (además, bust de caché del avatar) */
    async updateMyProfile(payload: {
      nombres?: string
      apellidos?: string
      telefono?: string
      direccion?: string
      avatar_url?: string | null
    }) {
      // PUT /api/v1/usuarios/me (requiere Authorization)
      await request('PUT', '/v1/usuarios/me', payload, {
        headers: { ...buildAuthHeaders(), 'Content-Type': 'application/json' },
      })

      // refresca /me y guarda
      const me = await get<MeResponse>('/v1/me', {
        headers: { ...buildAuthHeaders() },
      })
      if (me.user) {
        this.user = mapApiUser(me.user)
        this.avatarStamp = Date.now()
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('avatarStamp', String(this.avatarStamp))
      }
    },
  },
})
