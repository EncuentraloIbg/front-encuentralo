// src/stores/AuthStore.ts
import router from '@/router'
import AuthService from '@/services/AuthService'
import { defineStore } from 'pinia'
import {
  obtenerNotificaciones,
  marcarComoLeida,
  initializeSseConnection,
  closeSseConnection,
} from '@/services/NotificacionService'

interface User {
  id: number
  nombre: string
  email: string
}

interface Notification {
  id: number
  titulo: string
  mensaje: string
  ticketId: number
  leido: boolean
  // puedes agregar más props si las usas (estadoId, etc.)
}

export const authSetStore = defineStore('auth', {
  state: () => {
    let user: User | null = null
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) user = JSON.parse(storedUser)
    } catch (error) {
      console.error('Error al parsear el usuario desde localStorage:', error)
    }
    return {
      user,
      token: localStorage.getItem('token') || null,
      notificaciones: [] as Notification[],
      cantidadNoLeidas: 0,
      loadingNotifications: false,
      sseConnectionActive: false,
    }
  },

  actions: {
    /** LOGIN */
    async login(userData: { email: string; password: string }): Promise<boolean> {
      try {
        const auth = new AuthService()
        const res = await auth.login(userData.email, userData.password)

        // Adaptar shape del backend -> store (correo → email, nombres+apellidos → nombre)
        const apiUser = res.user as any
        const user: User = {
          id: apiUser.id,
          nombre: [apiUser.nombres, apiUser.apellidos].filter(Boolean).join(' ').trim(),
          email: apiUser.correo,
        }

        this.token = res.token
        this.user = user

        localStorage.setItem('token', res.token)
        localStorage.setItem('user', JSON.stringify(user))

        await this.loadNotificationsFromApi()
        this.startSseConnection()

        router.push('/dashboard')
        return true
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Error al iniciar sesión'
        console.error('AuthStore.login:', msg)
        return false
      }
    },

    /** LOGOUT */
    async logout() {
      this.user = null
      this.token = null
      this.notificaciones = []
      this.cantidadNoLeidas = 0

      localStorage.removeItem('user')
      localStorage.removeItem('token')

      closeSseConnection()
      this.sseConnectionActive = false

      router.push('/login')
    },

    /** CHECK AUTH (usa /api/me) */
    async checkAuth() {
      if (this.token && !this.user) {
        try {
          const authService = new AuthService()
          const response = await authService.me()

          if ((response as any).user) {
            const apiUser = (response as any).user
            this.user = {
              id: apiUser.id,
              nombre: [apiUser.nombres, apiUser.apellidos].filter(Boolean).join(' ').trim(),
              email: apiUser.correo,
            }
            localStorage.setItem('user', JSON.stringify(this.user))

            await this.loadNotificationsFromApi()
            this.startSseConnection()

            if (
              router.currentRoute.value.path === '/login' ||
              router.currentRoute.value.path === '/register'
            ) {
              router.push('/dashboard')
            }
          } else {
            console.error('checkAuth: No se pudo obtener el usuario o token inválido.')
            this.logout()
          }
        } catch (error: unknown) {
          const msg =
            (error as any)?.response?.data?.message ??
            (error instanceof Error ? error.message : 'Error desconocido')
          console.error('checkAuth:', msg)
          this.logout()
        }
      } else if (this.token && this.user) {
        await this.loadNotificationsFromApi()
        this.startSseConnection()

        if (
          router.currentRoute.value.path === '/login' ||
          router.currentRoute.value.path === '/register'
        ) {
          router.push('/dashboard')
        }
      } else {
        console.log('checkAuth: No hay token en localStorage.')
      }
    },

    /** ==== NOTIFICACIONES ==== */
    handleNewSseNotification(notificationData: any) {
      console.log('AuthStore: Nueva notificación SSE:', notificationData)
      this.notificaciones.unshift({
        id: notificationData.id,
        titulo: notificationData.title,
        mensaje: notificationData.message,
        ticketId: notificationData.ticketId,
        leido: false,
      })
      this.cantidadNoLeidas++
    },

    startSseConnection() {
      if (!this.user?.id) {
        console.warn('AuthStore: No hay usuario para iniciar SSE.')
        return
      }
      if (this.sseConnectionActive) {
        console.log('AuthStore: SSE ya activa.')
        return
      }
      try {
        initializeSseConnection(this.user.id, this.handleNewSseNotification.bind(this))
        this.sseConnectionActive = true
      } catch (error) {
        console.error('AuthStore: Error SSE:', error)
        this.sseConnectionActive = false
      }
    },

    async loadNotificationsFromApi() {
      if (!this.user?.id || this.loadingNotifications) {
        console.warn('AuthStore: No se cargan notificaciones (sin usuario o ya cargando).')
        return
      }
      this.loadingNotifications = true
      try {
        const userId = this.user.id
        const fetched = await obtenerNotificaciones(userId)
        this.notificaciones = fetched
        this.cantidadNoLeidas = fetched.filter((n: Notification) => !n.leido).length
      } catch (err) {
        console.error('AuthStore: Error al cargar notificaciones:', err)
        this.notificaciones = []
        this.cantidadNoLeidas = 0
      } finally {
        this.loadingNotifications = false
      }
    },

    async markNotificationAsRead(notificationId: number) {
      try {
        await marcarComoLeida(notificationId)
        await this.loadNotificationsFromApi()
      } catch (error) {
        console.error('Error al marcar notificación como leída:', error)
      }
    },
  },
})
