<template>
  <v-navigation-drawer
    expand-on-hover
    rail
    app
    permanent
    color="#90CAF9"
    style="margin-top: 64px;"
  >
    <v-list>
      <v-list-item
        :prepend-avatar="auth.user?.profilePictureUrl || 'https://i.pravatar.cc/160?img=3'"
        :subtitle="auth.user?.correo"
        :title="auth.user?.nombre"
      />
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
        :to="{ path: '/dashboard' }"
        link
      />

      <v-list-group
        prepend-icon="mdi-ticket"
        title="Tickets"
        no-action
      >
        <template #activator="{ props }">
          <v-list-item v-bind="props" title="Tickets" />
        </template>

        <v-list-item
          prepend-icon="mdi-ticket-confirmation"
          title="Crear"
          :to="{ path: '/tickets' }"
          link
        />
        <v-list-item
          prepend-icon="mdi-history"
          title="Historial"
          :to="{ path: '/historial-tickets' }"
          link
        />
      </v-list-group>

      <v-list-item
        prepend-icon="mdi-account-multiple"
        title="Usuarios"
        :to="{ path: '/Usuarios' }"
        link
      />
      <v-list-item
        prepend-icon="mdi-domain"
        title="Empresas"
        :to="{ path: '/formulario-empresas' }"
        link
      />
      <v-list-item
        prepend-icon="mdi-folder-multiple"
        title="Proyectos"
        :to="{ path: '/proyectos' }"
        link
      />
      <v-list-item
        prepend-icon="mdi-bell"
        title="Notificaciones"
        :to="{ path: '/Notificaciones' }"
        link
      />

      <v-list-group
        prepend-icon="mdi-cog"
        title="Configuración"
        no-action
      >
        <template #activator="{ props }">
          <v-list-item v-bind="props" title="Configuración" />
        </template>

        <v-list-item
          prepend-icon="mdi-account"
          title="Perfil"
          :to="{ path: '/profile' }"
          link
        />
        <v-list-item
          prepend-icon="mdi-account-cog"
          title="Roles"
          :to="{ path: '/roles-crud' }"
          link
        />
        <v-list-item
          prepend-icon="mdi-shield-account"
          title="Permisos"
          :to="{ path: '/permisos' }"
          link
        />
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { authSetStore } from '@/stores/AuthStore'
const auth = authSetStore()
</script>

<style scoped>
.v-navigation-drawer {
  color: white;
  z-index: 1000;
}
</style>