// src/services/ItemsService.ts

const ITEMS_API_URL = 'http://localhost:3333/api/items'; // ¡Asegúrate que este prefijo coincida con tus rutas de AdonisJS!

interface Item {
  id: number;
  nombre: string;
  url?: string | null;
  icon?: string | null;
  parentId?: number | null;
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

const ItemsService = {
  async getItems(): Promise<Item[]> {
    try {
      const response = await fetch(ITEMS_API_URL);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener ítems:', error);
      throw error;
    }
  },

  async getItemById(id: number): Promise<Item> {
    try {
      const response = await fetch(`${ITEMS_API_URL}/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener ítem ${id}:`, error);
      throw error;
    }
  },

  async createItem(nombre: string, url?: string | null, icon?: string | null, parentId?: number | null): Promise<Item> {
    try {
      const response = await fetch(ITEMS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, url, icon, parentId }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al crear ítem:', error);
      throw error;
    }
  },

  async updateItem(id: number, nombre: string, url?: string | null, icon?: string | null, parentId?: number | null): Promise<Item> {
    try {
      const response = await fetch(`${ITEMS_API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, url, icon, parentId }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al actualizar ítem:', error);
      throw error;
    }
  },

  async deleteItem(id: number): Promise<void> {
    try {
      const response = await fetch(`${ITEMS_API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al eliminar ítem: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error al eliminar ítem:', error);
      throw error;
    }
  },
};

export default ItemsService;
export type { Item };