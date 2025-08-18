// src/services/PermisosService.ts

const API_BASE_URL = 'http://localhost:3333/api';

interface Permiso {
  id: number;
  nombre: string;
  descripcion?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Rol {
  id: number;
  nombre: string;
}

interface Item {
  id: number;
  nombre: string;
}

interface Asignacion {
  id: number;
  rol: Rol;
  item: Item;
  permiso: Permiso;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error en la solicitud a la API: ${response.statusText}`);
  }
  if (response.status === 204) {
    return null as T;
  }
  return response.json();
}

const PermisosService = {
  async obtenerPermisos(): Promise<Permiso[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/permisos`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      throw error;
    }
  },

  async getPermisoById(id: number): Promise<Permiso> {
    try {
      const response = await fetch(`${API_BASE_URL}/permisos/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener permiso ${id}:`, error);
      throw error;
    }
  },

  async createPermiso(nombre: string, descripcion?: string): Promise<Permiso> {
    try {
      const response = await fetch(`${API_BASE_URL}/permisos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, descripcion }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al crear permiso:', error);
      throw error;
    }
  },

  async updatePermiso(id: number, nombre: string, descripcion?: string): Promise<Permiso> {
    try {
      const response = await fetch(`${API_BASE_URL}/permisos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, descripcion }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al actualizar permiso:', error);
      throw error;
    }
  },

  async deletePermiso(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/permisos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al eliminar permiso: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error al eliminar permiso:', error);
      throw error;
    }
  },

  async obtenerRoles(): Promise<Rol[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener roles:', error);
      throw error;
    }
  },

  async obtenerItems(): Promise<Item[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/items`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener ítems:', error);
      throw error;
    }
  },

  async obtenerAsignaciones(): Promise<Asignacion[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/asignaciones`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      throw error;
    }
  },

  async asignarPermisosRolItem(
    data: { roleId: number; itemId: number; permisosIds: number[] }
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/asignaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al asignar permisos a rol/ítem:', error);
      throw error;
    }
  },

  async eliminarAsignacion(asignacionId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/asignaciones/${asignacionId}`, {
        method: 'DELETE',
      });
      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al eliminar asignación: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      throw error;
    }
  },

  async actualizarPermisosRolItem(
    data: { rolId: number; itemId: number; permisosIds: number[] }
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/asignaciones/actualizar-por-rol-item`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al actualizar permisos de rol/ítem:', error);
      throw error;
    }
  },

  async eliminarAsignacionesPorRolItem(rolId: number, itemId: number): Promise<void> {
    try {
      // CORRECCIÓN: La URL del endpoint DELETE debería ser una plantilla de string correcta
      const response = await fetch(`${API_BASE_URL}/asignaciones/rol/${rolId}/item/${itemId}`, {
        method: 'DELETE',
        // Si tu backend espera los IDs en el cuerpo para DELETE, descomenta y ajusta:
        // headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ rolId, itemId }),
      });
      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al eliminar asignaciones por rol/ítem: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error al eliminar asignaciones por rol/ítem:', error);
      throw error;
    }
  },
};

export default PermisosService;
export type { Permiso, Rol, Item, Asignacion };

