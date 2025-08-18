<template>
  <div class="auth-layout">
    <div class="background"></div>

    <HeaderButtons />
    <LogoHeader logoSrc="/public/logo.png" pageName="LINEX" />

    <div class="auth-content">
      <router-view />
      <!-- Aquí se insertarán las vistas dinámicamente -->
    </div>

    <footer class="footer">
      <p>© 2025 Mi Aplicación. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import HeaderButtons from '@/components/HeaderButtons.vue'
import LogoHeader from '@/components/LogoHeader.vue'
</script>

<style scoped>
.background {
  position: absolute;
  width: 100%;
  height: 100%;
  background: url('/public/fondo.jpeg') no-repeat center center/cover;
  filter: brightness(0.6);
  z-index: -1;
}
.auth-layout {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100vw;
  height: 100vh;
  position: relative;
}

.auth-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.footer {
  position: absolute;
  bottom: 20px;
  text-align: center;
  color: white;
  font-size: 14px;
}
</style>
