<template>
  <v-container class="py-5">
    <v-card class="mb-5" outlined>
      <v-card-title class="text-h5 text-center">Formulario de Usuario</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="onSubmit" class="form" style="color: black">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                label="Nombre"
                v-model="nombre"
                :error-messages="nombreError"
                required
                outlined
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="Apellido"
                v-model="apellido"
                :error-messages="apellidoError"
                required
                outlined
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="Email"
                v-model="correo"
                :error-messages="correoError"
                type="email"
                required
                outlined
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="Teléfono"
                v-model="telefono"
                :error-messages="telefonoError"
                type="tel"
                required
                outlined
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                label="Rol"
                v-model="rol"
                :items="roles"
                item-title="nombre"
                item-value="id"
                :error-messages="rolError"
                required
                outlined
                clearable
                @update:modelValue="rolBlur"
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                label="Empresa"
                v-model="empresa"
                :items="empresas"
                item-title="nombre"
                item-value="id"
                :error-messages="empresaError"
                required
                outlined
                clearable
                @update:modelValue="empresaBlur"
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                label="Contraseña"
                v-model="password"
                :error-messages="passwordError"
                type="password"
                :required="!isEditing"
                minlength="6"
                outlined
              />
            </v-col>
          </v-row>
          <div class="d-flex justify-start">
            <v-btn v-if="isEditing" color="secondary" @click="resetFormAndState" class="mr-2">Cancelar Edición</v-btn>

            <v-btn v-if="!isEditing" color="grey" text @click="resetFormAndState" class="mr-2">Limpiar Formulario</v-btn>

            <v-btn color="primary" type="submit">{{ isEditing ? 'Actualizar Usuario' : 'Crear Usuario' }}</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card outlined>
      <v-card-title class="text-h6">
        Lista de Usuarios
      </v-card-title>

      <v-row align="center" class="px-4 pb-4">
        <v-col cols="12" sm="6" md="5" lg="4">
          <v-text-field v-model="search" label="Buscar usuario" prepend-inner-icon="mdi-magnify" outlined dense hide-details />
        </v-col>

        <v-col cols="12" sm="6" md="7" lg="8" class="d-flex justify-start">
          <!-- Botones de ordenamiento con el color primario -->
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
        :items="filteredUsers"
        item-value="id"
        v-model:sort-by="sortBy"
        class="elevation-1"
      >
        <!-- Slot para la columna ID -->
        <template v-slot:item.id="{ item }">
          {{ item.id }}
        </template>
        
        <template v-slot:item.rol_display_name="{ item }">
          {{ item.rol_display_name }}
        </template>
        <template v-slot:item.empresa_display_name="{ item }">
          {{ item.empresa_display_name }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon @click="editUser(item)" class="mr-1">
            <v-icon color="primary">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="handleDeleteUser(item.id)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
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
import { ref, onMounted, computed } from 'vue';
import { useForm, useField } from 'vee-validate';

import { crearUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario } from '../services/userService';
import ConfirmDialog from '../components/Confirmardialogo.vue';

// --- Funciones de validación ---
const required = (value: any) => {
  if (value === null || value === undefined || value === '') {
    return 'Este campo es obligatorio.';
  }
  if (typeof value === 'number' && value <= 0) {
    return 'Selecciona un valor válido.';
  }
  return true;
};
const minLength = (value: string, length: number) => (value && value.length >= length) || `Debe tener al menos ${length} caracteres.`;
const isEmail = (value: string) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value) || 'Debe ser un correo electrónico válido.';
};

const isPhoneNumber = (value: string) => {
  const pattern = /^3\d{9}$/;
  return pattern.test(value) || 'El teléfono debe ser de 10 dígitos y empezar por 3.';
};

const onlyLetters = (value: string) => {
  const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return pattern.test(value) || 'Solo se permiten letras.';
};

// --- Estados de la UI ---
const isEditing = ref(false);
const editingUserId = ref<number | null>(null);

// --- Inicializa el formulario con VeeValidate ---
const { handleSubmit, resetForm, setValues } = useForm();

// --- Vincula los campos individuales con VeeValidate y sus reglas de validación ---
const { value: nombre, errorMessage: nombreError } = useField('nombre', [required, (val: string) => minLength(val, 2), onlyLetters]);
const { value: apellido, errorMessage: apellidoError } = useField('apellido', [required, (val: string) => minLength(val, 2), onlyLetters]);
const { value: telefono, errorMessage: telefonoError } = useField('telefono', [required, isPhoneNumber]);
const { value: correo, errorMessage: correoError } = useField('correo', [required, isEmail]);

const { value: password, errorMessage: passwordError } = useField('password', (value: string) => {
  if (!isEditing.value) {
    if (!value) return 'La contraseña es obligatoria.';
    if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  } else {
    if (value && value.length < 6) return 'La contraseña debe tener al menos 6 caracteres si se proporciona.';
  }
  return true;
});

const { value: rol, errorMessage: rolError, handleBlur: rolBlur } = useField('rol', [required]);
const { value: empresa, errorMessage: empresaError, handleBlur: empresaBlur } = useField('empresa', [required]);

// --- Estados adicionales del formulario y datos ---
const roles = ref<any[]>([])
const empresas = ref<any[]>([])

// --- Estados de la UI para Snackbar y Modales ---
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
const currentAction = ref('');
const userToDeleteId = ref<number | null>(null);

// --- Datos de la tabla ---
const usuarios = ref<any[]>([]);
const search = ref('');
const sortBy = ref<Array<{ key: string; order: 'asc' | 'desc' }>>([{ key: 'id', order: 'asc' }]);

const itemsPerPage = ref(10); // Asumiendo que esta tabla también usa paginación interna

// --- Cabeceras de la tabla (Actualizadas para usar ID real y sortable) ---
const headers = [
  { title: 'ID', key: 'id', sortable: false }, // Se mantiene sin flecha de ordenamiento
  { title: 'Nombre', key: 'nombre', sortable: false }, // CAMBIO: sortable es false
  { title: 'Apellido', key: 'apellido', sortable: false }, // CAMBIO: sortable es false
  { title: 'Correo', key: 'correo', sortable: false }, // CAMBIO: sortable es false
  { title: 'Teléfono', key: 'telefono', sortable: false }, // CAMBIO: sortable es false
  { title: 'Rol', key: 'rol_display_name', sortable: false }, // CAMBIO: sortable es false
  { title: 'Empresa', key: 'empresa_display_name', sortable: false }, // CAMBIO: sortable es false
  { title: 'Acciones', key: 'actions', sortable: false },
];

// --- Funciones para la interacción con la API y el estado ---

async function fetchEmpresas() {
  try {
    const response = await fetch('http://localhost:3333/api/usuarios/obtener-empresas');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    empresas.value = data;
  } catch (error: any) {
    console.error('Error al obtener las empresas:', error);
    snackbar.value = { show: true, message: `Error al cargar las empresas: ${error.message}`, color: 'error' };
  }
}

async function fetchRoles() {
  try {
    const response = await fetch('http://localhost:3333/api/usuarios/obtener-roles');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    roles.value = data;
  } catch (error: any) {
    console.error('Error al obtener los roles:', error);
    snackbar.value = { show: true, message: `Error al cargar los roles: ${error.message}`, color: 'error' };
  }
}

async function cargarUsuarios() {
  try {
    const fetchedUsers = await obtenerUsuarios();
    usuarios.value = fetchedUsers.map((user: any) => {
      const roleDisplayName = user.rol ? user.rol.nombre : 'N/A';
      const empresaDisplayName = user.empresa ? user.empresa.nombre : 'N/A';
      return {
        ...user,
        rol_display_name: roleDisplayName,
        empresa_display_name: empresaDisplayName
      };
    });
  } catch (err) {
    snackbar.value = {
      show: true,
      message: 'Error al cargar usuarios. Consulta la consola para más detalles.',
      color: 'error',
    };
    console.error('Error al cargar usuarios:', err);
  }
}

function editUser(user: any) {
  isEditing.value = true;
  editingUserId.value = user.id;
  setValues({
    nombre: user.nombre,
    apellido: user.apellido,
    telefono: user.telefono,
    correo: user.correo,
    rol: user.rol_id || (user.rol ? user.rol.id : null),
    empresa: user.empresa_id || (user.empresa ? user.empresa.id : null),
  });
  password.value = '';
}

const onSubmit = handleSubmit(async (values) => {
  if (isEditing.value) {
    confirmDialogTitle.value = 'Confirmar Actualización';
    confirmDialogMessage.value = '¿Estás seguro de que quieres actualizar este usuario?';
    confirmDialogConfirmText.value = 'Actualizar';
    confirmDialogConfirmColor.value = 'primary';
    currentAction.value = 'update';
  } else {
    confirmDialogTitle.value = 'Confirmar Creación';
    confirmDialogMessage.value = '¿Estás seguro de que quieres crear este usuario?';
    confirmDialogConfirmText.value = 'Crear';
    confirmDialogConfirmColor.value = 'success';
    currentAction.value = 'create';
  }
  showConfirmDialog.value = true;
});

async function handleConfirmAction() {
  snackbar.value.show = false;
  console.log('DEBUG: handleConfirmAction ejecutada para la acción:', currentAction.value);

  try {
    if (currentAction.value === 'create') {
      const userData = {
        nombre: nombre.value,
        apellido: apellido.value,
        telefono: telefono.value,
        correo: correo.value,
        password: password.value,
        rol_id: rol.value,
        empresa_id: empresa.value,
      };
      console.log('DEBUG: Creando usuario con datos:', userData);
      await crearUsuario(userData);
      snackbar.value = { show: true, message: 'Usuario creado exitosamente.', color: 'success' };
      await cargarUsuarios();
      setSortOrder('desc'); // Mantener el orden 'Más Recientes' después de crear
    } else if (currentAction.value === 'update') {
      const userDataToUpdate: any = {
        nombre: nombre.value,
        apellido: apellido.value,
        telefono: telefono.value,
        correo: correo.value,
        rol_id: rol.value,
        empresa_id: empresa.value,
      };
      if (password.value) {
        userDataToUpdate.password = password.value;
      }
      console.log('DEBUG: Actualizando usuario con ID:', editingUserId.value, ' y datos:', userDataToUpdate);
      await actualizarUsuario(editingUserId.value!, userDataToUpdate);
      snackbar.value = { show: true, message: 'Usuario actualizado correctamente.', color: 'success' };
      await cargarUsuarios();
      // No cambiamos el orden después de actualizar, se mantiene el que ya estaba
    } else if (currentAction.value === 'delete') {
      if (userToDeleteId.value !== null) {
        console.log('DEBUG: Eliminando usuario con ID:', userToDeleteId.value);
        await eliminarUsuario(userToDeleteId.value);
        snackbar.value = { show: true, message: 'Usuario eliminado correctamente.', color: 'success' };
        await cargarUsuarios();
        // No cambiamos el orden después de eliminar, se mantiene el que ya estaba
      }
    }

    resetFormAndState();

  } catch (err: any) {
    console.error('ERROR en handleConfirmAction:', err);
    const errorMessage = err?.response?.data?.message || err?.message || 'Error desconocido al procesar la operación.';
    if (err?.response?.data?.errors) {
      const backendErrors = err.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
      snackbar.value = { show: true, message: `Error de validación: ${backendErrors}`, color: 'error' };
    } else {
      snackbar.value = { show: true, message: errorMessage, color: 'error' };
    }
  } finally {
    showConfirmDialog.value = false;
    currentAction.value = '';
  }
}

function resetFormAndState() {
  resetForm();
  isEditing.value = false;
  editingUserId.value = null;
  userToDeleteId.value = null;
  rol.value = null;
  empresa.value = null;
}

// Nueva función para establecer el orden de la tabla
const setSortOrder = (order: 'asc' | 'desc') => {
  sortBy.value = [{ key: 'id', order: order }];
};

onMounted(async () => {
  await fetchRoles();
  await fetchEmpresas();
  await cargarUsuarios();
  setSortOrder('asc'); // Cargar inicialmente ordenado por ID ascendente
});

const filteredUsers = computed(() => {
  let items = usuarios.value;

  if (search.value) {
    const searchTerm = search.value.toLowerCase().trim();
    items = items.filter((u) =>
      Object.values(u).some((val) =>
        String(val || '').toLowerCase().includes(searchTerm)
      )
    );
  }
  
  // No necesitamos ordenar aquí, v-data-table lo hará con v-model:sort-by
  return items;
});

function handleDeleteUser(id: number) {
  userToDeleteId.value = id;
  confirmDialogTitle.value = 'Confirmar Eliminación';
  confirmDialogMessage.value = '¿Estás seguro de que quieres eliminar a este usuario? Esta acción es irreversible.';
  confirmDialogConfirmText.value = 'Eliminar';
  confirmDialogConfirmColor.value = 'error';
  currentAction.value = 'delete';
  showConfirmDialog.value = true;
}

function handleCancelAction() {
  console.log('Acción cancelada por el usuario.');
  userToDeleteId.value = null;
  currentAction.value = '';
  showConfirmDialog.value = false;
}
</script>

<style scoped>
.form {
  padding: 16px;
  border-radius: 8px;
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

/* NUEVO: Estilo para controlar la altura de las filas de la tabla */
.v-data-table tbody tr {
  height: 48px; /* O el valor que consideres apropiado, por ejemplo, 56px, 64px */
  min-height: 48px; /* Asegura que no se haga más pequeña */
}
/* Asegurarse de que las celdas también tengan un padding consistente */
.v-data-table tbody td {
  padding: 8px 16px; /* Ajusta el padding si las celdas parecen demasiado grandes */
}
</style>
