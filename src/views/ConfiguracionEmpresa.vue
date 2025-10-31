<template>
  <v-container class="py-8" fluid>
    <v-row justify="center">
      <v-col cols="12" md="9" lg="8">
        <!-- ===== Tarjeta: Empresa ===== -->
        <v-card variant="outlined" rounded="lg">
          <v-card-title class="text-h6 d-flex align-center justify-space-between">
            <span>Configuración de la empresa</span>

            <div class="d-flex align-center ga-3">
              <v-select
                v-model="selectedId"
                :items="razonesSociales"
                :loading="loadingRS"
                item-title="nombre"
                item-value="id"
                label="Razón social"
                density="compact"
                style="min-width: 260px"
                @update:modelValue="onChangeRS"
              />

              <v-btn
                v-if="!editMode"
                prepend-icon="mdi-pencil"
                color="primary"
                @click="toggleEdit(true)"
                :disabled="loading"
              >
                Editar
              </v-btn>

              <v-btn
                v-else
                variant="text"
                prepend-icon="mdi-eye"
                @click="cancelEdit"
                :disabled="saving"
              >
                Ver tarjeta
              </v-btn>
            </div>
          </v-card-title>

          <v-divider />

          <v-expand-transition>
            <v-alert
              v-if="errorMsg"
              type="error"
              variant="tonal"
              class="ma-4"
              closable
              @click:close="errorMsg = ''"
            >
              {{ errorMsg }}
            </v-alert>
          </v-expand-transition>

          <!-- ===== Vista empresa ===== -->
          <v-expand-transition>
            <div v-show="!editMode">
              <v-card-text>
                <v-row class="py-4" align="center" no-gutters>
                  <v-col cols="12" md="4" class="d-flex justify-center">
                    <div class="avatar-wrap">
                      <v-avatar size="140">
                        <v-img :src="avatarPreview" alt="Logo / avatar" cover />
                      </v-avatar>
                    </div>
                  </v-col>

                  <v-col cols="12" md="8">
                    <div class="text-h6 mb-1">
                      {{ empresa?.nombre || '—' }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Prefijo de orden: <strong>{{ empresa?.prefijo_orden || '—' }}</strong>
                    </div>

                    <v-row class="mt-5">
                      <v-col cols="12" sm="6">
                        <v-list density="compact">
                          <v-list-item>
                            <template #prepend><v-icon>mdi-email</v-icon></template>
                            <v-list-item-title>{{ empresa?.correo || '—' }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item>
                            <template #prepend><v-icon>mdi-phone</v-icon></template>
                            <v-list-item-title>{{ empresa?.telefono || '—' }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-col>

                      <v-col cols="12" sm="6">
                        <v-list density="compact">
                          <v-list-item>
                            <template #prepend><v-icon>mdi-map-marker</v-icon></template>
                            <v-list-item-title>{{ empresa?.direccion || '—' }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item>
                            <template #prepend><v-icon>mdi-web</v-icon></template>
                            <v-list-item-title>{{ empresa?.sitio_web || '—' }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-col>
                    </v-row>

                    <v-divider class="my-4" />

                    <div>
                      <div class="text-subtitle-2 mb-1">Descripción</div>
                      <div class="text-body-2">
                        {{ empresa?.descripcion || '—' }}
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </div>
          </v-expand-transition>

          <!-- ===== Form empresa ===== -->
          <v-expand-transition>
            <div v-show="editMode">
              <v-card-text>
                <v-form class="form" @submit.prevent="onSubmit">
                  <v-row>
                    <v-col cols="12" class="d-flex align-center ga-4">
                      <v-avatar size="84" class="elevation-1">
                        <v-img :src="avatarPreview" alt="Logo / avatar" cover />
                      </v-avatar>

                      <div class="d-flex ga-2 flex-wrap align-center">
                        <v-btn
                          color="primary"
                          :loading="uploading"
                          @click="pickFile"
                          prepend-icon="mdi-camera"
                        >
                          Cambiar logo / avatar
                        </v-btn>
                        <div class="text-caption text-medium-emphasis">
                          JPG/PNG/WebP máx. ~6MB
                        </div>
                        <input
                          ref="fileInput"
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          class="d-none"
                          @change="onFile"
                        />
                      </div>
                    </v-col>

                    <v-col cols="12" md="8">
                      <v-text-field label="Nombre comercial" v-model.trim="form.nombre" :disabled="saving" variant="outlined" />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field label="Prefijo de orden" v-model.trim="form.prefijo_orden" :disabled="saving" variant="outlined" maxlength="10" />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field label="Correo" v-model.trim="form.correo" :disabled="saving" variant="outlined" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field label="Teléfono" v-model.trim="form.telefono" :disabled="saving" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field label="Dirección" v-model.trim="form.direccion" :disabled="saving" variant="outlined" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field label="Sitio web" v-model.trim="form.sitio_web" :disabled="saving" variant="outlined" />
                    </v-col>

                    <v-col cols="12">
                      <v-textarea label="Descripción" v-model.trim="form.descripcion" :disabled="saving" variant="outlined" rows="4" auto-grow />
                    </v-col>
                  </v-row>

                  <div class="d-flex justify-end ga-2">
                    <v-btn variant="text" @click="cancelEdit" :disabled="saving">Cancelar</v-btn>
                    <v-btn color="primary" type="submit" :loading="saving">Guardar cambios</v-btn>
                  </div>
                </v-form>
              </v-card-text>
            </div>
          </v-expand-transition>

          <v-progress-linear v-if="loading" indeterminate color="primary" />
        </v-card>

        <!-- ===== Tarjeta: Usuario ===== -->
        <v-card class="mt-6" variant="outlined" rounded="lg">
          <v-card-title class="text-h6 d-flex align-center justify-space-between">
            <span>Usuario</span>
            <div class="d-flex align-center ga-2">
              <v-btn
                v-if="!editUser"
                prepend-icon="mdi-account-edit"
                color="primary"
                @click="toggleUserEdit(true)"
                :disabled="loadingUser"
              >Editar</v-btn>
              <v-btn
                v-else
                variant="text"
                prepend-icon="mdi-eye"
                @click="toggleUserEdit(false)"
                :disabled="savingUser"
              >Ver tarjeta</v-btn>
            </div>
          </v-card-title>

          <v-divider />

          <!-- Vista -->
          <v-expand-transition>
            <div v-show="!editUser">
              <v-card-text>
                <v-row align="center">
                  <v-col cols="12" md="4" class="d-flex justify-center">
                    <v-avatar size="120">
                      <v-img :src="userAvatar" alt="Avatar de usuario" cover />
                    </v-avatar>
                  </v-col>
                  <v-col cols="12" md="8">
                    <div class="text-h6">{{ usuario?.nombres }} {{ usuario?.apellidos }}</div>
                    <div class="text-caption text-medium-emphasis">{{ usuario?.correo }}</div>
                    <div class="text-caption text-medium-emphasis mt-1">{{ usuario?.telefono || '—' }}</div>

                    <v-divider class="my-4" />
                    <div class="text-body-2">
                      <strong>Razón social:</strong> {{ empresa?.nombre || '—' }}
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </div>
          </v-expand-transition>

          <!-- Edición -->
          <v-expand-transition>
            <div v-show="editUser">
              <v-card-text>
                <v-form @submit.prevent="saveUser">
                  <v-row>
                    <v-col cols="12" class="d-flex align-center ga-4">
                      <v-avatar size="84" class="elevation-1">
                        <v-img :src="userAvatar" alt="Avatar de usuario" cover />
                      </v-avatar>
                      <div class="d-flex ga-2 flex-wrap align-center">
                        <v-btn color="primary" :loading="uploading" @click="pickUserFile" prepend-icon="mdi-camera">
                          Cambiar avatar
                        </v-btn>
                        <input
                          ref="userFileInput"
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          class="d-none"
                          @change="onUserFile"
                        />
                      </div>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field label="Nombres" v-model.trim="userForm.nombres" :disabled="savingUser" variant="outlined" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field label="Apellidos" v-model.trim="userForm.apellidos" :disabled="savingUser" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field label="Correo" v-model.trim="userForm.correo" :disabled="savingUser" variant="outlined" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field label="Teléfono" v-model.trim="userForm.telefono" :disabled="savingUser" variant="outlined" />
                    </v-col>
                  </v-row>

                  <div class="d-flex justify-end ga-2">
                    <v-btn variant="text" @click="toggleUserEdit(false)" :disabled="savingUser">Cancelar</v-btn>
                    <v-btn color="primary" type="submit" :loading="savingUser">Guardar cambios</v-btn>
                  </div>
                </v-form>
              </v-card-text>
            </div>
          </v-expand-transition>

          <v-progress-linear v-if="loadingUser" indeterminate color="primary" />
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="okMsg" color="success" timeout="2200">
      Guardado correctamente
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { ApiError } from '@/services/http'
import RazonSocialService, {
  type RazonSocialDTO,
  type RazonSocialUpdatePayload,
} from '@/services/RazonSocialService'
import {
  listarUsuarios,
  actualizarUsuario,
  uploadAvatar as uploadUserAvatar,
  type Usuario,
} from '@/services/userService'
import { authSetStore } from '@/stores/AuthStore'

const auth = authSetStore()

/** ===== Empresa ===== */
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const editMode = ref(false)

const empresa = ref<RazonSocialDTO | null>(null)
const errorMsg = ref('')
const okMsg = ref(false)

const razonesSociales = ref<RazonSocialDTO[]>([])
const selectedId = ref<number | null>(null)
const loadingRS = ref(false)

const form = reactive<RazonSocialUpdatePayload>({
  nombre: '',
  prefijo_orden: '',
  correo: '',
  telefono: '',
  direccion: '',
  sitio_web: '',
  descripcion: '',
  avatar_url: '',
})

const API_ORIGIN = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3333')
  .toString()
  .replace(/\/$/, '')
const avatarPreview = computed(() => {
  const url = (editMode.value ? form.avatar_url : empresa.value?.avatar_url) || ''
  if (!url) return 'https://i.pravatar.cc/160?u=razon-social'
  return /^https?:\/\//i.test(url) ? url : `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`
})

const fileInput = ref<HTMLInputElement | null>(null)
function pickFile() {
  fileInput.value?.click()
}
async function onFile(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || !files[0]) return
  try {
    uploading.value = true
    const url = await RazonSocialService.uploadAvatar(files[0])
    form.avatar_url = url
  } catch (err) {
    errorMsg.value =
      err instanceof ApiError ? err.message : (err as Error)?.message || 'No se pudo subir la imagen'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function loadRS() {
  loadingRS.value = true
  try {
    const res = await RazonSocialService.listarRazonesSociales('', true)
    razonesSociales.value = res.data
    const saved = Number(localStorage.getItem('rs_id') || '')
    const exists = res.data.some((r) => r.id === saved)
    selectedId.value = exists ? saved : res.data[0]?.id ?? null
    if (selectedId.value) await onChangeRS(selectedId.value)
  } catch (err) {
    errorMsg.value =
      err instanceof ApiError ? err.message : (err as Error)?.message || 'No se pudo cargar razones sociales'
  } finally {
    loadingRS.value = false
  }
}

async function onChangeRS(id: number) {
  if (!id) return
  try {
    loading.value = true
    usuario.value = null // limpia tarjeta mientras cambia

    const res = await RazonSocialService.getMiEmpresa(id)
    empresa.value = res.data

    if (editMode.value && empresa.value) {
      form.nombre = empresa.value.nombre
      form.prefijo_orden = empresa.value.prefijo_orden
      form.correo = empresa.value.correo ?? ''
      form.telefono = empresa.value.telefono ?? ''
      form.direccion = empresa.value.direccion ?? ''
      form.sitio_web = empresa.value.sitio_web ?? ''
      form.descripcion = empresa.value.descripcion ?? ''
      form.avatar_url = empresa.value.avatar_url ?? ''
    }

    await loadUserByRS(id)
    localStorage.setItem('rs_id', String(id))
  } catch (err) {
    errorMsg.value =
      err instanceof ApiError ? err.message : (err as Error)?.message || 'No se pudo cargar la empresa'
  } finally {
    loading.value = false
  }
}

function toggleEdit(v: boolean) {
  editMode.value = v
  if (v && empresa.value) {
    form.nombre = empresa.value.nombre
    form.prefijo_orden = empresa.value.prefijo_orden
    form.correo = empresa.value.correo ?? ''
    form.telefono = empresa.value.telefono ?? ''
    form.direccion = empresa.value.direccion ?? ''
    form.sitio_web = empresa.value.sitio_web ?? ''
    form.descripcion = empresa.value.descripcion ?? ''
    form.avatar_url = empresa.value.avatar_url ?? ''
  }
}
function cancelEdit() {
  toggleEdit(false)
  errorMsg.value = ''
}

async function onSubmit() {
  if (!empresa.value) return
  try {
    saving.value = true
    errorMsg.value = ''

    const payload: RazonSocialUpdatePayload = {
      nombre: form.nombre,
      prefijo_orden: form.prefijo_orden,
      correo: form.correo,
      telefono: form.telefono,
      direccion: form.direccion,
      sitio_web: form.sitio_web,
      descripcion: form.descripcion,
      avatar_url: form.avatar_url,
    }

    const updated = await RazonSocialService.updateEmpresa(empresa.value.id, payload)
    const refreshed = await RazonSocialService.getMiEmpresa(updated.id)
    empresa.value = refreshed.data
    okMsg.value = true
    toggleEdit(false)
  } catch (err) {
    errorMsg.value =
      err instanceof ApiError ? err.message : (err as Error)?.message || 'No se pudo guardar'
  } finally {
    saving.value = false
  }
}

/* ===== Usuario (depende de la RS) ===== */
const loadingUser = ref(true)
const savingUser = ref(false)
const editUser = ref(false)

const usuario = ref<Usuario | null>(null)
const userForm = reactive<Partial<Usuario>>({
  nombres: '',
  apellidos: '',
  correo: '',
  telefono: '',
  avatar_url: '',
})

const userFileInput = ref<HTMLInputElement | null>(null)
function pickUserFile() {
  userFileInput.value?.click()
}

const userAvatar = computed(() => {
  const url = (editUser.value ? userForm.avatar_url : usuario.value?.avatar_url) || ''
  if (!url) return 'https://i.pravatar.cc/140?u=usuario'
  return /^https?:\/\//i.test(url) ? url : `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`
})

async function onUserFile(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || !files[0]) return
  try {
    uploading.value = true
    const url = await uploadUserAvatar(files[0])
    userForm.avatar_url = url
  } catch (err) {
    errorMsg.value =
      err instanceof ApiError ? err.message : (err as Error)?.message || 'No se pudo subir la imagen del usuario'
  } finally {
    uploading.value = false
    if (userFileInput.value) userFileInput.value.value = ''
  }
}

function toggleUserEdit(v: boolean) {
  editUser.value = v
  if (v && usuario.value) {
    userForm.nombres = usuario.value.nombres ?? ''
    userForm.apellidos = usuario.value.apellidos ?? ''
    userForm.correo = usuario.value.correo ?? ''
    userForm.telefono = usuario.value.telefono ?? ''
    userForm.avatar_url = usuario.value.avatar_url ?? ''
  }
}

async function loadUserByRS(rsId: number) {
  loadingUser.value = true
  try {
    const page = await listarUsuarios({ razon_social_id: rsId, perPage: 1 })
    usuario.value = page.data?.[0] ?? null
    if (editUser.value && usuario.value) {
      userForm.nombres = usuario.value.nombres ?? ''
      userForm.apellidos = usuario.value.apellidos ?? ''
      userForm.correo = usuario.value.correo ?? ''
      userForm.telefono = usuario.value.telefono ?? ''
      userForm.avatar_url = usuario.value.avatar_url ?? ''
    }
  } catch (err) {
    errorMsg.value =
      err instanceof ApiError ? err.message : (err as Error)?.message || 'No se pudo cargar el usuario'
  } finally {
    loadingUser.value = false
  }
}

async function saveUser() {
  if (!usuario.value) return
  try {
    savingUser.value = true
    errorMsg.value = ''

    const payload = {
      nombres: userForm.nombres,
      apellidos: userForm.apellidos,
      correo: userForm.correo,
      telefono: userForm.telefono || null,
      avatar_url: userForm.avatar_url ?? null,
    }

    const updated = await actualizarUsuario(usuario.value.id, payload)
    usuario.value = updated

    // Refresca datos visibles en el sidebar si corresponde
{
  // helpers locales (sin any)
  type SidebarAuthUser = {
    id: number
    correo: string
    nombre?: string
    profilePictureUrl?: string | null
  }
  function isSidebarAuthUser(u: unknown): u is SidebarAuthUser {
    return !!u &&
      typeof u === 'object' &&
      'id' in u && typeof (u as { id: unknown }).id === 'number' &&
      'correo' in u && typeof (u as { correo: unknown }).correo === 'string'
  }

  const store = auth as { user?: unknown; bumpAvatarStamp?: unknown }
  const current = store.user

  if (current && isSidebarAuthUser(current) && current.id === updated.id) {
    const nombre =
      [updated.nombres, updated.apellidos].filter(Boolean).join(' ') || updated.correo

    current.nombre = nombre
    current.profilePictureUrl = updated.avatar_url ?? current.profilePictureUrl ?? null

    if (typeof store.bumpAvatarStamp === 'function') {
      store.bumpAvatarStamp()
    }
    localStorage.setItem('user', JSON.stringify(current))
  }
}

okMsg.value = true
editUser.value = false
} catch (err) {
errorMsg.value =
  err instanceof ApiError ? err.message : (err as Error)?.message || 'No se pudo guardar el usuario'
} finally {
savingUser.value = false
}
}

onMounted(async () => {
await loadRS()
})
</script>

<style scoped>
.avatar-wrap { position: relative; display: inline-block; }
.form :deep(.v-field) { background: #fafafa; }
</style>

