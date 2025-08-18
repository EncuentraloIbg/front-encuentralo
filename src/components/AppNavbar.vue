<template>
  <v-toolbar
    color="#2962FF"
    dark
    app
    elevation="2"
  >
    <v-btn icon="mdi-menu" class="d-none"></v-btn>

    <v-toolbar-title>
      Bienvenido, {{ authStore.user?.nombre || 'Usuario' }}
    </v-toolbar-title>

    <v-spacer></v-spacer>

      <v-menu location="bottom end" offset-y>
      <template #activator="{ props }">
        <v-badge
          :content="authStore.cantidadNoLeidas"  color="red"
          v-bind="props"
          overlap
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </template>

      <v-list>
        <v-list-item
          v-for="noti in authStore.notificaciones"  :key="noti.id"
          @click="irADetalle(noti)"
        >
          <v-list-item-title>{{ noti.titulo }}</v-list-item-title>
          <v-list-item-subtitle>{{ noti.mensaje }}</v-list-item-subtitle>
        </v-list-item>
        <v-divider class="my-1" />

        <v-list-item @click="router.push({ name: 'Notificaciones' })">
          <v-list-item-title class="text-primary">
            Ver todas las notificaciones
          </v-list-item-title>
           </v-list-item>
      </v-list>
       </v-menu>
    <v-btn icon="mdi-export" @click="handleLogout"></v-btn>
  </v-toolbar>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'; // Ya no necesitas `ref` aquí para las notificaciones
import { authSetStore } from '@/stores/AuthStore'; // Importa tu store
import { useRouter } from 'vue-router';
// Ya no necesitas importar obtenerNotificaciones ni marcarComoLeida aquí,
// porque el AuthStore ahora maneja esa lógica internamente.
// import { obtenerNotificaciones, marcarComoLeida } from '@/services/NotificacionService'

const authStore = authSetStore();
const router = useRouter();

// ⭐⭐⭐ SE ELIMINAN LAS REFS LOCALES PARA NOTIFICACIONES Y CANTIDADNOLEIDAS ⭐⭐⭐
// const notificaciones = ref<any[]>([])
// const cantidadNoLeidas = ref(0)


// ⭐⭐⭐ ESTA FUNCIÓN YA NO ES NECESARIA AQUÍ ⭐⭐⭐
// La lógica de carga de notificaciones ahora reside en el AuthStore
// async function cargarNotificaciones() {
//   try {
//     if (!authStore.user?.id) {
//       console.warn('Usuario ID no disponible para cargar notificaciones.');
//       return;
//     }
//     const userId = authStore.user.id;
//     const data = await obtenerNotificaciones(userId);
//     notificaciones.value = data;
//     cantidadNoLeidas.value = data.filter((n: any) => !n.leido).length;
//   } catch (err) {
//     console.error('Error al cargar notificaciones', err);
//   }
// }

async function irADetalle(noti: any) {
  // Llama a la nueva acción del store para marcar como leída y que el store se encargue de recargar
  await authStore.markNotificationAsRead(noti.id);
  // Redirigir al detalle del ticket
  router.push({ name: 'detalle-ticket', params: { id: String(noti.ticketId)}});
}

// Consolidamos la lógica de montaje en un solo onMounted
onMounted(async () => {
  // `checkAuth` en el AuthStore ahora se encarga de:
  // 1. Verificar/cargar la información del usuario.
  // 2. Una vez el usuario está cargado, llama a `loadUserNotifications` para obtenerlas.
  await authStore.checkAuth();
});

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};
</script>

<style scoped>
.v-toolbar {
  position: fixed;
  width: 100%; /* Asegura que la barra ocupe todo el ancho si es fija */
  z-index: 1000; /* Asegura que esté por encima de otros elementos */
}

/* Considera si necesitas esta clase o si Vuetify ya posiciona bien los ítems */
/* .v-toolbar-items {
  position: fixed;
  right: 0;
} */
</style>