<template>
  <v-navigation-drawer
    expand-on-hover
    rail
    app
    permanent
    color="#000000"
    class="drawer--dark"
    style="margin-top: 64px;"
  >
    <v-list>
      <v-list-item
        :prepend-avatar="avatarUrl"
        :subtitle="auth.user?.email"
        :title="auth.user?.nombre"
      />
    </v-list>

    <v-divider color="white" :opacity="0.2" />

    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
        :to="{ name: 'dashboard' }"
        link
      />

      <v-list-group prepend-icon="mdi-clipboard-text" title="Órdenes" no-action>
        <template #activator="{ props }">
          <v-list-item v-bind="props" title="Órdenes" />
        </template>

        <v-list-item
          prepend-icon="mdi-clipboard-plus"
          title="Crear"
          :to="{ name: 'ordenes-crear' }"
          link
        />

        <v-list-item
          prepend-icon="mdi-history"
          title="Historial"
          :to="{ name: 'historial-ordenes' }"
          link
        />
      </v-list-group>

      <v-list-item
        prepend-icon="mdi-cog"
        title="Configuración"
        :to="{ name: 'configuracion-empresa' }"
        link
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { authSetStore } from '@/stores/AuthStore'

const auth = authSetStore()

const API_ORIGIN = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3333')
  .toString()
  .replace(/\/$/, '')

const avatarUrl = computed(() => {
  const pic = auth.user?.profilePictureUrl
  let url: string

  if (typeof pic === 'string' && pic.length) {
    url = /^https?:\/\//i.test(pic)
      ? pic
      : `${API_ORIGIN}${pic.startsWith('/') ? '' : '/'}${pic}`
  } else {
    const seed = auth.user?.email || auth.user?.nombre || 'user'
    url = `https://i.pravatar.cc/160?u=${encodeURIComponent(seed)}`
  }

  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${auth.avatarStamp ?? ''}`
})
</script>

<style scoped>
/* Fondo negro + texto e íconos blancos */
.drawer--dark {
  background-color: #000 !important;
  color: #fff !important;
}

/* Fuerza el color blanco para títulos, subtítulos e íconos dentro del drawer */
.drawer--dark :deep(.v-list-item-title),
.drawer--dark :deep(.v-list-item-subtitle),
.drawer--dark :deep(.v-icon),
.drawer--dark :deep(.v-list-item__prepend .v-icon),
.drawer--dark :deep(.v-list-item__append .v-icon) {
  color: #fff !important;
}

/* Ítem activo/hover en gris oscuro para contraste */
.drawer--dark :deep(.v-list-item--active),
.drawer--dark :deep(.v-list-item:hover) {
  background-color: rgba(255, 255, 255, 0.06) !important;
}

.v-navigation-drawer {
  z-index: 1000;
}
</style>
