<template>
  <v-container class="py-5">
    <v-card outlined>
      <!-- Encabezado -->
      <v-card-title
        class="py-6 d-flex flex-column align-center justify-center text-center"
        style="border-bottom: 1px solid rgba(16,24,40,.08)"
      >
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
        <div class="text-subtitle-1">ORDEN DE ENTRADA</div>
        <div class="text-body-2 text-grey-darken-1 mt-1">
          <strong>{{ consecutivoPreviewText }}</strong>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-form @submit.prevent="onSubmit" class="form" style="color: black">
          <!-- ===== CLIENTE ===== -->
          <v-row class="mb-1 soft-block">
            <v-col cols="12"><h3 class="text-subtitle-1 font-weight-bold">DATOS DEL CLIENTE</h3></v-col>

            <v-col cols="12" md="3">
              <v-radio-group v-model="cliente.tipo_cliente" inline>
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
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                label="Teléfono (WhatsApp)"
                v-model="cliente.telefono"
                density="compact"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                label="Correo electrónico"
                v-model="cliente.correo"
                type="email"
                density="compact"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="5">
              <v-text-field label="Dirección" v-model="cliente.direccion" density="compact" hide-details="auto" />
            </v-col>

            <v-col cols="12" md="4">
              <v-checkbox v-model="cliente.whatsapp_opt_in" label="Acepta mensajes por WhatsApp" hide-details />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <!-- ===== EQUIPO ===== -->
          <v-row class="soft-block">
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
              />
              <v-text-field
                v-if="brandSelected === 'Otro'"
                class="mt-2"
                label="Especifique marca"
                v-model="brandOther"
                density="compact"
                hide-details="auto"
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
              />
              <v-text-field
                v-if="soSeleccionado === 'Otro'"
                class="mt-2"
                label="Especifique sistema operativo"
                v-model="soOtroDetalle"
                density="compact"
                hide-details="auto"
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
              />
              <v-text-field
                v-if="ramSeleccionado === 'Otro'"
                class="mt-2"
                label="Especifique RAM (ej: 12 GB)"
                v-model="ramOtroDetalle"
                density="compact"
                hide-details="auto"
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
              />
              <v-text-field
                v-if="discoSeleccionado === 'Otro'"
                class="mt-2"
                label="Especifique almacenamiento (ej: 512 GB SSD)"
                v-model="discoOtroDetalle"
                density="compact"
                hide-details="auto"
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
          <v-row class="soft-block">
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
                :counter="true"
                @update:modelValue="onFotosPicked"
              />
              <div class="text-caption text-medium-emphasis mt-1">
                {{ fotos.length }}/3 seleccionadas — Tamaño máx: 6 MB por imagen. Formatos: JPG, PNG, WEBP, GIF.
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
                <v-card v-for="(f, idx) in fotos" :key="idx" class="ma-2" elevation="1" width="180">
                  <v-img :src="f.preview || f.url" height="120" cover class="bg-grey-lighten-3">
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
                    <v-btn size="small" variant="text" color="error" :disabled="f.uploading" @click="eliminarFoto(idx)">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </div>

              <div v-if="fotos.length === 0" class="text-medium-emphasis">Aún no has añadido fotos.</div>
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
                <v-img :src="previewSrc" max-height="70vh" contain class="bg-grey-lighten-3 rounded-lg" />
              </v-card-text>
            </v-card>
          </v-dialog>

          <v-divider class="my-6" />

          <!-- ===== FALLA / PASS ===== -->
          <v-row class="mt-2 soft-block">
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
          <v-row class="soft-block">
            <v-col cols="12"><h3 class="text-subtitle-1 font-weight-bold">CONDICIONES</h3></v-col>

            <v-col cols="12" md="4">
              <v-checkbox v-model="orden.autoriza_respaldo" label="¿Autoriza respaldo de datos?" hide-details />
            </v-col>
            <v-col cols="12" md="4">
              <v-checkbox v-model="orden.autoriza_apertura" label="¿Autoriza apertura del equipo?" hide-details />
            </v-col>
            <v-col cols="12" md="4">
              <v-checkbox v-model="orden.mojado" label="¿Equipo con humedad/derrame?" hide-details />
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
          <v-row class="soft-block">
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
          <v-row class="soft-block">
            <v-col cols="12" md="6">
              <v-checkbox v-model="confirmDatos" label="Confirmo que los datos fueron revisados" hide-details />
            </v-col>
            <v-col cols="12" md="6">
              <v-checkbox
                v-model="confirmAccesorios"
                label="Confirmo que se recibieron únicamente los accesorios listados"
                hide-details
              />
            </v-col>
          </v-row>

          <div class="d-flex justify-start mt-4">
            <v-btn color="grey" variant="text" @click="resetForm">Limpiar</v-btn>
            <v-btn color="primary" type="submit" class="ml-2">Guardar</v-btn>
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
import { upload, ApiError } from '@/services/http'
import {
  crearOrden as svcCrearOrden,
  tiposEquipo as svcTiposEquipo,
  accesorios as svcAccesorios,
  metodosPago as svcMetodosPago,
  siguienteConsecutivo as svcSiguienteConsecutivo,
  type CrearOrdenPayload as SvcCrearOrdenPayload,
} from '@/services/OrdenesService'

/* ===== Tipos de catálogos ===== */
type Catalogo = { id: number; nombre: string; logo?: string; prefijo?: string; logoWidth?: number }
type AccesorioItem = { id: number; nombre: string }
type MetodoPagoItem = { id: number; nombre: string }
type TipoEquipoItem = { id: number; nombre: string }

/* ===== Payloads form (local) ===== */
type ClientePayload = {
  nombre: string
  documento: string
  telefono?: string
  correo?: string
  direccion?: string | null
  whatsapp_opt_in?: boolean
  tipo_cliente?: 'persona' | 'empresa' | null
}
type EquipoForm = {
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

/* ===== Helpers ===== */
function getJsonMessage(u: unknown): string | null {
  if (typeof u === 'object' && u && 'message' in (u as Record<string, unknown>)) {
    const m = (u as Record<string, unknown>).message
    if (typeof m === 'string') return m
  }
  return null
}
function errorMessage(err: unknown) {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return getJsonMessage(err) ?? String(err)
}

/* ===== Logos demo ===== */
import logoEncuentralo from '@/assets/Encuentralo.png?url'
import logoMundosmartphone from '@/assets/Mundosmartphone.png?url'

/* ===== Razones sociales (demo) ===== */
const razonesSociales = ref<Catalogo[]>([
  { id: 1, nombre: 'Encuentralo.com', logo: logoEncuentralo, prefijo: 'OEC', logoWidth: 160 },
  { id: 2, nombre: 'Mundosmartphone', logo: logoMundosmartphone, prefijo: 'OGC', logoWidth: 320 },
])
const razon_social_id = ref<number>(1)

const razonSocialNombre = computed(
  () => razonesSociales.value.find((r) => r.id === razon_social_id.value)?.nombre ?? 'Razón social'
)
const razonSocialLogo = computed(() => razonesSociales.value.find((r) => r.id === razon_social_id.value)?.logo ?? null)
const razonSocialPrefijo = computed(
  () => razonesSociales.value.find((r) => r.id === razon_social_id.value)?.prefijo ?? undefined
)
const razonSocialLogoWidth = computed(
  () => razonesSociales.value.find((r) => r.id === razon_social_id.value)?.logoWidth ?? 160
)

/* ===== Código preview ===== */
const consecutivoPreview = ref<number | null>(null)
const consecutivoPreviewText = computed(() => {
  const n = consecutivoPreview.value
  const pref = razonSocialPrefijo.value
  if (n == null) return '—'
  const code = String(n).padStart(6, '0')
  return pref ? `${pref}-${code}` : code
})

async function obtenerSiguienteConsecutivo(razonId: number) {
  try {
    const d = await svcSiguienteConsecutivo(razonId) // { consecutivo, codigo }
    consecutivoPreview.value = d.consecutivo
  } catch {
    consecutivoPreview.value = null
  }
}

/* ===== Form state ===== */
const cliente = ref<ClientePayload>({
  nombre: '',
  documento: '',
  telefono: '',
  correo: '',
  direccion: '',
  whatsapp_opt_in: false,
  tipo_cliente: 'persona',
})
const equipo = ref<EquipoForm>({
  tipo_equipo_id: null,
  marca: '',
  modelo: '',
  serie_imei: '',
  specs: '',
})
const orden = ref<OrdenPayload>({
  estado_estetico: '',
  fallo_reportado: '',
  observaciones_cliente: '',
  pass_desbloqueo: '',
  autoriza_respaldo: false,
  autoriza_apertura: false,
  mojado: false,
  diagnostico_costo: null,
  anticipo: null,
  metodo_pago_id: null,
  fecha_entrega_acordada: null,
})

/* ===== Marcas dinámicas ===== */
const PC_BRANDS = [
  'Acer',
  'ASUS',
  'Dell',
  'HP',
  'Lenovo',
  'MSI',
  'Apple',
  'Samsung',
  'Toshiba',
  'Huawei',
  'Razer',
  'Microsoft (Surface)',
  'Alienware',
  'Gigabyte',
  'Sony',
  'LG',
] as const
const PHONE_BRANDS = [
  'Samsung',
  'Apple (iPhone)',
  'Xiaomi',
  'Huawei',
  'Motorola',
  'Nokia',
  'OPPO',
  'Vivo',
  'OnePlus',
  'Sony',
  'ZTE',
  'Realme',
  'Google (Pixel)',
  'Honor',
  'Tecno',
  'Infinix',
  'LG',
  'ASUS (ROG)',
  'Lenovo',
] as const
const OTHER_OPTION = 'Otro'
const brandSelected = ref<string | null>(null)
const brandOther = ref('')

const tiposEquipo = ref<TipoEquipoItem[]>([])
const selectedTipo = computed(() => tiposEquipo.value.find((t) => t.id === (equipo.value.tipo_equipo_id ?? -1)))
const tipoNombre = computed(() => (selectedTipo.value?.nombre ?? '').toLowerCase())
const isPhoneType = computed(() => /cel|móvi|smart|tel[eé]fono/.test(tipoNombre.value))
const isPcType = computed(() => /pc|laptop|port[aá]til|computador|notebook|desktop/.test(tipoNombre.value))

const brandOptions = computed(() => {
  let base: readonly string[]
  if (isPhoneType.value && !isPcType.value) base = PHONE_BRANDS
  else if (isPcType.value && !isPhoneType.value) base = PC_BRANDS
  else base = [...new Set([...PC_BRANDS, ...PHONE_BRANDS])]
  return [...base, OTHER_OPTION]
})
watch(brandSelected, (v) => {
  if (v !== OTHER_OPTION) brandOther.value = ''
})
const equipoMarcaEffective = computed(
  () => (brandSelected.value === OTHER_OPTION ? brandOther.value : brandSelected.value) || ''
)

/* ===== SO / RAM / DISCO ===== */
const soOpciones = ['Windows 8', 'Windows 10', 'Windows 11', 'Ubuntu', 'Android', 'iOS', 'Otro'] as const
type SoOpcion = (typeof soOpciones)[number]
const ramOpciones = ['2 GB', '4 GB', '8 GB', '16 GB', '32 GB', 'Otro'] as const
type RamOpcion = (typeof ramOpciones)[number]
const discoOpciones = ['128 GB', '240 GB', '256 GB', '500 GB', '512 GB', '1 TB', '2 TB', 'Otro'] as const
type DiscoOpcion = (typeof discoOpciones)[number]

const soSeleccionado = ref<SoOpcion | null>(null)
const soOtroDetalle = ref('')
const ramSeleccionado = ref<RamOpcion | null>(null)
const ramOtroDetalle = ref('')
const discoSeleccionado = ref<DiscoOpcion | null>(null)
const discoOtroDetalle = ref('')

function withRamLabel(v: string) {
  return v.toLowerCase().includes('ram') ? v : `${v} RAM`
}
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
watch([soSeleccionado, soOtroDetalle, ramSeleccionado, ramOtroDetalle, discoSeleccionado, discoOtroDetalle], () => {
  equipo.value.specs = specsPreview.value
})

/* ===== Estado físico ===== */
const estadoFisicoOpciones = [
  'Sin golpes',
  'Rayones leves',
  'Golpes en esquinas',
  'Pantalla rota',
  'Pantalla con rayones',
  'Tapa trasera dañada',
  'Bisagras sueltas',
  'Puertos con juego',
  'Huellas de humedad',
  'Oxidación visible',
  'Otro',
] as const
type EstadoFisicoOpcion = (typeof estadoFisicoOpciones)[number]
const estadoFisicoSeleccionado = ref<EstadoFisicoOpcion[]>([])
const estadoFisicoOtroDetalle = ref('')
function estadoFisicoToText() {
  const list = [...estadoFisicoSeleccionado.value]
  const idx = list.indexOf('Otro')
  if (idx >= 0 && estadoFisicoOtroDetalle.value.trim()) list[idx] = `Otro: ${estadoFisicoOtroDetalle.value.trim()}` as EstadoFisicoOpcion
  return list.join(', ')
}

/* ===== Accesorios / Métodos de pago ===== */
const accesorios = ref<AccesorioItem[]>([])
const metodosPago = ref<MetodoPagoItem[]>([])
const accesoriosSeleccionados = ref<number[]>([])
const ACCESORIO_OTRO_ID = -99 as const
const accesorioOpciones = computed<AccesorioItem[]>(() => {
  const other: AccesorioItem = { id: (ACCESORIO_OTRO_ID as unknown) as number, nombre: 'Otro' }
  return [...accesorios.value, other]
})

/* ===== FOTOS ===== */
type FotoItem = {
  file: File
  preview: string
  url?: string
  uploading: boolean
  error?: string
  descripcion?: string
}
const fotos = ref<FotoItem[]>([])
const fotosPicked = ref<File[] | File | null>(null)

const previewDialog = ref(false)
const previewSrc = ref<string>('')

function abrirPreview(f: FotoItem) {
  previewSrc.value = f.url ?? f.preview
  previewDialog.value = true
}

function revokePreview(url?: string) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
}

function eliminarFoto(idx: number) {
  const f = fotos.value[idx]
  if (f) revokePreview(f.preview)
  fotos.value.splice(idx, 1)
}

const MAX_FOTOS = 3
const MAX_MB = 6
const ACEPTADOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const

function onFotosPicked(files: File | File[]) {
  const incoming = Array.isArray(files) ? files : files ? [files] : []
  if (incoming.length === 0) return
  const espacio = MAX_FOTOS - fotos.value.length
  const lote = incoming.slice(0, Math.max(0, espacio))

  for (const file of lote) {
    if (!ACEPTADOS.includes(file.type as (typeof ACEPTADOS)[number])) {
      snackbar.value = { show: true, message: 'Formato no permitido', color: 'error' }
      continue
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      snackbar.value = { show: true, message: `La imagen supera ${MAX_MB}MB`, color: 'error' }
      continue
    }

    const item: FotoItem = { file, preview: URL.createObjectURL(file), uploading: true }
    fotos.value.push(item)
    subirFoto(item)
  }

  // limpiar input (opcional)
  fotosPicked.value = null
}

async function subirFoto(item: FotoItem) {
  try {
    const fd = new FormData()
    fd.append('foto', item.file) // endpoint espera 'foto'
    const res = await upload<{ url?: string; urls?: string[]; data?: Array<{ url: string }> }>('/v1/uploads/fotos', fd)
    const url = res.url || res.urls?.[0] || res.data?.[0]?.url
    if (!url) throw new Error('La API no devolvió URL')
    item.url = url
    item.error = undefined
  } catch (err) {
    item.error = errorMessage(err)
    snackbar.value = { show: true, message: `Error subiendo foto: ${item.error}`, color: 'error' }
  } finally {
    item.uploading = false
  }
}

const hayFotosSubiendo = computed(() => fotos.value.some((f) => f.uploading))
const hayFotosFallidas = computed(() => fotos.value.some((f) => f.error))
const subiendoBloqueado = computed(() => !hayFotosFallidas.value)
const textoBotonSubida = computed(() => (hayFotosFallidas.value ? 'Reintentar fallidas' : 'Subiendo…'))
function reintentarFallidas() {
  for (const f of fotos.value) {
    if (f.error) {
      f.error = undefined
      f.uploading = true
      subirFoto(f)
    }
  }
}

/* = revoke object urls al desmontar */
onBeforeUnmount(() => {
  fotos.value.forEach((f) => revokePreview(f.preview))
})

/* ===== Validación ===== */
const errors = ref<Record<string, string>>({
  nombre: '',
  documento: '',
  tipo_equipo_id: '',
  marca: '',
  modelo: '',
  serie_imei: '',
  fallo_reportado: '',
})
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

/* ===== Fecha local -> ISO ===== */
const fechaEntregaLocal = ref('')
function toIsoOrNull(local: string) {
  if (!local) return null
  const withSec = local.length === 16 ? `${local}:00` : local
  const d = new Date(withSec)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/* ===== Snackbar ===== */
type SnackColor = 'success' | 'error' | 'warning'
const snackbar = ref<{ show: boolean; message: string; color: SnackColor }>({
  show: false,
  message: '',
  color: 'success',
})

/* ===== Confirmaciones ===== */
const confirmDatos = ref(false)
const confirmAccesorios = ref(false)

/* ===== Carga catálogos ===== */
async function cargarCatalogos() {
  try {
    const [tip, acc, mp] = await Promise.all([svcTiposEquipo(), svcAccesorios(), svcMetodosPago()])
    tiposEquipo.value = tip
    accesorios.value = acc
    metodosPago.value = mp
  } catch (err) {
    snackbar.value = { show: true, message: errorMessage(err), color: 'error' }
  }
}

/* ===== Submit ===== */
async function onSubmit() {
  if (!confirmDatos.value || !confirmAccesorios.value) {
    snackbar.value = {
      show: true,
      message: 'Debes confirmar la revisión de datos y de accesorios.',
      color: 'warning',
    }
    return
  }
  if (!validate()) {
    snackbar.value = { show: true, message: 'Revisa los campos obligatorios.', color: 'error' }
    return
  }

  equipo.value.marca = equipoMarcaEffective.value.trim()
  equipo.value.specs = specsPreview.value || undefined

  const payload: SvcCrearOrdenPayload = {
    razon_social_id: razon_social_id.value,
    cliente: {
      nombre: cliente.value.nombre?.trim(),
      documento: cliente.value.documento?.trim(),
      telefono: cliente.value.telefono || undefined,
      correo: cliente.value.correo?.trim() || undefined,
      direccion: cliente.value.direccion?.trim() || undefined,
      whatsapp_opt_in: Boolean(cliente.value.whatsapp_opt_in),
      tipo_cliente: cliente.value.tipo_cliente ?? null,
    },
    equipo: {
      tipo_equipo_id: equipo.value.tipo_equipo_id as number, // validado en form
      marca: equipo.value.marca,
      modelo: equipo.value.modelo?.trim(),
      serie_imei: equipo.value.serie_imei?.trim(),
      specs: equipo.value.specs?.trim() || undefined,
    },
    orden: {
      estado_estetico: estadoFisicoToText() || null,
      fallo_reportado: orden.value.fallo_reportado?.trim() || null,
      observaciones_cliente: orden.value.observaciones_cliente?.trim() || null,
      pass_desbloqueo: orden.value.pass_desbloqueo?.trim() || null,
      autoriza_respaldo: Boolean(orden.value.autoriza_respaldo),
      autoriza_apertura: Boolean(orden.value.autoriza_apertura),
      mojado: Boolean(orden.value.mojado),
      diagnostico_costo: orden.value.diagnostico_costo ?? null,
      anticipo: orden.value.anticipo ?? null,
      metodo_pago_id: orden.value.metodo_pago_id ?? null,
      fecha_entrega_acordada: toIsoOrNull(fechaEntregaLocal.value),
    },
    accesorios: (accesoriosSeleccionados.value || [])
      .filter((id) => id > 0)
      .map((id) => ({ accesorio_id: id })),
    fotos: fotos.value
      .filter((f) => f.url)
      .map((f) => ({ url: f.url as string, descripcion: f.descripcion })),
  }

  try {
    const data = await svcCrearOrden(payload)
    snackbar.value = { show: true, message: `Orden creada: ${data.codigo}`, color: 'success' }
    await obtenerSiguienteConsecutivo(razon_social_id.value)
    resetForm()
  } catch (err) {
    snackbar.value = { show: true, message: errorMessage(err), color: 'error' }
  }
}

/* ===== Reset ===== */
function resetForm() {
  cliente.value = {
    nombre: '',
    documento: '',
    telefono: '',
    correo: '',
    direccion: '',
    whatsapp_opt_in: false,
    tipo_cliente: 'persona',
  }
  equipo.value = { tipo_equipo_id: null, marca: '', modelo: '', serie_imei: '', specs: '' }

  brandSelected.value = null
  brandOther.value = ''
  soSeleccionado.value = null
  soOtroDetalle.value = ''
  ramSeleccionado.value = null
  ramOtroDetalle.value = ''
  discoSeleccionado.value = null
  discoOtroDetalle.value = ''

  fotos.value.forEach((f) => revokePreview(f.preview))
  fotos.value = []
  fotosPicked.value = null

  orden.value = {
    estado_estetico: '',
    fallo_reportado: '',
    observaciones_cliente: '',
    pass_desbloqueo: '',
    autoriza_respaldo: false,
    autoriza_apertura: false,
    mojado: false,
    diagnostico_costo: null,
    anticipo: null,
    metodo_pago_id: null,
    fecha_entrega_acordada: null,
  }
  estadoFisicoSeleccionado.value = []
  estadoFisicoOtroDetalle.value = ''
  accesoriosSeleccionados.value = []
  fechaEntregaLocal.value = ''
  confirmDatos.value = false
  confirmAccesorios.value = false
}

/* ===== Lifecycle ===== */
onMounted(async () => {
  await Promise.all([cargarCatalogos(), obtenerSiguienteConsecutivo(razon_social_id.value)])
})
watch(razon_social_id, async (val) => {
  await obtenerSiguienteConsecutivo(val)
})
</script>

<style scoped>
.form {
  padding: 1rem;
}
.text-h5,
.text-h6 {
  color: #1976d2;
  font-weight: bold;
}

/* Panel suave para “zebra” por sección */
.soft-block {
  background: #f7f9fb;
  border: 1px solid rgba(16, 24, 40, 0.06);
  border-radius: 14px;
  padding: 18px;
}

/* Toques grises en campos sin cambiar props */
:deep(.v-text-field .v-field),
:deep(.v-select .v-field),
:deep(.v-textarea .v-field) {
  background: #fafbfc;
  border-radius: 10px;
}
:deep(.v-field.v-field--variant-outlined) {
  --v-field-border-opacity: 0.28;
}
:deep(.v-field--focused) {
  --v-field-border-opacity: 0.5;
}
:deep(.v-divider) {
  opacity: 0.7;
}
</style>
