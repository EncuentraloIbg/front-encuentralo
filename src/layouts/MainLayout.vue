<template>
  <v-app>
    <AppSidebar />
    <v-layout>
      <AppNavbar />
    </v-layout>

    <!-- 👇 Fondo con textura suave -->
    <v-main class="app-bg">
      <v-container class="py-8" fluid>
        <v-row justify="center">
          <v-col cols="12" md="11" lg="10" xl="9">
            <!-- 👇 Tarjeta contenedora para que el blanco "flote" sobre el fondo -->
            <v-sheet class="content-card" rounded="xl" elevation="1">
              <router-view />
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import AppNavbar from '@/components/AppNavbar.vue'
</script>

<style scoped>
/* Fondo gris con ligera textura para que no sea plano frente al navbar/sidebar negro */
.app-bg {
  /* base */
  background: #f4f6f8;
  /* trama muy sutil en modo “dots” */
  background-image:
    radial-gradient(#e9ecef 1px, transparent 1px),
    radial-gradient(#edf1f5 1px, transparent 1px);
  background-position: 0 0, 12px 12px;
  background-size: 24px 24px;
  min-height: 100vh;
}

/* Contenedor del contenido (tu formulario va adentro sin tocarlo) */
.content-card {
  background: #fff;
  border: 1px solid rgba(16, 24, 40, 0.06);
  box-shadow:
    0 1px 2px rgba(16, 24, 40, 0.04),
    0 8px 24px rgba(16, 24, 40, 0.06);
  padding: 24px; /* respira */
}

/* Opcional: titulares más “fuertes” para secciones largas */
:deep(h3.text-subtitle-1) {
  color: #1f2937;            /* gris oscuro */
  font-weight: 700;
}
:deep(.v-divider) {
  opacity: .6;
}
</style>
