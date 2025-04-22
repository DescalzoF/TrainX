// services/exerciseService.js
export const fetchExercisesForLevel = async (caminoId, level) => {
    try {
        const response = await fetch(`http://localhost:8080/api/exercises?caminoId=${caminoId}&level=${level}`);
        if (!response.ok) {
            throw new Error('Error al obtener los ejercicios');
        }
        const data = await response.json();
        return data; // Devuelve los ejercicios
    } catch (error) {
        console.error("Error al cargar los ejercicios:", error);
        throw error;
    }
};
