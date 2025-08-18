<template>
  <v-container class="py-5">
    <v-card class="settings-main-card" outlined>
      <v-card-title class="text-h4 text-center py-6 settings-title">
        Configuraciones de Usuario
      </v-card-title>
      <v-card-text>
        <p class="text-lg text-center mb-10 settings-subtitle">
          Bienvenido, {{ authStore.user?.nombre || 'Usuario' }}! Aquí puedes ajustar las preferencias de tu cuenta y del sistema.
        </p>

        <v-row>
          <v-col cols="12" md="3">
            <v-list nav dense class="settings-nav-list rounded-lg">
              <v-list-item
                v-for="(item, i) in settingsCategories"
                :key="i"
                :value="item"
                color="primary"
                :class="{ 'v-list-item--active': selectedTab === item.value }"
                @click="selectedTab = item.value"
                class="settings-nav-item"
              >
                <template v-slot:prepend>
                  <v-icon :icon="item.icon"></v-icon>
                </template>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-col>

          <v-col cols="12" md="9">
            <v-window v-model="selectedTab" class="settings-content-window">
              <v-window-item value="profile">
                <v-card class="setting-section-card" elevation="2">
                  <v-card-title class="text-h5 section-title-blue">Información del Perfil</v-card-title>
                  <v-card-text>
                    <v-form @submit.prevent="saveProfileSettings">
                      <v-text-field
                        label="Nombre"
                        v-model="profileSettings.nombre"
                        required
                        outlined
                        density="compact"
                        class="mb-4"
                      ></v-text-field>
                      <v-text-field
                        label="Apellido"
                        v-model="profileSettings.apellido"
                        required
                        outlined
                        density="compact"
                        class="mb-4"
                      ></v-text-field>
                      <v-text-field
                        label="Correo Electrónico"
                        v-model="profileSettings.correo"
                        type="email"
                        required
                        outlined
                        density="compact"
                        class="mb-4"
                      ></v-text-field>
                      <v-text-field
                        label="Teléfono"
                        v-model="profileSettings.telefono"
                        type="tel"
                        outlined
                        density="compact"
                        class="mb-4"
                      ></v-text-field>
                      <v-btn color="primary" type="submit" variant="flat" class="mt-4">Guardar Cambios</v-btn>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-window-item>

              <v-window-item value="security">
                <v-card class="setting-section-card" elevation="2">
                  <v-card-title class="text-h5 section-title-green">Seguridad de la Cuenta</v-card-title>
                  <v-card-text>
                    <v-list dense class="bg-transparent">
                      <v-list-item>
                        <v-list-item-title>Contraseña</v-list-item-title>
                        <v-list-item-subtitle>Último cambio: Hace 30 días</v-list-item-subtitle>
                        <template v-slot:append>
                          <v-btn icon variant="text" color="primary" size="small" @click="showChangePasswordDialog">
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>
                        </template>
                      </v-list-item>
                      <v-list-item>
                        <v-switch
                          v-model="securitySettings.twoFactorAuth"
                          color="success"
                          label="Autenticación de Dos Factores (2FA)"
                          hide-details
                        ></v-switch>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>Dispositivos Conectados</v-list-item-title>
                        <v-list-item-subtitle>3 dispositivos activos</v-list-item-subtitle>
                        <template v-slot:append>
                          <v-btn icon variant="text" color="info" size="small" @click="showManageDevicesDialog">
                            <v-icon>mdi-devices</v-icon>
                          </v-btn>
                        </template>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>Actividad de Inicio de Sesión</v-list-item-title>
                        <v-list-item-subtitle>Último inicio de sesión: Hoy, 10:30 AM desde IP 192.168.1.1</v-list-item-subtitle>
                        <template v-slot:append>
                          <v-btn icon variant="text" color="info" size="small" @click="showLoginHistoryDialog">
                            <v-icon>mdi-history</v-icon>
                          </v-btn>
                        </template>
                      </v-list-item>
                    </v-list>
                    <v-btn color="success" variant="flat" class="mt-4">Actualizar Seguridad</v-btn>
                  </v-card-text>
                </v-card>
              </v-window-item>

              <v-window-item value="notifications">
                <v-card class="setting-section-card" elevation="2">
                  <v-card-title class="text-h5 section-title-orange">Notificaciones</v-card-title>
                  <v-card-text>
                    <p class="text-base text-gray-700 mb-4">
                      Controla cómo y cuándo recibes notificaciones sobre tus tickets y actividad del sistema.
                    </p>
                    <v-list dense class="bg-transparent">
                      <v-list-item>
                        <v-switch
                          v-model="notificationSettings.newTicketEmail"
                          color="primary"
                          label="Email: Nuevo ticket creado (para agentes)"
                          hide-details
                        ></v-switch>
                      </v-list-item>
                      <v-list-item>
                        <v-switch
                          v-model="notificationSettings.ticketUpdateEmail"
                          color="primary"
                          label="Email: Actualización en mis tickets"
                          hide-details
                        ></v-switch>
                      </v-list-item>
                      <v-list-item>
                        <v-switch
                          v-model="notificationSettings.newCommentEmail"
                          color="primary"
                          label="Email: Nuevo comentario en ticket"
                          hide-details
                        ></v-switch>
                      </v-list-item>
                      <v-list-item>
                        <v-switch
                          v-model="notificationSettings.inAppAlerts"
                          color="primary"
                          label="Alertas en la aplicación (in-app)"
                          hide-details
                        ></v-switch>
                      </v-list-item>
                      <v-list-item>
                        <v-select
                          label="Frecuencia de Resumen (Email)"
                          :items="['Nunca', 'Diario', 'Semanal']"
                          v-model="notificationSettings.summaryFrequency"
                          outlined
                          density="compact"
                          hide-details
                        ></v-select>
                      </v-list-item>
                    </v-list>
                    <v-btn color="primary" variant="flat" class="mt-4">Guardar Notificaciones</v-btn>
                  </v-card-text>
                </v-card>
              </v-window-item>

              <v-window-item value="audit">
                <v-card class="setting-section-card" elevation="2">
                  <v-card-title class="text-h5 section-title-purple">Historial de Actividad y Auditoría</v-card-title>
                  <v-card-text>
                    <p class="text-base text-gray-700 mb-4">
                      Consulta el registro de todas las acciones realizadas en tu cuenta y en el sistema.
                    </p>
                    <v-btn color="purple-darken-2" variant="outlined" class="mr-2 mb-2" @click="viewAuditLog">Ver Registro de Auditoría</v-btn>
                    <v-btn color="purple-darken-2" variant="outlined" class="mb-2" @click="viewChangeHistory">Ver Historial de Cambios</v-btn>
                  </v-card-text>
                </v-card>
              </v-window-item>
            </v-window>
          </v-col>
        </v-row>

        <div class="text-center mt-10">
          <v-btn color="red-darken-2" size="large" class="danger-button" @click="showDeleteAccountDialog">
            Eliminar Cuenta
            <v-icon end>mdi-delete-forever</v-icon>
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
      <template #actions>
        <v-btn text @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { authSetStore } from '@/stores/AuthStore';
// Importa tu servicio de usuario si tienes uno, por ejemplo:
// import { updateUserProfile } from '@/services/userService';

const authStore = authSetStore();

// Estado para controlar la pestaña seleccionada
const selectedTab = ref('profile'); // Valor inicial

// Definición de las categorías de configuración para el menú
const settingsCategories = [
  { title: 'Información del Perfil', icon: 'mdi-account-circle', value: 'profile' },
  { title: 'Seguridad de la Cuenta', icon: 'mdi-lock', value: 'security' },
  { title: 'Notificaciones', icon: 'mdi-bell', value: 'notifications' },
  { title: 'Historial de Actividad', icon: 'mdi-history', value: 'audit' },
];

// Estado para la información del perfil (editable)
const profileSettings = ref({
  nombre: '',
  apellido: '',
  correo: '',
  telefono: '',
});

// Estado para las preferencias de seguridad
const securitySettings = ref({
  twoFactorAuth: false,
});

// Estado para las preferencias de notificaciones (NUEVO)
const notificationSettings = ref({
  newTicketEmail: true,
  ticketUpdateEmail: true,
  newCommentEmail: true,
  inAppAlerts: true,
  summaryFrequency: 'Diario',
});

// Estado para el Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});

onMounted(async () => {
  // Asegúrate de que el usuario esté cargado en el store al montar el componente
  await authStore.checkAuth();
  // Inicializa los campos del formulario con los datos del usuario
  if (authStore.user) {
    profileSettings.value.nombre = authStore.user.nombre || '';
    profileSettings.value.apellido = authStore.user.apellido || ''; // Asumiendo que 'apellido' existe en authStore.user
    profileSettings.value.correo = authStore.user.correo || '';
    profileSettings.value.telefono = authStore.user.telefono || '';
    // Aquí podrías cargar las configuraciones de seguridad y privacidad reales del usuario desde una API
    // Por ahora, usamos valores predeterminados para el mock
  }
});

// --- Funciones para guardar la información del perfil ---
const saveProfileSettings = async () => {
  try {
    // Aquí deberías llamar a tu API para actualizar el perfil del usuario
    // Ejemplo: await updateUserProfile(authStore.user.id, profileSettings.value);

    // --- Mock de simulación de API (eliminar en producción) ---
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Guardando perfil:', profileSettings.value);
    // Si la actualización es exitosa, actualiza el store
    if (authStore.user) {
      authStore.user.nombre = profileSettings.value.nombre;
      authStore.user.apellido = profileSettings.value.apellido; // Actualiza el apellido
      authStore.user.correo = profileSettings.value.correo;
      authStore.user.telefono = profileSettings.value.telefono;
      // Opcional: Si tu AuthStore guarda en localStorage, actualízalo
      // localStorage.setItem('user', JSON.stringify(authStore.user));
    }
    // --- Fin Mock ---

    snackbar.value = { show: true, message: 'Perfil actualizado exitosamente.', color: 'success' };
  } catch (error: any) {
    console.error('Error al guardar el perfil:', error);
    snackbar.value = { show: true, message: error.message || 'Error al actualizar el perfil.', color: 'error' };
  }
};

// --- Funciones de ejemplo para las acciones de seguridad y trazabilidad (usan snackbar) ---
const showChangePasswordDialog = () => {
  snackbar.value = { show: true, message: 'Funcionalidad para cambiar contraseña (redirigir a otra vista o modal).', color: 'info' };
  // En una aplicación real, usarías un router.push('/change-password') o un modal
};

const showManageDevicesDialog = () => {
  snackbar.value = { show: true, message: 'Funcionalidad para gestionar dispositivos conectados (mostrar modal o vista).', color: 'info' };
};

const showLoginHistoryDialog = () => {
  snackbar.value = { show: true, message: 'Funcionalidad para ver el historial de inicios de sesión (mostrar modal o vista).', color: 'info' };
};

const viewAuditLog = () => {
  snackbar.value = { show: true, message: 'Funcionalidad para ver el registro de auditoría (redirigir a vista de logs).', color: 'info' };
};

const viewChangeHistory = () => {
  snackbar.value = { show: true, message: 'Funcionalidad para ver el historial de cambios (redirigir a vista de historial).', color: 'info' };
};

const showDeleteAccountDialog = () => {
  snackbar.value = { show: true, message: 'Funcionalidad para eliminar cuenta (requiere confirmación y lógica de backend).', color: 'warning' };
  // Aquí podrías integrar un ConfirmDialog real como el que ya tienes en TicketsView
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Contenedor principal de la tarjeta de configuraciones */
.settings-main-card {
  max-width: 1200px; /* Un poco más ancho para el layout de dos columnas */
  margin: 20px auto;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.settings-title {
  color: #333333;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
}

.settings-subtitle {
  color: #555555;
  font-family: 'Inter', sans-serif;
}

/* Estilos para el menú de navegación lateral */
.settings-nav-list {
  background-color: #F5F5F5; /* Gris muy claro para el fondo del menú */
  padding: 10px 0;
}

.settings-nav-item {
  border-radius: 8px;
  margin: 5px 10px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.settings-nav-item:hover {
  background-color: #E0E0E0; /* Gris un poco más oscuro al pasar el ratón */
}

/* Estilos para las tarjetas de sección de configuraciones (dentro de v-window) */
.setting-section-card {
  background-color: #FFFFFF; /* Fondo blanco para el contenido principal */
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-height: 400px; /* Asegura una altura mínima para las secciones */
}

.setting-section-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.section-title-blue {
  color: #1976D2; /* Azul oscuro */
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  margin-bottom: 15px;
}

.section-title-green {
  color: #4CAF50; /* Verde oscuro */
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  margin-bottom: 15px;
}

.section-title-orange {
  color: #FF9800; /* Naranja para notificaciones */
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  margin-bottom: 15px;
}

.section-title-purple {
  color: #9C27B0; /* Morado oscuro */
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  margin-bottom: 15px;
}

/* Estilos para los elementos de lista dentro de las secciones */
.v-list-item-title {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  color: #333333;
}

.v-list-item-subtitle {
  font-family: 'Inter', sans-serif;
  color: #777777;
  font-size: 0.85rem;
}

/* Estilo para el botón de acción peligrosa */
.danger-button {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-transform: none;
  border-radius: 25px;
  padding: 15px 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.danger-button:hover {
  transform: translateY(-2px);
  background-color: #C62828 !important; /* Un rojo más oscuro */
}

/* Clases de utilidad de Vuetify y Tailwind */
.py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-10 { margin-bottom: 2.5rem; }
.mt-10 { margin-top: 2.5rem; }
.text-h4 { font-size: 2.125rem; line-height: 2.5rem; }
.text-h5 { font-size: 1.5rem; line-height: 2rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-center { text-align: center; }
.bg-transparent { background-color: transparent !important; } /* Para que v-list sea transparente */
</style>
