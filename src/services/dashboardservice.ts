import { authSetStore } from '@/stores/AuthStore'; // Necesitamos el AuthStore para obtener el token

const API_BASE_URL = 'http://localhost:3333/api'; // <--- ASEGÚRATE DE QUE ESTA URL SEA CORRECTA

/**
 * Define las interfaces para la estructura de datos que esperamos del backend
 * para el dashboard. Esto mejora la seguridad de tipos en el frontend.
 */
export interface MetricData {
  ticketsAbiertos: number;
  ticketsCerradosMes: number;
  nuevosUsuarios: number;
}

export interface ActivityItem {
  id: number;
  titulo: string;
  estado: string;
  asignadoA: string;
  empresa: string;
  evento: string;
  fecha: string;
}

export interface TaskItem {
  id: number;
  titulo: string;
  prioridad: string;
  estado: string;
  vence: string;
  detalle: string;
}

// Adapta la interfaz principal del DashboardResponse a la estructura del servicio de ejemplo
// para mantener la consistencia, aunque los datos internos sigan siendo los tuyos.
export interface DashboardResponse {
  metrics: MetricData;
  actividadReciente: ActivityItem[];
  tareasPendientes: TaskItem[];
}

export default class DashboardService {
  static async getDashboardData(): Promise<DashboardResponse> {
    const authStore = authSetStore(); // Obtiene la instancia del store
    const token = authStore.user.id; // Obtiene el token

    console.log('DashboardService - Token recuperado del AuthStore:', token);
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Error desconocido al obtener datos del dashboard';
        throw new Error(`Error ${response.status}: ${errorMessage}`);
      }

      return await response.json() as DashboardResponse;
    } catch (error) {
      console.error('Error in DashboardService.getDashboardData:', error);
      throw error;
    }
  }
}
