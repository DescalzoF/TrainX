// src/services/caminoservice/CaminoService.js

export const fetchExercisesForLevel = async (caminoId, level) => {
    try {
        // Reemplaza con la URL de tu API y asegúrate de que esté configurada correctamente
        const response = await fetch(`http://localhost:8080/api/exercises/${caminoId}/${level}`);

        // Verifica si la respuesta es correcta (código 200)
        if (!response.ok) {
            throw new Error('No se pudieron cargar los ejercicios');
        }

        // Convierte la respuesta a formato JSON
        const exercisesData = await response.json();
        return exercisesData;
    } catch (error) {
        console.error('Error al obtener ejercicios:', error);
        throw error;
    }
};
