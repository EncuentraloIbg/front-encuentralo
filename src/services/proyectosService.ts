export const API_BASE_URL = 'http://localhost:3333/api'; // <--- Añadido 'export' aquí

/**
 * Obtiene todos los proyectos.
 * @returns Un array con los proyectos.
 */
export async function obtenerProyectos() {
    try {
        const response = await fetch(`${API_BASE_URL}/proyectos`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al obtener proyectos');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en proyectoService (obtenerProyectos):', error);
        throw error;
    }
}

export async function obtenerEmpresas() {
    try {
        const response = await fetch(`${API_BASE_URL}/empresas`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al obtener empresas');
        }
        return await response.json();
    } catch (error) {
        console.error('Error en proyectoService (obtenerEmpresas):', error);
        throw error;
    }
}


/**
 * Crea un nuevo proyecto.
 * @param proyectoData Un objeto con los datos del proyecto a crear.
 * @returns El proyecto creado.
 */
// AHORA ESPERA UN OBJETO PLANO
export async function crearProyecto(proyectoData: { nombre: string; empresa_id: number | null }) {
    try {
        const response = await fetch(`${API_BASE_URL}/proyectos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // MUY IMPORTANTE: Indicar que envías JSON
            },
            body: JSON.stringify(proyectoData), // Convertir el objeto a JSON string
        });

        if (!response.ok) {
            // Manejo específico para el error de conflicto (nombre duplicado)
            if (response.status === 409) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'El nombre del proyecto ya existe.');
            }
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al crear proyecto');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en proyectoService (crearProyecto):', error);
        throw error;
    }
}

/**
 * Actualiza un proyecto existente por ID.
 * @param id El ID del proyecto a actualizar.
 * @param proyectoData Datos actualizados en un objeto plano.
 * @returns El proyecto actualizado.
 */
// AHORA ESPERA UN OBJETO PLANO
export async function actualizarProyecto(id: number, proyectoData: { nombre: string; empresa_id: number | null }) {
    try {
        // Para PUT, usamos el método 'PUT' directamente, no 'POST' con '_method=PUT'
        const response = await fetch(`${API_BASE_URL}/proyectos/${id}`, {
            method: 'PUT', // MUY IMPORTANTE: Cambiar a PUT
            headers: {
                'Content-Type': 'application/json', // MUY IMPORTANTE: Indicar que envías JSON
            },
            body: JSON.stringify(proyectoData), // Convertir el objeto a JSON string
        });

        if (!response.ok) {
             // Manejo específico para el error de conflicto (nombre duplicado)
            if (response.status === 409) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'El nombre del proyecto ya existe por otro proyecto.');
            }
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al actualizar proyecto');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en proyectoService (actualizarProyecto):', error);
        throw error;
    }
}

/**
 * Elimina un proyecto por su ID.
 * @param id El ID del proyecto a eliminar.
 * @returns Confirmación de eliminación.
 */
export async function eliminarProyecto(id: number) {
    try {
        const response = await fetch(`${API_BASE_URL}/proyectos/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al eliminar proyecto');
        }

        // Si la API devuelve un 204 No Content, no hay body que parsear.
        // Si devuelve algo (ej. mensaje de éxito), lo parseamos.
        return response.status === 204 ? {} : await response.json();
    } catch (error) {
        console.error('Error en proyectoService (eliminarProyecto):', error);
        throw error;
    }
}

/**
 * Verifica si un nombre de proyecto ya existe en la base de datos.
 * @param nombre El nombre del proyecto a verificar.
 * @param excludeId Opcional. El ID del proyecto actual (para actualizaciones).
 * @returns Un objeto con `isUnique` (booleano) y un `message`.
 */
export async function verificarNombreProyectoUnico(nombre: string, excludeId: number | null = null) {
    try {
        let url = `${API_BASE_URL}/proyectos/check-unique-name?name=${encodeURIComponent(nombre)}`;
        if (excludeId !== null) {
            url += `&excludeId=${excludeId}`;
        }

        const response = await fetch(url);

        // Si la respuesta no es OK (por ejemplo, 409 Conflict), es porque el nombre no es único.
        // Si es 200 OK, el nombre es único.
        if (response.ok) {
            const data = await response.json();
            return data; // Devolverá { isUnique: true, message: '...' }
        } else if (response.status === 409) {
            const data = await response.json();
            return data; // Devolverá { isUnique: false, message: '...' }
        } else {
            // Otros errores del servidor
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al verificar la unicidad del nombre del proyecto.');
        }
    } catch (error) {
        console.error('Error en proyectosService (verificarNombreProyectoUnico):', error);
        // Si hay un error de red o similar, asumimos que no se pudo verificar.
        // Podrías decidir qué comportamiento es el más seguro aquí.
        // Por ahora, lanzamos el error para que el componente lo maneje.
        throw error;
    }
}