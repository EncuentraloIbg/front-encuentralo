// src/services/ticketService.ts
import { authSetStore } from '@/stores/AuthStore';

const API_BASE_URL = 'http://localhost:3333/api';

/**
 * Crea un nuevo ticket en la base de datos.
 * @param ticketData Los datos del ticket a crear (espera FormData para archivos).
 * @returns El ticket creado con su ID y otras propiedades.
 */
export async function crearTicket(ticketData: FormData) {
  try {
    const authStore = authSetStore();
    const token = authStore.token;

    // --- Validación para asegurar que el token y el ID de usuario estén disponibles ---
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }
    if (!authStore.user || !authStore.user.id) {
      // Es una buena práctica verificar esto antes de intentar acceder a 'authStore.user.id'
      throw new Error('Información de usuario no disponible. Por favor, inicie sesión nuevamente.');
    }
    const userId = authStore.user.id; // Obtener el ID del usuario del store
    // --- FIN Validación ---

    // ✅ CORRECCIÓN CRÍTICA: AÑADIMOS DE NUEVO EL userId AL FORM DATA.
    // Esto es necesario porque el backend NO está usando auth.user.id para 'creador_id'.
    // En su lugar, espera 'userId' directamente del FormData.
    ticketData.append('userId', userId.toString());

    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: {
        // Para FormData, NO se debe establecer 'Content-Type': 'application/json'
        // El navegador lo gestiona automáticamente con 'multipart/form-data'.
        'Authorization': `Bearer ${token}`, // Correcto: El token real va en el encabezado
      },
      body: ticketData, // Correcto: Enviamos FormData directamente
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage =
        errorData.message || errorData.error || errorData.mensaje || 'Error al crear ticket';
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (crearTicket):', error);
    throw error;
  }
}

/**
 * Obtiene todos los tickets de la base de datos.
 * @returns Un array de objetos ticket.
 */
export async function obtenerTickets() {
  try {
    const authStore = authSetStore(); // Obtener el store para el token

    // --- CORRECCIÓN: Verificar token para rutas protegidas (si esta ruta lo requiere) ---
    // Asumo que 'obtenerTickets' debería estar protegida. Si no es así, puedes quitar este bloque.
    if (!authStore.token) {
      throw new Error('No authentication token found. Please log in.');
    }
    // --- FIN CORRECCIÓN ---

    const response = await fetch(`${API_BASE_URL}/tickets`, {
      // --- CORRECCIÓN: Asegurar que el token de autorización se envíe ---
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
      // --- FIN CORRECCIÓN ---
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage =
        errorData.message || errorData.error || errorData.mensaje || 'Error al obtener tickets';
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerTickets):', error);
    throw error;
  }
}

/**
 * Actualiza un ticket existente por su ID.
 * @param id El ID del ticket a actualizar.
 * @param ticketData Los datos parciales del ticket a actualizar (espera FormData para archivos).
 * @returns El ticket actualizado.
 */
export async function actualizarTicket(id: number, ticketData: FormData) {
  try {
    const authStore = authSetStore();

    // --- Validación para asegurar que el token y el ID de usuario estén disponibles ---
    if (!authStore.token) {
      throw new Error('No authentication token found. Please log in.');
    }
    if (!authStore.user || !authStore.user.id) {
      throw new Error('Información de usuario no disponible para actualizar. Por favor, inicie sesión.');
    }
    const userId = authStore.user.id; // Obtener el ID del usuario del store
    // --- FIN Validación ---

    // ✅ Agregamos el usuario_id al FormData.
    // Esto es necesario si el backend lo espera así, en lugar de obtenerlo del token.
    ticketData.append('usuario_id', userId.toString());

    const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'PATCH',
      // --- CORRECCIÓN: Asegurar que el token de autorización se envíe ---
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
      // --- FIN CORRECCIÓN ---
      body: ticketData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage =
        errorData.message || errorData.error || errorData.mensaje || 'Error al actualizar ticket';
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (actualizarTicket):', error);
    throw error;
  }
}

/**
 * Elimina un ticket por su ID.
 * @param id El ID del ticket a eliminar.
 * @returns Un objeto de confirmación de eliminación (puede ser vacío o con un mensaje).
 */
export async function eliminarTicket(id: number) {
  try {
    const authStore = authSetStore(); // Obtener el store para el token

    // --- CORRECCIÓN: Verificar token para rutas protegidas ---
    if (!authStore.token) {
      throw new Error('No authentication token found. Please log in.');
    }
    // --- FIN CORRECCIÓN ---

    const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'DELETE',
      // --- CORRECCIÓN: Asegurar que el token de autorización se envíe ---
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
      // --- FIN CORRECCIÓN ---
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage =
        errorData.message || errorData.error || errorData.mensaje || 'Error al eliminar ticket';
      throw new Error(errorMessage);
    }

    return response.status === 204 ? {} : await response.json();
  } catch (error) {
    console.error('Error en ticketService (eliminarTicket):', error);
    throw error;
  }
}

// --- NUEVA FUNCIÓN PARA DESCARGAR ADJUNTO ---

/**
 * Descarga el archivo adjunto de un ticket por su ID.
 * Utiliza el endpoint que creamos en el backend.
 * @param ticketId El ID del ticket cuyo adjunto se desea descargar.
 */
export async function downloadTicketAttachment(ticketId: number) {
  try {
    const authStore = authSetStore(); // Obtener el store para el token

    // --- CORRECCIÓN: Verificar token para rutas protegidas ---
    if (!authStore.token) {
      throw new Error('No authentication token found. Please log in.');
    }
    // --- FIN CORRECCIÓN ---

    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/attachment`, {
      // --- CORRECCIÓN: Asegurar que el token de autorización se envíe ---
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
      // --- FIN CORRECCIÓN ---
    });

    if (!response.ok) {
      // Intenta obtener el mensaje de error del backend si no es un archivo
      const errorData = await response.json();
      const errorMessage =
        errorData.message ||
        errorData.error ||
        errorData.mensaje ||
        'Error al descargar el archivo adjunto.';
      throw new Error(errorMessage);
    }

    // Obtener el nombre del archivo del header 'Content-Disposition' o usar un default
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = `attachment_ticket_${ticketId}`;

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1];
      }
    }

    // Crea un objeto URL para el blob del archivo y lo descarga
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // Nombre del archivo para la descarga
    document.body.appendChild(a);
    a.click();
    a.remove(); // Limpia el elemento 'a' del DOM
    window.URL.revokeObjectURL(url); // Libera la URL del objeto

    return { success: true, message: 'Archivo descargado con éxito.' };
  } catch (error) {
    console.error('Error en ticketService (downloadTicketAttachment):', error);
    throw error;
  }
}

// --- Servicios adicionales para las listas de referencia (se asume que requieren token) ---

export async function obtenerEstados() {
  try {
    const authStore = authSetStore();
    if (!authStore.token) throw new Error('No authentication token found.');
    const response = await fetch(`${API_BASE_URL}/estados`, { headers: { 'Authorization': `Bearer ${authStore.token}` } });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || errorData.mensaje || 'Error al obtener estados de tickets');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerEstados):', error);
    throw error;
  }
}

export async function obtenerPrioridades() {
  try {
    const authStore = authSetStore();
    if (!authStore.token) throw new Error('No authentication token found.');
    const response = await fetch(`${API_BASE_URL}/prioridades`, { headers: { 'Authorization': `Bearer ${authStore.token}` } });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || errorData.mensaje || 'Error al obtener prioridades');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerPrioridades):', error);
    throw error;
  }
}

export async function obtenerEmpresas() {
  try {
    const authStore = authSetStore();
    if (!authStore.token) throw new Error('No authentication token found.');
    const response = await fetch(`${API_BASE_URL}/empresas`, { headers: { 'Authorization': `Bearer ${authStore.token}` } });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || errorData.mensaje || 'Error al obtener empresas');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerEmpresas):', error);
    throw error;
  }
}

// ✅ Función crucial para obtener técnicos, ahora con manejo de autenticación
export async function obtenerTecnicos(): Promise<{ id: number; nombres: string; apellido: string; rol?: { id: number; nombre: string } }[]> {
  try {
    const authStore = authSetStore();
    if (!authStore.token) {
      throw new Error('No authentication token found. Please log in.');
    }
    const response = await fetch(`${API_BASE_URL}/usuarios/tecnicos-lista`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || errorData.mensaje || 'Error al obtener técnicos.');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerTecnicos):', error);
    throw error;
  }
}

// Tu función original obtenerUsuariosAsignables que llama a /usuarios (todos los usuarios)
export async function obtenerUsuariosAsignables() {
  try {
    const authStore = authSetStore();
    if (!authStore.token) {
      throw new Error('No authentication token found. Please log in.');
    }
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || errorData.mensaje || 'Error al obtener usuarios asignables');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerUsuariosAsignables):', error);
    throw error;
  }
}

export async function obtenerCategorias() {
  try {
    const authStore = authSetStore();
    if (!authStore.token) throw new Error('No authentication token found.');
    const response = await fetch(`${API_BASE_URL}/categorias`, { headers: { 'Authorization': `Bearer ${authStore.token}` } });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || errorData.mensaje || 'Error al obtener categorías');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerCategorias):', error);
    throw error;
  }
}

export async function obtenerServicios() {
  try {
    const authStore = authSetStore();
    if (!authStore.token) throw new Error('No authentication token found.');
    const response = await fetch(`${API_BASE_URL}/servicios`, { headers: { 'Authorization': `Bearer ${authStore.token}` } });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || errorData.mensaje || 'Error al obtener servicios');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerServicios):', error);
    throw error;
  }
}

export async function enviarComentario(ticketId: number, usuarioId: number, comentario: string) {
  try {
    const authStore = authSetStore();
    if (!authStore.token) {
      throw new Error('No authentication token found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/comentarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        usuarioId,
        comentario,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al guardar comentario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (enviarComentario):', error);
    throw error;
  }
}

export async function obtenerTrazabilidadTicket(ticketId: number) {
  try {
    const authStore = authSetStore();
    if (!authStore.token) {
      throw new Error('No authentication token found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/trazabilidad`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage =
        errorData.message || errorData.error || errorData.mensaje || 'Error al obtener trazabilidad del ticket';
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerTrazabilidadTicket):', error);
    throw error;
  }
}