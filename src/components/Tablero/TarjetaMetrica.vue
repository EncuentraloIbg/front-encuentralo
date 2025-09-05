<template>
  <v-card class="metric-card" elevation="2">
    <v-card-title class="text-h6 metric-title">{{ titulo }}</v-card-title>
    <v-card-text class="text-center text-5xl font-bold metric-value">
      {{ valor }}
    </v-card-text>
    <v-card-subtitle v-if="subtitulo" class="text-center metric-subtitle">
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
.metric-card{ background:#F0F8FF; border-radius:12px; padding:30px; border:1px solid #CDE0F5; }
.metric-title{ color:#004D99; font-weight:700; }
.metric-value{ color:#3636DF; }
.metric-subtitle{ color:#000; font-weight:700; }
</style>
