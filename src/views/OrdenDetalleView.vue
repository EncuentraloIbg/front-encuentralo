<template>
  <v-container class="py-6">
    <v-card class="pa-4" elevation="10" v-if="orden">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-ticket" class="me-2" />
        Detalle de Orden — <span class="ms-2 font-weight-medium">{{ orden.codigo }}</span>
        <v-spacer />
        <v-chip :color="estadoColor(orden.estado)" class="text-white" size="small">
          {{ (orden.estado || '').toUpperCase() }}
        </v-chip>
      </v-card-title>

      <v-card-subtitle class="mt-2">
        Creada: {{ fmt(orden.created_at) }} · Actualizada: {{ fmt(orden.updated_at) }}
      </v-card-subtitle>

      <v-card-text class="mt-4">
        <v-row dense>
          <!-- Razón social -->
          <v-col cols="12" md="6">
            <h4 class="text-subtitle-1 mb-1">Razón social</h4>
            <div>{{ rsNombre }}</div>
          </v-col>

          <!-- Cliente -->
          <v-col cols="12" md="6">
            <h4 class="text-subtitle-1 mb-1">Cliente</h4>
            <div class="mb-1">
              {{ cliNombre }}
              <template v-if="cliDocumento"> — Doc: {{ cliDocumento }}</template>
            </div>
            <div class="text-grey">
              Tel: {{ cliTelefono || '—' }} · Correo: {{ cliCorreo || '—' }}
            </div>
          </v-col>

          <!-- Equipo -->
          <v-col cols="12" md="6" class="mt-4">
            <h4 class="text-subtitle-1 mb-1">Equipo</h4>
            <div>
              {{ equipoMarca }} {{ equipoModelo }} · IMEI/SN: <strong>{{ equipoSerie }}</strong>
            </div>
            <div class="text-grey">
              Tipo: {{ tipoEquipoNombre }} · Specs: {{ equipoSpecs || '—' }}
            </div>
          </v-col>

          <!-- Pago / valores -->
          <v-col cols="12" md="6" class="mt-4">
            <h4 class="text-subtitle-1 mb-1">Valores / Pago</h4>
            <div>Método de pago: {{ metodoPagoNombre || '—' }}</div>
            <div>Diagnóstico: {{ money(orden.diagnostico_costo) }}</div>
            <div>Anticipo: {{ money(orden.anticipo) }}</div>
            <div>Entrega acordada: {{ fmt(orden.fecha_entrega_acordada || undefined) }}</div>
          </v-col>

          <!-- Condiciones/flags -->
          <v-col cols="12" class="mt-4">
            <h4 class="text-subtitle-1 mb-2">Condiciones / Flags</h4>
            <div class="d-flex flex-wrap gap-2">
              <v-chip variant="tonal" :color="orden.autoriza_respaldo ? 'green' : 'grey'">
                Autoriza respaldo: {{ boolTxt(orden.autoriza_respaldo) }}
              </v-chip>
              <v-chip variant="tonal" :color="orden.autoriza_apertura ? 'green' : 'grey'">
                Autoriza apertura: {{ boolTxt(orden.autoriza_apertura) }}
              </v-chip>
              <v-chip variant="tonal" :color="orden.mojado ? 'red' : 'grey'">
                Mojado: {{ boolTxt(orden.mojado) }}
              </v-chip>
            </div>
          </v-col>

          <!-- Observaciones/falla -->
          <v-col cols="12" md="6">
            <h4 class="text-subtitle-1 mb-1">Falla reportada</h4>
            <div>{{ orden.fallo_reportado || '—' }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <h4 class="text-subtitle-1 mb-1">Estado estético</h4>
            <div>{{ orden.estado_estetico || '—' }}</div>
          </v-col>
          <v-col cols="12">
            <h4 class="text-subtitle-1 mb-1">Observaciones del cliente</h4>
            <div>{{ orden.observaciones_cliente || '—' }}</div>
          </v-col>

          <!-- Accesorios -->
          <v-col cols="12" class="mt-4">
            <h4 class="text-subtitle-1 mb-2">Accesorios</h4>
            <div v-if="accesoriosList.length">
              <v-chip
                v-for="(a, i) in accesoriosList"
                :key="i"
                class="ma-1"
                variant="tonal"
                color="primary"
              >
                #{{ a.accesorio_id }}<span v-if="a.detalle"> · {{ a.detalle }}</span>
              </v-chip>
            </div>
            <div v-else class="text-grey">Sin accesorios</div>
          </v-col>

          <!-- Fotos -->
          <v-col cols="12" class="mt-2">
            <h4 class="text-subtitle-1 mb-2">Fotos</h4>
            <div v-if="fotosList.length" class="d-flex flex-wrap gap-3">
              <v-img
                v-for="(f, i) in fotosList"
                :key="i"
                :src="f.url"
                width="140"
                height="100"
                class="rounded-lg elevation-2"
                cover
              />
            </div>
            <div v-else class="text-grey">Sin fotos</div>
          </v-col>

          <!-- Archivos -->
          <v-col cols="12" class="mt-2">
            <h4 class="text-subtitle-1 mb-2">Archivos</h4>
            <div v-if="archivosList.length" class="d-flex flex-column">
              <v-btn
                v-for="(a, i) in archivosList"
                :key="i"
                variant="tonal"
                color="primary"
                class="mb-2 justify-start"
                prepend-icon="mdi-download"
                @click="abrirUrl(a.url)"
              >
                {{ a.nombre_archivo }} — ({{ a.tipo || 'archivo' }})
              </v-btn>
            </div>
            <div v-else class="text-grey">Sin archivos</div>
          </v-col>
        </v-row>

        <!-- TRAZABILIDAD -->
        <v-divider class="my-6" />
        <h4 class="text-subtitle-1 mb-3">Trazabilidad</h4>
        <div
          style="
            max-height: 280px;
            overflow-y: auto;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 10px;
          "
        >
          <v-timeline density="compact">
            <v-timeline-item
              v-for="(h, idx) in historial"
              :key="idx"
              :dot-color="estadoColor(h.estado)"
              size="small"
            >
              <div class="mb-1">
                <strong>Estado:</strong> {{ (h.estado || '').toUpperCase() }}
                <span v-if="h.motivoTexto" class="text-grey"> — {{ h.motivoTexto }}</span>
              </div>
              <div class="text-grey">
                <span v-if="h.usuarioId !== null">Usuario ID: {{ h.usuarioId }}</span>
                <span class="ms-2">{{ fmt(h.created_at) }}</span>
              </div>
            </v-timeline-item>
          </v-timeline>
        </div>

        <!-- ACCIONES -->
        <v-row class="mt-6" align="center">
          <v-col cols="12" md="6" class="d-flex gap-2">
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-arrow-left" @click="volver">
              Volver
            </v-btn>
          </v-col>
          <v-col cols="12" md="6" class="d-flex justify-end gap-2">
            <v-btn color="success" @click="abrirCerrar('entregado')" :disabled="orden.estado !== 'recibido'">
              Marcar entregado
            </v-btn>
            <v-btn color="warning" @click="abrirCerrar('cancelada')" :disabled="orden.estado !== 'recibido'">
              Cancelar
            </v-btn>
            <v-btn color="error" @click="abrirCerrar('rechazada')" :disabled="orden.estado !== 'recibido'">
              Rechazar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Dialog cerrar -->
    <v-dialog v-model="dlgCerrar" max-width="520">
      <v-card>
        <v-card-title class="headline">Cerrar orden ({{ estadoCierre?.toUpperCase() }})</v-card-title>
        <v-card-text>
          <v-text-field type="date" label="Fecha de cierre" v-model="fechaCierre" :max="hoyIso" required />
          <v-select
            v-if="estadoCierre === 'cancelada' || estadoCierre === 'rechazada'"
            label="Motivo (opcional si usas texto)"
            :items="motivosAplicables"
            item-title="nombre"
            item-value="id"
            v-model="motivoId"
            clearable
          />
          <v-textarea
            v-if="estadoCierre === 'cancelada' || estadoCierre === 'rechazada'"
            label="Motivo texto (opcional)"
            v-model="motivoTexto"
            rows="2"
            auto-grow
          />
          <small class="text-grey">* Solo se puede cerrar desde estado “recibido”.</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="tonal" @click="dlgCerrar = false">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmarCerrar">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.open" :color="snack.color" :timeout="2500">
      {{ snack.msg }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DateTime } from 'luxon'
import {
  obtenerOrden,
  cerrarOrden,
  obtenerMotivosEstado,
  type OrdenDetalle,
  type OrdenEstado,
  type MotivoEstado,
  type FotoIn as Foto,
  type ArchivoIn as Arch,
  type AccesorioIn as AccIn,
  type HistorialItem,
} from '@/services/OrdenesService'

const route = useRoute()
const router = useRouter()

// ======= State principal =======
const orden = ref<OrdenDetalle | null>(null)
const historial = ref<HistorialItem[]>([])
const motivos = ref<MotivoEstado[]>([])

// ======= Dialog de cierre =======
const dlgCerrar = ref(false)
const estadoCierre = ref<Extract<OrdenEstado, 'entregado' | 'cancelada' | 'rechazada'> | null>(null)
const fechaCierre = ref<string>(DateTime.now().toISODate() || '')
const motivoId = ref<number | null>(null)
const motivoTexto = ref<string>('')

const snack = ref<{ open: boolean; msg: string; color: 'success' | 'error' | 'warning' | 'info' }>({
  open: false,
  msg: '',
  color: 'info',
})

const hoyIso = computed(() => DateTime.now().toISODate() || '')

// ======= Derivados seguros (evitan casts en template) =======
const rsNombre = computed(() => orden.value?.razonSocial?.nombre ?? '—')

const cliNombre = computed(() => orden.value?.cliente?.nombre ?? '—')
const cliDocumento = computed(() => orden.value?.cliente?.documento ?? '')
const cliTelefono = computed(() => orden.value?.cliente?.telefono ?? '')
const cliCorreo = computed(() => orden.value?.cliente?.correo ?? '')

const equipoMarca = computed(() => orden.value?.equipo?.marca ?? '—')
const equipoModelo = computed(() => orden.value?.equipo?.modelo ?? '')
const equipoSerie = computed(() => orden.value?.equipo?.serieImei ?? '—')
const equipoSpecs = computed(() => orden.value?.equipo?.specs ?? '')

const metodoPagoNombre = computed(() => orden.value?.metodoPago?.nombre ?? '')

const tipoEquipoNombre = computed(() => {
  const id = orden.value?.equipo?.tipoEquipoId
  return id ? `#${id}` : '—'
})

const accesoriosList = computed<AccIn[]>(() => (orden.value?.accesorios ?? []).filter(Boolean))
const fotosList = computed<Foto[]>(() => (orden.value?.fotos ?? []).filter(Boolean))
const archivosList = computed<Arch[]>(() => (orden.value?.archivos ?? []).filter(Boolean))

// ======= Utilidades =======
function abrirUrl(url: string) {
  if (!url) return
  window.open(url, '_blank', 'noopener')
}

function estadoColor(e?: OrdenEstado): string {
  switch (e) {
    case 'recibido':
      return 'blue'
    case 'entregado':
      return 'green'
    case 'cancelada':
      return 'orange'
    case 'rechazada':
      return 'red'
    default:
      return 'grey'
  }
}

function boolTxt(v: boolean | null | undefined): string {
  if (v === true) return 'Sí'
  if (v === false) return 'No'
  return '—'
}

function fmt(iso?: string): string {
  if (!iso) return '—'
  const dt = DateTime.fromISO(iso)
  return dt.isValid ? dt.toFormat('dd LLL yyyy, hh:mm a') : '—'
}

function money(v?: number | null): string {
  if (v === null || v === undefined) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(v)
}

function volver() {
  router.push({ name: 'HistorialOrdenes' })
}

const motivosAplicables = computed(() => {
  if (!estadoCierre.value) return []
  return motivos.value.filter((m) => m.estado_aplicable === estadoCierre.value)
})

function abrirCerrar(e: Extract<OrdenEstado, 'entregado' | 'cancelada' | 'rechazada'>) {
  estadoCierre.value = e
  fechaCierre.value = DateTime.now().toISODate() || ''
  motivoId.value = null
  motivoTexto.value = ''
  dlgCerrar.value = true
}

async function confirmarCerrar() {
  if (!orden.value || !estadoCierre.value) return
  try {
    const payload = {
      estado: estadoCierre.value,
      fecha_cierre: DateTime.fromISO(fechaCierre.value || DateTime.now().toISODate() || '').toISO()!,
      motivo_estado_id:
        estadoCierre.value === 'cancelada' || estadoCierre.value === 'rechazada'
          ? motivoId.value ?? null
          : null,
      motivo_estado_texto:
        estadoCierre.value === 'cancelada' || estadoCierre.value === 'rechazada'
          ? motivoTexto.value || null
          : null,
    }
    await cerrarOrden(orden.value.id, payload)
    snack.value = { open: true, msg: 'Orden cerrada correctamente', color: 'success' }
    dlgCerrar.value = false
    await cargar()
  } catch (e) {
    console.error('[cerrarOrden] error:', e)
    snack.value = { open: true, msg: 'No fue posible cerrar la orden', color: 'error' }
  }
}

async function cargar() {
  const id = Number(route.params.id)
  const det = await obtenerOrden(id)
  orden.value = det

  const hist = Array.isArray(det.historial) ? det.historial : []
  historial.value = hist.map((h, idx) => ({
    id: h.id ?? idx, // usa el id real; si no viene, fallback al índice
    estado: h.estado,
    usuarioId: h.usuarioId ?? null,
    motivoEstadoId: h.motivoEstadoId ?? undefined,
    motivoTexto: h.motivoTexto ?? null,
    created_at: h.created_at ?? undefined,
  }))

  motivos.value = await obtenerMotivosEstado()
}

onMounted(() => {
  cargar().catch((err) => {
    console.error('[obtenerOrden] error:', err)
    snack.value = { open: true, msg: 'No fue posible cargar la orden', color: 'error' }
  })
})
</script>

<style scoped>
.v-card-title {
  align-items: center;
}
</style>
