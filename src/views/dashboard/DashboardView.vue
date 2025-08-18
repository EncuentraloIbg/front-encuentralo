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
            <v-card class="metric-card" elevation="2">
              <v-card-title class="text-h6 metric-title">Tickets Abiertos</v-card-title>
              <v-card-text class="text-center text-5xl font-bold metric-value">
                {{ metrics.ticketsAbiertos }}
              </v-card-text>
              <v-card-subtitle class="text-center metric-subtitle">Tickets pendientes</v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="metric-card" elevation="2">
              <v-card-title class="text-h6 metric-title">Tickets Cerrados</v-card-title>
              <v-card-text class="text-center text-5xl font-bold metric-value">
                {{ metrics.ticketsCerradosMes }}
              </v-card-text>
              <v-card-subtitle class="text-center metric-subtitle">En los últimos 30 días</v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="metric-card" elevation="2">
              <v-card-title class="text-h6 metric-title">Nuevos Usuarios</v-card-title>
              <v-card-text class="text-center text-5xl font-bold metric-value">
                {{ metrics.nuevosUsuarios }}
              </v-card-text>
              <v-card-subtitle class="text-center metric-subtitle">Este trimestre</v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-8 justify-center">
          <v-col cols="12" md="8">
            <v-card class="section-card" elevation="2">
              <v-card-title class="text-h5 section-title-blue">Actividad Reciente</v-card-title>
              <v-card-text>
                <v-list dense v-if="actividadReciente.length">
                  <v-list-item v-for="item in actividadReciente" :key="item.id">
                    <v-list-item-title>{{ item.evento }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.fecha }} - {{ item.asignadoA || 'N/A' }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <p v-else class="text-center text-grey">No hay actividad reciente.</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

      </v-card-text>
      <v-overlay :model-value="loading" class="align-center justify-center">
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
        ></v-progress-circular>
      </v-overlay>
      <v-alert
        v-if="error"
        type="error"
        prominent
        class="mt-4"
      >
        Hubo un error al cargar los datos del dashboard: {{ error }}
      </v-alert>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { authSetStore } from '@/stores/AuthStore';

// Define la URL base de tu API de AdonisJS
const API_BASE_URL = 'http://localhost:3333/api';

const authStore = authSetStore();

// Variables reactivas para almacenar los datos del dashboard
const metrics = ref({
  ticketsAbiertos: 0,
  ticketsCerradosMes: 0,
  nuevosUsuarios: 0,
});
const actividadReciente = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const fetchDashboardData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const token = authStore.token;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} - ${errorData.message || 'Error en la respuesta del servidor'}`);
    }

    const data = await response.json();

    if (data) {
      metrics.value = data.metrics;
      actividadReciente.value = data.actividadReciente;
    }
  } catch (err: any) {
    console.error('Error fetching dashboard data:', err);
    error.value = `Error al cargar datos: ${err.message || 'Ocurrió un error desconocido'}`;
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await authStore.checkAuth();
  await fetchDashboardData();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* Colores Base Definidos */
:root {
  --color-primary-blue: #0A72ED;
  --color-dark-blue: #004D99;
  --color-light-blue: #EBF5FB;
  --color-grey-dark: #333333;
  --color-white: #FFFFFF;
  --color-metric-bg: #F0F8FF;
  --color-section-bg: #F8F8F8;
}

/* Estilos para el contenedor principal de la tarjeta del dashboard */
.dashboard-card {
  max-width: 1200px;
  margin: 20px auto;
  background-color: var(--color-white);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #E0E0E0;
}

.dashboard-title {
  color: rgb(57, 57, 173);
  font-family: 'Inter', sans-serif;
  font-weight: 900;
  font-size: 2.8rem !important;
  background-color: var(--color-light-blue);
  padding: 30px 0 !important;
  border-bottom: 2px solid var(--color-primary-blue);
  letter-spacing: -0.5px;
}

.dashboard-subtitle {
  color:black;
  font-family: 'Inter', sans-serif;
  font-size: 1.3rem !important;
  margin-top: 20px;
  line-height: 1.6;
  padding: 0 20px;
}

/* Estilos para las tarjetas de métricas */
.metric-card {
  background-color: var(--color-metric-bg);
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #CDE0F5;
}

.metric-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(70, 3, 255, 0.18);
}

.metric-title {
  color: var(--color-dark-blue);
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 1.45rem !important;
  margin-bottom: 15px;
}

.metric-value {
  color:rgb(54, 54, 223);
  font-family: 'Inter', sans-serif;
  font-weight: 900;
  font-size: 5rem !important;
  line-height: 1;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.metric-subtitle {
  color: rgb(0, 0, 0);
  font-family: 'Montserrat', sans-serif;
  font-size: 1.02rem !important;
  line-height: 1.4;
  font-weight: 900;
  letter-spacing: 0.5px;
}

/* Estilos para las tarjetas de sección (Actividad Reciente) */
.section-card {
  background-color: var(--color-section-bg);
  border-radius: 16px; /* La tarjeta contenedora ya tiene un buen redondeo */
  padding: 30px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #6d62ca;
  /* IMPORTANTE: Añadir overflow: hidden para que los redondeos internos no se "salgan" */
  overflow: hidden;
}

.section-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.18);
}

.section-title-blue {
  color: rgb(22, 76, 224);
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 1.8rem !important;
  margin-bottom: 25px;
  padding-bottom: 12px;
  border-bottom: 3px solid var(--color-primary-blue);
}

/* Estilos para los elementos de lista dentro de las secciones */
/* Aquí está la corrección para el recuadro blanco de los tickets */
.v-list {
    background-color: var(--color-white) !important; /* Asegura el fondo blanco para la lista */
    border-radius: 12px; /* Redondea la lista completa */
    overflow: hidden; /* Asegura que los contenidos redondeados no se salgan */
    padding: 0 !important; /* Elimina padding por defecto si lo hay */
}

.v-list-item {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  color: rgb(10, 1, 1);
  font-size: 1.15rem !important;
  margin-bottom: 0px; /* Elimina margen inferior si hay, para que el borde sea el único separador */
  padding: 12px 16px !important; /* Ajusta el padding para los ítems */
  border-bottom: 1px solid #EFEFEF; /* Línea separadora sólida y más clara */
}
.v-list-item:first-child {
    border-top-left-radius: 12px; /* Redondea la primera esquina superior izquierda */
    border-top-right-radius: 12px; /* Redondea la primera esquina superior derecha */
}
.v-list-item:last-child {
  border-bottom: none; /* Elimina el borde inferior del último ítem */
    border-bottom-left-radius: 12px; /* Redondea la última esquina inferior izquierda */
    border-bottom-right-radius: 12px; /* Redondea la última esquina inferior derecha */
}

.v-list-item-title {
  font-weight: 600;
  color: rgb(10, 1, 1);
  font-size: 1.15rem !important;
  margin-bottom: 4px;
}

.v-list-item-subtitle {
  color: var(--color-grey-dark); /* Usamos gris oscuro para subtítulos para mayor legibilidad */
  font-size: 0.95rem !important;
}


/* Estilos para el texto "No hay actividad reciente" */
.text-grey {
  color: var(--color-grey-dark) !important; /* Cambiado a gris oscuro para legibilidad */
  font-style: italic;
  padding: 25px;
  font-size: 1.1rem !important;
}

/* Overlay y Alert */
.v-overlay {
  background-color: rgba(255, 255, 255, 0.85);
}

.v-alert {
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: 8px;
}

/* Utilidades de Vuetify y Tailwind (ajustadas para reflejar nuevos tamaños) */
.py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-10 { margin-bottom: 2.5rem; }
.mt-4 { margin-top: 1rem; }
.text-h4 { font-size: 2.125rem; line-height: 2.5rem; }
.text-h5 { font-size: 1.5rem; line-height: 2rem; }
.text-h6 { font-size: 1.25rem; line-height: 1.75rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-center { text-align: center; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
.text-5xl { font-size: 3rem; line-height: 1; }
.text-6xl { font-size: 4rem; line-height: 1; }
.text-7xl { font-size: 5rem; line-height: 1; }
</style>