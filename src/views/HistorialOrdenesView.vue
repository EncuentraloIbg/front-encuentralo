<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title class="text-h5">
        <v-icon icon="mdi-clipboard-text-clock" class="me-2" />
        Historial de Órdenes
      </v-card-title>

      <!-- Filtros -->
      <v-row class="px-4 pb-4">
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="search"
            label="Buscar por código, cliente o documento…"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            @keyup.enter="reload()"
            @click:clear="handleClear"
            hide-details
          />
        </v-col>

        <v-col cols="12" sm="3">
          <v-select
            v-model="estadoFilter"
            :items="estadoItems"
            label="Estado"
            variant="outlined"
            density="compact"
            clearable
            hide-details
            @update:modelValue="reload"
          />
        </v-col>

        <v-col cols="12" sm="3">
          <v-select
            v-model="rsSelect"
            :items="razonesItems"
            item-title="nombre"
            item-value="id"
            label="Razón social"
            variant="outlined"
            density="compact"
            clearable
            hide-details
            :loading="razonesLoading"
            @update:modelValue="reload"
          />
        </v-col>
      </v-row>

      <!-- Tabla -->
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="headers"
        :items-length="totalItems"
        :items="items"
        :loading="loading"
        :items-per-page-options="[10, 20, 30, 50]"
        @update:options="loadItems"
        class="elevation-1"
      >
        <template #item.rowNumber="{ index }">
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </template>

        <template #item.estado="{ item }">
          <v-chip :color="getOrdenEstadoColor(item.estado)" size="small" class="text-uppercase">
            {{ item.estado || 'N/A' }}
          </v-chip>
        </template>

        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt || '') }}
        </template>

        <template #item.actions="{ item }">
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                variant="text"
                size="small"
                color="primary"
                @click="openDetalle(item.ordenId || item.id)"
              >
                <v-icon>mdi-eye</v-icon>
              </v-btn>
            </template>
            Ver orden
          </v-tooltip>

          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                variant="text"
                size="small"
                color="amber-darken-2"
                :to="{ name: 'orden-editar', params: { id: item.ordenId || item.id } }"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
            Editar
          </v-tooltip>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Dialog Detalle de Orden -->
    <v-dialog v-model="detalleDialog" max-width="1024">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2">mdi-clipboard-text</v-icon>
          <div class="d-flex flex-column">
            <span class="text-h6">{{ detalle?.codigo || 'Detalle de orden' }}</span>
            <span class="text-caption text-medium-emphasis">
              {{ pick(detalle?.razon_social, 'nombre') || pick(detalle?.razonSocial, 'nombre') || '—' }}
            </span>
          </div>
          <v-spacer />
          <v-chip :color="getOrdenEstadoColor(detalle?.estado)" size="small" class="text-uppercase me-2">
            {{ detalle?.estado || '—' }}
          </v-chip>

          <v-btn
            v-if="detalle && ['recibido','cancelada','rechazada'].includes((detalle.estado||'').toLowerCase())"
            color="primary"
            variant="elevated"
            prepend-icon="mdi-swap-horizontal"
            @click="openCerrarDialog()"
          >
            Cambiar estado
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text>
          <div v-if="detalleLoading" class="py-8 d-flex justify-center">
            <v-progress-circular indeterminate size="36" />
          </div>
          <div v-else-if="detalleError" class="py-6">
            <v-alert type="error" variant="tonal" title="Error cargando la orden" :text="detalleError" />
          </div>

          <div v-else-if="detalle">
            <!-- Cliente / Equipo -->
            <v-row class="mb-2">
              <v-col cols="12" md="6">
                <v-list density="compact" lines="two">
                  <v-list-subheader>Cliente</v-list-subheader>
                  <v-list-item :title="pick(detalle?.cliente, 'nombre') || '—'" prepend-icon="mdi-account">
                    <template #subtitle>
                      Doc: {{ pick(detalle?.cliente, 'documento') || '—' }}
                      · Tel: {{ pick(detalle?.cliente, 'telefono') || '—' }}
                      <span v-if="pick(detalle?.cliente, 'correo')">
                        · Correo: {{ pick(detalle?.cliente, 'correo') }}
                      </span>
                    </template>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" md="6">
                <v-list density="compact" lines="two">
                  <v-list-subheader>Equipo</v-list-subheader>
                  <v-list-item :title="`${pick(detalle?.equipo, 'marca') || '—'} ${pick(detalle?.equipo, 'modelo') || ''}`.trim()">
                    <template #prepend>
                      <div class="d-flex align-center me-2">
                        <v-icon class="me-1">mdi-cellphone</v-icon>
                        <v-icon>mdi-laptop</v-icon>
                      </div>
                    </template>
                    <template #subtitle>
                      Serie/IMEI: {{ pick(detalle?.equipo, 'serie_imei', 'serieImei') || '—' }}
                      <span v-if="pick(detalle?.equipo, 'specs')" class="ms-2"> · {{ pick(detalle?.equipo, 'specs') }}</span>
                    </template>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>

            <!-- Datos de recepción / Fechas & pago -->
            <v-row>
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-subheader>Datos de recepción</v-list-subheader>
                  <v-list-item prepend-icon="mdi-note-text" :title="pick(detalle, 'fallo_reportado', 'falloReportado') || '—'">
                    <template #subtitle>Fallo reportado</template>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-account-voice" :title="pick(detalle, 'observaciones_cliente', 'observacionesCliente') || '—'">
                    <template #subtitle>Observaciones del cliente</template>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-lock" :title="pick(detalle, 'pass_desbloqueo', 'passDesbloqueo') || '—'">
                    <template #subtitle>Clave/Desbloqueo</template>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-shield-check" :title="pick(detalle, 'estado_estetico', 'estadoEstetico') || '—'">
                    <template #subtitle>Estado físico al recibir</template>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-subheader>Fechas & pago</v-list-subheader>
                  <v-list-item prepend-icon="mdi-calendar-check" :title="fmt(pick(detalle, 'created_at', 'createdAt'))">
                    <template #subtitle>Fecha de creación</template>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-calendar-clock" :title="fmt(pick(detalle, 'fecha_entrega_acordada', 'fechaEntregaAcordada'))">
                    <template #subtitle>Entrega acordada</template>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-cash-multiple" :title="fmtMoney(pick(detalle, 'diagnostico_costo', 'diagnosticoCosto'))">
                    <template #subtitle>Valor diagnóstico</template>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-cash" :title="fmtMoney(pick(detalle, 'anticipo', 'anticipo'))">
                    <template #subtitle>Pagado (anticipo)</template>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-progress-check" :title="fmtMoney(saldo)">
                    <template #subtitle>Saldo pendiente</template>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>

            <!-- Autorizaciones y Accesorios -->
            <v-row>
              <v-col cols="12" md="4">
                <v-list density="compact">
                  <v-list-subheader>Autorizaciones</v-list-subheader>
                  <v-list-item prepend-icon="mdi-database-check" :title="boolTxt(pick(detalle, 'autoriza_respaldo', 'autorizaRespaldo'))">
                    <template #subtitle>Autoriza respaldo</template>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-tools" :title="boolTxt(pick(detalle, 'autoriza_apertura', 'autorizaApertura'))">
                    <template #subtitle>Autoriza apertura</template>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-water-alert" :title="boolTxt(pick(detalle, 'mojado', 'mojado'))">
                    <template #subtitle>Equipo con humedad/derrame</template>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" md="8">
                <v-list-subheader>Accesorios</v-list-subheader>
                <v-chip-group v-if="(detalle.accesorios?.length || 0) > 0" column>
                  <v-chip v-for="ac in (detalle.accesorios || [])" :key="ac.id" class="ma-1" size="small" variant="elevated">
                    {{ ac.nombre || `#${ac.accesorio_id ?? ''}` }}
                    <span v-if="ac.detalle"> — {{ ac.detalle }}</span>
                  </v-chip>
                </v-chip-group>
                <div v-else class="text-medium-emphasis">Sin accesorios registrados</div>
              </v-col>
            </v-row>

            <!-- Historial -->
            <v-divider class="my-4" />
            <v-list-subheader>Historial</v-list-subheader>
            <v-timeline density="compact">
              <v-timeline-item
                v-for="h in (detalle.historial || [])"
                :key="h.id"
                :dot-color="getOrdenEstadoColor(h.estado)"
                icon="mdi-check-circle-outline"
              >
                <div class="text-subtitle-2 text-uppercase">{{ h.estado }}</div>
                <div class="text-caption">{{ fmt(pick(h, 'created_at', 'createdAt')) }}</div>
                <div v-if="pick(pick(h, 'motivo_estado', 'motivoEstado'), 'nombre') || pick(h, 'motivo_texto')" class="text-caption">
                  Motivo: {{ pick(pick(h, 'motivo_estado', 'motivoEstado'), 'nombre') || pick(h, 'motivo_texto') }}
                </div>
              </v-timeline-item>
            </v-timeline>

            <!-- Archivos / Fotos -->
            <v-divider class="my-4" />
            <v-row>
              <v-col cols="12" md="6">
                <v-list-subheader>Archivos</v-list-subheader>
                <v-list density="compact">
                  <v-list-item
                    v-for="f in (detalle.archivos || [])"
                    :key="f.id"
                    prepend-icon="mdi-file"
                    :title="f.nombre_archivo || f.nombreArchivo || 'Archivo'"
                    :href="toAbsUrl(f.url)"
                    target="_blank"
                  />
                  <div v-if="(detalle.archivos?.length || 0) === 0" class="text-medium-emphasis ms-4">Sin archivos</div>
                </v-list>
              </v-col>

              <v-col cols="12" md="6">
                <v-list-subheader>Fotos</v-list-subheader>
                <div v-if="fotosDet.length > 0" class="d-flex flex-wrap">
                  <v-card
                    v-for="f in fotosDet"
                    :key="f.id"
                    class="ma-1"
                    width="130"
                    elevation="1"
                  >
                    <v-img
                      :src="toAbsUrl(pick(f, 'url') || '')"
                      width="130"
                      height="130"
                      cover
                      class="bg-grey-lighten-3 rounded"
                      @click="openPreview(pick(f, 'url') || '')"
                    >
                      <template #error>
                        <div class="d-flex align-center justify-center text-caption text-error fill-height">
                          No cargó
                        </div>
                      </template>
                    </v-img>
                  </v-card>
                </div>
                <div v-else class="text-medium-emphasis ms-4">Sin fotos</div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="detalleDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Cerrar Orden -->
    <v-dialog v-model="cerrarDialog" max-width="640">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2">mdi-swap-horizontal</v-icon>
          Cerrar orden
          <v-spacer />
          <v-chip size="small" variant="elevated">{{ detalle?.codigo }}</v-chip>
        </v-card-title>
        <v-divider />

        <v-card-text>
          <v-alert v-if="cerrarError" type="error" variant="tonal" class="mb-4" :text="cerrarError" />
          <v-row>
            <v-col cols="12">
              <v-radio-group v-model="cerrarEstado" inline>
                <v-radio value="entregado" label="Entregado" />
                <v-radio value="cancelada" label="Cancelada" />
                <v-radio value="rechazada" label="Rechazada" />
              </v-radio-group>
            </v-col>

            <template v-if="cerrarEstado === 'entregado'">
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="fmtMoneyNumber(total)"
                  label="Valor (total)"
                  prepend-inner-icon="mdi-cash-multiple"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="fmtMoneyNumber(pagado)"
                  label="Pagado (anticipo)"
                  prepend-inner-icon="mdi-cash"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="fmtMoneyNumber(saldo)"
                  label="Saldo pendiente"
                  prepend-inner-icon="mdi-progress-check"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="pagoAhora"
                  type="number"
                  min="0"
                  :max="saldo"
                  :label="`Pago ahora (debe ser ${fmtMoneyNumber(saldo)})`"
                  prepend-inner-icon="mdi-credit-card-outline"
                  variant="outlined"
                  density="compact"
                  :error="!!validPagoError"
                  :error-messages="validPagoError || ''"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="metodoPagoId"
                  :items="metodosPago"
                  item-title="nombre"
                  item-value="id"
                  label="Método de pago"
                  variant="outlined"
                  density="compact"
                  :loading="metodosLoading"
                  :error="cerrarEstado==='entregado' && !metodoPagoId"
                  :error-messages="cerrarEstado==='entregado' && !metodoPagoId ? 'Requerido' : ''"
                />
              </v-col>
            </template>

            <template v-if="['cancelada','rechazada'].includes(cerrarEstado)">
              <v-col cols="12" md="6">
                <v-select
                  v-model="motivoEstadoId"
                  :items="motivosFiltrados"
                  item-title="nombre"
                  item-value="id"
                  label="Motivo (opcional)"
                  variant="outlined"
                  density="compact"
                  :loading="motivosLoading"
                  clearable
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="motivoTexto"
                  label="Observación (requerida)"
                  :rules="[(v)=>!!v || 'La observación es obligatoria']"
                  rows="3"
                  auto-grow
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </template>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-btn variant="text" @click="cerrarDialog = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn color="primary" :loading="cerrarLoading" :disabled="!puedeConfirmar" @click="confirmarCerrar()">
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal vista previa -->
    <v-dialog v-model="previewDialog" max-width="900">
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
            :src="previewSrcAbs"
            max-height="70vh"
            contain
            class="bg-grey-lighten-3 rounded-lg"
          >
            <template #error>
              <div class="d-flex align-center justify-center text-error text-caption" style="height: 60vh;">
                No fue posible cargar la imagen
              </div>
            </template>
          </v-img>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  reqActualizarOrden,
  reqCerrarOrden,
  reqMetodosPago,
  reqMotivosEstado,
  reqListarOrdenes,
  reqObtenerOrden,
  reqRazonesSociales,
} from '@/services/ordenesService'

/** ===== ORIGEN de API & URL absolutas ===== */
const apiBaseFromEnv = typeof import.meta !== 'undefined'
  ? (import.meta.env?.VITE_API_BASE_URL as string | undefined)
  : undefined
const API_ORIGIN = (apiBaseFromEnv ? apiBaseFromEnv.replace(/\/$/, '') : 'http://localhost:3333')
function toAbsUrl(u?: string | null) {
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  return `${API_ORIGIN}${u.startsWith('/') ? '' : '/'}${u}`
}

/** ===== Tipos ===== */
interface HistItem {
  id: number
  ordenId?: number
  codigo: string
  clienteNombre: string
  razonSocial: string
  estado: 'recibido' | 'entregado' | 'cancelada' | 'rechazada'
  createdAt?: string
}
interface OrdenDetalle {
  id: number
  codigo: string
  estado: string
  created_at?: string; createdAt?: string
  fecha_entrega_acordada?: string | null; fechaEntregaAcordada?: string | null
  diagnostico_costo?: number | null; diagnosticoCosto?: number | null
  anticipo?: number | null
  autoriza_respaldo?: boolean | null; autorizaRespaldo?: boolean | null
  autoriza_apertura?: boolean | null; autorizaApertura?: boolean | null
  mojado?: boolean | null
  estado_estetico?: string | null; estadoEstetico?: string | null
  fallo_reportado?: string | null; falloReportado?: string | null
  observaciones_cliente?: string | null; observacionesCliente?: string | null
  pass_desbloqueo?: string | null; passDesbloqueo?: string | null
  metodo_pago?: { id: number; nombre: string } | null
  metodoPago?: { id: number; nombre: string } | null
  razon_social?: { id:number; nombre:string } | null
  razonSocial?: { id:number; nombre:string } | null
  cliente?: { id: number; nombre: string; documento?: string; telefono?: string; correo?: string } | null
  equipo?: { id: number; marca?: string; modelo?: string; serie_imei?: string; serieImei?: string; specs?: string } | null
  accesorios?: Array<{ id: number; accesorio_id?: number; nombre?: string; detalle?: string }>
  archivos?: Array<{ id: number; url: string; nombre_archivo?: string; nombreArchivo?: string; tipo?: string }>
  fotos?: Array<{ id: number; url: string; descripcion?: string }>
  historial?: Array<{
    id: number
    estado: string
    created_at?: string; createdAt?: string
    motivo_texto?: string | null
    motivo_estado?: { id: number; nombre: string } | null
    motivoEstado?: { id: number; nombre: string } | null
  }>
}

/** ===== Estado tabla y filtros ===== */
const items = ref<HistItem[]>([])
const totalItems = ref(0)
const loading = ref(false)
const page = ref(1)
const itemsPerPage = ref(10)
const search = ref('')
const estadoFilter = ref<string | null>(null)

/** Razones sociales (para filtro) */
const razonesItems = ref<Array<{ id:number; nombre:string }>>([])
const razonesLoading = ref(false)
const rsSelect = ref<number | null>(null)

/** Headers */
const headers = [
  { title: '#', key: 'rowNumber', sortable: false },
  { title: 'Código', key: 'codigo', sortable: true },
  { title: 'Cliente', key: 'clienteNombre', sortable: true },
  { title: 'Razón social', key: 'razonSocial', sortable: true },
  { title: 'Estado', key: 'estado', sortable: true },
  { title: 'Fecha', key: 'createdAt', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const estadoItems = [
  { title: 'Recibido', value: 'recibido' },
  { title: 'Entregado', value: 'entregado' },
  { title: 'Cancelada', value: 'cancelada' },
  { title: 'Rechazada', value: 'rechazada' },
]

/** ===== Helpers ===== */
function getOrdenEstadoColor(estado?: string | null) {
  if (!estado) return 'blue-grey'
  switch ((estado || '').toLowerCase()) {
    case 'recibido':   return 'blue'
    case 'entregado':  return 'green'
    case 'cancelada':  return 'red-darken-2'
    case 'rechazada':  return 'deep-orange'
    default:           return 'blue-grey'
  }
}
function formatDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}
function fmt(v?: string | null) { return formatDate(v || '') }
function fmtMoney(v?: number | null) {
  if (v == null) return '—'
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
  } catch { return String(v) }
}
function fmtMoneyNumber(v?: number | null) {
  if (v == null) return '0'
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
  } catch { return String(v) }
}
function boolTxt(v?: boolean | null) { return v ? 'Sí' : 'No' }
function pick<T = any>(obj: any, ...keys: string[]): T | null {
  if (!obj) return null as any
  for (const k of keys) {
    const v = (obj as any)[k]
    if (v !== undefined && v !== null && v !== '') return v as T
  }
  return null as any
}
const t = (s: any) => (typeof s === 'string' ? s.trim() : s)

/** ===== Modal Detalle ===== */
const detalleDialog = ref(false)
const detalleLoading = ref(false)
const detalleError = ref<string | null>(null)
const detalle = ref<OrdenDetalle | null>(null)
const fotosDet = computed(() => Array.isArray(detalle.value?.fotos) ? detalle.value!.fotos! : [])

/** Preview de foto */
const previewDialog = ref(false)
const previewSrc = ref<string>('')
const previewSrcAbs = computed(() => toAbsUrl(previewSrc.value))
function openPreview(url: string) {
  previewSrc.value = url || ''
  previewDialog.value = true
}

async function openDetalle(ordenId: number) {
  detalleDialog.value = true
  detalleLoading.value = true
  detalleError.value = null
  detalle.value = null
  try {
    const { method, url } = reqObtenerOrden(ordenId)
    const res = await fetch(url, { method })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
    detalle.value = (await res.json()) as OrdenDetalle
  } catch (e: any) {
    detalleError.value = e?.message || 'No fue posible cargar la orden'
  } finally {
    detalleLoading.value = false
  }
}

/** ===== Cerrar Orden (cambiar estado) ===== */
const cerrarDialog = ref(false)
const cerrarEstado = ref<'entregado' | 'cancelada' | 'rechazada'>('entregado')
const cerrarLoading = ref(false)
const cerrarError = ref<string | null>(null)

const pagoAhora = ref<number>(0)
const metodoPagoId = ref<number | null>(null)

const motivoEstadoId = ref<number | null>(null)
const motivoTexto = ref<string>('')

const metodosPago = ref<Array<{ id:number; nombre:string }>>([])
const metodosLoading = ref(false)

const motivos = ref<Array<{ id:number; nombre:string; estado_aplicable: 'entregado'|'cancelada'|'rechazada' }>>([])
const motivosLoading = ref(false)

const total = computed<number>(() => Number(pick(detalle.value, 'diagnostico_costo', 'diagnosticoCosto')) || 0)
const pagado = computed<number>(() => Number(pick(detalle.value, 'anticipo')) || 0)
const saldo = computed<number>(() => Math.max(0, total.value - pagado.value))
const validPagoError = computed<string | null>(() => {
  if (cerrarEstado.value !== 'entregado') return null
  if (saldo.value <= 0) return null
  if (pagoAhora.value === undefined || pagoAhora.value === null) return 'Ingresa el pago'
  if (pagoAhora.value <= 0) return 'El pago debe ser mayor a 0'
  if (pagoAhora.value !== saldo.value) return `Debe pagar exactamente ${fmtMoneyNumber(saldo.value)}`
  return null
})
const puedeConfirmar = computed<boolean>(() => {
  if (!detalle.value) return false
  if (cerrarEstado.value === 'entregado') {
    if (saldo.value > 0 && validPagoError.value) return false
    if (saldo.value > 0 && !metodoPagoId.value) return false
    return true
  }
  return !!motivoTexto.value && motivoTexto.value.trim().length > 0
})

function openCerrarDialog() {
  cerrarError.value = null
  cerrarEstado.value = 'entregado'
  pagoAhora.value = saldo.value
  metodoPagoId.value = (pick(detalle.value?.metodo_pago, 'id') || pick(detalle.value?.metodoPago, 'id')) as any || null
  motivoEstadoId.value = null
  motivoTexto.value = ''
  cerrarDialog.value = true
  loadMetodosPago()
  loadMotivosEstado()
}

const motivosFiltrados = computed(() =>
  motivos.value.filter(m => m.estado_aplicable === cerrarEstado.value)
)

async function loadMetodosPago() {
  try {
    metodosLoading.value = true
    const { method, url } = reqMetodosPago()
    const res = await fetch(url, { method })
    if (!res.ok) throw new Error(await res.text())
    metodosPago.value = await res.json()
  } catch {
    metodosPago.value = []
  } finally {
    metodosLoading.value = false
  }
}
async function loadMotivosEstado() {
  try {
    motivosLoading.value = true
    const { method, url } = reqMotivosEstado()
    const res = await fetch(url, { method })
    if (!res.ok) throw new Error(await res.text())
    motivos.value = await res.json()
  } catch {
    motivos.value = []
  } finally {
    motivosLoading.value = false
  }
}

watch(cerrarEstado, (val) => {
  cerrarError.value = null
  if (val === 'entregado') {
    motivoEstadoId.value = null
    motivoTexto.value = ''
    pagoAhora.value = saldo.value
  } else {
    pagoAhora.value = 0
    metodoPagoId.value = null
  }
})

async function confirmarCerrar() {
  if (!detalle.value) return
  cerrarLoading.value = true
  cerrarError.value = null
  try {
    const nowIso = new Date().toISOString()

    if (cerrarEstado.value === 'entregado') {
      if (saldo.value > 0) {
        if (validPagoError.value) throw new Error(validPagoError.value)
        if (!metodoPagoId.value) throw new Error('Selecciona el método de pago')

        const { method, url, body } = reqActualizarOrden(detalle.value.id, {
          anticipo: pagado.value + pagoAhora.value,
          metodo_pago_id: metodoPagoId.value,
        } as any)
        const upRes = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!upRes.ok) throw new Error(`No se pudo registrar el pago. ${upRes.status} ${await upRes.text()}`)
      }

      const { method, url, body } = reqCerrarOrden(detalle.value.id, {
        estado: 'entregado',
        fecha_cierre: nowIso,
      })
      const closeRes = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!closeRes.ok) throw new Error(`No se pudo cerrar la orden. ${closeRes.status} ${await closeRes.text()}`)
    } else {
      if (!motivoTexto.value || !motivoTexto.value.trim()) throw new Error('La observación es obligatoria')
      const { method, url, body } = reqCerrarOrden(detalle.value.id, {
        estado: cerrarEstado.value,
        fecha_cierre: nowIso,
        motivo_estado_id: motivoEstadoId.value ?? null,
        motivo_estado_texto: motivoTexto.value.trim(),
      } as any)
      const closeRes = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!closeRes.ok) throw new Error(`No se pudo cerrar la orden. ${closeRes.status} ${await closeRes.text()}`)
    }

    cerrarDialog.value = false
    await refreshDetalle()
    reload()
  } catch (e: any) {
    cerrarError.value = e?.message || 'No fue posible cambiar el estado'
  } finally {
    cerrarLoading.value = false
  }
}

async function refreshDetalle() {
  if (!detalle.value?.id) return
  try {
    detalleLoading.value = true
    const { method, url } = reqObtenerOrden(detalle.value.id)
    const res = await fetch(url, { method })
    if (res.ok) detalle.value = await res.json()
  } finally {
    detalleLoading.value = false
  }
}

/** ===== Tabla ===== */
function handleClear() { search.value = ''; reload() }
function reload() {
  page.value = 1
  loadItems({ page: page.value, itemsPerPage: itemsPerPage.value, sortBy: [] })
}

async function hydrateMissingNames(current: HistItem[]) {
  const need = current
    .map((it, idx) => ({ id: it.ordenId || it.id, idx, it }))
    .filter(({ it }) => !t(it.clienteNombre) || it.clienteNombre === '—' || !t(it.razonSocial) || it.razonSocial === '—')

  if (need.length === 0) return

  await Promise.allSettled(
    need.map(async ({ id, idx }) => {
      try {
        const { method, url } = reqObtenerOrden(id)
        const r = await fetch(url, { method })
        if (!r.ok) return
        const det: any = await r.json()
        const cliente = t(det?.cliente?.nombre)
        const razon = t(det?.razon_social?.nombre) || t(det?.razonSocial?.nombre)
        const updated = { ...items.value[idx] }
        if (cliente) updated.clienteNombre = cliente
        if (razon) updated.razonSocial = razon
        items.value[idx] = updated
      } catch {}
    })
  )

  // refrescar reactividad
  items.value = [...items.value]
}

async function loadItems(
  options: { page: number; itemsPerPage: number; sortBy: { key: string; order: string }[] } = {
    page: page.value, itemsPerPage: itemsPerPage.value, sortBy: []
  }
) {
  try {
    loading.value = true
    page.value = options.page
    itemsPerPage.value = options.itemsPerPage

    const params: any = { page: page.value, perPage: itemsPerPage.value }
    if (search.value?.trim()) params.q = search.value.trim()
    if (estadoFilter.value) params.estado = estadoFilter.value
    if (rsSelect.value) params.razon_social_id = rsSelect.value

    const { method, url } = reqListarOrdenes(params)
    const res = await fetch(url, { method })
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`)

    const json = await res.json()
    const data: any[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
    const meta = json?.meta || {}

    items.value = data.map((e: any) => ({
      id: e.id ?? e.ordenId ?? e.orden_id,
      ordenId: e.id ?? e.ordenId ?? e.orden_id,
      codigo: t(e.codigo ?? e.code) || '—',
      // intentamos varias formas y hacemos fallback si vienen vacíos
      clienteNombre: t(e.clienteNombre) || t(e.cliente_nombre) || t(e.cliente?.nombre) || '—',
      razonSocial:  t(e.razonSocial)  || t(e.razon_social_nombre) || t(e.razon_social?.nombre) || '—',
      estado: (e.estado || 'recibido').toLowerCase(),
      createdAt: e.createdAt ?? e.created_at ?? e.fecha ?? null,
    })) as HistItem[]

    totalItems.value = meta?.total ?? data.length

    // 🔁 Parche: si faltan nombres, los completamos con el endpoint de detalle
    await hydrateMissingNames(items.value)
  } catch (e) {
    console.error('Error al cargar órdenes:', e)
    items.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

/** ===== Carga de razones sociales para el select ===== */
async function loadRazones() {
  try {
    razonesLoading.value = true
    const { method, url } = reqRazonesSociales()
    const res = await fetch(url, { method })
    if (!res.ok) throw new Error(await res.text())
    const data = (await res.json()) as Array<{ id: number; nombre: string }>
    razonesItems.value = data
  } catch (e) {
    console.error('No se pudieron cargar razones sociales', e)
    razonesItems.value = []
  } finally {
    razonesLoading.value = false
  }
}

/** Primera carga */
loadRazones()
loadItems()
</script>
