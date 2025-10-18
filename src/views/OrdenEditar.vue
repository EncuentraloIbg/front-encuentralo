<template>
  <v-container class="py-5">
    <v-breadcrumbs :items="breadcrumbs" class="mb-2" />

    <v-card outlined>
      <!-- Encabezado -->
      <v-card-title class="py-6 d-flex flex-column align-center justify-center text-center">
        <div class="w-100 d-flex justify-end mb-2">
          <v-select
            v-model="razon_social_id"
            :items="razonesSociales"
            item-title="nombre"
            item-value="id"
            label="Razón social"
            density="compact"
            hide-details="auto"
            variant="outlined"
            style="max-width: 280px"
            :disabled="!EDITAR_RAZON_SOCIAL"
          />
        </div>

        <v-img
          v-if="razonSocialLogo"
          :src="razonSocialLogo"
          :alt="razonSocialNombre"
          :width="razonSocialLogoWidth"
          class="mb-2"
          eager
        />
        <div class="text-h5 font-weight-bold mb-1">{{ razonSocialNombre }}</div>
        <div class="text-subtitle-1">EDITAR ORDEN</div>
        <div class="text-body-2 text-grey-darken-1 mt-1" v-if="ordenCodigo">
          <strong>{{ ordenCodigo }}</strong>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
          :text="error"
        />

        <div v-if="loading" class="py-8 d-flex justify-center">
          <v-progress-circular indeterminate size="36" />
        </div>

        <v-form v-else @submit.prevent="onSubmit" class="form" style="color: black">
          <!-- ===== CLIENTE ===== -->
          <v-row class="mb-1">
            <v-col cols="12"><h3 class="text-subtitle-1 font-weight-bold">DATOS DEL CLIENTE</h3></v-col>

            <v-col cols="12" md="3">
              <v-radio-group v-model="cliente.tipo_cliente" inline :disabled="!EDITAR_CLIENTE_EQUIPO">
                <v-radio label="Persona" value="persona" />
                <v-radio label="Empresa" value="empresa" />
              </v-radio-group>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                label="Nombre completo"
                v-model="cliente.nombre"
                :error-messages="errors.nombre"
                density="compact"
                hide-details="auto"
                required
                :readonly="!EDITAR_CLIENTE_EQUIPO"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                label="Documento (tipo y número)"
                v-model="cliente.documento"
                :error-messages="errors.documento"
                density="compact"
                hide-details="auto"
                required
                :readonly="!EDITAR_CLIENTE_EQUIPO"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                label="Teléfono (WhatsApp)"
                v-model="cliente.telefono"
                density="compact"
                hide-details="auto"
                :readonly="!EDITAR_CLIENTE_EQUIPO"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                label="Correo electrónico"
                v-model="cliente.correo"
                type="email"
                density="compact"
                hide-details="auto"
                :readonly="!EDITAR_CLIENTE_EQUIPO"
              />
            </v-col>

            <v-col cols="12" md="5">
              <v-text-field
                label="Dirección"
                v-model="cliente.direccion"
                density="compact"
                hide-details="auto"
                :readonly="!EDITAR_CLIENTE_EQUIPO"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-checkbox
                v-model="cliente.whatsapp_opt_in"
                label="Acepta mensajes por WhatsApp"
                hide-details
                :disabled="!EDITAR_CLIENTE_EQUIPO"
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <!-- ===== EQUIPO ===== -->
          <v-row>
            <v-col cols="12"><h3 class="text-subtitle-1 font-weight-bold">DATOS DEL EQUIPO</h3></v-col>

            <v-col cols="12" md="4">
              <v-select
                label="Tipo de equipo"
                v-model="equipo.tipo_equipo_id"
                :items="tiposEquipo"
                item-title="nombre"
                item-value="id"
                :error-messages="errors.tipo_equipo_id"
                density="compact"
                hide-details="auto"
                required
                :disabled="!EDITAR_CLIENTE_EQUIPO"
              />
            </v-col>

            <!-- MARCA (PC / Cel) + Otro -->
            <v-col cols="12" md="4">
              <v-select
                :items="brandOptions"
                v-model="brandSelected"
                label="Marca"
                density="compact"
                hide-details="auto"
                clearable
                :error-messages="errors.marca"
                :disabled="!EDITAR_CLIENTE_EQUIPO"
              />
              <v-text-field
                v-if="brandSelected === 'Otro'"
                class="mt-2"
                label="Especifique marca"
                v-model="brandOther"
                density="compact"
                hide-details="auto"
                :readonly="!EDITAR_CLIENTE_EQUIPO"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                label="Modelo"
                v-model="equipo.modelo"
                :error-messages="errors.modelo"
                density="compact"
                hide-details="auto"
                required
                :readonly="!EDITAR_CLIENTE_EQUIPO"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                label="Número de serie / IMEI"
                v-model="equipo.serie_imei"
                :error-messages="errors.serie_imei"
                density="compact"
                hide-details="auto"
                required
                :readonly="!EDITAR_CLIENTE_EQUIPO"
              />
            </v-col>

            <!-- SO / RAM / DISCO + Otro -->
            <v-col cols="12" md="4">
              <v-select
                v-model="soSeleccionado"
                :items="soOpciones"
                label="Sistema operativo"
                density="compact"
                hide-details="auto"
                clearable
                :disabled="!EDITAR_CLIENTE_EQUIPO"
              />
              <v-text-field
                v-if="soSeleccionado === 'Otro'"
                class="mt-2"
                label="Especifique sistema operativo"
                v-model="soOtroDetalle"
                density="compact"
                hide-details="auto"
                :readonly="!EDITAR_CLIENTE_EQUIPO"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="ramSeleccionado"
                :items="ramOpciones"
                label="Memoria RAM"
                density="compact"
                hide-details="auto"
                clearable
                :disabled="!EDITAR_CLIENTE_EQUIPO"
              />
              <v-text-field
                v-if="ramSeleccionado === 'Otro'"
                class="mt-2"
                label="Especifique RAM (ej: 12 GB)"
                v-model="ramOtroDetalle"
                density="compact"
                hide-details="auto"
                :readonly="!EDITAR_CLIENTE_EQUIPO"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="discoSeleccionado"
                :items="discoOpciones"
                label="Disco / Almacenamiento"
                density="compact"
                hide-details="auto"
                clearable
                :disabled="!EDITAR_CLIENTE_EQUIPO"
              />
              <v-text-field
                v-if="discoSeleccionado === 'Otro'"
                class="mt-2"
                label="Especifique almacenamiento (ej: 512 GB SSD)"
                v-model="discoOtroDetalle"
                density="compact"
                hide-details="auto"
                :readonly="!EDITAR_CLIENTE_EQUIPO"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                :model-value="specsPreview"
                label="Resumen de specs (automático)"
                density="compact"
                hide-details="auto"
                readonly
                variant="outlined"
              />
            </v-col>

            <!-- ESTADO FÍSICO -->
            <v-col cols="12">
              <v-select
                v-model="estadoFisicoSeleccionado"
                :items="estadoFisicoOpciones"
                label="Estado físico al recibir"
                multiple
                chips
                closable-chips
                density="compact"
                hide-details="auto"
                :menu-props="{ maxHeight: 400 }"
              />
              <v-text-field
                v-if="estadoFisicoSeleccionado.includes('Otro')"
                class="mt-2"
                label="Detalle de 'Otro' (estado físico)"
                v-model="estadoFisicoOtroDetalle"
                density="compact"
                hide-details="auto"
              />
            </v-col>

            <!-- ACCESORIOS -->
            <v-col cols="12">
              <v-select
                v-model="accesoriosSeleccionados"
                :items="accesorioOpciones"
                item-title="nombre"
                item-value="id"
                label="Accesorios entregados"
                multiple
                chips
                closable-chips
                density="compact"
                hide-details="auto"
                :menu-props="{ maxHeight: 400 }"
              />
            </v-col>
          </v-row>

          <!-- ===== FOTOS ===== -->
          <v-divider class="my-6" />
          <v-row>
            <v-col cols="12">
              <h3 class="text-subtitle-1 font-weight-bold">
                FOTOS DEL EQUIPO <span class="text-medium-emphasis">(máx. 3)</span>
              </h3>
            </v-col>

            <v-col cols="12" md="8">
              <v-file-input
                v-model="fotosPicked"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                prepend-icon="mdi-image-plus"
                label="Selecciona fotos"
                density="compact"
                hide-details="auto"
                @update:modelValue="onFotosPicked"
              />
              <div class="text-caption text-medium-emphasis mt-1">
                {{ fotos.length }}/3 seleccionadas. Tamaño máx: 6 MB por imagen. Formatos: JPG, PNG, WEBP, GIF.
              </div>
            </v-col>

            <v-col cols="12" md="4" class="d-flex align-end">
              <v-btn
                :disabled="!hayFotosSubiendo || subiendoBloqueado"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-cloud-upload"
                @click="reintentarFallidas"
              >
                {{ textoBotonSubida }}
              </v-btn>
            </v-col>

            <v-col cols="12">
              <div class="d-flex flex-wrap">
                <v-card
                  v-for="(f, idx) in fotos"
                  :key="idx"
                  class="ma-2"
                  elevation="1"
                  width="180"
                >
                  <v-img
                    :src="f.preview || f.url"
                    height="120"
                    cover
                    class="bg-grey-lighten-3"
                  >
                    <template #placeholder>
                      <div class="fill-height d-flex align-center justify-center text-medium-emphasis">
                        <v-progress-circular v-if="f.uploading" indeterminate size="20" class="me-2" />
                        <span v-if="f.uploading">Subiendo…</span>
                        <span v-else>Sin vista previa</span>
                      </div>
                    </template>
                  </v-img>

                  <v-card-text class="py-2">
                    <div class="text-caption">
                      {{ f.descripcion || (f.file?.name || 'Imagen') }}
                    </div>
                    <div v-if="f.error" class="text-caption text-error">Error: {{ f.error }}</div>
                  </v-card-text>

                  <v-card-actions class="py-1">
                    <v-btn
                      size="small"
                      variant="text"
                      color="primary"
                      :disabled="!f.preview && !f.url"
                      @click="abrirPreview(f)"
                    >
                      <v-icon class="me-1">mdi-magnify</v-icon> Ver
                    </v-btn>
                    <v-spacer />
                    <v-btn
                      size="small"
                      variant="text"
                      color="error"
                      :disabled="f.uploading"
                      @click="eliminarFoto(idx)"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </div>

              <div v-if="fotos.length === 0" class="text-medium-emphasis">
                Aún no has añadido fotos.
              </div>
            </v-col>
          </v-row>

          <!-- Preview modal -->
          <v-dialog v-model="previewDialog" max-width="900" persistent>
            <v-card class="rounded-xl">
              <v-card-title class="d-flex align-center">
                Vista previa
                <v-spacer />
                <v-btn icon variant="text" @click="previewDialog = false">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-card-title>
              <v-divider />
              <v-card-text class="d-flex justify-center">
                <v-img
                  :src="previewSrc"
                  max-height="70vh"
                  contain
                  class="bg-grey-lighten-3 rounded-lg"
                />
              </v-card-text>
            </v-card>
          </v-dialog>

          <v-divider class="my-6" />

          <!-- ===== FALLA / PASS ===== -->
          <v-row class="mt-2">
            <v-col cols="12">
              <v-textarea
                label="Falla reportada por el cliente"
                v-model="orden.fallo_reportado"
                :error-messages="errors.fallo_reportado"
                rows="3"
                density="compact"
                hide-details="auto"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                label="Contraseña de acceso (si aplica)"
                v-model="orden.pass_desbloqueo"
                type="text"
                density="compact"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <!-- ===== CONDICIONES ===== -->
          <v-row>
            <v-col cols="12"><h3 class="text-subtitle-1 font-weight-bold">CONDICIONES</h3></v-col>

            <v-col cols="12" md="4">
              <v-checkbox v-model="orden.autoriza_respaldo" label="¿Autoriza respaldo de datos?" hide-details/>
            </v-col>
            <v-col cols="12" md="4">
              <v-checkbox v-model="orden.autoriza_apertura" label="¿Autoriza apertura del equipo?" hide-details/>
            </v-col>
            <v-col cols="12" md="4">
              <v-checkbox v-model="orden.mojado" label="¿Equipo con humedad/derrame?" hide-details/>
            </v-col>

            <v-col cols="12">
              <v-textarea
                label="Observaciones adicionales"
                v-model="orden.observaciones_cliente"
                rows="3"
                density="compact"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <!-- ===== VALORES ===== -->
          <v-row>
            <v-col cols="12"><h3 class="text-subtitle-1 font-weight-bold">VALORES</h3></v-col>

            <v-col cols="12" md="3">
              <v-text-field
                label="Valor diagnóstico"
                v-model.number="orden.diagnostico_costo"
                prefix="$"
                type="number"
                min="0"
                density="compact"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                label="Anticipo recibido"
                v-model.number="orden.anticipo"
                prefix="$"
                type="number"
                min="0"
                density="compact"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                label="Forma de pago"
                v-model="orden.metodo_pago_id"
                :items="metodosPago"
                item-title="nombre"
                item-value="id"
                density="compact"
                hide-details="auto"
                clearable
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="fechaEntregaLocal"
                label="Fecha y hora de entrega acordada"
                type="datetime-local"
                density="compact"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <!-- ===== CONFIRMACIÓN ===== -->
          <v-row>
            <v-col cols="12" md="6">
              <v-checkbox v-model="confirmDatos" label="Confirmo que los datos fueron revisados" hide-details />
            </v-col>
            <v-col cols="12" md="6">
              <v-checkbox v-model="confirmAccesorios" label="Confirmo que se recibieron únicamente los accesorios listados" hide-details />
            </v-col>
          </v-row>

          <div class="d-flex flex-wrap gap-2 mt-4">
            <v-btn variant="text" color="grey" @click="goBack">
              <v-icon class="me-1">mdi-arrow-left</v-icon> Volver
            </v-btn>
            <v-spacer />
            <v-btn color="grey" variant="text" @click="resetForm">Restablecer</v-btn>
            <v-btn color="primary" type="submit" :loading="saving">Guardar cambios</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="5000">
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  reqObtenerOrden,
  reqActualizarOrden,
  reqAccesorios,
  reqMetodosPago,
  reqTiposEquipo,
  reqAgregarFotos,
  reqAgregarAccesorios,
} from '@/services/ordenesService'

/* ===== Flags (ajusta a tu backend) ===== */
const EDITAR_CLIENTE_EQUIPO = false
const EDITAR_RAZON_SOCIAL   = false

/* ===== Router ===== */
const route = useRoute()
const router = useRouter()
const ordenId = computed(() => Number(route.params.id))
function goBack() {
  if (history.length > 1) router.back()
  else router.push({ name: 'historial-ordenes' }).catch(() => {})
}

/* ===== UI State ===== */
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
type SnackColor = 'success' | 'error' | 'warning'
const snackbar = ref<{ show: boolean; message: string; color: SnackColor }>({ show: false, message: '', color: 'success' })

/* ===== API ORIGIN (para subir fotos) ===== */
const apiBaseFromEnv = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_API_BASE_URL as string | undefined) : undefined
const API_ORIGIN = (apiBaseFromEnv ? apiBaseFromEnv.replace(/\/$/, '') : 'http://localhost:3333')

/* ===== Tipos ===== */
type Catalogo = { id: number; nombre: string; logo?: string; prefijo?: string; logoWidth?: number }
type AccesorioItem = { id: number; nombre: string }
type MetodoPagoItem = { id: number; nombre: string }
type TipoEquipoItem = { id: number; nombre: string }

type ClientePayload = {
  nombre: string
  documento: string
  telefono?: string
  correo?: string
  direccion?: string | null
  whatsapp_opt_in?: boolean
  tipo_cliente?: 'persona' | 'empresa' | null
}
type EquipoPayload = {
  tipo_equipo_id: number | null
  marca: string
  modelo: string
  serie_imei: string
  specs?: string | null
}
type OrdenPayload = {
  estado_estetico?: string | null
  fallo_reportado?: string | null
  observaciones_cliente?: string | null
  pass_desbloqueo?: string | null
  autoriza_respaldo?: boolean | null
  autoriza_apertura?: boolean | null
  mojado?: boolean | null
  diagnostico_costo?: number | null
  anticipo?: number | null
  metodo_pago_id?: number | null
  fecha_entrega_acordada?: string | null
}

/* ===== Form state ===== */
const razon_social_id = ref<number>(0)
const ordenCodigo = ref<string>('')

const cliente = ref<ClientePayload>({
  nombre: '', documento: '', telefono: '', correo: '', direccion: '', whatsapp_opt_in: false, tipo_cliente: 'persona',
})
const equipo = ref<EquipoPayload>({
  tipo_equipo_id: null, marca: '', modelo: '', serie_imei: '', specs: '',
})
const orden = ref<OrdenPayload>({
  estado_estetico: '', fallo_reportado: '', observaciones_cliente: '', pass_desbloqueo: '',
  autoriza_respaldo: false, autoriza_apertura: false, mojado: false,
  diagnostico_costo: null, anticipo: null, metodo_pago_id: null, fecha_entrega_acordada: null,
})

/* ===== Razones sociales (demo logos) ===== */
import logoEncuentralo from '@/assets/Encuentralo.png?url'
import logoMundosmartphone from '@/assets/Mundosmartphone.png?url'
const razonesSociales = ref<Catalogo[]>([
  { id: 1, nombre: 'Encuentralo.com',  logo: logoEncuentralo,     prefijo: 'OEC', logoWidth: 160 },
  { id: 2, nombre: 'Mundosmartphone',  logo: logoMundosmartphone,  prefijo: 'OGC', logoWidth: 320 },
])
const razonSocialNombre = computed(() => razonesSociales.value.find(r => r.id === razon_social_id.value)?.nombre ?? 'Razón social')
const razonSocialLogo = computed(() => razonesSociales.value.find(r => r.id === razon_social_id.value)?.logo ?? null)
const razonSocialLogoWidth = computed(() => razonesSociales.value.find(r => r.id === razon_social_id.value)?.logoWidth ?? 160)

/* ===== Validación ===== */
const errors = ref<Record<string, string>>({ nombre: '', documento: '', tipo_equipo_id: '', marca: '', modelo: '', serie_imei: '', fallo_reportado: '' })
function validate() {
  errors.value = {
    nombre: cliente.value.nombre?.trim() ? '' : 'Nombre es obligatorio.',
    documento: cliente.value.documento?.trim() ? '' : 'Documento es obligatorio.',
    tipo_equipo_id: equipo.value.tipo_equipo_id ? '' : 'Tipo de equipo es obligatorio.',
    marca: equipoMarcaEffective.value.trim() ? '' : 'Marca es obligatoria.',
    modelo: equipo.value.modelo?.trim() ? '' : 'Modelo es obligatorio.',
    serie_imei: equipo.value.serie_imei?.trim() ? '' : 'Serie/IMEI es obligatorio.',
    fallo_reportado: orden.value.fallo_reportado?.trim() ? '' : 'Falla reportada es obligatoria.',
  }
  return Object.values(errors.value).every((e) => e === '')
}

/* ===== Catálogos ===== */
const tiposEquipo = ref<TipoEquipoItem[]>([])
const accesorios = ref<AccesorioItem[]>([])
const metodosPago = ref<MetodoPagoItem[]>([])
async function cargarCatalogos() {
  const [tip, acc, mp] = await Promise.all([
    (async () => { const { method, url } = reqTiposEquipo(); const r = await fetch(url, { method }); return r.ok ? r.json() : [] })(),
    (async () => { const { method, url } = reqAccesorios(); const r = await fetch(url, { method }); return r.ok ? r.json() : [] })(),
    (async () => { const { method, url } = reqMetodosPago(); const r = await fetch(url, { method }); return r.ok ? r.json() : [] })(),
  ])
  tiposEquipo.value = tip || []
  accesorios.value = acc || []
  metodosPago.value = mp || []
}

/* ===== Marcas dinámicas ===== */
const PC_BRANDS = ['Acer','ASUS','Dell','HP','Lenovo','MSI','Apple','Samsung','Toshiba','Huawei','Razer','Microsoft (Surface)','Alienware','Gigabyte','Sony','LG'] as const
const PHONE_BRANDS = ['Samsung','Apple (iPhone)','Xiaomi','Huawei','Motorola','Nokia','OPPO','Vivo','OnePlus','Sony','ZTE','Realme','Google (Pixel)','Honor','Tecno','Infinix','LG','ASUS (ROG)','Lenovo'] as const
const OTHER_OPTION = 'Otro'
const brandSelected = ref<string | null>(null)
const brandOther = ref('')

const selectedTipo = computed(() => tiposEquipo.value.find(t => t.id === (equipo.value.tipo_equipo_id ?? -1)))
const tipoNombre = computed(() => (selectedTipo.value?.nombre ?? '').toLowerCase())
const isPhoneType = computed(() => /cel|móvi|smart|tel[eé]fono/.test(tipoNombre.value))
const isPcType    = computed(() => /pc|laptop|port[aá]til|computador|notebook|desktop/.test(tipoNombre.value))

const brandOptions = computed(() => {
  let base: readonly string[]
  if (isPhoneType.value && !isPcType.value) base = PHONE_BRANDS
  else if (isPcType.value && !isPhoneType.value) base = PC_BRANDS
  else base = [...new Set([...PC_BRANDS, ...PHONE_BRANDS])]
  return [...base, OTHER_OPTION]
})
watch(brandSelected, v => { if (v !== OTHER_OPTION) brandOther.value = '' })
const equipoMarcaEffective = computed(() => (brandSelected.value === OTHER_OPTION ? brandOther.value : brandSelected.value) || '')

/* ===== SO / RAM / DISCO ===== */
const soOpciones = ['Windows 8','Windows 10','Windows 11','Ubuntu','Android','iOS','Otro'] as const
const ramOpciones = ['2 GB','4 GB','8 GB','16 GB','32 GB','Otro'] as const
const discoOpciones = ['128 GB','240 GB','256 GB','500 GB','512 GB','1 TB','2 TB','Otro'] as const
const soSeleccionado = ref<string | null>(null); const soOtroDetalle = ref('')
const ramSeleccionado = ref<string | null>(null); const ramOtroDetalle = ref('')
const discoSeleccionado = ref<string | null>(null); const discoOtroDetalle = ref('')

function withRamLabel(v: string) { return v.toLowerCase().includes('ram') ? v : `${v} RAM` }
const specsPreview = computed(() => {
  const parts: string[] = []
  const so = (soSeleccionado.value === 'Otro' ? soOtroDetalle.value : soSeleccionado.value) || ''
  if (so.trim()) parts.push(so.trim())
  const ramRaw = (ramSeleccionado.value === 'Otro' ? ramOtroDetalle.value : ramSeleccionado.value) || ''
  if (ramRaw.trim()) parts.push(withRamLabel(ramRaw.trim()))
  const disco = (discoSeleccionado.value === 'Otro' ? discoOtroDetalle.value : discoSeleccionado.value) || ''
  if (disco.trim()) parts.push(disco.trim())
  return parts.filter(Boolean).join(', ')
})
watch([soSeleccionado,soOtroDetalle,ramSeleccionado,ramOtroDetalle,discoSeleccionado,discoOtroDetalle], () => { equipo.value.specs = specsPreview.value })

/* ===== Estado físico ===== */
const estadoFisicoOpciones = ['Sin golpes','Rayones leves','Golpes en esquinas','Pantalla rota','Pantalla con rayones','Tapa trasera dañada','Bisagras sueltas','Puertos con juego','Huellas de humedad','Oxidación visible','Otro'] as const
const estadoFisicoSeleccionado = ref<string[]>([])
const estadoFisicoOtroDetalle = ref('')
function estadoFisicoToText() {
  const list = [...estadoFisicoSeleccionado.value]
  const idx = list.indexOf('Otro')
  if (idx >= 0 && estadoFisicoOtroDetalle.value.trim()) list[idx] = `Otro: ${estadoFisicoOtroDetalle.value.trim()}`
  return list.join(', ')
}

/* ===== Accesorios seleccionados ===== */
const accesoriosSeleccionados = ref<number[]>([])
const ACCESORIO_OTRO_ID = -99 as const
const accesorioOpciones = computed<AccesorioItem[]>(() => {
  const other: AccesorioItem = { id: ACCESORIO_OTRO_ID as unknown as number, nombre: 'Otro' }
  return [...accesorios.value, other]
})

/* ===== FOTOS ===== */
type FotoItem = {
  file?: File
  preview?: string
  url?: string
  uploading: boolean
  error?: string
  descripcion?: string
}
const fotos = ref<FotoItem[]>([])
const fotosPicked = ref<File[] | null>(null)
const initialFotoUrls = ref<Set<string>>(new Set())

const previewDialog = ref(false)
const previewSrc = ref<string>('')
function abrirPreview(f: FotoItem) { previewSrc.value = f.url ?? f.preview ?? ''; previewDialog.value = true }
function revokePreview(url?: string) { if (url?.startsWith('blob:')) URL.revokeObjectURL(url) }
function eliminarFoto(idx: number) {
  const f = fotos.value[idx]
  if (f?.preview) revokePreview(f.preview)
  fotos.value.splice(idx, 1)
}

const MAX_FOTOS = 3
const MAX_MB = 6
const ACEPTADOS = ['image/jpeg','image/png','image/webp','image/gif']

function onFotosPicked(files: File[] | null) {
  if (!files || files.length === 0) return
  const espacio = MAX_FOTOS - fotos.value.length
  const lote = Array.from(files).slice(0, Math.max(0, espacio))
  for (const file of lote) {
    if (!ACEPTADOS.includes(file.type)) { snackbar.value = { show: true, message: 'Formato no permitido', color: 'error' }; continue }
    if (file.size > MAX_MB * 1024 * 1024) { snackbar.value = { show: true, message: `La imagen supera ${MAX_MB}MB`, color: 'error' }; continue }
    const item: FotoItem = { file, preview: URL.createObjectURL(file), uploading: true }
    fotos.value.push(item)
    subirFoto(item)
  }
  fotosPicked.value = null
}

async function subirFoto(item: FotoItem) {
  try {
    const fd = new FormData()
    fd.append('foto', item.file as File)
    const res = await fetch(`${API_ORIGIN}/api/v1/uploads/fotos`, { method: 'POST', body: fd })
    const ct = res.headers.get('content-type') ?? ''
    const data: any = ct.includes('application/json') ? await res.json() : await res.text()
    if (!res.ok) throw new Error((typeof data === 'object' && data?.message) || `HTTP ${res.status}`)
    const url = data?.url || data?.urls?.[0] || data?.data?.[0]?.url
    if (!url) throw new Error('La API no devolvió URL')
    item.url = url
    item.error = undefined
  } catch (e: any) {
    item.error = e?.message || 'Error subiendo foto'
    snackbar.value = { show: true, message: `Error subiendo foto: ${item.error}`, color: 'error' }
  } finally {
    item.uploading = false
  }
}

const hayFotosSubiendo = computed(() => fotos.value.some(f => f.uploading))
const hayFotosFallidas = computed(() => fotos.value.some(f => f.error))
const subiendoBloqueado = computed(() => !hayFotosFallidas.value)
const textoBotonSubida = computed(() => (hayFotosFallidas.value ? 'Reintentar fallidas' : 'Subiendo…'))
function reintentarFallidas() {
  for (const f of fotos.value) if (f.error && f.file) { f.error = undefined; f.uploading = true; subirFoto(f) }
}

onBeforeUnmount(() => { fotos.value.forEach(f => revokePreview(f.preview)) })

/* ===== Fecha local -> ISO ===== */
const fechaEntregaLocal = ref('')
function toIsoOrNull(local: string) {
  if (!local) return null
  const withSec = local.length === 16 ? `${local}:00` : local
  const d = new Date(withSec)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/* ===== Confirmaciones ===== */
const confirmDatos = ref(true)
const confirmAccesorios = ref(true)

/* ===== Carga de ORDEN y precarga ===== */
async function cargarOrden() {
  error.value = null
  loading.value = true
  try {
    const { method, url } = reqObtenerOrden(ordenId.value)
    const res = await fetch(url, { method })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
    const data = await res.json()

    // razon social & código
    razon_social_id.value = data?.razon_social?.id ?? data?.razonSocial?.id ?? 1
    ordenCodigo.value = data?.codigo ?? ''

    // cliente
    const c = data?.cliente || {}
    cliente.value = {
      nombre: c?.nombre ?? '',
      documento: c?.documento ?? '',
      telefono: c?.telefono ?? '',
      correo: c?.correo ?? '',
      direccion: c?.direccion ?? '',
      whatsapp_opt_in: Boolean(c?.whatsapp_opt_in ?? false),
      tipo_cliente: (c?.tipo_cliente ?? 'persona') as any,
    }

    // equipo
    const e = data?.equipo || {}
    equipo.value = {
      tipo_equipo_id: e?.tipo_equipo_id ?? e?.tipoEquipoId ?? null,
      marca: e?.marca ?? '',
      modelo: e?.modelo ?? '',
      serie_imei: e?.serie_imei ?? e?.serieImei ?? '',
      specs: e?.specs ?? '',
    }
    if (e?.marca && brandOptions.value.includes(e.marca)) {
      brandSelected.value = e.marca
      brandOther.value = ''
    } else if (e?.marca) {
      brandSelected.value = 'Otro'
      brandOther.value = e.marca
    } else {
      brandSelected.value = null
      brandOther.value = ''
    }

    // fecha entrega
    const fecha = data?.fecha_entrega_acordada ?? data?.fechaEntregaAcordada ?? null
    if (fecha) {
      const s = String(fecha)
      const d = new Date(s)
      const pad = (n: number) => String(n).padStart(2, '0')
      const local = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      fechaEntregaLocal.value = local
    } else {
      fechaEntregaLocal.value = ''
    }

    // orden (valores)
    orden.value = {
      estado_estetico: data?.estado_estetico ?? data?.estadoEstetico ?? '',
      fallo_reportado: data?.fallo_reportado ?? data?.falloReportado ?? '',
      observaciones_cliente: data?.observaciones_cliente ?? data?.observacionesCliente ?? '',
      pass_desbloqueo: data?.pass_desbloqueo ?? data?.passDesbloqueo ?? '',
      autoriza_respaldo: Boolean(data?.autoriza_respaldo ?? data?.autorizaRespaldo ?? false),
      autoriza_apertura: Boolean(data?.autoriza_apertura ?? data?.autorizaApertura ?? false),
      mojado: Boolean(data?.mojado ?? false),
      diagnostico_costo: Number(data?.diagnostico_costo ?? data?.diagnosticoCosto ?? 0) || null,
      anticipo: Number(data?.anticipo ?? 0) || null,
      metodo_pago_id: data?.metodo_pago?.id ?? data?.metodoPago?.id ?? null,
      fecha_entrega_acordada: fecha ? new Date(fecha).toISOString() : null,
    }

    // estado físico → chips
    const estFis = (orden.value.estado_estetico || '').split(',').map((s) => s.trim()).filter(Boolean)
    estadoFisicoSeleccionado.value = estFis.filter(v => estadoFisicoOpciones.includes(v as any)) as string[]
    const otro = estFis.find(s => s.toLowerCase().startsWith('otro:'))
    estadoFisicoOtroDetalle.value = otro ? otro.split(':').slice(1).join(':').trim() : ''

    // accesorios
    const acc = Array.isArray(data?.accesorios) ? data.accesorios : []
    accesoriosSeleccionados.value = acc.map((a: any) => a.accesorio_id ?? a.id).filter((x: any) => Number.isInteger(x))

    // fotos existentes
    const fs = Array.isArray(data?.fotos) ? data.fotos : []
    initialFotoUrls.value = new Set(fs.map((f: any) => f.url).filter(Boolean))
    fotos.value = fs.map((f: any) => ({
      url: f.url,
      uploading: false,
      descripcion: f.descripcion ?? '',
    }))
  } catch (e: any) {
    error.value = e?.message || 'No fue posible cargar la orden'
  } finally {
    loading.value = false
  }
}

/* ===== Helper accesorios (intenta payload alterno si 500) ===== */
async function actualizarAccesoriosSeleccionados(): Promise<boolean> {
  const sel = (accesoriosSeleccionados.value || []).filter(id => id > 0).map(id => ({ accesorio_id: id }))
  const headers = { 'Content-Type': 'application/json' }

  try {
    const { method, url, body } = reqAgregarAccesorios(ordenId.value, sel as any)
    const r = await fetch(url, { method, headers, body: JSON.stringify(body) })
    if (r.ok) return true

    // fallback: algunos backends esperan { accesorios: [...] }
    const r2 = await fetch(url, { method, headers, body: JSON.stringify({ accesorios: sel }) })
    if (r2.ok) return true

    const t = await r.text()
    throw new Error(`HTTP ${r.status}: ${t}`)
  } catch (err: any) {
    snackbar.value = { show: true, message: `Accesorios no se pudieron actualizar: ${err?.message || 'Error'}`, color: 'error' }
    return false
  }
}

/* ===== Guardar ===== */
async function onSubmit() {
  if (!confirmDatos.value || !confirmAccesorios.value) {
    snackbar.value = { show: true, message: 'Debes confirmar la revisión de datos y de accesorios.', color: 'warning' }
    return
  }
  if (!validate()) {
    snackbar.value = { show: true, message: 'Revisa los campos obligatorios.', color: 'error' }
    return
  }

  // Normalizar estado y specs
  orden.value.estado_estetico = estadoFisicoToText() || null
  equipo.value.marca = equipoMarcaEffective.value.trim()
  equipo.value.specs = specsPreview.value || undefined

  saving.value = true
  try {
    // 1) PATCH orden
    const { method, url, body } = reqActualizarOrden(ordenId.value, {
      estado_estetico: orden.value.estado_estetico ?? null,
      fallo_reportado: orden.value.fallo_reportado ?? null,
      observaciones_cliente: orden.value.observaciones_cliente ?? null,
      pass_desbloqueo: orden.value.pass_desbloqueo ?? null,
      autoriza_respaldo: Boolean(orden.value.autoriza_respaldo),
      autoriza_apertura: Boolean(orden.value.autoriza_apertura),
      mojado: Boolean(orden.value.mojado),
      diagnostico_costo: orden.value.diagnostico_costo ?? null,
      anticipo: orden.value.anticipo ?? null,
      metodo_pago_id: orden.value.metodo_pago_id ?? null,
      fecha_entrega_acordada: toIsoOrNull(fechaEntregaLocal.value),
    } as any)
    const upRes = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!upRes.ok) throw new Error(`No se pudo actualizar la orden. ${upRes.status} ${await upRes.text()}`)

    // 2) Accesorios (robusto)
    await actualizarAccesoriosSeleccionados()

    // 3) Fotos NUEVAS
    const nuevas = fotos.value
      .filter(f => f.url && !initialFotoUrls.value.has(f.url))
      .map(f => ({ url: f.url as string, descripcion: f.descripcion ?? null }))

    if (nuevas.length > 0) {
      const { method: mF, url: uF, body: bF } = reqAgregarFotos(ordenId.value, nuevas as any)
      let r = await fetch(uF, { method: mF, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bF) })
      if (!r.ok) {
        // fallback: { fotos: [...] }
        r = await fetch(uF, { method: mF, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fotos: nuevas }) })
      }
      if (!r.ok) throw new Error(`No se pudieron agregar las fotos. ${r.status} ${await r.text()}`)
      nuevas.forEach(n => initialFotoUrls.value.add(n.url))
    }

    snackbar.value = { show: true, message: 'Orden actualizada correctamente.', color: 'success' }
    await cargarOrden()
  } catch (err: any) {
    snackbar.value = { show: true, message: err?.message || 'No fue posible guardar los cambios', color: 'error' }
  } finally {
    saving.value = false
  }
}

/* ===== Reset (evita warning y recarga datos) ===== */
function resetForm() {
  // Limpia selecciones temporales locales (fotos nuevas no confirmadas)
  fotos.value
    .filter(f => f.preview && !f.url)
    .forEach(f => revokePreview(f.preview))
  fotosPicked.value = null
  // Relee la orden desde el backend
  cargarOrden()
}

/* ===== Migas ===== */
const breadcrumbs = computed(() => ([
  { title: 'Órdenes', to: { name: 'historial-ordenes' } },
  { title: ordenCodigo.value || `Orden #${ordenId.value}`, disabled: true },
]))

/* ===== Init ===== */
onMounted(async () => {
  await Promise.all([cargarCatalogos(), cargarOrden()])
})
</script>

<style scoped>
.form { padding: 1rem; }
.text-h5, .text-h6 { color: #1976D2; font-weight: bold; }
</style>
