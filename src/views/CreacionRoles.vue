<template>
  <v-container class="py-5">
    <v-card class="mb-5" outlined>
      <v-card-title class="text-h5 text-center">Gestión de Roles</v-card-title>
      <v-card-text>
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
            <v-col cols="12">
              <v-text-field
                label="Nombre del Rol"
                v-model="nombre"
                required
                outlined
                clearable
                :error-messages="validationErrors.nombre" 
                :rules="[rules.required, rules.minLength, rules.maxLength, validateNombreRolUnico]" />
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Descripción del Rol"
                v-model="descripcion"
                outlined
                counter
                clearable
                maxlength="255"
                hint="Proporciona una breve descripción del rol. (Máx. 255 caracteres)"
                :error-messages="validationErrors.descripcion"
                :rules="[rules.descriptionMaxLength]"
              />
            </v-col>
            <v-col cols="12" v-if="isEditing">
              <v-select
                label="Estado del Rol"
                v-model="estado"
                :items="['activo', 'inactivo']"
                outlined
                required
                :error-messages="validationErrors.estado"
                :rules="[rules.estadoRequired]"
              ></v-select>
            </v-col>
          </v-row>

          <div class="d-flex justify-start">
            <v-btn v-if="isEditing" color="secondary" @click="resetForm" class="mr-2">Cancelar Edición</v-btn>
            <v-btn v-if="!isEditing" color="grey" text @click="resetForm" class="mr-2">Limpiar Formulario</v-btn>
            <v-btn color="primary" type="submit">{{ isEditing ? 'Actualizar Rol' : 'Crear Rol' }}</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card outlined>
      <v-card-title class="text-h6">Listado de Roles</v-card-title>
      <v-row align="center" class="px-4 pb-4">
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-text-field v-model="search" label="Buscar rol" prepend-inner-icon="mdi-magnify" outlined dense hide-details />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select
            v-model="filtroEstadoTabla"
            :items="[{ title: 'Activos', value: 'activo' }, { title: 'Inactivos', value: 'inactivo' }, { title: 'Todos', value: 'todos' }]"
            label="Filtrar por Estado"
            outlined
            dense
            hide-details
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="6" class="d-flex justify-start">
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
        :items="filteredRoles" item-value="id"
        v-model:sort-by="sortBy"
        class="elevation-1"
      >
        <template v-slot:item.estado="{ item }">
          <v-chip :color="item.estado === 'activo' ? 'green' : 'red'" variant="flat" size="small">
            {{ item.estado === 'activo' ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon @click="editRol(item)" class="mr-1" :disabled="item.estado === 'inactivo'">
            <v-icon color="primary">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="handleDeleteRol(item.id)" v-if="item.estado === 'activo'">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
          <v-btn icon @click="handleActivateRol(item.id)" v-else>
            <v-icon color="success">mdi-check-circle</v-icon>
          </v-btn>
          <v-btn icon @click="handleDeletePermanentlyRol(item.id)" class="ml-1">
            <v-icon color="grey darken-2">mdi-eraser</v-icon> </v-btn>
        </template>
        <template v-slot:no-data>
          <v-alert :value="true" color="info" icon="mdi-information">
            No hay roles disponibles.
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
import { ref, onMounted, computed, watch } from 'vue';
import { obtenerRoles, crearRol, actualizarRol, eliminarRolPermanentemente, verificarNombreRolUnico, inactivarRol, activarRol } from '../services/CreacionRoles' // <-- Importa verificarNombreRolUnico y las funciones de estado si las usas directamente
import ConfirmDialog from '../components/Confirmardialogo.vue';

// Para el formulario de Vuetify. Permite acceder a métodos como `validate()` y `resetValidation()`.
const form = ref<HTMLFormElement | null>(null);

const roles = ref<any[]>([])
const nombre = ref('')
const descripcion = ref('')
const estado = ref('activo') // Estado por defecto para la creación

const search = ref('')
const isEditing = ref(false)
const editingRolId = ref<number | null>(null)

// Para almacenar los errores de validación del backend.
// En este caso, ya no se poblará para errores de unicidad del nombre,
// ya que la validación asíncrona los manejará directamente en la regla.
const validationErrors = ref<Record<string, string[]>>({});

// Nuevas referencias para la alerta general del formulario
const formAlertMessage = ref('');
const showFormAlert = ref(false);

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});
const showConfirmDialog = ref(false);
const confirmDialogTitle = ref('');
const confirmDialogMessage = '';
const confirmDialogConfirmText = ref('');
const confirmDialogConfirmColor = ref('');
const currentAction = ref('');
const rolToDeleteId = ref<number | null>(null);
const rolToActivateId = ref<number | null>(null);
const rolToDeletePermanentlyId = ref<number | null>(null);

type MySortItem = {
  key: string;
  order: boolean | 'asc' | 'desc' | undefined;
};
const sortBy = ref<MySortItem[]>([{ key: 'id', order: 'asc' }]);

const filtroEstadoTabla = ref('activo');

const headers = [
  { title: 'ID', key: 'id', sortable: false }, // Se mantiene sin flecha de ordenamiento
  { title: 'Nombre del Rol', key: 'nombre', sortable: false }, // CAMBIO: sortable: false
  { title: 'Descripción', key: 'descripcion', sortable: false }, // CAMBIO: sortable: false
  { title: 'Estado', key: 'estado', sortable: false }, // CAMBIO: sortable: false
  { title: 'Acciones', key: 'actions', sortable: false },
]

// REGLAS DE VALIDACIÓN FRONEND con Vuetify. Estas se ejecutan ANTES de enviar al backend.
const rules = {
  required: (value: string) => !!value || 'Este campo es requerido.', // Modificado el mensaje
  minLength: (v: string) => (v && v.length >= 3) || 'Mínimo 3 caracteres.', // Modificado el mensaje
  maxLength: (v: string) => (v && v.length <= 50) || 'Máximo 50 caracteres para el nombre.',
  descriptionMaxLength: (v: string) => (v && v.length <= 255) || 'Máximo 255 caracteres para la descripción.',
  estadoRequired: (value: string) => !!value || 'El estado es requerido.'
};

// --- NUEVA FUNCIÓN DE VALIDACIÓN ASÍNCRONA PARA EL NOMBRE DEL ROL ---
async function validateNombreRolUnico(value: string) {
  if (!value) return true; // Deja que la regla `required` maneje si el campo está vacío.

  // Si estamos editando y el nombre no ha cambiado, no es necesario verificar con el backend
  // para evitar llamadas innecesarias. Se compara con el valor original si se tiene.
  // Esto es una optimización, pero la lógica del backend con `excludeId` ya es robusta.
  // Si no quieres la optimización, simplemente elimina el `if` de abajo y llama directamente a `verificarNombreRolUnico`.
  if (isEditing.value && editingRolId.value !== null) {
      const originalRol = roles.value.find(r => r.id === editingRolId.value);
      if (originalRol && originalRol.nombre.toLowerCase() === value.toLowerCase()) {
          return true; // El nombre no ha cambiado, es válido.
      }
  }

  try {
    // Pasa el ID del rol actual si estás editando, para que el backend lo excluya de la verificación
    const isUnique = await verificarNombreRolUnico(value, editingRolId.value || undefined);
    return isUnique || 'Ya existe un rol con este nombre. Por favor, elige uno diferente.'; // Mensaje específico para unicidad
  } catch (error) {
    console.error('Error al verificar unicidad del nombre del rol:', error);
    // Este mensaje se mostrará si hay un error de red o de servidor al verificar la unicidad
    return 'Error al verificar la unicidad del nombre del rol. Intenta de nuevo.';
  }
}
// --- FIN NUEVA FUNCIÓN DE VALIDACIÓN ASÍNCRONA ---


async function cargarRoles() {
  try {
    roles.value = await obtenerRoles();
  } catch (error: any) {
    console.error('Error al cargar roles:', error);
    snackbar.value = { show: true, message: 'Error al cargar roles.', color: 'error' };
  }
}

async function submitForm() {
  // Limpiar errores de validación previos (tanto de frontend como de backend) y ocultar snackbar anterior
  validationErrors.value = {};
  snackbar.value.show = false;
  formAlertMessage.value = ''; // Limpiar la alerta general del formulario
  showFormAlert.value = false;

  // VALIDACIÓN FRONEND CON VUETIFY: Ejecuta las reglas de los campos definidas en `rules`.
  // Si esta validación falla, no se procede a la confirmación ni al envío al backend.
  if (!form.value) return; // Asegurarse de que el formulario está montado
  const { valid } = await form.value.validate(); // Valida todos los campos con reglas

  if (!valid) {
    snackbar.value = { show: true, message: 'Por favor, corrige los errores del formulario antes de continuar.', color: 'warning' };
    return; // Detiene la ejecución si la validación frontend falla
  }

  // Si la validación frontend pasa, procede a la confirmación del usuario para enviar al backend
  if (isEditing.value) {
    confirmDialogTitle.value = 'Confirmar Actualización de Rol';
    confirmDialogMessage.value = '¿Estás seguro de que quieres actualizar este rol?';
    confirmDialogConfirmText.value = 'Actualizar';
    confirmDialogConfirmColor.value = 'primary';
    currentAction.value = 'update';
  } else {
    confirmDialogTitle.value = 'Confirmar Creación de Rol';
    confirmDialogMessage.value = '¿Estás seguro de que quieres crear este rol?';
    confirmDialogConfirmText.value = 'Crear';
    confirmDialogConfirmColor.value = 'success';
    currentAction.value = 'create';
  }
  showConfirmDialog.value = true;
}

async function handleConfirmAction() {
  snackbar.value.show = false;
  validationErrors.value = {}; // Limpiar errores de validación previos
  formAlertMessage.value = ''; // Limpiar la alerta general del formulario
  showFormAlert.value = false;

  try {
    const rolData: { nombre: string; descripcion: string; estado?: string } = {
      nombre: nombre.value,
      descripcion: descripcion.value,
    };
    
    if (currentAction.value === 'create') {
      // Al crear, el estado por defecto es 'activo' desde el backend.
      // Si `descripcion` puede ser opcional al crear, ajusta la interfaz de `crearRol` en tu servicio.
      await crearRol(rolData);
      snackbar.value = { show: true, message: 'Rol creado exitosamente.', color: 'success' };
    } else if (currentAction.value === 'update') {
      // Al actualizar, se envía el estado explícitamente.
      rolData.estado = estado.value; // Añadir estado solo si estamos actualizando
      await actualizarRol(editingRolId.value!, rolData);
      snackbar.value = { show: true, message: 'Rol actualizado correctamente.', color: 'success' };
    } else if (currentAction.value === 'inactivate') {
      if (rolToDeleteId.value !== null) {
        await inactivarRol(rolToDeleteId.value); // Usa la función inactivarRol
        snackbar.value = { show: true, message: 'Rol inactivado correctamente.', color: 'success' };
      }
    } else if (currentAction.value === 'activate') {
      if (rolToActivateId.value !== null) {
        await activarRol(rolToActivateId.value); // Usa la función activarRol
        snackbar.value = { show: true, message: 'Rol activado correctamente.', color: 'success' };
      }
    } else if (currentAction.value === 'delete_permanent') {
      if (rolToDeletePermanentlyId.value !== null) {
        await eliminarRolPermanentemente(rolToDeletePermanentlyId.value);
        snackbar.value = { show: true, message: 'Rol eliminado definitivamente.', color: 'success' };
      }
    }

    // Recargar los roles y resetear el formulario después de CUALQUIER operación exitosa
    await cargarRoles();
    resetForm();

  } catch (err: any) {
    console.error('Error en handleConfirmAction:', err);
    // Ahora el error es un objeto Error estándar con el mensaje en `err.message`
    // No hay `err.response.status` ni `err.response.data.messages` en el servicio actual
    const errorMessage = err.message || 'Error al procesar la operación del rol. Intenta de nuevo más tarde.';
    snackbar.value = { show: true, message: errorMessage, color: 'error' };

    // Si el error es específicamente por unicidad del nombre (409 del backend),
    // el backend ya debería haberlo capturado y devuelto un mensaje en `err.message`.
    // Si necesitas un mensaje diferente para el formulario:
    if (errorMessage.includes('El nombre del rol ya está en uso.')) { // Compara con el mensaje que devuelve tu controlador en caso de conflicto
      formAlertMessage.value = 'El nombre de rol ingresado ya está en uso. Por favor, elige uno diferente.';
      showFormAlert.value = true;
    }
  } finally {
    // Siempre cerrar el diálogo de confirmación y limpiar variables temporales
    showConfirmDialog.value = false;
    currentAction.value = '';
    rolToDeleteId.value = null;
    rolToActivateId.value = null;
    rolToDeletePermanentlyId.value = null;
  }
}

function editRol(rol: any) {
  isEditing.value = true;
  editingRolId.value = rol.id;
  nombre.value = rol.nombre;
  descripcion.value = rol.descripcion;
  estado.value = rol.estado;
  resetValidation(); // Importante: Limpiar validaciones al entrar en modo edición para no arrastrar errores previos.
  window.scrollTo({ top: 0, behavior: 'smooth'})
}

function handleDeleteRol(id: number) {
  rolToDeleteId.value = id;
  confirmDialogTitle.value = 'Confirmar Inactivación de Rol';
  confirmDialogMessage.value = '¿Estás seguro de que quieres inactivar este rol? Se cambiará su estado a inactivo.';
  confirmDialogConfirmText.value = 'Inactivar';
  confirmDialogConfirmColor.value = 'error';
  currentAction.value = 'inactivate';
  showConfirmDialog.value = true;
}

function handleDeletePermanentlyRol(id: number) {
  rolToDeletePermanentlyId.value = id;
  confirmDialogTitle.value = '¡ADVERTENCIA! Eliminación Permanente de Rol';
  confirmDialogMessage.value = 'Esta acción eliminará el rol de forma definitiva de la base de datos y no se podrá recuperar. ¿Estás absolutamente seguro?';
  confirmDialogConfirmText.value = 'Eliminar PERMANENTEMENTE';
  confirmDialogConfirmColor.value = 'red darken-3'; // Vuetify 2.x color. En Vuetify 3 usa 'error-darken-3' o similar si está en tu tema.
  currentAction.value = 'delete_permanent';
  showConfirmDialog.value = true;
}

function handleActivateRol(id: number) {
  rolToActivateId.value = id;
  confirmDialogTitle.value = 'Confirmar Activación de Rol';
  confirmDialogMessage.value = '¿Estás seguro de que quieres activar este rol? Se cambiará su estado a activo.';
  confirmDialogConfirmText.value = 'Activar';
  confirmDialogConfirmColor.value = 'success';
  currentAction.value = 'activate';
  showConfirmDialog.value = true;
}

function handleCancelAction() {
  console.log('Acción de rol cancelada por el usuario.');
  resetForm(); // Resetear también limpia validaciones y oculta el snackbar
  showConfirmDialog.value = false;
}

function resetForm() {
  nombre.value = ''
  descripcion.value = ''
  estado.value = 'activo'
  isEditing.value = false
  editingRolId.value = null
  rolToDeleteId.value = null
  rolToActivateId.value = null
  rolToDeletePermanentlyId.value = null
  resetValidation(); // Resetear también las validaciones de Vuetify y de los errores del backend
  snackbar.value.show = false; // Ocultar snackbar
  formAlertMessage.value = ''; // Limpiar la alerta general del formulario
  showFormAlert.value = false;
}

// FUNCIÓN CLAVE: Para resetear las validaciones del formulario y los errores del backend
function resetValidation() {
  validationErrors.value = {}; // Limpiar los errores de validación del backend
  if (form.value) {
    form.value.resetValidation(); // Método de Vuetify 3 para resetear el estado de validación visual de los campos.
  }
}

onMounted(() => {
  cargarRoles();
  sortByIdDesc(); // Ordenar por ID descendente al cargar
});

const filteredRoles = computed(() => {
  let rolesFiltrados = roles.value;

  if (search.value) {
    const searchTerm = search.value.trim().toLowerCase();
    rolesFiltrados = rolesFiltrados.filter(r =>
      r.nombre.toLowerCase().includes(searchTerm) ||
      (r.descripcion && r.descripcion.toLowerCase().includes(searchTerm))
    );
  }

  if (filtroEstadoTabla.value === 'activo') {
    rolesFiltrados = rolesFiltrados.filter(r => r.estado === 'activo');
  } else if (filtroEstadoTabla.value === 'inactivo') {
    rolesFiltrados = rolesFiltrados.filter(r => r.estado === 'inactivo');
  }

  // Aplicar el ordenamiento
  if (sortBy.value && sortBy.value.length > 0) {
    const sortKey = sortBy.value[0].key;
    const sortOrder = sortBy.value[0].order;

    rolesFiltrados.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

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

  return rolesFiltrados;
});


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
/* Estilos adicionales para mensajes de error si no usas Vuetify directamente para todos los mensajes */
.error-message {
  color: red;
  font-size: 0.85em;
  margin-top: 5px;
}

.text-h5, .text-h6 {
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
