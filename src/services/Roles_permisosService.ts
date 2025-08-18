// src/services/Roles_permisosService.ts

import axios from 'axios'; // Usaremos axios por ser más estándar en Vue/Adonis

const API_URL = 'http://localhost:3333/api';

// --- ¡TODAS estas interfaces necesitan 'export' para ser importables! ---
export interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
}

export interface Rol {
    id: number;
    nombre: string;
}

export interface Permiso {
    id: number;
    nombre: string;
}

export interface Item {
    id: number;
    nombre: string;
}

// Interfaz AsignacionPermiso corregida para usar snake_case en los IDs
// para que coincida con la respuesta por defecto de AdonisJS para columnas directas
export interface AsignacionPermiso {
    id?: number; // Puede ser opcional si es un nuevo registro
    rol_id: number;       // CORREGIDO: de rolId a rol_id (snake_case)
    permiso_id: number;   // CORREGIDO: de permisoId a permiso_id (snake_case)
    item_id: number | null; // CORREGIDO: de itemId a item_id (snake_case)
    rol?: Rol | null; // Puede ser null si no se precarga
    permiso?: Permiso | null; // Puede ser null
    item?: Item | null; // Puede ser null
    created_at?: string; // CORREGIDO: de createdAt a created_at (snake_case)
    updated_at?: string; // CORREGIDO: de updatedAt a updated_at (snake_case)
}

// Interfaz para el payload de creación de asignaciones (esta sí usa camelCase para el envío al backend)
export interface CreateAsignacionData {
    rolId: number;
    itemId?: number | null; // Opcional para permisos generales
    selectedPermisos: number[]; // Array de IDs de permisos
    selectedVistas: number[]; // Array de IDs de ítems (vistas)
}

// Función auxiliar para manejar respuestas (usando axios, no fetch directamente)
// Axios ya maneja el JSON parsing y los errores HTTP de forma más elegante.
// No necesitamos handleResponse si usamos axios.
// Axios lanza un error para respuestas 4xx/5xx, que podemos capturar con try/catch.

const RolesPermisosService = {
    async getUsuarios(): Promise<Usuario[]> {
        try {
            const response = await axios.get(`${API_URL}/usuarios`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    },

    async getRoles(): Promise<Rol[]> {
        try {
            const response = await axios.get(`${API_URL}/roles`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener roles:', error);
            throw error;
        }
    },

    async getPermisos(): Promise<Permiso[]> {
        try {
            const response = await axios.get(`${API_URL}/permisos`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener permisos:', error);
            throw error;
        }
    },

    async getItems(): Promise<Item[]> {
        try {
            const response = await axios.get(`${API_URL}/items`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener ítems:', error);
            throw error;
        }
    },

    async getAsignaciones(): Promise<AsignacionPermiso[]> {
        try {
            // CORREGIDO: Añadir /permisos-gestion/
            const response = await axios.get(`${API_URL}/permisos-gestion/asignaciones`);
            return response.data;
        } catch (error) {
            console.error('Error al cargar asignaciones:', error);
            throw error;
        }
    },

    async getAsignacionesPorRol(rolId: number): Promise<AsignacionPermiso[]> {
        try {
            // CORREGIDO: Añadir /permisos-gestion/
            const response = await axios.get(`${API_URL}/permisos-gestion/roles/${rolId}/asignaciones`);
            return response.data;
        } catch (error) {
            console.error(`Error al cargar asignaciones para el rol ${rolId}:`, error);
            throw error;
        }
    },

    async createAsignacion(data: CreateAsignacionData): Promise<any> {
        try {
            // CORREGIDO: Añadir /permisos-gestion/
            const response = await axios.post(`${API_URL}/permisos-gestion/asignaciones`, data);
            return response.data;
        } catch (error) {
            console.error('Error al crear asignación de permisos:', error);
            throw error;
        }
    },

    async deleteAsignacion(rolId: number, permisoId: number, itemId: number | 'null'): Promise<any> {
        try {
            // CORREGIDO: Añadir /permisos-gestion/
            const response = await axios.delete(`${API_URL}/permisos-gestion/asignaciones/${rolId}/${permisoId}/${itemId}`);
            // Axios no devuelve data para 204 No Content, solo el status
            return response.status; // Puedes devolver el status 204
        } catch (error) {
            console.error('Error al eliminar asignación de permisos:', error);
            throw error;
        }
    }
};

export default RolesPermisosService;