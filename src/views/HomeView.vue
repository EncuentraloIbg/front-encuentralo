<template>
  <v-app>
    <v-main class="hero">
      <div class="hero-header">
        <img src="/logo.png" alt="Logo" class="logo" />
        </div>

      <v-container
        class="text-center fill-height d-flex flex-column justify-center align-center pt-12"
      >
        <h1 class="hero-title text-h1 font-weight-bold mb-2">Linex</h1>
        <p class="hero-subtitle text-h5 font-weight-medium mb-2">
          Bienvenido a tu espacio de soporte
        </p>
        <p class="text-body-1 mb-6" style="max-width: 600px;">
          Tu tranquilidad es nuestra prioridad. Estamos aquí para brindarte asistencia confiable, rápida y personalizada.
        </p>
        <v-btn
          color="primary"
          size="large"
          class="btn-shadow"
          variant="flat"
          @click="router.push('/login')"
        >
          Iniciar sesión
        </v-btn>
      </v-container>
    </v-main>

    <v-container class="my-16 feature-section"> <v-row justify="center" align="center" class="text-center">
        <v-col
          cols="12"
          md="4"
          class="feature-col"
          v-for="(feature, i) in features"
          :key="i"
          :style="{ '--i': i }"
        >
          <v-icon size="56" color="primary" class="feature-icon">
            {{ feature.icon }}
          </v-icon>
          <h3 class="mt-3 text-h6 font-weight-bold feature-title">{{ feature.title }}</h3>
          <p class="feature-desc">{{ feature.desc }}</p>
        </v-col>
      </v-row>
    </v-container>

    <v-container class="my-16 testimonial-section"> <h2 class="text-center text-h5 font-weight-bold mb-6">Lo que dicen nuestros usuarios</h2>
      <v-row justify="center" align="stretch" class="testimonials-row">
        <v-col cols="12" md="4" v-for="(testimony, i) in testimonials" :key="i">
          <v-card class="pa-6 testimonial-card elevation-8"> <p class="testimonial-text">"{{ testimony.text }}"</p>
            <p class="text-subtitle-2 font-weight-medium mt-5 testimonial-author">— {{ testimony.author }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-footer color="grey-lighten-4" class="text-center py-6"> <v-container>
        <div class="d-flex justify-center flex-wrap mb-4 footer-links">
          <v-btn variant="text" size="small" class="mx-3 footer-link">Contacto</v-btn>
          <v-btn variant="text" size="small" class="mx-3 footer-link">Términos</v-btn>
          <v-btn variant="text" size="small" class="mx-3 footer-link">Privacidad</v-btn>
        </div>
        <div class="text-body-2">
          © 2025 Linex. Todos los derechos reservados.
        </div>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue' // 'computed' ya no es estrictamente necesario para el modo oscuro, pero se puede mantener si se usa para otras cosas
import { useRouter } from 'vue-router'
// import { useTheme } from 'vuetify' // Eliminada la importación de useTheme

const router = useRouter()

const features: Array<{ icon: string; title: string; desc: string }> = [
  {
    icon: 'mdi-ticket',
    title: 'Gestión de Tickets',
    desc: 'Recibe, asigna y responde solicitudes de soporte con rapidez.',
  },
  {
    icon: 'mdi-bell-ring',
    title: 'Notificaciones Instantáneas',
    desc: 'Mantente al tanto de los cambios y responde sin perder tiempo.',
  },
  {
    icon: 'mdi-account-group',
    title: 'Soporte Colaborativo',
    desc: 'Trabaja con tu equipo para resolver incidencias de forma conjunta.',
  },
]

const testimonials = [
  {
    text: 'Desde que usamos Linex, resolvemos tickets en la mitad del tiempo. ¡Recomendado!',
    author: 'Ana R., Soporte TI',
  },
  {
    text: 'Muy intuitivo y rápido. El equipo de soporte también es excelente.',
    author: 'Carlos M., Cliente final',
  },
]

// Eliminada la lógica del tema oscuro
// const theme = useTheme()
// const toggleDarkMode = () => {
//   theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
// }
// const isDark = computed(() => theme.global.current.value.dark)

// Si usas Vuetify 3, asegúrate de configurar el tema global 'light' en tu `main.ts` o donde inicialices Vuetify.
// Por ejemplo, en `main.ts`:
/*
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light', // <--- Asegura que el tema por defecto sea 'light'
    themes: {
      light: {
        colors: {
          primary: '#1867C0', // Tus colores primarios para el tema claro
          secondary: '#5CBBF6',
          // etc.
        },
      },
      // No defines el tema 'dark' si no lo vas a usar
    },
  },
})

createApp(App)
  .use(router)
  .use(vuetify)
  .mount('#app')
*/
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
}

.v-application,
.v-application__wrap {
  height: 100%;
}

.hero {
  background:
    linear-gradient(135deg, rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.4)),
    url('/soporte.jpg') center/cover no-repeat;
  color: white;
  min-height: 90vh;
  user-select: none;
  background-attachment: fixed;
}

.hero-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  z-index: 2;
}

.logo {
  width: 100px;
  height: auto;
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.45));
}

.hero-title {
  animation: fadeSlideDown 1s ease forwards;
  opacity: 0;
  font-size: 4.5rem;
  font-weight: 900;
  letter-spacing: -1px;
  margin-top: -100px;
}

.hero-subtitle {
  animation: fadeSlideUp 1s ease 0.3s forwards;
  opacity: 0;
  font-size: 1.5rem;
  margin: 30px;
}

.btn-shadow {
  transition: all 0.25s ease;
  box-shadow: 0 8px 16px rgba(0, 88, 184, 0.5);
}
.btn-shadow:hover {
  box-shadow: 0 14px 26px rgba(0, 88, 184, 0.7);
  transform: translateY(-3px);
}

/* Características */
.feature-section {
  transition: background-color 0.3s ease, color 0.3s ease;
  /* Eliminada la regla .feature-section.dark */
}

.feature-col {
  margin-bottom: 3rem;
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: translateY(30px);
  opacity: 0;
  animation: fadeInUp 1s ease forwards;
  animation-delay: calc(var(--i) * 0.2s);
}
.feature-icon {
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.3));
}
.feature-title {
  margin-top: 1rem;
  font-weight: 700;
  color: #0d47a1; /* Color fijo para tema claro */
}
/* Eliminada la regla .feature-section.dark .feature-title */
.feature-desc {
  margin-top: 0.5rem;
  color: #333; /* Color fijo para tema claro */
  font-size: 1rem;
}
/* Eliminada la regla .feature-section.dark .feature-desc */

/* Testimonios */
.testimonial-section {
  transition: background-color 0.3s ease;
  /* Eliminada la regla .testimonial-section.dark */
}
.testimonials-row {
  gap: 24px;
}
.testimonial-card {
  border-radius: 12px;
  background: linear-gradient(145deg, #e3f2fd, #bbdefb); /* Fondo fijo para tema claro */
  color: #0d47a1; /* Color de texto fijo para tema claro */
  transition: box-shadow 0.3s ease;
}
/* Eliminada la regla .testimonial-card.dark */
.testimonial-card:hover {
  box-shadow: 0 16px 30px rgba(33, 150, 243, 0.4);
}
.testimonial-text {
  font-style: italic;
  font-size: 1.05rem;
  line-height: 1.6;
}
.testimonial-author {
  font-weight: 600;
  text-align: right;
  margin-top: 1.5rem;
  color: #0b3d91; /* Color fijo para tema claro */
}
/* Eliminada la regla .testimonial-section.dark .testimonial-author */

/* Footer */
.v-footer { /* Eliminada la clase .dark y su color condicional */
  background-color: #f5f5f5 !important; /* Un gris muy claro para el footer si no es dark */
  color: #333 !important; /* Color de texto para el footer */
}
/* Eliminada la regla .v-footer.dark */
.footer-links .footer-link {
  color: #1565c0 !important;
  transition: color 0.3s ease;
}
.footer-links .footer-link:hover {
  color: #0d47a1 !important;
  text-decoration: underline;
}

/* Animaciones */
@keyframes fadeSlideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>