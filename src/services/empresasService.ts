// src/services/empresasService.ts

// --- ¡DEFINICIÓN DE API_BASE_URL AQUÍ! ---
const API_BASE_URL = 'http://localhost:3333/api' // Asegúrate de que esta URL sea correcta

interface EmpresaData {
  nombre: string
  nit: string
  correo: string
  telefono: string
  estado?: 'activo' | 'inactivo' // Añadir 'estado' como opcional para creación/actualización
}

// 1. Función para obtener empresas (ahora con filtro de estado opcional)
export async function obtenerEmpresas(estadoFiltro?: string) {
  try {
    let url = `${API_BASE_URL}/empresas`;
    // Si se proporciona un filtro de estado y no es 'todos', añadirlo a la URL
    if (estadoFiltro && estadoFiltro !== 'todos') {
      url += `?estado=${estadoFiltro}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || 'Error al obtener empresas');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    throw error;
  }
}

// 2. Función para crear empresa (asegúrate de que el backend le asigne 'activo' por defecto)
export async function crearEmpresa(empresaData: EmpresaData) {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(empresaData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || 'Error al crear empresa');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al crear empresa:', error);
    throw error;
  }
}

// 3. Función para actualizar empresa (ahora puede enviar el campo 'estado')
export async function actualizarEmpresa(id: number, empresaData: Partial<EmpresaData>) {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(empresaData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || 'Error al actualizar empresa');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    throw error;
  }
}

// 4. Nueva función para inactivar una empresa (soft delete)
export async function inactivarEmpresa(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas/${id}/inactivar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || 'Error al inactivar empresa');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al inactivar empresa:', error);
    throw error;
  }
}

// 5. Nueva función para activar una empresa
export async function activarEmpresa(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas/${id}/activar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || 'Error al activar empresa');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al activar empresa:', error);
    throw error;
  }
}

// 6. Nueva función para eliminar permanentemente una empresa
export async function eliminarEmpresaPermanentemente(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas/${id}/permanente`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || 'Error al eliminar empresa permanentemente');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al eliminar empresa permanentemente:', error);
    throw error;
  }
}

// 7. Función para verificar unicidad del nombre de empresa
export async function verificarNombreEmpresaUnico(nombre: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas/check-unique-name?name=${encodeURIComponent(nombre)}`);
    if (!response.ok) {
      // Si el backend devuelve 409 (Conflict), significa que el nombre ya existe.
      if (response.status === 409) {
        return false; // Nombre ya existe
      }
      // Para cualquier otro error HTTP que no sea 409, lanzamos un error.
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al verificar unicidad del nombre');
    }
    const data = await response.json();
    return data.isUnique; // Asume que el backend devuelve { isUnique: true/false }
  } catch (error: any) {
    console.error('Error en verificarNombreEmpresaUnico:', error);
    // Si hay un error de red o de servidor, asumimos que no es único para evitar duplicados.
    // O podrías relanzar el error si quieres que el frontend lo maneje de forma diferente.
    throw new Error(error.message || 'Error de conexión al verificar el nombre.');
  }
}