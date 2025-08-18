import router from '@/router'
import AuthService from '@/services/AuthService'
import { defineStore } from 'pinia'
import { obtenerNotificaciones, marcarComoLeida, initializeSseConnection, closeSseConnection } from '@/services/NotificacionService'

interface User {
  id: number;
  nombre: string;
  email: string;
  // Agrega aquí cualquier otra propiedad relevante de tu objeto de usuario
}

interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  ticketId: number;
  leido: boolean;
  // Agrega aquí cualquier otra propiedad relevante de tu objeto de notificación
}

export const authSetStore = defineStore('auth', {
  state: () => {
    let user: User | null = null;
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        user = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error al parsear el usuario desde localStorage:', error);
    }

    return {
      user,
      token: localStorage.getItem('token') || null,
      notificaciones: [] as Notification[],
      cantidadNoLeidas: 0,
      loadingNotifications: false,
      sseConnectionActive: false, // <-- ¡NUEVO ESTADO: Bandera para controlar la SSE!
    };
  },

  actions: {
    async login(userData: { email: string; password: string }): Promise<boolean> {
      const auth = new AuthService();
      const login = await auth.login(userData.email, userData.password);

      if (login.errors?.[0]) {
        alert(login.errors[0].message);
        return false;
      } else {
        const token = login.token;
        this.token = token;
        this.user = login.user;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(login.user));

        // 1. Carga las notificaciones iniciales (sin iniciar SSE aquí)
        await this.loadNotificationsFromApi(); // <-- Cambiado el nombre de la acción
        // 2. Inicia la conexión SSE (solo si no está ya activa)
        this.startSseConnection();

        router.push('/dashboard');
        return true;
      }
    },

    async logout() {
      this.user = null;
      this.token = null;
      this.notificaciones = [];
      this.cantidadNoLeidas = 0;

      localStorage.removeItem('user');
      localStorage.removeItem('token');

      closeSseConnection(); // Cierra la conexión SSE en el servicio
      this.sseConnectionActive = false; // <-- Resetea la bandera
      console.log('AuthStore: Conexión SSE cerrada al cerrar sesión.');

      router.push('/login');
    },

    async checkAuth() {
      if (this.token && !this.user) {
        try {
          const authService = new AuthService();
          const response = await authService.me();

          if (response.user) {
            this.user = response.user;
            localStorage.setItem('user', JSON.stringify(response.user));
            console.log('checkAuth: Usuario cargado desde API:', this.user);

            // 1. Carga las notificaciones iniciales
            await this.loadNotificationsFromApi(); // <-- Cambiado el nombre
            // 2. Inicia la conexión SSE (solo si no está ya activa)
            this.startSseConnection();

            if (
              router.currentRoute.value.path === '/login' ||
              router.currentRoute.value.path === '/register'
            ) {
              router.push('/dashboard');
            }
          } else {
            console.error('checkAuth: No se pudo obtener la información del usuario o token inválido.');
            this.logout();
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(
              'checkAuth: Error al verificar autenticación:',
              (error as { response?: { data?: { message?: string } } })?.response?.data?.message || error.message
            );
          } else {
            console.error('checkAuth: Error desconocido:', error);
          }
          this.logout();
        }
      } else if (this.token && this.user) {
        console.log('checkAuth: Usuario ya cargado en el store y token presente.');
        // 1. Carga las notificaciones iniciales
        await this.loadNotificationsFromApi(); // <-- Cambiado el nombre
        // 2. Inicia la conexión SSE (solo si no está ya activa)
        this.startSseConnection();
        
        if (
          router.currentRoute.value.path === '/login' ||
          router.currentRoute.value.path === '/register'
        ) {
          router.push('/dashboard');
        }
      } else {
        console.log('checkAuth: No hay token en localStorage, no se verifica autenticación.');
      }
    },

    // --- LÓGICA DE NOTIFICACIONES ---

    // Este callback será llamado por NotificacionService cuando llegue una nueva notificación SSE.
    handleNewSseNotification(notificationData: any) {
      console.log('AuthStore: Nueva notificación SSE recibida (para este usuario):', notificationData);

      // 1. Añade la nueva notificación al principio de la lista existente
      this.notificaciones.unshift({
        id: notificationData.id, // Debe venir del SSE. Ya corrigimos esto en el backend.
        titulo: notificationData.title,
        mensaje: notificationData.message,
        ticketId: notificationData.ticketId,
        leido: false, // Las notificaciones SSE son nuevas, por lo tanto no leídas
        // Si necesitas otras propiedades del SSE, añádelas aquí (ej. estadoId)
        estadoId: notificationData.statusId,
      });

      // 2. Incrementa el contador de notificaciones no leídas
      this.cantidadNoLeidas++;

      // ¡IMPORTANTE! Ya NO LLAMAMOS a loadNotificationsFromApi() aquí.
      // Si la llamaras, reiniciarías la conexión SSE, que es lo que queremos evitar.
      // La lista y el contador se actualizan directamente con las líneas de arriba.
      // Solo recargaremos de la API al marcar como leída o al inicio/revisión de sesión.
    },

    // Nueva acción para INICIAR la conexión SSE de forma controlada
    startSseConnection() {
      if (!this.user?.id) {
        console.warn('AuthStore: No hay usuario para iniciar la conexión SSE.');
        return;
      }
      if (this.sseConnectionActive) {
        console.log('AuthStore: Conexión SSE ya activa para el usuario. No se reinicia.');
        return;
      }

      console.log('AuthStore: Intentando iniciar conexión SSE para usuario ID:', this.user.id);
      try {
        // Inicializa la conexión SSE y pasa el callback
        initializeSseConnection(this.user.id, this.handleNewSseNotification.bind(this));
        this.sseConnectionActive = true; // Marca la bandera como activa
        console.log('AuthStore: Conexión SSE iniciada y activa.');
      } catch (error) {
        console.error('AuthStore: Error al iniciar conexión SSE:', error);
        this.sseConnectionActive = false; // Si hay un error, asegura que la bandera esté en falso
      }
    },

    // Acción para CARGAR las notificaciones desde la API (NO para iniciar SSE)
    async loadNotificationsFromApi() { // <-- Nombre de acción cambiado para mayor claridad
      if (!this.user?.id || this.loadingNotifications) {
        console.warn('AuthStore: No se cargan notificaciones (sin usuario o ya cargando).');
        return;
      }
      this.loadingNotifications = true; // Activa la bandera de carga

      try {
        const userId = this.user.id;
        const fetchedNotifications = await obtenerNotificaciones(userId);
        this.notificaciones = fetchedNotifications;
        this.cantidadNoLeidas = fetchedNotifications.filter((n: Notification) => !n.leido).length;
        console.log(`AuthStore: Notificaciones cargadas desde API para el usuario ${userId}. No leídas: ${this.cantidadNoLeidas}`);
      } catch (err) {
        console.error('AuthStore: Error al cargar notificaciones desde la API:', err);
        this.notificaciones = [];
        this.cantidadNoLeidas = 0;
      } finally {
        this.loadingNotifications = false; // Desactiva la bandera de carga
      }
    },

    // Marca una notificación como leída y luego recarga la lista desde la API
    async markNotificationAsRead(notificationId: number) {
      try {
        await marcarComoLeida(notificationId);
        console.log(`AuthStore: Notificación ${notificationId} marcada como leída.`);
        // Recarga las notificaciones desde la API para asegurar que el estado y el contador
        // se actualicen con el estado persistido en la base de datos.
        await this.loadNotificationsFromApi(); // <-- Llama a la acción que solo carga desde API
      } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
      }
    },
  },
});