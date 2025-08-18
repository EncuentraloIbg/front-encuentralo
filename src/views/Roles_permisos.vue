<template>
    <v-container class="py-5">
        <v-card class="mb-5" outlined>
            <v-card-title class="text-h5 text-center"> Gestión de Asignación de Permisos </v-card-title>

            <v-card-text>
                <v-form @submit.prevent="submitForm" class="form" style="color: black">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="selectedRolId"
                                :items="roles"
                                item-title="nombre"
                                item-value="id"
                                label="Seleccionar Rol"
                                :rules="[v => v !== null || 'Rol es requerido']"
                                required
                                variant="outlined"
                                :disabled="!!editingAssignment" ></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="selectedItem"
                                :items="items"
                                item-title="nombre"
                                item-value="id"
                                label="Seleccionar Ítem Específico (Opcional)"
                                clearable
                                variant="outlined"
                            ></v-select>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12" md="6">
                            <v-card class="pa-4 elevation-1">
                                <v-card-title class="text-subtitle1">Permisos Generales:</v-card-title>
                                <v-list dense>
                                    <v-list-item v-for="permiso in permisos" :key="permiso.id">
                                        <v-checkbox
                                            v-model="selectedPermisos"
                                            :label="permiso.nombre"
                                            :value="permiso.id"
                                            hide-details
                                            density="compact"
                                        ></v-checkbox>
                                    </v-list-item>
                                </v-list>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-card class="pa-4 elevation-1">
                                <v-card-title class="text-subtitle1">Vistas Asignables (Permiso 'leer' a estas Vistas):</v-card-title>
                                <v-list dense>
                                    <v-list-item v-for="item in items" :key="item.id">
                                        <v-checkbox
                                            v-model="selectedVistas"
                                            :label="item.nombre"
                                            :value="item.id"
                                            hide-details
                                            density="compact"
                                        ></v-checkbox>
                                    </v-list-item>
                                </v-list>
                            </v-card>
                        </v-col>
                    </v-row>

                    <v-row class="mt-4">
                        <v-col class="d-flex justify-start">
                            <v-btn color="grey" text @click="resetForm" class="mr-2">
                                {{ editingAssignment ? 'Cancelar Edición' : 'Limpiar Formulario' }}
                            </v-btn>
                            <v-btn color="primary" type="submit">
                                {{ editingAssignment ? 'Actualizar Asignación' : 'Asignar Permisos' }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>

        <v-card outlined>
            <v-card-title class="text-h6">
                Asignaciones Existentes para el Rol Seleccionado
            </v-card-title>
            
            <v-row align="center" class="px-4 pb-4">
                <v-col cols="12" sm="6" md="5" lg="4"> 
                    <v-text-field 
                        v-model="search" 
                        label="Buscar asignaciones" 
                        prepend-inner-icon="mdi-magnify" 
                        outlined 
                        dense 
                        hide-details 
                    />
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
                :items="filteredAsignaciones"
                item-value="id"
                class="elevation-1"
                :loading="loadingAsignaciones"
                loading-text="Cargando asignaciones..."
                :no-data-text="noDataText"
                v-model:sort-by="sortBy"
            >
                <template v-slot:item.rol="{ item }">
                    {{ item.rol ? item.rol.nombre : 'N/A' }}
                </template>
                <template v-slot:item.item="{ item }">
                    {{ item.item ? item.item.nombre : 'Global' }}
                </template>
                <template v-slot:item.permiso="{ item }">
                    {{ item.permiso ? item.permiso.nombre : 'N/A' }}
                </template>

                <template v-slot:item.acciones="{ item }">
                    <v-btn icon @click="editAsignacion(item)" class="mr-1">
                        <v-icon color="blue">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon @click="deleteAsignacionConfirm(item)">
                        <v-icon color="red">mdi-delete</v-icon>
                    </v-btn>
                </template>
            </v-data-table>
        </v-card>

        <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
                <v-card-title class="text-h5 text-center">¿Estás seguro de eliminar esta asignación?</v-card-title>
                <v-card-text class="text-center">Esta acción no se puede deshacer.</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancelar</v-btn>
                    <v-btn color="red-darken-1" variant="text" @click="deleteAsignacionConfirmado">Eliminar</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar
            v-model="showAlertMessage"
            :color="alertType"
            timeout="3000"
        >
            {{ alertMessage }}
            <template #actions>
                <v-btn text @click="showAlertMessage = false">Cerrar</v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
// Asegúrate de que la ruta sea correcta según tu estructura de carpetas
import RolesPermisosService, { Rol, Permiso, Item, AsignacionPermiso, CreateAsignacionData } from '../services/Roles_permisosService';

// --- Variables Reactivas del Formulario ---
const roles = ref<Rol[]>([]);
const permisos = ref<Permiso[]>([]);
const items = ref<Item[]>([]); // Representa las "vistas" o módulos asignables

const selectedRolId = ref<number | null>(null);
const selectedPermisos = ref<number[]>([]); // Para IDs de permisos generales (crear, eliminar, etc.)
const selectedVistas = ref<number[]>([]); // Para IDs de ítems (vistas) que se les dará el permiso 'leer'
const selectedItem = ref<Item | null>(null); // Para seleccionar un ítem específico en el formulario (si aplica a un permiso)

// --- Variables para la Edición ---
const editingAssignment = ref<AsignacionPermiso | null>(null); // Almacena la asignación que se está editando

// --- Variables de la Tabla ---
const asignaciones = ref<AsignacionPermiso[]>([]);
const loadingAsignaciones = ref(false);
const search = ref(''); // Para el filtro de búsqueda en la tabla

// Ordenación por defecto para la tabla
type MySortItem = {
    key: string
    order: boolean | 'asc' | 'desc' | undefined
}
const sortBy = ref<MySortItem[]>([{ key: 'id', order: 'asc' }]); 

// Headers de la tabla
const headers = [
    { title: 'ID', key: 'id', sortable: false }, // CAMBIO: sortable: false para quitar la flecha
    { title: 'Rol', key: 'rol.nombre', sortable: true }, // Ahora sortable: true
    { title: 'Permiso', key: 'permiso.nombre', sortable: true }, // Ahora sortable: true
    { title: 'Ítem', key: 'item.nombre', sortable: true }, // Ahora sortable: true
    { title: 'Acciones', key: 'acciones', sortable: false },
];

// --- Variables del Diálogo de Eliminación ---
const dialogDelete = ref(false);
const itemToDelete = ref<AsignacionPermiso | null>(null);

// --- Variables de Alertas (Snackbar) ---
const showAlertMessage = ref(false);
const alertMessage = ref('');
const alertType = ref<'success' | 'error' | 'info'>('info');

// --- Propiedades Computadas ---
const noDataText = computed(() => {
    if (selectedRolId.value === null) {
        return 'Selecciona un rol para ver sus asignaciones.';
    }
    if (!loadingAsignaciones.value && asignaciones.value.length === 0 && search.value === '') {
        return 'No hay asignaciones para el rol seleccionado.';
    }
    if (!loadingAsignaciones.value && filteredAsignaciones.value.length === 0 && search.value !== '') {
        return 'No se encontraron asignaciones que coincidan con la búsqueda.';
    }
    return 'No hay datos disponibles.'; // Fallback general
});

const filteredAsignaciones = computed(() => {
    let items = [...asignaciones.value]; // Crear una copia para ordenar

    if (!search.value) {
        return items;
    }
    const lowerCaseSearch = search.value.toLowerCase();
    items = items.filter(asignacion =>
        (asignacion.rol?.nombre || '').toLowerCase().includes(lowerCaseSearch) ||
        (asignacion.item?.nombre || 'global').toLowerCase().includes(lowerCaseSearch) || 
        (asignacion.permiso?.nombre || '').toLowerCase().includes(lowerCaseSearch)
    );

    // Aplicar el ordenamiento (copiado de otras vistas para consistencia)
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

// Helper function to get nested object values
function getValueByKey(obj: any, key: string): any {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

// --- Funciones de Utilidad y Alertas ---
const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
    alertMessage.value = message;
    alertType.value = type;
    showAlertMessage.value = true;
};

// --- Funciones de Carga de Datos Maestros ---
const fetchRoles = async () => {
    try {
        roles.value = await RolesPermisosService.getRoles();
        // Intenta seleccionar el primer rol por defecto si no hay ninguno seleccionado
        if (roles.value.length > 0 && selectedRolId.value === null) {
            selectedRolId.value = roles.value[0].id;
        }
    } catch (error) {
        console.error('Error al cargar roles:', error);
        showAlert('Error al cargar los roles.', 'error');
    }
};

const fetchPermisos = async () => {
    try {
        permisos.value = await RolesPermisosService.getPermisos();
    } catch (error) {
        console.error('Error al cargar permisos:', error);
        showAlert('Error al cargar los permisos.', 'error');
    }
};

const fetchItems = async () => {
    try {
        items.value = await RolesPermisosService.getItems();
    } catch (error) {
        console.error('Error al cargar ítems:', error);
        showAlert('Error al cargar los ítems.', 'error');
    }
};

// --- Función para cargar asignaciones por Rol ---
const fetchAsignacionesPorRol = async (rolId: number) => {
    loadingAsignaciones.value = true;
    asignaciones.value = []; // Vacía la tabla antes de cargar
    try {
        const fetchedAsignaciones = await RolesPermisosService.getAsignacionesPorRol(rolId);
        asignaciones.value = fetchedAsignaciones;
    } catch (error) {
        console.error('Error al cargar asignaciones por rol:', error);
        showAlert('Error al cargar asignaciones de permisos para el rol seleccionado.', 'error');
    } finally {
        loadingAsignaciones.value = false;
    }
};

// --- Lógica del Formulario (Crear y Actualizar) ---
const submitForm = async () => {
    if (selectedRolId.value === null) {
        showAlert('Por favor, selecciona un rol.', 'error');
        return;
    }

    // Validación para asegurarse de que al menos un permiso o vista esté seleccionado
    // Esta validación se aplica a la creación y a la actualización si resultaría en una asignación vacía
    if (!editingAssignment.value && selectedPermisos.value.length === 0 && selectedVistas.value.length === 0) {
        showAlert('Debes seleccionar al menos un permiso o una vista para crear una asignación.', 'error');
        return;
    }
    
    // Obtener el ID del ítem seleccionado en el v-select (para un permiso específico de ítem)
    const itemIdFromSelect = selectedItem.value ? selectedItem.value.id : null;

    // Crear el objeto de datos que se enviará al servicio.
    // Tu backend espera `selectedPermisos` y `selectedVistas` como arrays.
    const dataToSend: CreateAsignacionData = {
        rolId: selectedRolId.value,
        itemId: itemIdFromSelect, // Este es el itemId general para el formulario, no solo para vistas
        selectedPermisos: [...selectedPermisos.value], 
        selectedVistas: [...selectedVistas.value],     
    };

    try {
        if (editingAssignment.value) {
            // --- Lógica de Actualización (Eliminar la original y luego Crear la nueva/modificada) ---
            const originalAssignment = editingAssignment.value;

            // 1. Eliminar la asignación original
            // Asegurarse de que `itemIdForDeletion` sea 'null' string si es null
            const originalItemIdForDeletion = originalAssignment.item_id === null ? 'null' : originalAssignment.item_id;
            
            console.log('DEBUG: Eliminando asignación original para actualización:', {
                rol_id: originalAssignment.rol_id,
                permiso_id: originalAssignment.permiso_id,
                item_id: originalItemIdForDeletion
            });

            await RolesPermisosService.deleteAsignacion(
                originalAssignment.rol_id,
                originalAssignment.permiso_id,
                originalItemIdForDeletion
            );
            
            // 2. Si hay nuevas selecciones en el formulario, crear las nuevas asignaciones.
            // La lógica aquí es más simple: si el formulario tiene algo seleccionado, se envía.
            if (dataToSend.selectedPermisos.length > 0 || dataToSend.selectedVistas.length > 0) {
                console.log('DEBUG: Creando nueva asignación después de eliminar la original:', dataToSend);
                await RolesPermisosService.createAsignacion(dataToSend);
                showAlert('Asignación actualizada exitosamente.', 'success');
            } else {
                // Si no se seleccionó nada nuevo después de eliminar la original, se considera una eliminación efectiva
                showAlert('Asignación eliminada exitosamente (no se seleccionaron nuevos permisos/vistas).', 'success');
            }
            
            editingAssignment.value = null; // Salir del modo edición
            
        } else {
            // --- Lógica de Creación de Nueva Asignación ---
            console.log('DEBUG: Creando nueva asignación:', dataToSend);
            await RolesPermisosService.createAsignacion(dataToSend);
            showAlert('Asignaciones guardadas exitosamente.', 'success');
        }
        
        // Recargar las asignaciones para el rol actual después de cualquier operación CRUD
        if (selectedRolId.value !== null) {
            await fetchAsignacionesPorRol(selectedRolId.value);
        }
        resetFormSelections(); // Limpiar el formulario para nuevas entradas
    } catch (error) {
        console.error('Error al guardar/actualizar asignación:', error);
        // Mostrar el mensaje de error del backend si está disponible
        const errorMessage = (error as any).message || 'Error desconocido al procesar la asignación.';
        showAlert('Error al guardar/actualizar asignaciones: ' + errorMessage, 'error');
    }
};

// --- Funciones para Limpiar Formulario ---
const resetFormSelections = () => {
    selectedPermisos.value = [];
    selectedVistas.value = [];
    selectedItem.value = null;
};

const resetForm = () => {
    selectedRolId.value = null; // Esto vaciará la tabla y el formulario
    resetFormSelections();
    editingAssignment.value = null; // Salir del modo edición
    search.value = ''; // Limpiar el campo de búsqueda
};

// --- Lógica de Edición (Rellenar el formulario) ---
const editAsignacion = (item: AsignacionPermiso) => {
    // 1. Entrar en modo edición y guardar la asignación actual
    editingAssignment.value = item;

    // 2. Rellenar el formulario
    selectedRolId.value = item.rol_id; // Se rellena, pero se deshabilita para edición

    // 3. Limpiar selecciones previas del formulario para evitar conflictos
    resetFormSelections();

    // 4. Determinar qué campos del formulario deben ser marcados/seleccionados
    const leerPermiso = permisos.value.find(p => p.nombre === 'leer');
    const leerPermisoId = leerPermiso ? leerPermiso.id : undefined;

    console.log('DEBUG: Editando asignación:', item);
    console.log('DEBUG: Permiso "leer" ID:', leerPermisoId);

    if (item.permiso_id === leerPermisoId && item.item_id !== null) {
        // Es un permiso de vista (leer a un ítem específico)
        selectedVistas.value = [item.item_id];
        // También seleccionar el ítem en el v-select si corresponde a esa vista
        selectedItem.value = items.value.find(i => i.id === item.item_id) || null;
        console.log('DEBUG: Asignación de vista. selectedVistas:', selectedVistas.value, 'selectedItem:', selectedItem.value);
    } else {
        // Si no es el permiso 'leer' para un ítem específico, es un permiso general
        // o un permiso 'leer' sin item_id (si tu backend lo permite como global)
        selectedPermisos.value = item.permiso_id ? [item.permiso_id] : [];
        selectedItem.value = null; // Un permiso general no tiene un ítem asociado
        console.log('DEBUG: Asignación general. selectedPermisos:', selectedPermisos.value);
    }

    showAlert(`Estás editando la asignación: Rol "${item.rol?.nombre || 'N/A'}", Permiso "${item.permiso?.nombre || 'N/A'}" en Ítem "${item.item?.nombre || 'Global'}". Modifica y haz clic en "Actualizar Asignación".`, 'info');
};

// --- Lógica de Eliminación ---
const deleteAsignacionConfirm = (item: AsignacionPermiso) => {
    itemToDelete.value = item;
    dialogDelete.value = true;
};

const closeDelete = () => {
    dialogDelete.value = false;
    itemToDelete.value = null;
};

const deleteAsignacionConfirmado = async () => {
    if (itemToDelete.value) {
        try {
            // Asegurarse de que `itemIdForDeletion` sea 'null' string si es null
            const itemIdForDeletion = itemToDelete.value.item_id === null ? 'null' : itemToDelete.value.item_id;

            console.log('DEBUG: Intentando eliminar asignación:', {
                rol_id: itemToDelete.value.rol_id,
                permiso_id: itemToDelete.value.permiso_id,
                item_id: itemIdForDeletion
            });

            await RolesPermisosService.deleteAsignacion(
                itemToDelete.value.rol_id,
                itemToDelete.value.permiso_id,
                itemIdForDeletion
            );
            showAlert('Asignación eliminada exitosamente.', 'success');
            
            // Si la asignación eliminada era la que se estaba editando, salir del modo edición
            if (editingAssignment.value && 
                editingAssignment.value.rol_id === itemToDelete.value.rol_id &&
                editingAssignment.value.permiso_id === itemToDelete.value.permiso_id &&
                editingAssignment.value.item_id === itemToDelete.value.item_id
            ) {
                editingAssignment.value = null;
                resetFormSelections();
            }

            // Recargar las asignaciones para el rol actual
            if (selectedRolId.value !== null) {
                await fetchAsignacionesPorRol(selectedRolId.value);
            } else {
                asignaciones.value = []; // Si no hay rol seleccionado, vaciar la tabla
            }
        } catch (error) {
            console.error('Error al eliminar asignación:', error);
            const errorMessage = (error as any).message || 'Error desconocido al eliminar la asignación.';
            showAlert('Error al eliminar asignación: ' + errorMessage, 'error');
        } finally {
            closeDelete();
        }
    }
};

// --- Ordenación de la tabla ---
const sortByIdAsc = () => {
    sortBy.value = [{ key: 'id', order: 'asc' }];
};

const sortByIdDesc = () => {
    sortBy.value = [{ key: 'id', order: 'desc' }];
};

// --- Hooks de Ciclo de Vida y Watchers ---
onMounted(async () => {
    // Cargar todos los datos maestros al iniciar el componente
    await Promise.all([
        fetchRoles(),
        fetchPermisos(),
        fetchItems(),
    ]);
});

// Watcher para cargar asignaciones cuando el rol seleccionado cambia
watch(selectedRolId, async (newRolId) => {
    if (newRolId !== null) {
        resetFormSelections(); // Limpiar el formulario al cambiar de rol
        editingAssignment.value = null; // Salir del modo edición al cambiar de rol
        await fetchAsignacionesPorRol(newRolId);
    } else {
        asignaciones.value = []; // Vaciar la tabla si no hay rol seleccionado
        resetFormSelections(); // Limpiar el formulario si el rol se deselecciona
    }
});
</script>

<style scoped>
/* Tu estilo específico para este componente */
.form {
    padding: 16px;
    border-radius: 8px;
}
.text-h5 {
    color: #1976D2; /* Color de ejemplo, ajusta a tu tema */
    font-weight: bold;
}
.text-h6 {
    color: #1976D2; /* Color de ejemplo, ajusta a tu tema */
    font-weight: bold;
}
.text-subtitle1 {
    color: #1976D2; /* Color de ejemplo, ajusta a tu tema */
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
