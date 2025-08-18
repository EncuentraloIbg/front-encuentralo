// src/services/notificacionService.ts

const BASE_URL = 'http://localhost:3333/api/notificaciones'
const SSE_URL = 'http://localhost:3333/api/notifications/stream' // <-- ¡Nueva URL para SSE!

let eventSource: EventSource | null = null // Para almacenar la instancia de EventSource
let currentUserId: number | null = null // Para el filtrado de notificaciones por usuario

let onNewNotificationCallback: ((notificationData: any) => void) | null = null

/**
 * Obtener las notificaciones de un usuario
 */
export async function obtenerNotificaciones(usuarioId: number) {
  const response = await fetch(`${BASE_URL}?usuarioId=${usuarioId}`)

  if (!response.ok) {
    throw new Error('Error al obtener notificaciones')
  }

  return await response.json()
}

/**
 * Marcar una notificación como leída
 */
export async function marcarComoLeida(id: number) {
  const response = await fetch(`${BASE_URL}/${id}/leida`, {
    method: 'PUT',
  })

  if (!response.ok) {
    throw new Error('Error al marcar notificación como leída')
  }

  return await response.json()
}

/**
 * Inicializa la conexión SSE para un usuario específico.
 * Solo se establece una conexión SSE a la vez.
 * @param userId El ID del usuario actual para filtrar notificaciones.
 * @param callback Función a llamar cuando se recibe una nueva notificación.
 */
export function initializeSseConnection(userId: number, callback: (notificationData: any) => void) {
  // Si ya hay una conexión abierta y activa para el mismo usuario, no hacer nada.
  if (eventSource && currentUserId === userId && eventSource.readyState === EventSource.OPEN) {
    console.log('NotificacionService: Conexión SSE ya establecida y abierta para el usuario:', userId)
    onNewNotificationCallback = callback // Asegurarse de que el callback esté actualizado
    return
  }

  // Si hay una conexión existente para un usuario diferente, o si está en estado CONNECTING/CLOSED,
  // la cerramos primero para asegurar una conexión limpia para el usuario actual.
  if (eventSource) {
    eventSource.close()
    console.log(`NotificacionService: Cerrando conexión SSE existente (anterior ID: ${currentUserId}, estado: ${eventSource.readyState}).`)
    eventSource = null // Limpiar la referencia para que se cree una nueva instancia
  }

  currentUserId = userId
  onNewNotificationCallback = callback

  console.log(`NotificacionService: Intentando abrir nueva conexión SSE para ${SSE_URL} para usuario ${userId}...`)
  eventSource = new EventSource(SSE_URL)

  eventSource.onopen = () => {
    console.log('NotificacionService: Conexión SSE abierta exitosamente.')
  }

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      console.log('NotificacionService: Evento SSE recibido:', data)

      // ¡FILTRADO CRÍTICO POR ID DE USUARIO!
      // Solo procesa la notificación si es para el usuario actual
      if (data.userId && data.userId === currentUserId) {
        console.log('NotificacionService: Notificación relevante recibida para el usuario:', currentUserId, data)
        // Llama al callback proporcionado por el componente Vue (AuthStore)
        if (onNewNotificationCallback) {
          onNewNotificationCallback(data)
        }
      } else {
        console.log('NotificacionService: Notificación ignorada (no es para este usuario o falta userId):', data)
      }
    } catch (e) {
      console.error('NotificacionService: ERROR al parsear el evento SSE:', e, 'Datos del evento:', event.data)
    }
  }

  eventSource.onerror = (error) => {
    console.error('NotificacionService: Error en la conexión SSE:', error)
    // No llames a close() ni intentes reconectar manualmente aquí.
    // EventSource tiene un mecanismo de reconexión automática incorporado.
    // Si el error es fatal o quieres controlarlo, puedes cerrar y manejar el reintento desde el AuthStore.
    // Por ahora, solo registramos el error.
  }
}

/**
 * Cierra la conexión SSE.
 * Debería llamarse cuando el usuario se desloguea o el componente que la usa se desmonta.
 */
export function closeSseConnection() {
  if (eventSource) {
    eventSource.close()
    eventSource = null
    currentUserId = null
    onNewNotificationCallback = null
    console.log('NotificacionService: Conexión SSE cerrada explícitamente.')
  }
}