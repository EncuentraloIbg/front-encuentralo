import axios from 'axios';

// Define la URL base de tu API de AdonisJS
const API_URL = 'http://localhost:3333/api'; // ¡Asegúrate de que esta sea tu URL correcta!

// Interfaz para los datos de una empresa
interface EmpresaData {
  nombre: string;
  nit: string;
  correo: string;
}

/**
 * Crea una nueva empresa.
 * @param data Los datos de la empresa a crear.
 * @returns La empresa creada.
 */
export async function crearEmpresa(data: EmpresaData): Promise<any> {
  try {
    const response = await axios.post(`${API_URL}/empresas`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error al crear empresa:', error.response?.data?.message || error.message);
    throw error;
  }
}

/**
 * Obtiene todas las empresas.
 * @returns Una lista de empresas.
 */
export async function obtenerEmpresas(): Promise<any[]> {
  try {
    const response = await axios.get(`${API_URL}/empresas`);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener empresas:', error.response?.data?.message || error.message);
    throw error;
  }
}

/**
 * Actualiza una empresa existente.
 * @param id El ID de la empresa a actualizar.
 * @param data Los datos a actualizar.
 * @returns La empresa actualizada.
 */
export async function actualizarEmpresa(id: number, data: Partial<EmpresaData>): Promise<any> {
  try {
    const response = await axios.put(`${API_URL}/empresas/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error al actualizar empresa:', error.response?.data?.message || error.message);
    throw error;
  }
}

/**
 * Elimina una empresa.
 * @param id El ID de la empresa a eliminar.
 */
export async function eliminarEmpresa(id: number): Promise<void> {
  try {
    await axios.delete(`${API_URL}/empresas/${id}`);
  } catch (error: any) {
    console.error('Error al eliminar empresa:', error.response?.data?.message || error.message);
    throw error;
  }
}
