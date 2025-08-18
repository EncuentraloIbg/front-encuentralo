<template>
  <v-container class="py-5">
    <v-card class="mb-5" outlined>
      <v-card-title class="text-h5 text-center">Asignar Proyectos</v-card-title>
      <v-card-text>
        <!-- Alerta general para el formulario -->
        <v-alert
          v-if="showFormAlert"
          type="warning"
          variant="tonal"
          class="mb-4"
          closable
          v-model="showFormAlert"
        >
          {{ formAlertMessage }}
        </v-alert>

        <v-form ref="form" @submit.prevent="submitForm" class="form" style="color: black">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                label="Nombre del proyecto"
                v-model="nombre"
                required
                outlined
                :rules="[rules.required, rules.minLength, rules.maxLength, validateNombreProyectoUnico]" 
                :error-messages="validationErrors.nombre"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                label="Empresa"
                :items="empresas"
                item-value="id"
                item-title="nombre"
                v-model="empresa_id"
                required
                outlined
                :rules="[rules.empresaRequired]"
                :error-messages="validationErrors.empresa_id"
              />
            </v-col>
          </v-row>

          <div class="d-flex justify-start">
            <v-btn v-if="isEditing" color="secondary" @click="resetForm" class="mr-2">Cancelar</v-btn>
            <v-btn v-if="!isEditing" color="grey" text @click="resetForm" class="mr-2">Limpiar</v-btn>
            <v-btn color="primary" type="submit">Guardar Proyecto</v-btn>
          </div>
        </v-form>

      </v-card-text>
    </v-card>
    <v-card outlined>
      <v-card-title class="text-h6">Listado de Proyectos</v-card-title>
      <v-row align="center" class="px-4 pb-4">
        <v-col cols="12" sm="6" md="5" lg="4">
          <v-text-field v-model="search" label="Buscar proyecto" prepend-inner-icon="mdi-magnify" outlined dense hide-details />
        </v-col>
        <v-col cols="12" sm="6" md="7" lg="8" class="d-flex justify-start">
          <!-- Botones de ordenamiento ahora son solo flechas con estilo primario -->
          <v-btn-toggle v-model="sortBy[0].order" mandatory variant="elevated" color="primary">
            <v-btn value="asc" class="pa-2">
              <v-icon>mdi-sort-ascending</v-icon>
            </v-btn>
            <v-btn value="desc" class="pa-2">
              <v-icon>mdi-sort-descending</v-icon>
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="filteredProyectos"
        item-value="id"
        v-model:sort-by="sortBy"
        class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn icon @click="editProyecto(item)" class="mr-1">
            <v-icon color="primary">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="handleDeleteProyecto(item.id)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
        </template>
        <template v-slot:no-data>
          <v-alert :value="true" color="info" icon="mdi-information">
            No hay proyectos disponibles.
          </v-alert>
        </template>
      </v-data-table>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
      <template #actions>
        <v-btn text @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>

    <ConfirmDialog
      v-model="showConfirmDialog"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :confirm-text="confirmDialogConfirmText"
      :confirm-color="confirmDialogConfirmColor"
      @confirm="handleConfirmAction"
      @cancel="handleCancelAction"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
// Asegúrate de que la ruta a tu servicio es correcta
import { obtenerProyectos, obtenerEmpresas, crearProyecto, actualizarProyecto, eliminarProyecto, verificarNombreProyectoUnico } from '../services/proyectosService' // <-- Importado verificarNombreProyectoUnico
// Asegúrate de que la ruta a tu componente de diálogo es correcta
import ConfirmDialog from '../components/Confirmardialogo.vue';

// Para el formulario de Vuetify. Permite acceder a métodos como `validate()` y `resetValidation()`.
const form = ref<HTMLFormElement | null>(null);

const proyectos = ref<any[]>([])
const empresas = ref<any[]>([])   // <- listado de empresas
const nombre = ref('')
const empresa_id = ref<number | null>(null)

const search = ref('')
const isEditing = ref(false)
const editingProyectoId = ref<number | null>(null) // Para guardar el ID del proyecto en edición

// --- Variables de estado para notificaciones y modales de confirmación ---
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});
const showConfirmDialog = ref(false);
const confirmDialogTitle = ref('');
const confirmDialogMessage = ref('');
const confirmDialogConfirmText = ref('');
const confirmDialogConfirmColor = ref('');
const currentAction = ref(''); // 'create', 'update', 'delete'
const proyectoToDeleteId = ref<number | null>(null);
// ------------------------------------------------------------------

// Para almacenar los errores de validación del backend (si los hubiera, aunque la unicidad se maneja en la regla)
const validationErrors = ref<Record<string, string[]>>({});
// Nuevas referencias para la alerta general del formulario
const formAlertMessage = ref('');
const showFormAlert = ref(false);

// Definición para el tipo de ordenamiento (necesario para v-data-table en Vuetify 3)
type MySortItem = {
  key: string;
  order: boolean | 'asc' | 'desc' | undefined;
};
const sortBy = ref<MySortItem[]>([{ key: 'id', order: 'asc' }]); // Ordenar por ID ascendente por defecto
// `sortDesc` no se usa directamente con `v-model:sort-by` en Vuetify 3, se gestiona en `order` del `sortBy`

// Cabeceras para la tabla
const headers = [
  { title: 'ID', key: 'id', sortable: false }, // CAMBIO AQUÍ: sortable es false para quitar la flecha
  { title: 'Empresa', key: 'empresa.nombre', sortable: false }, // CAMBIO AQUÍ: sortable es false
  { title: 'Nombre del Proyecto', key: 'nombre', sortable: false }, // CAMBIO AQUÍ: sortable es false
  { title: 'Acciones', key: 'actions', sortable: false },
]

// REGLAS DE VALIDACIÓN FRONEND con Vuetify. Estas se ejecutan ANTES de enviar al backend.
const rules = {
  required: (value: string) => !!value || 'Este campo es requerido.',
  minLength: (v: string) => (v && v.length >= 3) || 'Mínimo 3 caracteres.',
  maxLength: (v: string) => (v && v.length <= 100) || 'Máximo 100 caracteres para el nombre.', // Ajusta si es necesario
  empresaRequired: (value: number | null) => value !== null || 'La empresa es requerida.',
};

// --- FUNCIÓN DE VALIDACIÓN ASÍNCRONA PARA EL NOMBRE DEL PROYECTO ---
async function validateNombreProyectoUnico(value: string) {
  if (!value) return true; // Deja que la regla `required` maneje si el campo está vacío.

  // Optimización: Si estamos editando y el nombre no ha cambiado, es válido.
  if (isEditing.value && editingProyectoId.value !== null) {
      const originalProyecto = proyectos.value.find(p => p.id === editingProyectoId.value);
      if (originalProyecto && originalProyecto.nombre.toLowerCase() === value.toLowerCase()) {
          return true; // El nombre no ha cambiado, es válido.
      }
  }

  try {
    // Pasa el ID del proyecto actual si estás editando, para que el backend lo excluya de la verificación
    const result = await verificarNombreProyectoUnico(value, editingProyectoId.value || null);
    return result.isUnique || result.message; // Devuelve true o el mensaje de error del backend
  } catch (error) {
    console.error('Error al verificar unicidad del nombre del proyecto:', error);
    // Este mensaje se mostrará si hay un error de red o de servidor al verificar la unicidad
    return 'Error al verificar la unicidad del nombre del proyecto. Intenta de nuevo.';
  }
}
// --- FIN FUNCIÓN DE VALIDACIÓN ASÍNCRONA ---


// Cargar proyectos desde la API
async function cargarProyectos() {
  try {
    proyectos.value = await obtenerProyectos()
  } catch (error: any) {
    console.error('Error al cargar proyectos:', error)
    snackbar.value = {
      show: true,
      message: 'Error al cargar proyectos.',
      color: 'error',
    };
  }
}

async function cargarEmpresas() {
  try {
    empresas.value = await obtenerEmpresas()
  } catch (error) {
    console.error('Error al cargar empresas:', error)
    snackbar.value = {
      show: true,
      message: 'Error al cargar empresas.',
      color: 'error',
    };
  }
}

// Lógica para enviar el formulario (crear/actualizar)
async function submitForm() {
  // Limpiar errores de validación previos y ocultar snackbar anterior
  validationErrors.value = {};
  snackbar.value.show = false;
  formAlertMessage.value = '';
  showFormAlert.value = false;

  // VALIDACIÓN FRONEND CON VUETIFY: Ejecuta las reglas de los campos definidas en `rules`.
  if (!form.value) return; // Asegurarse de que el formulario está montado
  const { valid } = await form.value.validate(); // Valida todos los campos con reglas, incluyendo la asíncrona

  if (!valid) {
    snackbar.value = { show: true, message: 'Por favor, corrige los errores del formulario antes de continuar.', color: 'warning' };
    return; // Detiene la ejecución si la validación frontend falla
  }

  // Si la validación frontend pasa, procede a la confirmación del usuario para enviar al backend
  if (isEditing.value) {
    confirmDialogTitle.value = 'Confirmar Actualización de Proyecto';
    confirmDialogMessage.value = '¿Estás seguro de que quieres actualizar este proyecto?';
    confirmDialogConfirmText.value = 'Actualizar';
    confirmDialogConfirmColor.value = 'primary';
    currentAction.value = 'update';
  } else {
    confirmDialogTitle.value = 'Confirmar Creación de Proyecto';
    confirmDialogMessage.value = '¿Estás seguro de que quieres crear este proyecto?';
    confirmDialogConfirmText.value = 'Crear';
    confirmDialogConfirmColor.value = 'success';
    currentAction.value = 'create';
  }
  showConfirmDialog.value = true;
}

// Manejar la acción de confirmación (crear, actualizar, eliminar)
async function handleConfirmAction() {
  snackbar.value.show = false; // Oculta cualquier snackbar anterior
  formAlertMessage.value = ''; // Limpiar la alerta general del formulario
  showFormAlert.value = false;

  try {
    const projectData = {
      nombre: nombre.value,
      empresa_id: empresa_id.value,
    };

    if (currentAction.value === 'create') {
      const nuevoProyecto = await crearProyecto(projectData);
      proyectos.value.push(nuevoProyecto);
      sortBy.value = [{ key: 'id', order: 'desc' }]; // Muestra el más reciente primero
      snackbar.value = { show: true, message: 'Proyecto creado exitosamente.', color: 'success' };
    } else if (currentAction.value === 'update') {
      const actualizado = await actualizarProyecto(editingProyectoId.value!, projectData);
      const index = proyectos.value.findIndex(p => p.id === editingProyectoId.value);
      if (index !== -1) {
        // Actualiza el proyecto en el array con los datos recibidos
        Object.assign(proyectos.value[index], actualizado);
      }
      snackbar.value = { show: true, message: 'Proyecto actualizado correctamente.', color: 'success' };
    } else if (currentAction.value === 'delete') {
      if (proyectoToDeleteId.value !== null) {
        await eliminarProyecto(proyectoToDeleteId.value);
        proyectos.value = proyectos.value.filter(p => p.id !== proyectoToDeleteId.value);
        cargarProyectos(); // Recargar para asegurar consistencia
        snackbar.value = { show: true, message: 'Proyecto eliminado correctamente.', color: 'success' };
      }
    }
    resetForm();
  } catch (err: any) {
    console.error('Error en handleConfirmAction:', err);
    // El servicio ahora lanza un Error simple con el mensaje
    const errorMessage = err.message || 'Error al procesar la operación del proyecto. Intenta de nuevo más tarde.';
    snackbar.value = { show: true, message: errorMessage, color: 'error' };

    // Si el error es específicamente por unicidad del nombre (el mensaje que tu backend devuelve)
    if (errorMessage.includes('El nombre del proyecto ya está en uso')) {
        formAlertMessage.value = errorMessage; // Muestra el mensaje específico del backend
        showFormAlert.value = true;
    }
  } finally {
    showConfirmDialog.value = false;
    currentAction.value = '';
    proyectoToDeleteId.value = null;
  }
}

// Función para editar un proyecto
function editProyecto(proyecto: any) {
  isEditing.value = true;
  editingProyectoId.value = proyecto.id;
  nombre.value = proyecto.nombre;
  empresa_id.value = proyecto.empresa?.id || null; // Asegúrate de obtener el ID de la empresa
  resetValidation(); // Limpiar validaciones al entrar en modo edición
  window.scrollTo({ top: 0, behavior: 'smooth'})
}

// Función para eliminar un proyecto (muestra el diálogo de confirmación)
function handleDeleteProyecto(id: number) {
  proyectoToDeleteId.value = id;
  confirmDialogTitle.value = 'Confirmar Eliminación de Proyecto';
  confirmDialogMessage.value = '¿Estás seguro de que quieres eliminar este proyecto? Esta acción es irreversible.';
  confirmDialogConfirmText.value = 'Eliminar';
  confirmDialogConfirmColor.value = 'error';
  currentAction.value = 'delete';
  showConfirmDialog.value = true;
}

// Manejar la cancelación del diálogo de confirmación
function handleCancelAction() {
  console.log('Acción de proyecto cancelada por el usuario.');
  proyectoToDeleteId.value = null;
  currentAction.value = '';
  showConfirmDialog.value = false; // Asegura que el modal se cierre
}

function resetForm() {
  nombre.value = ''
  empresa_id.value = null
  isEditing.value = false
  editingProyectoId.value = null
  proyectoToDeleteId.value = null
  resetValidation(); // Limpiar validaciones al resetear el formulario
  snackbar.value.show = false; // Ocultar snackbar
  formAlertMessage.value = ''; // Limpiar la alerta general del formulario
  showFormAlert.value = false;
}

// Función para resetear las validaciones del formulario y los errores del backend
function resetValidation() {
  // Limpiar cualquier error de validación visual de Vuetify
  if (form.value) {
    form.value.resetValidation();
  }
  // Limpiar errores específicos del backend (si los estabas manejando por campo)
  validationErrors.value = {};
}

// Cargar los proyectos y empresas cuando el componente se monta
onMounted(() => {
  cargarProyectos();
  cargarEmpresas();
  sortByIdDesc(); // Por defecto, mostrar los más recientes
});

// Filtrar proyectos por búsqueda
const filteredProyectos = computed(() => {
  let items = [...proyectos.value]; // Copia el array original

  // Filtrar por texto de búsqueda
  if (search.value) {
    const searchTerm = search.value.toLowerCase().trim();
    items = items.filter(p =>
      (p.nombre?.toLowerCase()?.includes(searchTerm) || false) ||
      (p.empresa?.nombre?.toLowerCase()?.includes(searchTerm) || false)
    );
  }

  // Aplicar el ordenamiento (definido por sortBy)
  if (sortBy.value && sortBy.value.length > 0) {
    const sortKey = sortBy.value[0].key;
    const sortOrder = sortBy.value[0].order;

    items.sort((a, b) => {
      let valA = getValueByKey(a, sortKey);
      let valB = getValueByKey(b, sortKey);

      // Manejar valores nulos o indefinidos para evitar errores de comparación
      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' ? (valA - valB) : (valB - valA);
      }
    });
  }
  return items;
});

// Helper function to get nested object values
function getValueByKey(obj: any, key: string): any {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

// Funciones para ordenar la tabla
// Ahora simplemente actualizan el `sortBy` y el computed `filteredProyectos` hará el resto.
const sortByIdAsc = () => {
  sortBy.value = [{ key: 'id', order: 'asc' }];
};

const sortByIdDesc = () => {
  sortBy.value = [{ key: 'id', order: 'desc' }];
};
</script>

<style scoped>
.form {
  padding: 1rem;
}
.text-h5 {
  color: #1976D2;
  font-weight: bold;
}
.text-h6 {
  color: #1976D2;
  font-weight: bold;
}
/* Estilos para que los botones de toggle se vean bien sin texto */
.v-btn-toggle .v-btn {
  min-width: 44px; /* Asegura un tamaño mínimo para que el ícono se vea bien */
}

/* Estilo para controlar la altura de las filas de la tabla */
.v-data-table tbody tr {
  height: 48px; /* O el valor que consideres apropiado */
  min-height: 48px;
}
/* Asegurarse de que las celdas también tengan un padding consistente */
.v-data-table tbody td {
  padding: 8px 16px;
}
</style>
