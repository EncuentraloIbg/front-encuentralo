// src/services/RolesService.ts

const ROLES_API_URL = 'http://localhost:3333/api/roles'; // ¡Asegúrate que este prefijo coincida con tus rutas de AdonisJS!

interface Rol {
  id: number;
  nombre: string;
  createdAt?: string;
  updatedAt?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error en la solicitud a la API: ${response.statusText}`);
  }
  if (response.status === 204) {
    return null as T; // No content for DELETE operations
  }
  return response.json();
}

const RolesService = {
  async getRoles(): Promise<Rol[]> {
    try {
      const response = await fetch(ROLES_API_URL);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener roles:', error);
      throw error;
    }
  },

  async getRolById(id: number): Promise<Rol> {
    try {
      const response = await fetch(`${ROLES_API_URL}/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener rol ${id}:`, error);
      throw error;
    }
  },

  async createRol(nombre: string): Promise<Rol> {
    try {
      const response = await fetch(ROLES_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al crear rol:', error);
      throw error;
    }
  },

  async updateRol(id: number, nombre: string): Promise<Rol> {
    try {
      const response = await fetch(`${ROLES_API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      throw error;
    }
  },

  async deleteRol(id: number): Promise<void> {
    try {
      const response = await fetch(`${ROLES_API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al eliminar rol: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      throw error;
    }
  },
};

export default RolesService;
export type { Rol };