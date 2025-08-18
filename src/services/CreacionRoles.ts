// src/services/CreacionRoles.ts

// Define la URL base de tu API de AdonisJS
const API_BASE_URL = 'http://localhost:3333/api' // URL base para todos los endpoints

// Define la interfaz para la estructura de un rol
export interface Rol {
  id: number
  nombre: string
  descripcion?: string | null // Puede ser nulo
  estado: 'activo' | 'inactivo'
  createdAt?: string
  updatedAt?: string
}

// Define un tipo para los datos que se pueden enviar al actualizar (pueden ser parciales)
type RolUpdateData = {
  nombre?: string
  descripcion?: string | null
  estado?: 'activo' | 'inactivo'
}

/**
 * Función auxiliar para manejar respuestas de fetch
 * Lanza un error estructurado si la respuesta no es OK (status 2xx)
 */
async function handleFetchResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: any = {};
    let errorMessage: string = '';

    try {
      // Intentar parsear el error como JSON
      errorData = await response.json();
      // El backend ahora devuelve un objeto con 'message' en caso de conflicto
      errorMessage = errorData.message || 'Error del servidor.';
    } catch (e) {
      // Si no es JSON o hay un error al parsear, obtener el texto o un mensaje genérico
      errorMessage = await response.text();
      if (!errorMessage) {
        errorMessage = `Error de red o respuesta no JSON. Estado: ${response.status} ${response.statusText}`;
      }
    }

    // Lanza un error con un mensaje simple
    throw new Error(errorMessage);
  }

  // Si la respuesta es 204 No Content, response.json() fallará.
  // Es mejor verificar si hay contenido antes de intentar parsear.
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  // Si no es JSON (ej. 204 No Content), devolvemos un objeto vacío
  return {} as T;
}


/**
 * Obtiene todos los roles desde la API.
 * Corresponde a GET /api/roles
 */
export async function obtenerRoles(): Promise<Rol[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    return await handleFetchResponse<Rol[]>(response);
  } catch (error: any) {
    console.error('Error al obtener roles:', error);
    // Propaga el mensaje de error directamente
    throw new Error(error.message || 'Error desconocido al obtener roles');
  }
}

/**
 * Crea un nuevo rol.
 * Corresponde a POST /api/roles
 */
export async function crearRol(rolData: { nombre: string; descripcion?: string | null; estado?: 'activo' | 'inactivo' }): Promise<Rol> {
  try {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(rolData),
    })
    return await handleFetchResponse<Rol>(response);
  } catch (error: any) {
    console.error('Error al crear rol:', error);
    // Propaga el mensaje de error directamente
    throw new Error(error.message || 'Error desconocido al crear rol');
  }
}

/**
 * Actualiza un rol existente.
 * Corresponde a PUT/PATCH /api/roles/:id
 */
export async function actualizarRol(id: number, rolData: RolUpdateData): Promise<Rol> {
  try {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      method: 'PUT', // O 'PATCH' si tu API espera PATCH para actualizaciones parciales
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(rolData),
    })
    return await handleFetchResponse<Rol>(response);
  } catch (error: any) {
    console.error(`Error al actualizar rol con ID ${id}:`, error);
    // Propaga el mensaje de error directamente
    throw new Error(error.message || `Error desconocido al actualizar rol con ID ${id}`);
  }
}

/**
 * Elimina un rol de forma PERMANENTE de la base de datos.
 * Corresponde a DELETE /api/roles/:id/permanente
 */
export async function eliminarRolPermanentemente(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/roles/${id}/permanente`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (!response.ok) {
        let errorData: any = {};
        let errorMessage: string = '';
        try {
            errorData = await response.json();
            errorMessage = errorData.message || 'Error del servidor.';
        } catch (e) {
            errorMessage = await response.text();
            if (!errorMessage) {
              errorMessage = `Error de red o respuesta no JSON. Estado: ${response.status} ${response.statusText}`;
            }
        }
        throw new Error(errorMessage);
    }
    return; // No hay datos que devolver para una eliminación 204
  } catch (error: any) {
    console.error(`Error al eliminar rol permanentemente con ID ${id}:`, error);
    throw new Error(error.message || `Error desconocido al eliminar rol con ID ${id}`);
  }
}

// NUEVA FUNCIÓN para verificar unicidad del nombre del rol
export async function verificarNombreRolUnico(nombre: string, excludeId?: number): Promise<boolean> {
  try {
    let url = `${API_BASE_URL}/roles/check-unique-name?name=${encodeURIComponent(nombre)}`;
    if (excludeId) {
      url += `&excludeId=${excludeId}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      // Si el backend devuelve 409 (Conflict), significa que el nombre ya existe.
      if (response.status === 409) {
        return false; // Nombre ya existe
      }
      // Para cualquier otro error HTTP que no sea 409, lanzamos un error.
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al verificar unicidad del nombre del rol');
    }
    const data = await response.json();
    return data.isUnique; // Asume que el backend devuelve { isUnique: true/false }
  } catch (error: any) {
    console.error('Error en verificarNombreRolUnico:', error);
    // Si hay un error de red o de servidor, asumimos que no es único para evitar duplicados.
    throw new Error(error.message || 'Error de conexión al verificar el nombre del rol.');
  }
}

// Las funciones de activar/inactivar por PATCH se dejaron comentadas en el ejemplo anterior
// porque el controlador de AdonisJS que te proporcioné antes las tiene explícitamente.
// Si tu frontend las usa, descoméntalas.
export async function inactivarRol(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/roles/${id}/inactivar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al inactivar rol');
    }
    return; // 204 No Content
  } catch (error: any) {
    console.error(`Error al inactivar rol con ID ${id}:`, error);
    throw new Error(error.message || `Error desconocido al inactivar rol con ID ${id}`);
  }
}

export async function activarRol(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/roles/${id}/activar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al activar rol');
    }
    return; // 204 No Content
  } catch (error: any) {
    console.error(`Error al activar rol con ID ${id}:`, error);
    throw new Error(error.message || `Error desconocido al activar rol con ID ${id}`);
  }
}