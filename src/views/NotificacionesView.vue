<template>
  <v-container>
    <v-card class="mt-4" elevation="2" color="#f8f8f8"> <v-card-title class="text-h6">Mis notificaciones</v-card-title>
      <v-divider></v-divider>
      <v-card-text class="notifications-card-text">
        <v-list class="pa-0 notifications-list">
          <v-list-item
            v-for="noti in notificaciones"
            :key="noti.id"
            @click="irADetalle(noti)"
            :class="[
              'rounded-lg',
              'ma-2',
              'cursor-pointer',
              'transition',
              noti.leido ? 'notification-item-read' : 'notification-item-unread',
              'hover:shadow-sm'
            ]"
          >
            <template #prepend>
              <v-icon
                :color="noti.titulo === 'Nuevo comentario' ? 'teal' : 'indigo'"
                size="24"
              >
                {{ noti.titulo === 'Nuevo comentario' ? 'mdi-comment-text' : 'mdi-alert-circle' }}
              </v-icon>
            </template>

            <template #title>
              <span class="font-weight-medium">{{ noti.titulo }}</span>
            </template>

            <template #subtitle>
              <span>{{ noti.mensaje }}</span>
            </template>

            <template #append>
              <v-icon
                :color="noti.leido ? 'grey' : 'primary'"
                size="20"
              >
                {{ noti.leido ? 'mdi-email-open' : 'mdi-email' }}
              </v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authSetStore } from '@/stores/AuthStore'
import { obtenerNotificaciones, marcarComoLeida } from '@/services/NotificacionService'

const router = useRouter()
const authStore = authSetStore()

interface Notificacion {
  id: number
  titulo: string
  mensaje: string
  leido: boolean
  ticketId: number
}

const notificaciones = ref<Notificacion[]>([])

async function cargarNotificaciones(usuarioId: number) {
  try {
    const data = await obtenerNotificaciones(usuarioId)
    notificaciones.value = data
  } catch (error) {
    console.error('❌ Error al cargar notificaciones:', error)
  }
}

async function irADetalle(noti: Notificacion) {
  try {
    if (!noti.leido) {
      await marcarComoLeida(noti.id)
    }
    router.push({ name: 'detalle-ticket', params: { id: noti.ticketId } })
  } catch (error) {
    console.error('❌ Error al redirigir al detalle:', error)
  }
}

onMounted(async () => {
  await authStore.checkAuth()
  const usuarioId = authStore.user?.id || Number(localStorage.getItem('usuarioId'))

  if (usuarioId) {
    await cargarNotificaciones(usuarioId)
  } else {
    console.warn('⚠ No se encontró usuarioId. No se cargaron notificaciones.')
  }
})
</script>

<style scoped>
/* Estilos para la tarjeta principal de notificaciones (la prop 'color' de Vuetify es más efectiva) */
.notifications-card {
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  /* Eliminamos background-color aquí, ya que lo maneja la prop 'color' */
}

/* El v-card-text suele tener un fondo blanco por defecto en Vuetify. Lo haremos transparente. */
.notifications-card-text {
  background-color: transparent !important;
  padding-bottom: 0 !important;
}

/* Estilos para la lista interna (que contiene los ítems de notificación) */
.notifications-list.v-list {
  background-color: transparent !important;
  padding: 0 !important;
}

/* Ajusta los colores de fondo de los ítems de notificación */
.notifications-list .v-list-item.notification-item-read {
  background-color: #e0e0e0 !important; /* Gris claro para notificaciones leídas */
  color: #555 !important;
  border: 1px solid #d0d0d0;
  margin: 8px !important;
}

.notifications-list .v-list-item.notification-item-unread {
  background-color: #fbfbfb !important; /* Blanco hueso para notificaciones no leídas */
  color: #333 !important;
  border: 1px solid #e5e5e5;
  margin: 8px !important;
}

/* Estilos generales para los ítems de lista */
.notifications-list .v-list-item {
  border-radius: 8px !important;
  transition: all 0.2s ease-in-out;
}

.notifications-list .v-list-item:last-child {
  margin-bottom: 0 !important;
}

/* Efecto hover */
.notifications-list .v-list-item.hover\:shadow-sm:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    transform: translateY(-2px);
}

/* Ajustes de tipografía */
.v-card-title {
  color: #333;
  font-weight: 600;
}

.v-list-item-title {
    font-weight: 500;
    font-size: 1rem;
}

.v-list-item-subtitle {
    font-size: 0.85rem;
    color: #666;
}
</style>