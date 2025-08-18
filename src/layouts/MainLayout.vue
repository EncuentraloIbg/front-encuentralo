<template>
  <v-app>
    <AppSidebar />

    <v-layout>
      <AppNavbar />
    </v-layout>

    <v-main class="pa-15" style="background: #fafafa;"> <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import AppNavbar from '@/components/AppNavbar.vue'
</script>

<style scoped>
/* No hay cambios en el estilo scoped, solo en el template */
</style>