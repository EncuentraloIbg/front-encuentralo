<template>
  <v-card class="section-card" elevation="2">
    <v-card-title class="text-h5 section-title-blue">Actividad Reciente</v-card-title>
    <v-card-text>
      <v-list dense v-if="items.length">
        <v-list-item v-for="it in items" :key="it.id">
          <v-list-item-title>{{ it.evento }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ it.fecha }} - {{ it.asignadoA || 'N/A' }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <p v-else class="text-center text-grey">No hay actividad reciente.</p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { ActividadItem } from '@/composables/useDashboardOrdenes'
defineProps<{ items: ActividadItem[] }>()
</script>

<style scoped>
.section-card {
  background: #f6f7f9;                  /* gris suave */
  border-radius: 16px;
  padding: 30px;
  border: 1px solid #e5e7eb;            /* borde gris */
  overflow: hidden;
}
.section-title-blue {
  color: #111827;                       /* título gris oscuro */
  font-weight: 700;
  border-bottom: 2px solid #d1d5db;     /* subrayado gris */
  padding-bottom: 12px;
}
.text-grey {
  color: #6b7280;                       /* texto auxiliar gris medio */
  font-style: italic;
  padding: 25px;
}
</style>
