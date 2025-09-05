<template>
  <v-app>
    <v-main class="hero">
      <v-container class="hero-inner text-center d-flex flex-column align-center justify-center">
        <div class="brand">
          <img :src="logoEncuentralo" alt="Encuéntralo" class="logo e1" />
          <span class="amp">&</span>
          <img :src="logoMundoSmartphone" alt="MundoSmartphone" class="logo e2" />
        </div>

        <h1 class="hero-title text-h1 font-weight-bold mb-2">
          Bienvenido a tu Centro de Control
        </h1>
        <p class="hero-subtitle text-h5 font-weight-medium mb-6">
          Lleva un control simple y confiable de tus equipos. Consulte su progreso, historial
          y estado en cualquier momento.
        </p>
        <v-btn color="primary" size="large" class="btn-shadow" variant="flat" @click="router.push('/login')">
          Iniciar sesión
        </v-btn>
      </v-container>
    </v-main>

    <!-- Beneficios -->
    <v-container class="my-16 feature-section">
      <h2 class="text-center text-h5 font-weight-bold mb-6">Beneficios clave</h2>
      <v-row justify="center" align="center" class="text-center">
        <v-col
          v-for="(feature, i) in features"
          :key="i"
          cols="12"
          md="4"
          class="feature-col"
          :style="{ '--i': i }"
        >
          <v-icon size="56" class="feature-icon">{{ feature.icon }}</v-icon>
          <h3 class="mt-3 text-h6 font-weight-bold feature-title">{{ feature.title }}</h3>
          <p class="feature-desc">{{ feature.desc }}</p>
        </v-col>
      </v-row>
    </v-container>

    <!-- Cómo funciona (horizontal en desktop) -->
    <v-container class="my-16 pasos-section">
      <h2 class="text-center text-h5 font-weight-bold mb-6">¿Cómo funciona?</h2>
      <v-row class="pasos-row" justify="center" align="stretch">
        <v-col v-for="(step, i) in steps" :key="i" cols="12" md="4" class="px-3">
          <v-card class="pa-6 paso-card elevation-6">
            <div class="paso-number">{{ i + 1 }}</div>
            <h3 class="text-subtitle-1 font-weight-bold mt-2">{{ step.title }}</h3>
            <p class="mt-2 text-body-2">{{ step.desc }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-footer color="grey-lighten-4" class="text-center py-6">
      <v-container>
        <div class="text-body-2">
          © 2025 Encuéntralo & MundoSmartphone. Todos los derechos reservados.
        </div>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import logoEncuentralo from '@/assets/Encuentralo.png'
import logoMundoSmartphone from '@/assets/Mundosmartphone.png'

const router = useRouter()

const features = [
  { icon: 'mdi-clipboard-plus', title: 'Ingreso Express', desc: 'Crea órdenes con datos del cliente, fotos y accesorios en segundos.' },
  { icon: 'mdi-image-multiple', title: 'Evidencias', desc: 'Adjunta imágenes del estado: recepción, diagnóstico y entrega.' },
  { icon: 'mdi-whatsapp', title: 'Avisos Automáticos', desc: 'Notifica por WhatsApp o email cambios de estado y aprobaciones.' },
  { icon: 'mdi-timeline-text', title: 'Trazabilidad', desc: 'Historial por IMEI/Serial: repuestos, tiempos y responsables.' },
  { icon: 'mdi-file-sign', title: 'Firma Digital', desc: 'Entrega con firma y aceptación de términos para mayor respaldo.' },
  { icon: 'mdi-shield-check', title: 'Control & Auditoría', desc: 'Roles, permisos y bitácora de cambios para ambas empresas.' },
]

const steps = [
  { title: 'Crear Orden', desc: 'Registra datos del equipo, cliente, fotos y accesorios.' },
  { title: 'Diagnóstico', desc: 'Define fallas, cotiza repuestos y solicita aprobación.' },
  { title: 'Entrega', desc: 'Pruebas, firma digital y comprobante; cierra con trazabilidad.' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

body { font-family: 'Inter', sans-serif; }
.v-application, .v-application__wrap { height: 100%; }

/* ===== HERO con degradado diagonal ===== */
.hero {
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  align-items: center;
  background: linear-gradient(to bottom, #ffffff 0%, #111111 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-inner {
  min-height: 100vh;
  min-height: 100svh;
}

/* Logos */
.brand {
  display: flex; align-items: center; justify-content: center;
  gap: 18px; margin-bottom: 10px;
}
.logo {
  height: clamp(96px, 12vw, 160px);
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
}
.logo.e1 { height: clamp(104px, 12.5vw, 180px); }
.logo.e2 { height: clamp(135px, 16vw, 240px); transform: translateY(2px); }

.amp {
  color: #fff;
  font-weight: 900;
  font-size: clamp(26px, 3.4vw, 38px);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

/* Títulos */
.hero-title {
  animation: fadeSlideDown 0.9s ease forwards;
  opacity: 0;
  font-size: clamp(2.4rem, 5vw, 4.2rem);
  font-weight: 900;
  letter-spacing: -0.5px;
  margin-top: 0.25rem;
  text-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
}
.hero-subtitle {
  animation: fadeSlideUp 1s ease 0.25s forwards;
  opacity: 0;
  font-size: clamp(1rem, 2.3vw, 1.3rem);
  max-width: 780px;
  margin: 16px 24px 24px;
  color: #eee;
}

/* Botón principal minimal */
.btn-shadow {
  background: #fff !important;
  color: #000 !important;
  font-weight: 600;
  transition: all 0.25s ease;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}
.btn-shadow:hover {
  background: #000 !important;
  color: #fff !important;
  box-shadow: 0 12px 20px rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
}

/* ===== Beneficios ===== */
.feature-col {
  margin-bottom: 2.2rem; 
  transition: transform .3s ease, opacity .3s ease;
  transform: translateY(30px); opacity: 0; 
  animation: fadeInUp 1s ease forwards;
  animation-delay: calc(var(--i) * .12s);
}
.feature-icon { color: #000; }
.feature-title { margin-top: 1rem; font-weight: 700; color: #000; }
.feature-desc { margin-top: .5rem; color: #333; font-size: 1rem; }

/* ===== Pasos ===== */
.pasos-row { gap: 0 !important; }
@media (min-width: 960px){ .pasos-row { flex-wrap: nowrap !important; } }
@media (max-width: 959.98px){ .pasos-row { flex-wrap: wrap !important; } }
.px-3{ padding-left: 12px !important; padding-right: 12px !important; }

.paso-card {
  width: 100%;
  border-radius:14px;
  background: linear-gradient(145deg, #fff, #f5f5f5);
  color:#000;
  position:relative;
  border:1px solid rgba(0,0,0,.15);
}
.paso-number {
  position:absolute; top:-18px; right:-12px; background:#000; color:#fff;
  height:36px; width:36px; border-radius:50%; 
  display:grid; place-items:center; font-weight:800;
  box-shadow:0 8px 18px rgba(0,0,0,.35);
}

/* Footer */
.v-footer { background:#111 !important; color:#bbb !important; }

/* Animaciones */
@keyframes fadeSlideDown { from{opacity:0; transform:translateY(-20px);} to{opacity:1; transform:translateY(0);} }
@keyframes fadeSlideUp { from{opacity:0; transform:translateY(20px);} to{opacity:1; transform:translateY(0);} }
@keyframes fadeInUp { to{opacity:1; transform:translateY(0);} }
</style>
