import { useEffect, useState } from "react";
import axios from "axios";

const ExerciseView = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        // Obtener el token JWT del localStorage o context
        const token = localStorage.getItem("jwtToken");

        if (!token) {
            setError("No se encontró el token JWT.");
            setLoading(false);
            return;
        }

        // Configuración para todas las solicitudes axios
        const axiosConfig = {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        };

        // Realizar la solicitud al backend para obtener el CaminoFitnessId y LevelId
        axios
            .get("/api/users/exerciseDetails", axiosConfig)
            .then((response) => {
                console.log("Respuesta completa de exerciseDetails:", response.data);

                // Guardar los detalles del usuario para debugging
                setUserDetails(response.data);

                // Desestructuración de los IDs de la respuesta
                const { caminoFitnessId, levelId } = response.data;

                // Validación de los datos obtenidos
                if (!caminoFitnessId || !levelId) {
                    throw new Error(`Datos incompletos: caminoFitnessId=${caminoFitnessId}, levelId=${levelId}`);
                }

                console.log("Buscando ejercicios con CaminoFitnessId:", caminoFitnessId);
                console.log("Buscando ejercicios con LevelId:", levelId);

                // Realizar la solicitud para obtener los ejercicios según los IDs
                // Probamos con la ruta que está esperando nuestro backend
                return axios.get(`/api/exercises/${caminoFitnessId}/${levelId}`, axiosConfig);
            })
            .then((response) => {
                // Verificar la respuesta de los ejercicios
                console.log("Ejercicios obtenidos:", response.data);

                if (Array.isArray(response.data)) {
                    setExercises(response.data);
                } else {
                    console.warn("La respuesta no es un array:", response.data);
                    setExercises([]);
                }

                setLoading(false);
            })
            .catch((err) => {
                // Manejo de errores en las solicitudes
                console.error("Error completo:", err);

                if (err.response) {
                    // La solicitud fue hecha y el servidor respondió con un código de estado
                    console.error("Respuesta de error:", err.response.data);
                    console.error("Estado HTTP:", err.response.status);

                    if (err.response.status === 401) {
                        setError("No estás autenticado. Por favor, inicia sesión nuevamente.");
                    } else if (err.response.status === 404) {
                        setError("No se encontró el recurso solicitado. Verifica las rutas API.");
                    } else {
                        setError(`Error del servidor: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
                    }
                } else if (err.request) {
                    // La solicitud fue hecha pero no se recibió respuesta
                    console.error("No hubo respuesta del servidor:", err.request);
                    setError("No se recibió respuesta del servidor. Verifica tu conexión a internet.");
                } else {
                    // Ocurrió un error al configurar la solicitud
                    console.error("Error de configuración:", err.message);
                    setError(`Error en la solicitud: ${err.message}`);
                }

                setLoading(false);
            });
    }, []);

    // Estado de carga
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando ejercicios...</p>
            </div>
        );
    }

    // Manejo de errores con información de debugging
    if (error) {
        return (
            <div className="error-container">
                <h2>Error al cargar los ejercicios</h2>
                <p>{error}</p>

                {userDetails && (
                    <div className="debug-info">
                        <h3>Información de depuración:</h3>
                        <pre>{JSON.stringify(userDetails, null, 2)}</pre>
                    </div>
                )}

                <button
                    onClick={() => window.location.reload()}
                    className="retry-button"
                >
                    Intentar nuevamente
                </button>
            </div>
        );
    }

    // Mostrar los ejercicios obtenidos
    return (
        <div className="exercises-container">
            <h1>Mis Ejercicios</h1>

            {exercises.length === 0 ? (
                <div className="no-exercises">
                    <p>No se encontraron ejercicios para tu nivel actual.</p>
                    <p>Información del usuario:</p>
                    <pre>{JSON.stringify(userDetails, null, 2)}</pre>
                </div>
            ) : (
                <ul className="exercise-list">
                    {exercises.map((exercise) => (
                        <li key={exercise.id} className="exercise-item">
                            <h3>{exercise.name}</h3>
                            {exercise.description && <p>{exercise.description}</p>}
                            {exercise.difficulty && <span className="difficulty">Dificultad: {exercise.difficulty}</span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ExerciseView;