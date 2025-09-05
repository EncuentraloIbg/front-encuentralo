<template>
  <v-container class="py-5">
    <v-card class="dashboard-card" outlined>
      <v-card-title class="text-h4 text-center py-6 dashboard-title">
        Bienvenid@, {{ authStore.user?.nombre || 'Usuario' }}!
      </v-card-title>

      <v-card-text>
        <p class="text-lg text-center mb-10 dashboard-subtitle">
          Este es un resumen general de tu actividad y las métricas clave del sistema.
        </p>

        <v-row class="mb-8">
          <v-col cols="12" md="4">
            <TarjetaMetrica
              titulo="Tickets Abiertos"
              :valor="metricas.ticketsAbiertos"
              subtitulo="Tickets pendientes"
            />
          </v-col>
          <v-col cols="12" md="4">
            <TarjetaMetrica
              titulo="Tickets Cerrados"
              :valor="metricas.ticketsCerradosMes"
              subtitulo="En los últimos 30 días"
            />
          </v-col>
          <v-col cols="12" md="4">
            <TarjetaMetrica
              titulo="Nuevos Usuarios"
              :valor="metricas.nuevosUsuarios"
              subtitulo="Este trimestre"
            />
          </v-col>
        </v-row>

        <v-row class="mb-8 justify-center">
          <v-col cols="12" md="8">
            <ListaActividad :items="actividadReciente" />
          </v-col>
        </v-row>
      </v-card-text>

      <v-overlay :model-value="cargando" class="align-center justify-center">
        <v-progress-circular color="primary" indeterminate size="64" />
      </v-overlay>

      <v-alert v-if="error" type="error" prominent class="mt-4">
        Hubo un error al cargar los datos del dashboard: {{ error }}
      </v-alert>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { authSetStore } from '@/stores/AuthStore'
import { useTablero } from '@/composables/useTablero'
import TarjetaMetrica from '@/components/Tablero/TarjetaMetrica.vue'
import ListaActividad from '@/components/Tablero/ListaActividad.vue'

const authStore = authSetStore()
const { metricas, actividadReciente, cargando, error, cargarDatosTablero } = useTablero()

onMounted(async () => {
  await authStore.checkAuth()
  await cargarDatosTablero()
})
</script>

<style scoped>
.dashboard-card{ max-width:1200px; margin:20px auto; border-radius:16px; border:1px solid #E0E0E0; }
.dashboard-title{ color:rgb(57,57,173); font-weight:900; background:#EBF5FB; border-bottom:2px solid #0A72ED; }
.dashboard-subtitle{ color:black; }
</style>
