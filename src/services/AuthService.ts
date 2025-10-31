// src/services/authService.ts
import { post, get } from './http'

export type ApiMessage = { message: string }
export type LoginResponse = { type: 'bearer'; token: string; user: unknown }

function normalizeEmailOrCorreo(v?: string | null): string {
  return (v ?? '').trim().toLowerCase()
}

export default class AuthService {
  async login(
    correoOrEmail: string | { correo?: string; email?: string; password: string },
    maybePassword?: string
  ): Promise<LoginResponse> {
    let correo = ''
    let password = ''

    if (typeof correoOrEmail === 'string') {
      correo = normalizeEmailOrCorreo(correoOrEmail)
      password = String(maybePassword ?? '')
    } else {
      const { correo: c, email, password: p } = correoOrEmail
      correo = normalizeEmailOrCorreo(c || email || '')
      password = String(p ?? '')
    }

    // OJO: sin opciones extra (tu http.ts no las usa)
    const res = await post<LoginResponse, { correo: string; password: string }>(
      '/v1/login',
      { correo, password }
    )

    // Si quieres guardar el token manualmente para otras llamadas:
    // localStorage.setItem('auth_token', res.token)

    return res
  }

  async forgotPassword(correo: string): Promise<ApiMessage> {
    return post<ApiMessage, { correo: string }>('/v1/forgot-password', { correo })
  }

  async resetPassword(token: string, password: string): Promise<ApiMessage> {
    return post<ApiMessage, { token: string; password: string }>(
      '/v1/reset-password',
      { token, password }
    )
  }

  async me(): Promise<{ user: unknown }> {
    return get<{ user: unknown }>('/v1/me')
  }
}
