// src/services/userService.ts

const API_BASE_URL = 'http://localhost:3333'

// --- Interfaz de datos para Usuario (actualizada y corregida para nombres de campos) ---
interface UsuarioData {
  nombre: string
  apellido: string
  telefono: string
  correo: string
  password?: string // La contraseña es opcional al actualizar
  rol_id: number | null // ✨ Corregido a rol_id
  empresa_id: number | null // ✨ Corregido a empresa_id
}

// --- Funciones de CRUD para Usuarios ---

export async function crearUsuario(usuarioData: UsuarioData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usuarioData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      // Incluimos un log para ver la estructura exacta del error del backend
      console.error('Error response from backend (crearUsuario):', errorData);
      throw new Error(errorData.message || 'Error al crear usuario'); // Usa 'message' si el backend lo envía así
    }

    return await response.json()
  } catch (error) {
    console.error('Error en userService.crearUsuario:', error)
    throw error
  }
}

export async function obtenerUsuarios() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/usuarios`)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error response from backend (obtenerUsuarios):', errorData);
      throw new Error(errorData.message || 'Error al obtener usuarios');
    }

    return await response.json()
  } catch (error) {
    console.error('Error en userService.obtenerUsuarios:', error)
    throw error
  }
}

export async function actualizarUsuario(id: number, usuarioData: Partial<UsuarioData>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usuarioData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error response from backend (actualizarUsuario):', errorData);
      throw new Error(errorData.message || 'Error al actualizar usuario');
    }

    return await response.json()
  } catch (error) {
    console.error('Error en userService.actualizarUsuario:', error)
    throw error
  }
}

export async function eliminarUsuario(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error response from backend (eliminarUsuario):', errorData);
      throw new Error(errorData.message || 'Error al eliminar usuario');
    }

    return await response.json()
  } catch (error) {
    console.error('Error en userService.eliminarUsuario:', error)
    throw error
  }
}

export async function uploadProfileImage(userId: number, formData: FormData) {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/upload-profile-picture`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from backend (uploadProfileImage):', errorData);
      throw new Error(errorData.message || 'Error al subir la imagen de perfil');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en userService.uploadProfileImage:', error);
    throw error;
  }
}

// --- ✨ Nuevas funciones para obtener listas de apoyo (roles y empresas) ✨ ---

export async function obtenerRoles() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/roles-lista`)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error response from backend (obtenerRoles):', errorData);
      throw new Error(errorData.message || 'Error al obtener roles');
    }

    return await response.json()
  } catch (error) {
    console.error('Error en userService.obtenerRoles:', error)
    throw error
  }
}

export async function obtenerEmpresas() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/empresas-lista`)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error response from backend (obtenerEmpresas):', errorData);
      throw new Error(errorData.message || 'Error al obtener empresas');
    }

    return await response.json()
  } catch (error) {
    console.error('Error en userService.obtenerEmpresas:', error)
    throw error
  }
}

// services/userService.ts

// ... tus otras funciones de usuario

export async function obtenerTecnicos() { // O cambiar nombre a obtenerUsuariosTecnicos para más claridad
  try {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/tecnicos-lista`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener la lista de técnicos');
    }
    return response.data; // Asumiendo que tu backend devuelve directamente el array de técnicos
  } catch (error: any) {
    console.error('Error al obtener la lista de técnicos:', error);
    throw error;
  }
}