<template>
  <v-card class="metric-card" elevation="2">
    <v-card-title class="metric-title">
      {{ titulo }}
    </v-card-title>
    <v-card-text class="metric-value">
      {{ valor }}
    </v-card-text>
    <v-card-subtitle v-if="subtitulo" class="metric-subtitle">
      {{ subtitulo }}
    </v-card-subtitle>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  titulo: string
  valor: number | string
  subtitulo?: string
}>()
</script>

<style scoped>
.metric-card {
  background: #f8f9fb;                 /* gris casi blanco */
  border-radius: 12px;
  padding: 30px;
  border: 1px solid #e5e7eb;           /* borde gris */
  text-align: center;
}
.metric-title {
  color: #374151;                       /* gris texto principal */
  font-weight: 700;
  text-align: center;
}
.metric-value {
  color: #111827;                       /* gris muy oscuro */
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin: 10px 0;
}
.metric-subtitle {
  color: #6b7280;                       /* gris medio */
  font-weight: 600;
  text-align: center;
}
</style>
