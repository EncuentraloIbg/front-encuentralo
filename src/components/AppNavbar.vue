<template>
  <v-toolbar
    color="#000000"
    app
    elevation="2"
    class="toolbar--dark"
  >
    <v-btn icon="mdi-menu" class="d-none"></v-btn>

    <v-toolbar-title>
      Bienvenido, {{ authStore.user?.nombre || 'Usuario' }}
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <!-- Botón que abre el diálogo -->
    <v-btn icon="mdi-export" @click="confirmOpen = true"></v-btn>
  </v-toolbar>

  <!-- Diálogo de confirmación -->
  <v-dialog v-model="confirmOpen" max-width="420" persistent>
    <v-card>
      <v-card-title class="text-h6">¿Cerrar sesión?</v-card-title>
      <v-card-text>
        Se cerrará tu sesión actual. Tendrás que iniciar sesión nuevamente para continuar.
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="onCancel" :disabled="loggingOut">Cancelar</v-btn>
        <v-btn color="primary" @click="onConfirm" :loading="loggingOut">
          Cerrar sesión
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authSetStore } from '@/stores/AuthStore'
import { useRouter } from 'vue-router'

const authStore = authSetStore()
const router = useRouter()

const confirmOpen = ref(false)
const loggingOut = ref(false)

onMounted(async () => {
  await authStore.checkAuth()
})

const onCancel = () => {
  confirmOpen.value = false
}

const onConfirm = async () => {
  try {
    loggingOut.value = true
    await authStore.logout()
    confirmOpen.value = false
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  } finally {
    loggingOut.value = false
  }
}
</script>

<style scoped>
.v-toolbar {
  position: fixed;
  width: 100%;
  z-index: 1000;
}

/* Tema oscuro del navbar */
.toolbar--dark {
  background-color: #000 !important;
  color: #fff !important;
}

/* Fuerza texto e íconos en blanco */
.toolbar--dark :deep(.v-toolbar-title),
.toolbar--dark :deep(.v-icon),
.toolbar--dark :deep(.v-btn .v-icon),
.toolbar--dark :deep(.v-btn),
.toolbar--dark :deep(.v-btn--icon) {
  color: #fff !important;
}
</style>
