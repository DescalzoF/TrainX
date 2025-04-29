import { useEffect, useState } from "react";
import axios from "axios";
import "./ExercisesView.css";
import confetti from 'canvas-confetti';
import {useAuth} from "../../contexts/AuthContext.jsx";

const ExerciseView = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [completedExercises, setCompletedExercises] = useState({});

    const { currentUser } = useAuth();
    const username = currentUser?.username || "Usuario";

    useEffect(() => {
        // Fetch user data on component mount
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            // Get the token from localStorage
            const token = localStorage.getItem("jwtToken") || localStorage.getItem("token");

            if (!token) {
                setError("No se encontró el token JWT.");
                setLoading(false);
                return;
            }

            // Configuración para todas las solicitudes axios
            const axiosConfig = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            };

            // Get caminoFitnessId and levelId directly from localStorage as a fallback
            const caminoFitnessId = localStorage.getItem("caminoFitnessId");
            const levelId = localStorage.getItem("levelId") || "principiante"; // Default to 'principiante' if not found

            // Try the API request first
            try {
                // Modified API endpoint to ensure we're hitting the right path
                const response = await axios.get("http://localhost:8080/api/users/exerciseDetails", axiosConfig);

                console.log("Respuesta completa de exerciseDetails:", response.data);

                // Check if the response is valid JSON and has the required fields
                if (response.data && typeof response.data === 'object') {
                    // Set user details from API response
                    setUserDetails(response.data);

                    // If we got a valid response, proceed with these values
                    await fetchExercises(response.data.caminoFitnessId, response.data.levelId, axiosConfig);

                    // Also fetch completed exercises status if API supports it
                    await fetchCompletedExercises(axiosConfig);
                } else {
                    throw new Error("Formato de respuesta inválido");
                }
            } catch (apiError) {
                console.warn("Error al obtener detalles del usuario desde la API, usando valores de localStorage:", apiError);

                // If API request failed, use localStorage values
                if (caminoFitnessId) {
                    const fallbackUserDetails = {
                        caminoFitnessId,
                        levelId,
                        caminoFitnessName: getCaminoNameById(caminoFitnessId),
                        levelName: levelId,
                    };

                    setUserDetails(fallbackUserDetails);
                    await fetchExercises(caminoFitnessId, levelId, axiosConfig);
                } else {
                    throw new Error("No se pudo obtener la información del camino fitness y nivel.");
                }
            }

        } catch (err) {
            handleError(err);
        }
    };

    // Helper function to get camino name based on ID (fallback)
    const getCaminoNameById = (id) => {
        const caminoMap = {
            "1": "fuerza",
            "2": "hipertrofia",
            "3": "deportista",
            "4": "entrenamiento hibrido",
            "5": "otro"
        };
        return caminoMap[id] || "otro";
    };

    // Add a function to fetch already completed exercises
    const fetchCompletedExercises = async (axiosConfig) => {
        try {
            // This is a placeholder - implement the endpoint for getting completed exercises
            const response = await axios.get(`http://localhost:8080/api/exercises/completed`, axiosConfig);

            if (response.data && Array.isArray(response.data)) {
                // Convert the array of completed exercise IDs to an object for easier lookup
                const completedMap = {};
                response.data.forEach(exerciseId => {
                    completedMap[exerciseId] = true;
                });
                setCompletedExercises(completedMap);
            }
        } catch (err) {
            console.warn("Error fetching completed exercises:", err);
            // Continue with empty completed exercises - non-critical error
        }
    };

    const fetchExercises = async (caminoFitnessId, levelId, axiosConfig) => {
        if (!caminoFitnessId || !levelId) {
            throw new Error(`Datos incompletos: caminoFitnessId=${caminoFitnessId}, levelId=${levelId}`);
        }

        console.log(`Obteniendo ejercicios para camino=${caminoFitnessId}, nivel=${levelId}`);

        // Realizar la solicitud para obtener los ejercicios según los IDs
        const response = await axios.get(`http://localhost:8080/api/exercises/${caminoFitnessId}/${levelId}`, axiosConfig);

        // Verificar la respuesta de los ejercicios
        console.log("Ejercicios obtenidos:", response.data);

        if (Array.isArray(response.data)) {
            // Add XP rewards to each exercise - fixed to 50XP as requested
            const exercisesWithXP = response.data.map(exercise => ({
                ...exercise,
                xpFitnessReward: 50 // Fixed to 50XP as requested
            }));
            setExercises(exercisesWithXP);
        } else {
            console.warn("La respuesta no es un array:", response.data);
            setExercises([]);
        }

        setLoading(false);
    };

    const completeExercise = async (exerciseId) => {
        try {
            // Only proceed if the exercise hasn't been completed yet
            if (completedExercises[exerciseId]) {
                return;
            }

            // Get the token from localStorage
            const token = localStorage.getItem("jwtToken") || localStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                return;
            }

            // Get the user ID from userDetails or currentUser
            const userId = userDetails?.userId || currentUser?.id;
            if (!userId) {
                console.error("No user ID found");
                return;
            }

            // Mark this specific exercise as completed in state
            setCompletedExercises(prev => ({
                ...prev,
                [exerciseId]: true
            }));

            // Trigger confetti effect
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#0061ff', '#26a69a', '#4CAF50', '#FFC107'],
                disableForReducedMotion: true,
                zIndex: 2000,
                decay: 0.94,
                scalar: 0.8
            });

            // Show XP success notification
            const exerciseData = exercises.find(e => e.id === exerciseId);

            if (exerciseData) {
                // Create and add success notification to DOM
                const xpPoints = exerciseData.xpFitnessReward || 0;
                const successBox = document.createElement('div');
                successBox.className = 'xp-success-box';
                successBox.innerHTML = `
                <div class="xp-success-icon">🏆</div>
                <div class="xp-success-content">
                    <div class="xp-success-title">¡Ejercicio completado!</div>
                    <div class="xp-success-message">XP recompensado: <span class="xp-points">+${xpPoints}</span></div>
                </div>
                `;
                document.body.appendChild(successBox);

                // Remove the notification after animation completes
                setTimeout(() => {
                    document.body.removeChild(successBox);
                }, 4000);
            }

            // Send the completed exercise data to the backend
            try {
                // First, call the XP fitness endpoint to add XP
                const xpResponse = await axios.put(
                    `http://localhost:8080/api/xpfitness/${userId}/addXp/50`,
                    {},  // Empty body as we're passing values in the URL
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );

                console.log("XP actualizado exitosamente:", xpResponse.data);

                // Then log the exercise completion (if you have an endpoint for it)
                await axios.post(
                    `http://localhost:8080/api/exercises/complete`,
                    {
                        userId: userId,
                        exerciseId: exerciseId,
                        xpFitnessReward: 50 // Fixed at 50XP
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );

                console.log(`Ejercicio ${exerciseId} completado y XP actualizado en el backend`);
            } catch (apiError) {
                console.error("Error al actualizar XP en el backend:", apiError);
                // Still keep the UI state as completed even if backend update fails
            }

        } catch (err) {
            console.error('Error al completar el ejercicio:', err);
        }
    };

    const handleError = (err) => {
        // Manejo de errores en las solicitudes
        console.error("Error completo:", err);

        if (err.response) {
            // La solicitud fue hecha y el servidor respondió con un código de estado
            console.error("Respuesta de error:", err.response.data);
            console.error("Estado HTTP:", err.response.status);

            if (err.response.status === 401) {
                setError("No estás autenticado. Por favor, inicia sesión nuevamente.");
            } else if (err.response.status === 403) {
                setError("No tienes permisos para acceder a este recurso.");
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
    };

    // Estado de carga
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando datos...</p>
            </div>
        );
    }

    // Manejo de errores con información de debugging
    if (error) {
        return (
            <div className="error-container">
                <h2>Error al cargar los datos</h2>
                <p>{error}</p>

                {userDetails && (
                    <div className="debug-info">
                        <h3>Información de depuración:</h3>
                        <pre>{JSON.stringify(userDetails, null, 2)}</pre>
                    </div>
                )}

                <button
                    onClick={() => {
                        setError(null);
                        setLoading(true);
                        fetchUserData();
                    }}
                    className="retry-button"
                >
                    Intentar nuevamente
                </button>
            </div>
        );
    }

    return (
        <div className="exercises-view-container">
            <h1>Programa de Entrenamiento de {username}</h1>

            <div className="content-container">
                <div className="sessions-panel">
                    <div className="session-card active">
                        <div className="session-header">
                            <h3>Cuerpo Completo</h3>
                        </div>

                        <div className="session-details">
                            <div className="exercises-table">
                                <div className="table-header">
                                    <div className="col-exercise">Ejercicio</div>
                                    <div className="col-description">Descripción</div>
                                    <div className="col-reps">Repeticiones</div>
                                    <div className="col-sets">Series</div>
                                    <div className="col-weight">Peso (kg)</div>
                                    <div className="col-xp">XP</div>
                                    <div className="col-actions">Acciones</div>
                                </div>

                                {exercises && exercises.length > 0 ? (
                                    exercises.map((exercise, idx) => (
                                        <div className="table-row" key={`exercise-${exercise.id || idx}`}>
                                            <div className="col-exercise">
                                                <strong>{exercise.name || 'Ejercicio Desconocido'}</strong>
                                            </div>
                                            <div className="col-description">
                                                <p className="exercise-description">{exercise.description || ''}</p>
                                            </div>
                                            <div className="col-reps">12</div>
                                            <div className="col-sets">3</div>
                                            <div className="col-weight">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.5"
                                                    defaultValue="0"
                                                />
                                            </div>
                                            <div className="col-xp">
                                                <button
                                                    className={`xp-reward-button ${completedExercises[exercise.id] ? 'completed' : ''}`}
                                                    onClick={() => completeExercise(exercise.id)}
                                                    disabled={completedExercises[exercise.id]}
                                                >
                                                    {completedExercises[exercise.id] ? (
                                                        <span className="completed-text">✓ Completado</span>
                                                    ) : (
                                                        `+${exercise.xpFitnessReward || 0} XP`
                                                    )}
                                                </button>
                                            </div>
                                            <div className="col-actions">
                                                {exercise.videoUrl && (
                                                    <a
                                                        href={exercise.videoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="video-link"
                                                    >
                                                        <i className="fa fa-youtube-play"></i> Video
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="table-row">
                                        <div style={{ padding: '20px', textAlign: 'center' }}>No se encontraron ejercicios</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExerciseView;