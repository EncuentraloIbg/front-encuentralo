<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title class="text-h5">
        <v-icon icon="mdi-clipboard-text-clock" class="me-2" />
        Historial de Tickets
      </v-card-title>

      <v-row class="px-4 pb-4">
        <v-col cols="12">
          <v-text-field
            v-model="search"
            label="Buscar tickets..."
            prepend-inner-icon="mdi-magnify"
            outlined
            dense
            clearable
            @update:modelValue="handleSearch"
            hide-details
          />
        </v-col>
      </v-row>

      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="headers"
        :items-length="totalItems"
        :items="tickets"
        :loading="loading"
        :items-per-page-options="[10, 20, 30, 50]"
        @update:options="loadItems"
        class="elevation-1"
      >
        <template #item.rowNumber="{ index }">
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </template>

        <template #item.prioridad.nombre="{ item }">
          <v-chip :color="getPrioridadColor(item.prioridad?.nombre)" small>
            {{ item.prioridad?.nombre || 'N/A' }}
          </v-chip>
        </template>

        <template #item.estado.nombre="{ item }">
          <v-chip :color="getEstadoColor(item.estado?.nombre)" small>
            {{ item.estado?.nombre || 'N/A' }}
          </v-chip>
        </template>

        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt || '') }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon
            @click="irADetalle(item.id)"
            color="primary"
            variant="text"
            size="small"
          >
            <v-icon>mdi-eye</v-icon>
            <v-tooltip activator="parent" location="top">Ver detalles</v-tooltip>
          </v-btn>
        </template>
      </v-data-table-server>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { debounce } from 'lodash'; // Asegúrate de tener @types/lodash instalado

const router = useRouter();

// Define el tipo de Ticket para evitar errores de tipo
interface Ticket {
  id: number; // El ID sigue siendo necesario internamente para acciones como 'irADetalle'
  titulo: string;
  prioridad?: { nombre?: string | null };
  estado?: { nombre?: string | null };
  created_at?: string;
  createdAt?: string;
}

// Estado de la tabla
const tickets = ref<Ticket[]>([]);
const loading = ref(false);
const totalItems = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);

// Estado para búsqueda
const search = ref('');
const sortOrder = ref('desc'); // Se mantiene fijo en 'desc' para mostrar los más recientes

// Cabeceras de la tabla (¡Aquí hemos quitado 'ID'!)
const headers = [
  { title: '#', key: 'rowNumber', sortable: false }, // Columna para el número de fila secuencial
  { title: 'Título', key: 'titulo', sortable: true },
  { title: 'Prioridad', key: 'prioridad.nombre', sortable: true },
  { title: 'Estado', key: 'estado.nombre', sortable: true },
  { title: 'Fecha', key: 'createdAt', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false }
];

// Función para cargar los tickets de la API
async function loadItems(options: { page: number; itemsPerPage: number; sortBy: { key: string; order: string }[] } = { page: page.value, itemsPerPage: itemsPerPage.value, sortBy: [] }) {
  try {
    loading.value = true;

    page.value = options.page;
    itemsPerPage.value = options.itemsPerPage;

    const params = new URLSearchParams({
      page: page.value.toString(),
      limit: itemsPerPage.value.toString(),
      sortOrder: sortOrder.value,
      search: search.value.trim()
    });

    console.log('Parámetros de la API:', params.toString());

    const response = await fetch(`http://localhost:3333/api/tickets/historial?${params}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta de la API:', response.status, errorText);
      throw new Error(`Error en la respuesta del servidor: ${response.status} ${errorText}`);
    }

    const { data, meta } = await response.json();

    tickets.value = Array.isArray(data) ? data.map(ticket => ({
      ...ticket,
      prioridad: ticket.prioridad || { nombre: null },
      estado: ticket.estado || { nombre: null }
    })) : [];
    
    totalItems.value = meta?.total !== undefined ? meta.total : 0;

    console.log('Tickets cargados:', tickets.value.length, 'Total items:', totalItems.value);
  } catch (error) {
    console.error('Error al cargar tickets:', error);
  } finally {
    loading.value = false;
  }
}

// Manejador de búsqueda con debounce
const handleSearch = debounce(() => {
  page.value = 1;
  loadItems();
}, 500);

// Al montar el componente, cargar los tickets con el orden predeterminado (más recientes)
onMounted(() => {
  loadItems({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [] });
});

// Navegación al detalle del ticket (¡el ID sigue siendo necesario aquí!)
function irADetalle(ticketId: number) {
  router.push({ name: 'detalle-ticket', params: { id: ticketId } });
}

// Funciones de color (sin cambios)
function getEstadoColor(estado: string | null | undefined) {
  if (!estado) return 'blue-grey';

  switch (estado.toLowerCase()) {
    case 'abierto': return 'blue';
    case 'asignado': return 'indigo';
    case 'en progreso': return 'cyan';
    case 'pendiente': return 'orange';
    case 'revisión': return 'purple';
    case 'cerrado': return 'green';
    case 'reabierto': return 'red-lighten-2';
    default: return 'blue-grey';
  }
}

function getPrioridadColor(prioridad: string | null | undefined) {
  if (!prioridad) return 'blue-grey-darken-1';

  switch (prioridad.toLowerCase()) {
    case 'critica': return 'red-darken-3';
    case 'urgente': return 'red';
    case 'alta': return 'deep-orange';
    case 'media': return 'amber';
    case 'baja': return 'light-green-darken-1';
    default: return 'blue-grey-darken-1';
  }
}

// Función para formatear la fecha
function formatDate(dateString: string) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn('Fecha inválida recibida:', dateString);
    return 'Fecha inválida';
  }
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>

<style scoped>
/* Estilos adicionales si los tienes */
</style>