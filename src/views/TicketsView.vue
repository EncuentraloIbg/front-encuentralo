<template>
  <v-container class="py-5">
    <v-card class="mb-5" outlined>
      <v-card-title class="text-h5 text-center py-4">
        FORMULARIO DE TICKET
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="onSubmit" class="form" style="color: black">
          <v-row class="mb-2">
            <v-col cols="12">
              <v-text-field
                label="Título del Ticket"
                v-model="titulo"
                :error-messages="tituloError"
                :error="!!tituloError"
                outlined
                density="compact"
                counter="100"
                maxlength="100"
                hide-details="auto"
                @blur="handleTituloBlur"
              />
            </v-col>
          </v-row>

          <v-row class="mb-4">
            <v-col cols="12">
              <v-textarea
                label="Descripción Detallada del Problema/Solicitud"
                v-model="descripcion"
                :error-messages="descripcionError"
                :error="!!descripcionError"
                outlined
                rows="5"
                density="compact"
                counter="1000"
                maxlength="1000"
                hide-details="auto"
                @blur="handleDescripcionBlur"
              />
            </v-col>
          </v-row>

          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <v-select
                label="Estado Actual"
                v-model="estado_id"
                :items="estados"
                item-title="nombre"
                item-value="id"
                :error-messages="estadoIdError"
                :error="!!estadoIdError"
                required
                outlined
                density="compact"
                class="mb-3"
                hide-details="auto"
              />
              <v-select
                label="Prioridad del Ticket"
                v-model="prioridad_id"
                :items="prioridades"
                item-title="nombre"
                item-value="id"
                :error-messages="prioridadIdError"
                :error="!!prioridadIdError"
                required
                outlined
                density="compact"
                class="mb-3"
                hide-details="auto"
              />
              <v-select
                label="Empresa Asociada"
                v-model="empresa_id"
                :items="empresas"
                item-title="nombre"
                item-value="id"
                :error-messages="empresaIdError"
                :error="!!empresaIdError"
                required
                outlined
                density="compact"
                class="mb-3"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                label="Asignado a (Técnico)"
                v-model="usuario_asignado_id"
                :items="usuariosAsignados"
                item-title="nombreCompleto"
                item-value="id"
                :error-messages="usuarioAsignadoIdError"
                :error="!!usuarioAsignadoIdError"
                required
                outlined
                density="compact"
                class="mb-3"
                hide-details="auto"
              />
              <v-select
                label="Categoría de Servicio"
                v-model="categoria_id"
                :items="categorias"
                item-title="nombre"
                item-value="id"
                :error-messages="categoriaIdError"
                :error="!!categoriaIdError"
                required
                outlined
                density="compact"
                class="mb-3"
                hide-details="auto"
              />
              <v-select
                label="Servicio Específico"
                v-model="servicio_id"
                :items="servicios"
                item-title="nombre"
                item-value="id"
                :error-messages="servicioIdError"
                :error="!!servicioIdError"
                required
                outlined
                density="compact"
                class="mb-3"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <v-row class="mb-4 align-center">
            <v-col cols="12">
              <p class="text-subtitle-1 mb-2">Adjuntar Archivo (opcional, máx. 5MB):</p>
              <div class="d-flex align-center flex-wrap">
                <v-btn
                  color="primary"
                  variant="outlined"
                  class="mr-2 mb-2"
                  @click="triggerFileInput"
                  style="text-transform: none;"
                >
                  Seleccionar archivo
                  <v-icon end>mdi-paperclip</v-icon>
                </v-btn>

                <input
                  type="file"
                  ref="fileInputRef"
                  @change="handleFileChange"
                  style="display: none;"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  single
                />

                <v-chip
                  v-if="fileNameDisplay"
                  closable
                  @click:close="clearSelectedFile"
                  color="info"
                  variant="flat"
                  class="mb-2 mr-2"
                >
                  {{ fileNameDisplay }} (Nuevo)
                </v-chip>

                <v-chip
                  v-if="isEditing && existingFileName && !fileNameDisplay"
                  closable
                  @click:close="removeExistingAttachment"
                  color="purple"
                  variant="flat"
                  class="mb-2"
                >
                  {{ existingFileName }} (Existente)
                </v-chip>

                <p v-if="isEditing && existingFileName && !fileNameDisplay" class="text-caption ml-2 mb-2">
                  <a @click="downloadAttachment(editingTicketId!)" style="cursor: pointer; text-decoration: underline;">Descargar existente</a>
                </p>
              </div>
              <v-messages :value="[archivoAdjuntoError]" color="error"></v-messages>
            </v-col>
          </v-row>

          <div class="d-flex justify-start mt-4">
            <v-btn color="grey" text @click="resetFormAndState" class="mr-2">
              {{ isEditing ? 'Cancelar Edición' : 'Limpiar' }}
            </v-btn>
            <v-btn color="primary" type="submit">
              {{ isEditing ? 'Actualizar' : 'Guardar' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card outlined>
      <v-card-title class="text-h6 py-4">
        Lista de Tickets
      </v-card-title>

      <v-row align="center" class="px-4 pb-4">
        <v-col cols="12" sm="6" md="5" lg="4">
          <v-text-field v-model="search" label="Buscar ticket" prepend-inner-icon="mdi-magnify" outlined dense hide-details />
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
        :items="filteredTickets"
        item-value="id"
        v-model:sort-by="sortBy"
        v-model:sort-desc="sortDesc"
        class="elevation-1"
      >
        <template #item.nombreArchivo="{ item }">
          <v-btn
            v-if="item.nombreArchivo"
            icon
            variant="flat"
            size="small"
            color="grey-lighten-3"
            @click="downloadAttachment(item.id)"
            title="Descargar adjunto"
          >
            <v-icon color="blue-darken-2">mdi-download</v-icon>
          </v-btn>
          <span v-else>N/A</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon @click="editTicket(item)" class="mr-1">
            <v-icon color="primary">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="handleDeleteTicket(item.id)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
        </template>
        <template v-slot:no-data>
          <v-alert :value="true" color="info" icon="mdi-information">
            No hay tickets disponibles. ¡Crea uno nuevo!
          </v-alert>
        </template>
      </v-data-table>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="5000">
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
import { useForm, useField } from 'vee-validate';

import {
  crearTicket,
  obtenerTickets,
  actualizarTicket,
  eliminarTicket,
  obtenerEstados,
  obtenerPrioridades,
  obtenerEmpresas,
  obtenerTecnicos,
  obtenerCategorias,
  obtenerServicios,
  downloadTicketAttachment
} from '../services/ticketService';
import ConfirmDialog from '../components/Confirmardialogo.vue';

// --- Custom Validation Rules ---
const required = (value: any) => {
  if (value === null || value === undefined || value === '') {
    return 'Este campo es obligatorio.';
  }
  if (typeof value === 'number' && value <= 0) {
    return 'Selecciona una opción válida.';
  }
  return true;
};

const minLength = (value: string, min: number) => {
  if (!value || value.length < min) {
    return `Debe tener al menos ${min} caracteres.`;
  }
  return true;
};

const maxLength = (value: string, max: number) => {
  if (value && value.length > max) {
    return `No debe exceder los ${max} caracteres.`;
  }
  return true;
};

const composeRules = (...rules: ((value: any, ...args: any[]) => true | string)[]) => {
  return (value: any) => {
    for (const rule of rules) {
      const result = rule(value);
      if (result !== true) {
        return result;
      }
    }
    return true;
  };
};

// --- Form Initialization with VeeValidate ---
const { handleSubmit, resetForm, setValues, errors, meta, validate, setErrors } = useForm();

// --- Field Definitions using useField ---
const { value: titulo, errorMessage: tituloError, handleBlur: handleTituloBlur } = useField<string>(
  'titulo',
  composeRules((v: string) => required(v), (v: string) => minLength(v, 3), (v: string) => maxLength(v, 100)),
  { initialValue: '' }
);

const { value: descripcion, errorMessage: descripcionError, handleBlur: handleDescripcionBlur } = useField<string>(
  'descripcion',
  composeRules((v: string) => required(v), (v: string) => minLength(v, 5), (v: string) => maxLength(v, 1000)),
  { initialValue: '' }
);

const { value: estado_id, errorMessage: estadoIdError } = useField<number | null>(
  'estado_id',
  (v: any) => required(v),
  { initialValue: null }
);

const { value: prioridad_id, errorMessage: prioridadIdError } = useField<number | null>(
  'prioridad_id',
  (v: any) => required(v),
  { initialValue: null }
);

const { value: empresa_id, errorMessage: empresaIdError } = useField<number | null>(
  'empresa_id',
  (v: any) => required(v),
  { initialValue: null }
);

const { value: usuario_asignado_id, errorMessage: usuarioAsignadoIdError } = useField<number | null>(
  'usuario_asignado_id',
  (v: any) => required(v),
  { initialValue: null }
);

const { value: categoria_id, errorMessage: categoriaIdError } = useField<number | null>(
  'categoria_id',
  (v: any) => required(v),
  { initialValue: null }
);

const { value: servicio_id, errorMessage: servicioIdError } = useField<number | null>(
  'servicio_id',
  (v: any) => required(v),
  { initialValue: null }
);

// --- UI States ---
const isEditing = ref(false);
const editingTicketId = ref<number | null>(null);

// --- Attachment Handling ---
const archivoAdjunto = ref<File | null>(null);
const fileNameDisplay = ref('');
const existingFileName = ref<string | null>(null);
const clearExistingAttachment = ref(false);
const archivoAdjuntoError = ref('');

// --- Snackbar Messages ---
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});

// --- Lists for v-select (loaded from API) ---
const estados = ref<{ id: number; nombre: string }[]>([]);
const prioridades = ref<{ id: number; nombre: string }[]>([]);
const empresas = ref<{ id: number; nombre: string }[]>([]);
const usuariosAsignados = ref<{ id: number; nombreCompleto: string }[]>([]);
const categorias = ref<{ id: number; nombre: string }[]>([]);
const servicios = ref<{ id: number; nombre: string }[]>([]);

// --- Confirmation Modal Variables ---
const showConfirmDialog = ref(false);
const confirmDialogTitle = ref('');
const confirmDialogMessage = ref('');
const confirmDialogConfirmText = ref('');
const confirmDialogConfirmColor = ref('');
const currentAction = ref('');
const ticketToDeleteId = ref<number | null>(null);

/**
 * Preloads ticket data into the form for editing.
 * @param ticket The ticket object to edit.
 */
function editTicket(ticket: any) {
  isEditing.value = true;
  editingTicketId.value = ticket.id;

  titulo.value = ticket.titulo;
  descripcion.value = ticket.descripcion;
  estado_id.value = ticket.estado?.id || null;
  prioridad_id.value = ticket.prioridad?.id || null;
  empresa_id.value = ticket.empresa?.id || null;
  usuario_asignado_id.value = ticket.usuarioAsignado?.id || null;
  categoria_id.value = ticket.categoria?.id || null;
  servicio_id.value = ticket.servicio?.id || null;

  archivoAdjunto.value = null;
  fileNameDisplay.value = '';
  existingFileName.value = ticket.nombreArchivo || null;
  clearExistingAttachment.value = false;
  archivoAdjuntoError.value = '';
}

/**
 * Function executed when the form is submitted.
 * VeeValidate handles prior validation. If valid, the callback is executed.
 */
const onSubmit = handleSubmit(async (values) => {
  console.log('Form is valid, values:', values);

  if (isEditing.value) {
    confirmDialogTitle.value = 'Confirmar Actualización';
    confirmDialogMessage.value = '¿Estás seguro de que quieres actualizar este ticket?';
    confirmDialogConfirmText.value = 'Actualizar';
    confirmDialogConfirmColor.value = 'primary';
    currentAction.value = 'update';
  } else {
    confirmDialogTitle.value = 'Confirmar Creación';
    confirmDialogMessage.value = '¿Estás seguro de que quieres crear este ticket?';
    confirmDialogConfirmText.value = 'Crear';
    confirmDialogConfirmColor.value = 'success';
    currentAction.value = 'create';
  }
  showConfirmDialog.value = true;
});

/**
 * Executed when the user confirms an action in the modal.
 * Performs the CRUD operation (create, update, delete).
 */
async function handleConfirmAction() {
  snackbar.value.show = false;
  archivoAdjuntoError.value = '';

  const formValues = {
    titulo: titulo.value,
    descripcion: descripcion.value,
    estado_id: estado_id.value,
    prioridad_id: prioridad_id.value,
    empresa_id: empresa_id.value,
    usuario_asignado_id: usuario_asignado_id.value,
    categoria_id: categoria_id.value,
    servicio_id: servicio_id.value,
  };

  try {
    if (currentAction.value === 'create' || currentAction.value === 'update') {
      const formData = new FormData();
      formData.append('titulo', formValues.titulo as string);
      formData.append('descripcion', formValues.descripcion as string);

      formData.append('estado_id', formValues.estado_id !== null ? String(formValues.estado_id) : '');
      // CORRECCIÓN: Cambiado 'formcomes.prioridad_id' a 'formValues.prioridad_id'
      formData.append('prioridad_id', formValues.prioridad_id !== null ? String(formValues.prioridad_id) : '');
      formData.append('empresas_id', formValues.empresa_id !== null ? String(formValues.empresa_id) : '');

      if (formValues.usuario_asignado_id !== null && formValues.usuario_asignado_id > 0) {
        formData.append('usuario_asignado_id', String(formValues.usuario_asignado_id));
      } else if (formValues.usuario_asignado_id === null && isEditing.value) {
        formData.append('usuario_asignado_id', '');
      }

      if (formValues.categoria_id !== null && formValues.categoria_id > 0) {
        formData.append('categoria_id', String(formValues.categoria_id));
      } else if (formValues.categoria_id === null && isEditing.value) {
        formData.append('categoria_id', '');
      }

      if (formValues.servicio_id !== null && formValues.servicio_id > 0) {
        formData.append('servicio_id', String(formValues.servicio_id));
      } else if (formValues.servicio_id === null && isEditing.value) {
        formData.append('servicio_id', '');
      }

      if (archivoAdjunto.value) {
        formData.append('archivo_adjunto', archivoAdjunto.value);
      } else if (isEditing.value && clearExistingAttachment.value) {
        formData.append('clear_adjunto', 'true');
      }

      if (currentAction.value === 'create') {
        const nuevoTicket = await crearTicket(formData);
        tickets.value.unshift(nuevoTicket);
        sortBy.value = [{ key: 'id', order: 'desc' }];
        snackbar.value = { show: true, message: 'Ticket creado exitosamente.', color: 'success' };
      } else if (currentAction.value === 'update') {
        const actualizado = await actualizarTicket(editingTicketId.value!, formData);
        const index = tickets.value.findIndex(t => t.id === editingTicketId.value);
        if (index !== -1) {
          tickets.value[index] = actualizado;
        }
        await cargarTickets();
        snackbar.value = { show: true, message: 'Ticket actualizado correctamente.', color: 'success' };
      }
    } else if (currentAction.value === 'delete') {
      if (ticketToDeleteId.value !== null) {
        await eliminarTicket(ticketToDeleteId.value);
        tickets.value = tickets.value.filter(t => t.id !== ticketToDeleteId.value);
        await cargarTickets();
        snackbar.value = { show: true, message: 'Ticket eliminado correctamente.', color: 'success' };
      }
    }
    resetFormAndState();
  } catch (err: any) {
    console.error('Error during ticket operation:', err);
    let messageToDisplay = 'Error al procesar la operación del ticket.';
    let backendErrors: { [key: string]: string } = {};

    if (err.message && err.message.startsWith('{') && err.message.endsWith('}')) {
      try {
        const errorObj = JSON.parse(err.message);
        if (errorObj.errors && Array.isArray(errorObj.errors)) {
          messageToDisplay = 'Se encontraron errores de validación del servidor. Por favor, revisa los campos marcados.';
          errorObj.errors.forEach((error: any) => {
            const fieldName = error.field === 'empresas_id' ? 'empresa_id' : error.field;
            backendErrors[fieldName] = error.message;

            if (fieldName === 'archivo_adjunto') {
              archivoAdjuntoError.value = error.message;
            }
          });
          setErrors(backendErrors);
        } else if (errorObj.message) {
          messageToDisplay = errorObj.message;
        }
      } catch (parseError) {
        messageToDisplay = err.message;
      }
    } else {
      messageToDisplay = err.message || 'Error desconocido al procesar la operación del ticket.';
    }

    snackbar.value = { show: true, message: messageToDisplay, color: 'error' };
  } finally {
    showConfirmDialog.value = false;
    currentAction.value = '';
  }
}

/**
 * Resets the form and editing state, including VeeValidate.
 */
function resetFormAndState() {
  resetForm();

  isEditing.value = false;
  editingTicketId.value = null;
  ticketToDeleteId.value = null;

  archivoAdjunto.value = null;
  fileNameDisplay.value = '';
  existingFileName.value = null;
  clearExistingAttachment.value = false;
  archivoAdjuntoError.value = '';
}

// --- Ticket Table State and Logic ---
const tickets = ref<any[]>([]);
const search = ref('');
type MySortItem = {
  key: string;
  order: boolean | 'asc' | 'desc' | undefined;
};
const sortBy = ref<MySortItem[]>([{ key: 'id', order: 'desc' }]);
const sortDesc = ref(false); // Mantener sortDesc para compatibilidad, aunque Vuetify 3 usa `order` en `sortBy`

const headers = [
  { title: 'ID', key: 'id', sortable: false }, // CAMBIO: sortable: false para quitar la flecha
  { title: 'Asunto', key: 'titulo', sortable: true }, // Ahora sortable: true
  { title: 'Empresa', key: 'empresa.nombre', sortable: true }, // Ahora sortable: true
  { title: 'Prioridad', key: 'prioridad.nombre', sortable: true }, // Ahora sortable: true
  { title: 'Estado', key: 'estado.nombre', sortable: true }, // Ahora sortable: true
  { title: 'Técnico', key: 'usuarioAsignado.nombreCompleto', sortable: true }, // Ahora sortable: true
  { title: 'Adjunto', key: 'nombreArchivo', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false },
];

const sortByIdAsc = () => {
  sortBy.value = [{ key: 'id', order: 'asc' }];
};

const sortByIdDesc = () => {
  sortBy.value = [{ key: 'id', order: 'desc' }];
};

async function cargarTickets() {
  try {
    tickets.value = await obtenerTickets();
  } catch (err: any) {
    snackbar.value = {
      show: true,
      message: err.message || 'Error al cargar tickets',
      color: 'error',
    };
  }
}

async function cargarListasReferencia() {
  try {
    estados.value = await obtenerEstados();
    prioridades.value = await obtenerPrioridades();
    empresas.value = await obtenerEmpresas();
    usuariosAsignados.value = await obtenerTecnicos();
    categorias.value = await obtenerCategorias();
    servicios.value = await obtenerServicios();
    console.log('Estados cargados:', estados.value);
    console.log('Prioridades cargadas:', prioridades.value);
    console.log('Empresas cargadas:', empresas.value);
  } catch (error: any) {
    console.error('Error al cargar listas de referencia:', error);
    snackbar.value = { show: true, message: error.message || 'Error al cargar opciones de filtro.', color: 'error' };
  }
}

const filteredTickets = computed(() => {
  let items = [...tickets.value]; // Crear una copia para poder ordenar sin mutar el original

  // Aplicar el filtro de búsqueda
  if (search.value) {
    const searchTerm = search.value.toLowerCase().trim();
    items = items.filter((t) =>
      String(t.id).toLowerCase().includes(searchTerm) ||
      t.titulo.toLowerCase().includes(searchTerm) ||
      (t.empresa?.nombre || '').toLowerCase().includes(searchTerm) ||
      (t.prioridad?.nombre || '').toLowerCase().includes(searchTerm) ||
      (t.estado?.nombre || '').toLowerCase().includes(searchTerm) ||
      (t.usuarioAsignado?.nombreCompleto || '').toLowerCase().includes(searchTerm) ||
      (t.nombreArchivo || '').toLowerCase().includes(searchTerm)
    );
  }

  // Aplicar el ordenamiento
  if (sortBy.value && sortBy.value.length > 0) {
    const sortKey = sortBy.value[0].key;
    const sortOrder = sortBy.value[0].order;

    items.sort((a, b) => {
      let valA = getValueByKey(a, sortKey);
      let valB = getValueByKey(b, sortKey);

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

// Helper function to get nested object values (copied from project-management-table as it's useful here too)
function getValueByKey(obj: any, key: string): any {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

function handleDeleteTicket(id: number) {
  ticketToDeleteId.value = id;
  confirmDialogTitle.value = 'Confirmar Eliminación';
  confirmDialogMessage.value = '¿Estás seguro de que quieres eliminar este ticket? Esta acción es irreversible.';
  confirmDialogConfirmText.value = 'Eliminar';
  confirmDialogConfirmColor.value = 'error';
  currentAction.value = 'delete';
  showConfirmDialog.value = true;
}

function handleCancelAction() {
  ticketToDeleteId.value = null;
  currentAction.value = '';
  resetFormAndState();
}

// Functions to handle file attachment
const fileInputRef = ref<HTMLInputElement | null>(null);

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileChange(event: Event) {
  archivoAdjuntoError.value = '';
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension && allowedExtensions.includes(fileExtension)) {
      if (file.size <= 5 * 1024 * 1024) { // 5 MB in bytes
        archivoAdjunto.value = file;
        fileNameDisplay.value = archivoAdjunto.value.name;
        clearExistingAttachment.value = false;
        archivoAdjuntoError.value = '';
      } else {
        snackbar.value = { show: true, message: 'El archivo es demasiado grande (máx. 5MB).', color: 'warning' };
        archivoAdjuntoError.value = 'El archivo es demasiado grande (máx. 5MB).';
        clearSelectedFile();
      }
    } else {
      snackbar.value = { show: true, message: 'Tipo de archivo no permitido. Solo se aceptan imágenes, PDF, y documentos de Office.', color: 'warning' };
      archivoAdjuntoError.value = 'Tipo de archivo no permitido.';
      clearSelectedFile();
    }
  } else {
    archivoAdjunto.value = null;
    fileNameDisplay.value = '';
    archivoAdjuntoError.value = '';
  }
}

function clearSelectedFile() {
  archivoAdjunto.value = null;
  fileNameDisplay.value = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
  archivoAdjuntoError.value = '';
}

function removeExistingAttachment() {
  existingFileName.value = null;
  clearExistingAttachment.value = true;
  clearSelectedFile();
}

async function downloadAttachment(ticketId: number) {
  try {
    await downloadTicketAttachment(ticketId);
  } catch (error: any) {
    snackbar.value = { show: true, message: error.message || 'Error al descargar el archivo.', color: 'error' };
  }
}

// --- Lifecycle Hooks ---
onMounted(async () => {
  await cargarTickets();
  await cargarListasReferencia();
  sortByIdDesc(); // Por defecto, mostrar los más recientes

  watch(errors, (newErrors) => {
    console.log('VeeValidate errors updated:', newErrors);
  }, { deep: true });
});
</script>

<style scoped>
.form {
  padding: 1rem;
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
