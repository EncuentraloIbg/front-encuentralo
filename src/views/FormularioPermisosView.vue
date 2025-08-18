<template>
  <v-container class="py-5">
    <v-card class="mb-5" outlined>
      <v-card-title class="text-h5 text-center">
        Formulario de {{ isEditing ? 'Actualización' : 'Asignación' }} de Permisos
      </v-card-title>
      <v-card-text>
        <v-form ref="formularioAsignacion" @submit.prevent="handleSubmit">
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="rolSeleccionado"
                :items="roles"
                label="Selecciona un rol"
                item-title="nombre"
                item-value="id"
                variant="outlined"
                density="compact"
                required
                :loading="cargandoRoles"
                :readonly="isEditing"
                :rules="[v => !!v || 'Rol es requerido']"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="itemSeleccionado"
                :items="items"
                label="Selecciona un Ítem"
                item-title="nombre"
                item-value="id"
                variant="outlined"
                density="compact"
                required
                :loading="cargandoItems"
                :readonly="isEditing"
                :rules="[v => !!v || 'Ítem es requerido']"
              />
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="permisosSeleccionados"
                :items="permisos"
                color="success"
                label="Permisos"
                item-title="nombre"
                item-value="id"
                variant="outlined"
                density="compact"
                multiple
                chips
                clearable
                required
                :loading="cargandoPermisos"
                :rules="[v => (v && v.length > 0) || 'Permisos son requeridos']"
              />
            </v-col>
          </v-row>

          <v-btn color="primary" type="submit" :loading="enviandoFormulario">
            {{ isEditing ? 'ACTUALIZAR' : 'Asignar Permisos' }}
          </v-btn>
          <v-btn
            v-if="isEditing"
            color="grey-darken-1"
            class="ml-2"
            @click="clearFormAndDeselect"
            :disabled="enviandoFormulario"
          >
            CANCELAR
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card outlined>
      <v-card-title class="text-h6">Asignaciones Existentes</v-card-title>

      <v-row align="center" class="px-4 pb-4">
        <v-col cols="12" sm="6" md="5" lg="4">
          <v-text-field v-model="search" label="Buscar permiso" prepend-inner-icon="mdi-magnify" outlined dense hide-details />
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
        :headers="headersAsignaciones"
        :items="filteredAsignaciones"
        item-value="id"
        v-model:sort-by="sortBy"
        :loading="cargandoAsignaciones"
        loading-text="Cargando..."
        no-data-text="No hay asignaciones"
        class="elevation-1"
      >
        <template v-slot:item.id="{ item }">
          <!-- Muestra solo el ID del rol en la columna 'ID' -->
          {{ item.rol.id }}
        </template>
        <template v-slot:[`item.permisosAgrupados`]="{ item }">
          <div v-if="item.permisosAgrupados && item.permisosAgrupados.length > 0">
            {{ item.permisosAgrupados.map(permiso => permiso.nombre).join(', ') }}
          </div>
          <div v-else>
            N/A
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon class="mr-2" @click="editAssignment(item)">
            <v-icon :color="selectedAssignmentId === item.id ? 'primary' : 'blue'">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="eliminarAsignacion(item)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>

    <v-dialog v-model="showConfirmDialog" max-width="550px">
      <v-card>
        <v-card-title class="headline">Confirmar Acción</v-card-title>
        <v-card-text>
          ¿Está seguro de que desea {{ dialogAction === 'update' ? 'actualizar' : dialogAction === 'delete' ? 'eliminar' : 'asignar' }} los permisos para el Rol:
          {{ itemToConfirm?.rol?.nombre || 'N/A' }} e Ítem: {{ itemToConfirm?.item?.nombre || 'N/A' }}?

          <template v-if="dialogAction === 'update' || dialogAction === 'assign'">
              <div class="mt-4">Permisos a Guardar:</div>
              <v-chip
                v-for="permisoId in permisosSeleccionados"
                :key="permisoId"
                class="ma-1"
                :color="dialogAction === 'update' ? 'black-lighten-4' : 'black-lighten-4'"
                density="comfortable"
              >
                {{ getPermisoNombreById(permisoId) }}
              </v-chip>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" text @click="showConfirmDialog = false">Cancelar</v-btn>
          <v-btn color="primary" text @click="executeConfirmedAction">Confirmar</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, toRaw} from 'vue';
import PermisosService, { type Rol, type Item, type Permiso, type Asignacion } from '@/services/PermisosService';

// Variables reactivas
const rolSeleccionado = ref<number | null>(null);
const itemSeleccionado = ref<number | null>(null);
const permisosSeleccionados = ref<number[]>([]);

const roles = ref<Rol[]>([]);
const items = ref<Item[]>([]);
const permisos = ref<Permiso[]>([]);
const asignaciones = ref<Asignacion[]>([]);

const cargandoRoles = ref(false);
const cargandoItems = ref(false);
const cargandoPermisos = ref(false);
const cargandoAsignaciones = ref(false);
const enviandoFormulario = ref(false);

const isEditing = ref(false);
const selectedAssignmentId = ref<string | null>(null);

const showConfirmDialog = ref(false);
const itemToConfirm = ref<any>(null);
const dialogAction = ref<'update' | 'delete' | 'assign' | ''>('');
const formularioAsignacion = ref<any>(null);

// Tipo para sortBy, consistente con Vuetify v-data-table
type MySortItem = {
  key: string;
  order: boolean | 'asc' | 'desc' | undefined;
};

// Ordenación por defecto para la tabla (se controla por los botones del template)
const sortBy = ref<MySortItem[]>([{ key: 'id', order: 'asc' }]);


const filteredAsignaciones = computed(() => {
  const searchTerm = search.value.trim().toLowerCase();
  let filtered = groupedAssignments.value.filter((item) => {
    return (
      item.rolNombre.toLowerCase().includes(searchTerm) ||
      item.itemNombre.toLowerCase().includes(searchTerm) ||
      item.permisosAgrupados.some((permiso) =>
        permiso.nombre.toLowerCase().includes(searchTerm)
      )
    );
  });

  // Aplicar el ordenamiento
  if (sortBy.value && sortBy.value.length > 0) {
    const sortKey = sortBy.value[0].key;
    const sortOrder = sortBy.value[0].order;

    filtered.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortKey === 'rolNombre') {
        valA = a.rolNombre;
        valB = b.rolNombre;
      } else if (sortKey === 'itemNombre') {
        valA = a.itemNombre;
        valB = b.itemNombre;
      } else if (sortKey === 'id') {
        // Para ordenar por la parte numérica del ID compuesto (rolId-itemId)
        valA = parseInt(a.id.split('-')[0]);
        valB = parseInt(b.id.split('-')[0]);
        if (valA === valB) {
            valA = parseInt(a.id.split('-')[1]);
            valB = parseInt(b.id.split('-')[1]);
        }
      } else {
        // Fallback para otras claves si fuera necesario
        valA = (a as any)[sortKey];
        valB = (b as any)[sortKey];
      }

      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' ? (valA - valB) : (valB - valA);
      }
    });
  }

  return filtered;
});


const sortByIdAsc = () => {
    sortBy.value = [{ key: 'id', order: 'asc' }];
};

const sortByIdDesc = () => {
    sortBy.value = [{ key: 'id', order: 'desc' }];
};

const search = ref('');

const snackbar = ref({
  show: false,
  message: '',
  color: '',
  timeout: 3000,
});


const headersAsignaciones = [
  { title: 'ID', key: 'id', sortable: false }, // Agregado y con sortable: false
  { title: 'Rol', key: 'rolNombre', sortable: false }, // CAMBIO: sortable: false
  { title: 'Ítem', key: 'itemNombre', sortable: false }, // CAMBIO: sortable: false
  { title: 'Permiso', key: 'permisosAgrupados', sortable: false},
  { title: 'Acciones', key: 'actions', sortable: false }
];

const groupedAssignments = computed(() => {
  const groups = new Map<string, {
    id: string; // 'rolId-itemId'
    rol: Rol;
    item: Item;
    rolNombre: string;
    itemNombre: string;
    permisosAgrupados: Permiso[];
    originalAsignacionesIds: number[];
  }>();

  asignaciones.value.forEach(asignacion => {
    // Asegúrate de que las propiedades anidadas existen
    if (!asignacion.rol || !asignacion.rol.id || !asignacion.rol.nombre ||
        !asignacion.item || !asignacion.item.id || !asignacion.item.nombre ||
        !asignacion.permiso || !asignacion.permiso.id || !asignacion.permiso.nombre) {
        console.warn('Asignación con datos incompletos omitida:', asignacion);
        return; // Omitir asignaciones malformadas
    }
    const key = `${asignacion.rol.id}-${asignacion.item.id}`;

    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        rol: asignacion.rol,
        item: asignacion.item,
        rolNombre: asignacion.rol.nombre,
        itemNombre: asignacion.item.nombre,
        permisosAgrupados: [],
        originalAsignacionesIds: [],
      });
    }
    const group = groups.get(key)!;

    if (!group.permisosAgrupados.some(p => p.id === asignacion.permiso.id)) {
        group.permisosAgrupados.push(asignacion.permiso);
    }
    group.originalAsignacionesIds.push(asignacion.id);
  });

  const result = Array.from(groups.values()).map(group => ({
    ...group,
    permisosAgrupados: group.permisosAgrupados.sort((a, b) => a.nombre.localeCompare(b.nombre)),
  }));
  return result;
});

const getPermisoNombreById = (id: number) => {
  const permiso = permisos.value.find(p => p.id === id);
  return permiso ? permiso.nombre : `ID: ${id}`;
};

onMounted(async () => {
  await Promise.all([
    cargarRoles(),
    cargarItems(),
    cargarPermisos(),
    cargarAsignaciones(),
    sortByIdAsc()
  ]);
});

async function cargarRoles() {
  cargandoRoles.value = true;
  try {
    roles.value = await PermisosService.obtenerRoles();
  } catch (error: any) {
    console.error('Error al cargar roles:', error);
    snackbar.value = { show: true, message: `Error al cargar roles: ${error.message || 'Error desconocido'}`, color: 'error', timeout: 3000 };
  } finally {
    cargandoRoles.value = false;
  }
}

async function cargarItems() {
  cargandoItems.value = true;
  try {
    items.value = await PermisosService.obtenerItems();
  } catch (error: any) {
    console.error('Error al cargar items:', error);
    snackbar.value = { show: true, message: `Error al cargar ítems: ${error.message || 'Error desconocido'}`, color: 'error', timeout: 3000 };
  } finally {
    cargandoItems.value = false;
  }
}

async function cargarPermisos() {
  cargandoPermisos.value = true;
  try {
    permisos.value = await PermisosService.obtenerPermisos();
  } catch (error: any) {
    console.error('Error al cargar permisos:', error);
    snackbar.value = { show: true, message: `Error al cargar permisos: ${error.message || 'Error desconocido'}`, color: 'error', timeout: 3000 };
  } finally {
    cargandoPermisos.value = false;
  }
}

async function cargarAsignaciones() {
  cargandoAsignaciones.value = true;
  try {
    asignaciones.value = await PermisosService.obtenerAsignaciones();
  } catch (error: any) {
    console.error('Error al cargar asignaciones:', error);
    snackbar.value = { show: true, message: `Error al cargar asignaciones: ${error.message || 'Error desconocido'}`, color: 'error', timeout: 3000 };
  } finally {
    cargandoAsignaciones.value = false;
  }
}

async function handleSubmit() {
  const { valid } = await (formularioAsignacion.value as any).validate();
  if (!valid) {
    snackbar.value = { show: true, message: 'Por favor, completa todos los campos requeridos.', color: 'warning', timeout: 3000 };
    return;
  }

  itemToConfirm.value = {
    rol: roles.value.find(r => r.id === rolSeleccionado.value),
    item: items.value.find(i => i.id === itemSeleccionado.value),
    permisosIds: permisosSeleccionados.value,
  };

  dialogAction.value = isEditing.value ? 'update' : 'assign';
  showConfirmDialog.value = true;
}

async function executeConfirmedAction() {
    showConfirmDialog.value = false;
    enviandoFormulario.value = true;

    try {
        if (dialogAction.value === 'assign') {
            const dataToAssign = {
                rolId: rolSeleccionado.value as number,
                itemId: itemSeleccionado.value as number,
                permisosIds: [...permisosSeleccionados.value], // Copia para asegurar array plano
            };
            await PermisosService.asignarPermisosRolItem(dataToAssign);
            snackbar.value = { show: true, message: 'Permisos asignados exitosamente!', color: 'success', timeout: 3000 };
            clearFormAndDeselect();
            sortByIdDesc();

        } else if (dialogAction.value === 'update') {
            const dataToUpdate = {
                rolId: rolSeleccionado.value as number,
                itemId: itemSeleccionado.value as number,
                permisosIds: [...permisosSeleccionados.value], // Copia para asegurar array plano
            };
            await PermisosService.actualizarPermisosRolItem(dataToUpdate);
            snackbar.value = { show: true, message: 'Permisos actualizados exitosamente!', color: 'success', timeout: 3000 };
            clearFormAndDeselect();
            sortByIdAsc();

        } else if (dialogAction.value === 'delete') {
            // La eliminación no envía permisosIds, así que no necesita el cambio
            await PermisosService.eliminarAsignacionesPorRolItem(
                itemToConfirm.value.rol.id,
                itemToConfirm.value.item.id
            );
            snackbar.value = { show: true, message: 'Asignación eliminada exitosamente!', color: 'info', timeout: 3000 };
            clearFormAndDeselect();
            sortByIdAsc();
        }

        await cargarAsignaciones();

    } catch (err: any) {
        console.error("Error en la operación:", err);
        snackbar.value = { show: true, message: `Error: ${err.message || 'Ocurrió un error inesperado.'}`, color: 'error', timeout: 5000 };
    } finally {
        enviandoFormulario.value = false;
    }
}

function eliminarAsignacion(item: any) {
  itemToConfirm.value = item;
  dialogAction.value = 'delete';
  showConfirmDialog.value = true;
}

function editAssignment(groupedItem: any) {
  // Asegúrate de que groupedItem y sus propiedades existen antes de usarlos
  if (groupedItem &&
        groupedItem.rol && typeof groupedItem.rol === 'object' && groupedItem.rol.id !== null && groupedItem.rol.id !== undefined &&
        groupedItem.item && typeof groupedItem.item === 'object' && groupedItem.item.id !== null && groupedItem.item.id !== undefined &&
        groupedItem.permisosAgrupados && Array.isArray(groupedItem.permisosAgrupados)
    ) {
      rolSeleccionado.value = groupedItem.rol.id;
      itemSeleccionado.value = groupedItem.item.id;
      permisosSeleccionados.value = groupedItem.permisosAgrupados.map((p: Permiso) => toRaw(p).id);

    isEditing.value = true;
    selectedAssignmentId.value = groupedItem.id;
  } else {
    console.warn('Intento de editar una asignación con datos incompletos:', groupedItem);
    snackbar.value = { show: true, message: 'No se pudo cargar la asignación para editar. Datos incompletos.', color: 'warning', timeout: 3000 };
    return;
  }
}

function clearFormAndDeselect() {
  rolSeleccionado.value = null;
  itemSeleccionado.value = null;
  permisosSeleccionados.value = [];
  isEditing.value = false;
  selectedAssignmentId.value = null;
  (formularioAsignacion.value as any)?.resetValidation();
}

watch(rolSeleccionado, (newVal, oldVal) => {
    if (!isEditing.value && newVal !== oldVal) {
        permisosSeleccionados.value = [];
    }
});

watch(itemSeleccionado, (newVal, oldVal) => {
    if (!isEditing.value && newVal !== oldVal) {
        permisosSeleccionados.value = [];
    }
});
</script>

<style scoped>
.selected-row {
  background-color: rgba(var(--v-theme-primary), 0.1);
  transition: background-color 0.3s ease;
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

/* Estilos para los títulos de las tarjetas */
.text-h5, .text-h6 {
  color: #1976D2;
  font-weight: bold;
}
</style>
