<template>
  <div ref="el"></div>
  <div ref="ella"></div>
  <div class="logo-header">
    <h1 class="page-name">{{ pageName }}</h1>
    <img :src="logoSrc" alt="Logo" class="logo" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const el = ref()
const ella = ref()

defineProps({
  logoSrc: {
    type: String,
    required: true,
  },
  pageName: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.logo-header {
  position: absolute;
  top: 8px;
  left: 45px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  width: 90px; /* Ajusta el tamaño del logo */
  height: auto;
}

.page-name {
  font-size: 45px;
  font-weight: bold;
  color: white; /* Ajusta el color según el diseño */
}
</style>
