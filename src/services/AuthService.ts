// src/services/AuthService.ts

import { authSetStore } from '@/stores/AuthStore'; // Importa el AuthStore para obtener el token

// Define la URL base de tu API de AdonisJS
// IMPORTANTE: Asegúrate de que esta URL sea correcta.
// Para el login, la ruta parece ser directamente en la raíz, no bajo /api
const API_BASE_URL = 'http://localhost:3333';

export default class AuthService {
  /**
   * Método para iniciar sesión de un usuario.
   * NO requiere token de autenticación.
   */
  async login(correo: string, password: string) {
    try {
      // La URL para el login parece ser directamente en la raíz de la API, ej. http://localhost:3333/login
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // 'Content-Type' es el correcto, 'content-type' también funciona pero es menos común
        },
        body: JSON.stringify({ correo, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la autenticación');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error en AuthService.login:', error.message);
        return { errors: [{ message: error.message }] };
      }
      console.error('Error desconocido en AuthService.login:', error);
      return { errors: [{ message: 'Error desconocido' }] };
    }
  }

  /**
   * Método para verificar la sesión del usuario obteniendo su información.
   * REQUIERE enviar el token de autenticación.
   *
   * Asume que la ruta en tu backend de AdonisJS para obtener la información del usuario
   * autenticado es GET /api/me y está protegida por middleware de autenticación.
   */
  async me() {
    const authStore = authSetStore(); // Obtiene la instancia del store
    const token = authStore.token; // Obtiene el token del store

    // Si no hay token en el store, no podemos hacer la petición autenticada
    if (!token) {
      console.warn('AuthService.me(): No hay token de autenticación disponible. No se puede verificar la sesión.');
      // Lanzamos un error para que el AuthStore lo capture y haga logout si es necesario.
      throw new Error('No hay token de autenticación disponible para verificar la sesión.');
    }

    try {
      // La URL para obtener información del usuario autenticado, típicamente /api/me
      // Asegúrate de que esta ruta '/api/me' exista en tu AdonisJS y esté protegida.
      const response = await fetch(`${API_BASE_URL}/api/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // <--- ¡Esto es CRUCIAL! Envía el token
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Manejo específico para el 401: token inválido o expirado
        if (response.status === 401) {
          throw new Error('Token de autenticación expirado o inválido.');
        }
        // Para otros errores HTTP (400, 500, etc.)
        throw new Error(errorData.message || 'Error al obtener información del usuario.');
      }

      // Si la respuesta es exitosa, devuelve los datos del usuario
      return await response.json();
    } catch (error) {
      console.error('Error en AuthService.me():', error);
      // Propaga el error para que `AuthStore.checkAuth` pueda manejarlo (ej. llamar a `logout`)
      throw error;
    }
  }
}