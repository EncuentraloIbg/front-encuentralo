<template>
  <v-container class="py-5">
    <v-card class="dashboard-card" outlined>
      <v-card-title class="text-h4 text-center py-6 dashboard-title">
        Bienvenid@, {{ authStore.user?.nombre || 'Usuario' }}!
      </v-card-title>

      <v-card-text>
        <p class="text-lg text-center mb-10 dashboard-subtitle">
          Resumen general de tus Órdenes de Entrada y métricas clave.
        </p>

        <!-- MÉTRICAS -->
        <v-row class="mb-8">
          <v-col cols="12" md="3">
            <TarjetaMetrica
              titulo="Órdenes Abiertas"
              :valor="metricas.ordenesAbiertas"
              subtitulo="En estado recibido"
            />
          </v-col>

          <v-col cols="12" md="3">
            <TarjetaMetrica
              titulo="Órdenes Cerradas"
              :valor="metricas.ordenesCerradasMes"
              subtitulo="Últimos 30 días"
            />
          </v-col>

          <v-col cols="12" md="3">
            <TarjetaMetrica
              titulo="Abiertas Hoy"
              :valor="metricas.ordenesHoyAbiertas"
              subtitulo="Ingresadas hoy"
            />
          </v-col>

          <v-col cols="12" md="3">
            <TarjetaMetrica
              titulo="Cerradas Hoy"
              :valor="metricas.ordenesHoyCerradas"
              subtitulo="Entregadas / canceladas / rechazadas"
            />
          </v-col>
        </v-row>

        <!-- ACTIVIDAD RECIENTE -->
        <v-row class="mb-8 justify-center">
          <v-col cols="12" md="8">
            <ListaActividad :items="actividadReciente" />
          </v-col>
        </v-row>
      </v-card-text>

      <!-- LOADING -->
      <v-overlay :model-value="cargando" class="align-center justify-center">
        <v-progress-circular color="grey-darken-1" indeterminate size="64" />
      </v-overlay>

      <!-- ERROR -->
      <v-alert v-if="error" type="error" prominent class="mt-4">
        Hubo un error al cargar los datos del tablero de órdenes: {{ error }}
      </v-alert>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { authSetStore } from '@/stores/AuthStore'
import { useDashboardOrdenes } from '@/composables/useDashboardOrdenes'
import TarjetaMetrica from '@/components/Tablero/TarjetaMetrica.vue'
import ListaActividad from '@/components/Tablero/ListaActividad.vue'

const authStore = authSetStore()
const { metricas, actividadReciente, cargando, error, cargarDatosTablero } = useDashboardOrdenes()

onMounted(async () => {
  await authStore.checkAuth()
  await cargarDatosTablero()
})
</script>

<style scoped>
/* === Paleta corporativa neutral === */
:root{
  --bg-surface: #ffffff;
  --bg-soft:    #f6f7f9;
  --ink-strong: #111827; /* gris casi negro */
  --ink:        #374151; /* texto principal */
  --ink-soft:   #6b7280; /* subtítulos */
  --stroke:     #e5e7eb; /* bordes */
  --stroke-strong:#d1d5db;
  --brand-muted:#eaecef; /* header suave */
}

/* Card principal */
.dashboard-card {
  max-width: 1200px;
  margin: 20px auto;
  border-radius: 16px;
  border: 1px solid var(--stroke);
  background: var(--bg-surface);
  box-shadow:
    0 1px 2px rgba(17,24,39,.04),
    0 8px 24px rgba(17,24,39,.06);
}

/* Título sin azules: banda superior gris y texto en negro corporativo */
.dashboard-title {
  color: var(--ink-strong);
  font-weight: 800;
  background: linear-gradient(180deg, var(--brand-muted), var(--bg-surface));
  border-bottom: 1px solid var(--stroke-strong);
}

/* Subtítulo en gris medio */
.dashboard-subtitle {
  color: var(--ink-soft);
  margin-top: 8px;
}

/* ====== Neutralizar azules dentro de las métricas (sin tocar el componente) ====== */
:deep(.v-card), :deep(.metric-card){
  /* sin primarios */
}
:deep(.text-primary){
  color: var(--ink-strong) !important;
}
:deep(.v-chip--selected), :deep(.bg-primary){
  background-color: var(--ink-strong) !important;
}

/* Paneles/listas internas en tonos grises */
:deep(.v-alert-title), :deep(.v-list-subheader), :deep(.v-list-item-title){
  color: var(--ink) !important;
}

/* Divisores más sutiles */
:deep(.v-divider){ opacity:.7; border-color: var(--stroke) !important; }

/* Tarjetas de actividad, si existen */
:deep(.activity-card){
  background: var(--bg-soft);
  border: 1px solid var(--stroke);
  border-radius: 12px;
}
</style>
