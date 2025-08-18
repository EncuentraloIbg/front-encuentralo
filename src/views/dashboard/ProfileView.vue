<template>
  <v-container class="py-5">
    <v-card class="profile-card" outlined>
      <v-card-title class="text-h5 text-center py-4 profile-title">
        Perfil de Usuario
      </v-card-title>
      <v-card-text>
        <p class="text-lg text-center mb-10 profile-subtitle">
          Aquí puedes ver toda la información de tu perfil y los detalles asociados.
        </p>

        <div v-if="authStore.user" class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="profile-picture-section">
            <h3 class="text-2xl font-semibold mb-4 section-title-blue">Foto de Perfil</h3>
            <div class="avatar-container" @click="triggerFileInput">
              <img
                class="profile-avatar"
                :src="profilePicturePreview || authStore.user.profilePictureUrl || 'https://i.pravatar.cc/160?img=3'"
                alt="Foto de Perfil"
                @error="handleImageError"
              />
              <label class="upload-overlay">
                <v-icon>mdi-camera</v-icon>
              </label>
            </div>

            <p v-if="validationError" class="text-center text-red-500 text-sm mt-2">
              {{ validationError }}
            </p>

            <input
              type="file"
              ref="profilePictureInput"
              @change="handleFileChange"
              class="hidden-input"
              accept="image/*"
              style="display:none"
            />
            <v-btn
              v-if="selectedFile"
              @click="uploadProfilePicture"
              color="green"
              class="upload-button"
              :loading="uploading"
            >
              <v-icon left>mdi-upload</v-icon> Subir Foto
            </v-btn>
            <p v-if="uploading" class="uploading-text">Subiendo...</p>
          </div>

          <div class="info-section">
            <h3 class="text-2xl font-semibold mb-4 section-title-blue">Datos Personales</h3>
            <div class="space-y-3">
              <p><span class="font-medium info-label">Nombre Completo:</span> {{ authStore.user.nombre || 'N/A' }} {{ authStore.user.apellido || 'N/A' }} </p>
              <p><span class="font-medium info-label">Email:</span> {{ authStore.user.correo || 'N/A' }} </p>
              <p><span class="font-medium info-label">Teléfono:</span> {{ authStore.user.telefono || 'N/A' }} </p>
              <p><span class="font-medium info-label">Creado el:</span> {{ formatDate(authStore.user.createdAt) }} </p>
              <p><span class="font-medium info-label">Última Actualización:</span> {{ formatDate(authStore.user.updatedAt) }}</p>
            </div>
          </div>

          <!-- Sección roles -->
            <div class="info-section col-span-1 md:col-span-2">
              <h3 class="text-2xl font-semibold mb-4 section-title-green">Rol Asignado</h3>
              <div v-if="authStore.user.rol" class="rol-badge">
                {{ authStore.user.rol.nombre }}
              </div>
              <p v-else class="info-text-secondary text-center">No hay rol asignado.</p>
            </div>

            <div v-if="authStore.user.tipoUsuario === 'externo' && authStore.user.empresa" class="info-section col-span-1 md:col-span-2">
            <p class="info-text">IngeniaCore</p>
          </div>


          <div v-if="authStore.user.tipoUsuario === 'externo' && authStore.user.empresa" class="info-section col-span-1 md:col-span-2">
            <h3 class="text-2xl font-semibold mb-4 section-title-purple">Información de la Empresa</h3>
            <div class="space-y-3">
              <p><span class="font-medium info-label">Nombre de la Empresa:</span> {{ authStore.user.empresa.nombre || 'N/A' }}</p>
              <p><span class="font-medium info-label">NIT:</span> {{ authStore.user.empresa.nit || 'N/A' }}</p>
              <p><span class="font-medium info-label">Correo de Contacto:</span> {{ authStore.user.empresa.correo || 'N/A' }}</p>
            </div>
          </div>
          <div v-else-if="authStore.user.tipoUsuario === 'externo'" class="info-section col-span-1 md:col-span-2">
            <p class="info-text-secondary">No hay información de empresa disponible.</p>
          </div>

          </div>


        <!-- Estado de carga -->
        <div v-else class="text-center mt-12 p-8 loading-section">
          <p class="text-xl font-semibold loading-text">Cargando información del usuario...</p>
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
import { uploadFile } from '@/services/uploadService';

const authStore = authSetStore();

const validationError = ref<string | null>(null);
const profilePictureInput = ref<HTMLInputElement|null>(null);
const selectedFile = ref<File|null>(null);
const profilePicturePreview = ref<string|null>(null);
const uploading = ref(false);

const snackbar = ref({ show: false, message: '', color: 'success' });

onMounted(() => authStore.checkAuth());

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/160?img=3';
};

const triggerFileInput = () => {
  validationError.value = null;
  profilePictureInput.value?.click();
};

const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null;

  selectedFile.value = null;
  profilePicturePreview.value = null;
  validationError.value = null;

  if (file) {
    const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxSizeInBytes) {
      validationError.value = 'El tamaño máximo permitido es de 2 MB.';
      profilePictureInput.value!.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;

      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const aspectRatio = width / height;

        const lowerBound = 0.95;
        const upperBound = 1.05;

        if (aspectRatio >= lowerBound && aspectRatio <= upperBound) {
          selectedFile.value = file;
          profilePicturePreview.value = reader.result as string;
        } else {
          validationError.value = 'Solo se permiten imágenes cuadradas (proporción 1:1, (400x400 px) máximo 2 MB)';
          profilePictureInput.value!.value = '';
        }
      };
    };
    reader.readAsDataURL(file);
  }
};

const uploadProfilePicture = async () => {
  if (!selectedFile.value) {
    snackbar.value = { show: true, message: 'Por favor, selecciona una imagen primero.', color: 'warning' };
    return;
  }
  uploading.value = true;
  try {
    const uploaded = await uploadFile(selectedFile.value);
    if (!uploaded?.url || !authStore.user) throw new Error('Error subiendo imagen.');
    const res = await fetch('http://localhost:3333/usuarios/profile-picture-url', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ userId: authStore.user.id, url: uploaded.url }),
    });
    if (!res.ok) throw new Error('Error guardando URL en DB.');
    authStore.user.profilePictureUrl = uploaded.url;
    localStorage.setItem('user', JSON.stringify(authStore.user));
    snackbar.value = { show: true, message: 'Foto de perfil actualizada correctamente.', color: 'success' };
  } catch (err) {
    console.error(err);
    snackbar.value = { show: true, message: 'Error al subir o guardar la foto.', color: 'error' };
  } finally {
    uploading.value = false;
    selectedFile.value = null;
    profilePicturePreview.value = null;
    validationError.value = null;

  }
};
</script>

<style scoped>
/* Estilos para el contenedor principal de la tarjeta */
.profile-card {
  max-width: 1000px; /* Tamaño más grande */
  margin: 20px auto; /* Centrado horizontal */
  background-color: #ffffff; /* Fondo blanco */
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Sombra suave */
}

.profile-title {
  color: #333333; /* Color de título oscuro */
  font-family: 'Inter', sans-serif;
  font-weight: 700;
}

.profile-subtitle {
  color: #555555; /* Color de subtítulo gris */
  font-family: 'Inter', sans-serif;
}

/* Estilos para las secciones de información individuales */
.info-section {
  background-color: #f9f9f9; /* Fondo muy claro para las secciones */
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* Sombra sutil */
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Alinea el contenido a la izquierda por defecto */
}

/* Ajuste para centrar contenido específico dentro de info-section cuando se usa text-center */
.info-section.text-center {
  align-items: center; /* Esto centrará los elementos flexibles hijos */
}

/* Estilos para la sección de foto de perfil */
.profile-picture-section {
  background-color: #f9f9f9;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra el contenido de esta sección */
  justify-content: center;
  text-align: center;
}

.avatar-container {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #42A5F5; /* Borde azul */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
  cursor: pointer;
  background-color: #f0f0f0; /* Fondo gris claro para cuando la imagen no llena el espacio */
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover; /* esto hace que la imagen se recorte pero llene el círculo */
  object-position: center; /* centra la imagen */
  border-radius: 50%; /* por si falta, asegura que el img también sea circular */
  display: block;
}

.upload-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-container:hover .upload-overlay {
  opacity: 1;
}

.upload-overlay .v-icon {
  color: white;
  font-size: 48px;
}

.hidden-input {
  display: none;
}

.upload-button {
  margin-top: 10px;
  text-transform: none; /* Evita que el texto del botón esté en mayúsculas */
  font-weight: 600;
}

.uploading-text {
  color: #1976D2;
  margin-top: 10px;
  font-size: 0.9rem;
}


/* Títulos de sección */
.section-title-blue {
  color: #1976D2; /* Azul de Vuetify para títulos de sección */
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-align: center; /* Centrado para todos los títulos de sección */
  width: 100%; /* Asegura que ocupe todo el ancho para el centrado */
}

.section-title-green {
  color: #020202; /* Verde de Vuetify para títulos de sección */
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-align: center;
  width: 100%;
}

.section-title-purple {
  color: #9C27B0; /* Morado de Vuetify para títulos de sección */
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-align: center;
  width: 100%;
}

/* La sección 'Empresa Asociada' fue eliminada, así que no necesitamos este estilo */
.section-title-yellow {
  color: #FFC107;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-align: center;
  width: 100%;
}

.info-label {
  color: #333333; /* Etiquetas en color oscuro */
  font-family: 'Inter', sans-serif;
  font-weight: 500;
}

.info-text {
  color: #555555; /* Texto de información en gris oscuro */
  font-family: 'Inter', sans-serif;
}

.info-text-secondary {
  color: #777777; /* Texto secundario en gris más claro */
  font-family: 'Inter', sans-serif;
}

/* Estilos para el mensaje de carga */
.loading-section {
  background-color: #f0f0f0; /* Fondo claro para el mensaje de carga */
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.loading-text {
  color: #333333; /* Texto de carga oscuro */
  font-family: 'Inter', sans-serif;
}

/* Estilos de cuadrícula (manteniendo la utilidad de Tailwind para el layout) */
.grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 2rem;
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .col-span-1 { grid-column: span 1 / span 1; }
  .md\:col-span-2 {
    grid-column: span 2 / span 2;
  }
}

/* Clases de utilidad de espaciado y texto (pueden ser de Tailwind o custom) */
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-10 { margin-bottom: 2.5rem; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.mt-12 { margin-top: 3rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.p-8 { padding: 2rem; }
.text-center { text-align: center; }
.text-h5 { font-size: 1.5rem; line-height: 2rem; } /* Vuetify h5 equivalent */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.space-y-3 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.75rem * var(--tw-space-y-reverse));
}
.capitalize { text-transform: capitalize; }
.list-disc { list-style-type: disc; }
.list-inside { list-style-position: inside; }

/* Estilos compartidos para cuadros */
.shared-box {
  margin-top: 20px; /* Espaciado */
  text-align: center; /* Centra el texto */
  background-color: #f9f9f9; /* Fondo claro */
  padding: 10px 20px; /* Espaciado interno */
  border-radius: 5px; /* Bordes redondeados */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Sombra suave */
}

.rol-badge {
  display: inline-block;
  padding: 8px 16px;
  background: linear-gradient(135deg, #1e88e5, #42a5f5, #64b5f6);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 20px;
  text-align: center;
  margin: 0 auto;
  box-shadow: 0 4px 15px rgba(30, 136, 229, 0.6);
  border: 2px solid white;
  transition: all 0.3s ease;
  cursor: default;
}

.rol-badge:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(30, 136, 229, 0.8);
}


</style>


