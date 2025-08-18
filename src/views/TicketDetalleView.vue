<template>
  <v-container>
    <v-card class="pa-4 mt-4" elevation="10">
      <v-card-title>
        <v-icon icon="mdi-ticket" class="me-2" />
        Detalles del Ticket #{{ ticket?.id || '' }}
      </v-card-title>

      <v-card-text v-if="ticket">
        <v-row>
          <v-col cols="12" md="6">
            <strong>Título:</strong> {{ ticket.titulo }}
          </v-col>
          <v-col cols="12" md="6">
            <strong>Estado:</strong>
            <v-chip :color="getEstadoColor(ticket.estado?.nombre)">
              {{ ticket.estado?.nombre }}
            </v-chip>
          </v-col>
          <v-col cols="12" md="6" >
            <strong>Creador por:</strong>
              {{ ticket.creador?.nombre || 'Usuario no disponible' }}
          </v-col>

          <v-col cols="12" md="6">
            <strong>Fecha de creación:</strong> {{ formatearFecha(ticket.createdAt) }}
          </v-col>
          <v-col cols="12" md="6" v-if="ticket.fechaFinalizacion">
            <strong>Fecha de finalización:</strong> 
            <span style="color: green">
              <v-icon small color="green">mdi-check-circle</v-icon>
              {{ formatearFecha(ticket.fechaFinalizacion) }}
            </span>
          </v-col>
          <v-col cols="12">
            <strong>Descripción:</strong>
            <p>{{ ticket.descripcion }}</p>
          </v-col>
          <v-col cols="12" md="6">
            <strong>Prioridad:</strong>
            <v-chip :color="getPrioridadColor(ticket.prioridad?.nombre)">
              {{ ticket.prioridad?.nombre }}
            </v-chip>
          </v-col>
          <v-col cols="12" md="6">
            <strong>Categoría:</strong> {{ ticket.categoria?.nombre }}
          </v-col>
          <v-col cols="12" md="6">
            <strong>Servicio:</strong> {{ ticket.servicio?.nombre }}
          </v-col>
          <v-col cols="12" md="6">
            <strong>Empresa:</strong> {{ ticket.empresa?.nombre }}
          </v-col>
          <v-col cols="12" md="6">
            <strong>Usuario asignado:</strong> {{ ticket.usuarioAsignado?.nombre || 'Sin asignar' }}
          </v-col>
          <v-col cols="12" md="6">
            <strong>Archivo adjunto:</strong>
            <span v-if="ticket.nombreArchivo">
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-download"
                @click="descargarArchivo(ticket.id)"
              >
                Descargar
              </v-btn>
            </span>
            <span v-else>No tiene</span>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <strong>Comentarios:</strong>
        <v-timeline density="compact">
          <v-timeline-item
            v-for="comentario in ticket.comentarios"
            :key="comentario.id"
            dot-color="primary"
            size="small"
          >
            <template #opposite>
              {{ comentario.usuario?.nombre || 'Usuario' }}
            </template>
            <div>{{ comentario.comentario }}</div>
            <small class="text-grey">
              {{ formatearFecha(comentario.createdAt) }}
            </small>
          </v-timeline-item>
        </v-timeline>

        <!-- Textarea nuevo comentario -->
        <v-textarea
          v-model="nuevoComentario"
          label="Agregar comentario"
          auto-grow
          rows="2"
        />
        <v-row class="mt-4" align="center">
          <v-col cols="6">
            <v-btn color="primary" @click="enviarNuevoComentario">
              Enviar comentario
            </v-btn>
          </v-col>
          <v-col cols="6" class="d-flex justify-end">
            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-arrow-left"
              @click="router.push({ name: 'HistorialTickets' })"
            >
              Volver al historial
            </v-btn>
          </v-col>
        </v-row>

        <!-- 🔁 TRAZABILIDAD DE ESTADO -->
        <v-divider class="my-4" />
        <strong>Trazabilidad:</strong>
        <div style="max-height: 250px; overflow-y: auto; border: 1px solid #ddd; border-radius: 6px; padding: 8px;">
          <v-timeline density="compact">
            <v-timeline-item
              v-for="(registro, index) in trazabilidad"
              :key="index"
              dot-color="green"
              size="small"
            >
              <div>
                <strong>usuario:</strong>
                {{ registro.usuario ? registro.usuario.nombre + '' + registro.usuario.apellido : 'sin nombre' }}
              </div>
              <div><strong>Estado:</strong> {{ registro.estado?.nombre }}</div>
              <div v-if="registro.comentario">
                <em>Comentario:</em> {{ registro.comentario }}
              </div>
              <small class="text-grey">
                {{ formatearFecha(registro.fecha) }}
              </small>
            </v-timeline-item>
          </v-timeline>
        </div>
      </v-card-text>
    </v-card>
    <v-dialog v-model="showConfirmDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Confirmar envío</v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas enviar este comentario?
          <v-textarea
            :model-value="comentarioConfirmado"
            readonly
            class="mt-4"
            auto-grow
            rows="2"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="showConfirmDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmarEnvio">Enviar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
     >
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DateTime } from 'luxon'
import { authSetStore } from '@/stores/AuthStore'
import { enviarComentario } from '@/services/ticketService'

const route = useRoute()
const router = useRouter()
const ticket = ref<any>(null)
const trazabilidad = ref<any[]>([])
const nuevoComentario = ref('')
const authStore = authSetStore()
const showConfirmDialog = ref(false)
const comentarioConfirmado = ref('')
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

function getEstadoColor(estado: string) {
  switch (estado) {
    case 'Abierto': return 'blue'
    case 'Asignado': return 'orange'
    case 'Cerrado': return 'green'
    default: return 'grey'
  }
}

function getPrioridadColor(prioridad: string) {
  switch (prioridad) {
    case 'Alta': return 'red'
    case 'Media': return 'orange'
    case 'Baja': return 'green'
    default: return 'grey'
  }
}

function formatearFecha(fecha: string) {
  const dt = DateTime.fromISO(fecha)
  return dt.isValid ? dt.toFormat('dd LLL yyyy, hh:mm a') : 'Fecha invalida'
}

function descargarArchivo(ticketId: number) {
  const url = `http://localhost:3333/api/tickets/${ticketId}/attachment`
  window.open(url, '_blank')
}

async function obtenerTicketDetalle(id: number) {
  try {
    const res = await fetch(`http://localhost:3333/api/tickets/${id}`)
    const data = await res.json()
    ticket.value = data
  } catch (error) {
    console.error('Error al cargar ticket:', error)
  }
}

async function obtenerTrazabilidad(id: number) {
  try {
    const res = await fetch(`http://localhost:3333/api/tickets/${id}/trazabilidad`)
    const data = await res.json()
    trazabilidad.value = data
  } catch (error) {
    console.error('Error al cargar trazabilidad:', error)
  }
}

async function enviarNuevoComentario() {
  if (!nuevoComentario.value.trim()) return
  
  // Mostrar diálogo de confirmación
  showConfirmDialog.value = true
  comentarioConfirmado.value = nuevoComentario.value
}

async function confirmarEnvio() {
  try {
    await enviarComentario(
      ticket.value.id, 
      authStore.user.id, 
      comentarioConfirmado.value
    )
    nuevoComentario.value = ''
     await Promise.all([
      obtenerTicketDetalle(ticket.value.id),
      obtenerTrazabilidad(ticket.value.id)
    ]);
    
    // Mostrar mensaje de éxito
    snackbarMessage.value = 'Comentario enviado correctamente'
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch (error) {
    console.error('Error al comentar:', error)
    // Mostrar mensaje de error
    snackbarMessage.value = 'Error al enviar el comentario'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    showConfirmDialog.value = false
    comentarioConfirmado.value = ''
  }
}

onMounted(() => {
  const id = Number(route.params.id)
  obtenerTicketDetalle(id)
  obtenerTrazabilidad(id)
})
</script>
