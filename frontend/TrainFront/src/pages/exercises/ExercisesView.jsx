import { useEffect, useState } from "react";
import axios from "axios";
import "./ExercisesView.css";

const ExerciseView = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [generationSuccess, setGenerationSuccess] = useState(false);
    const [activeSession, setActiveSession] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [selectedSessionForAdd, setSelectedSessionForAdd] = useState(null);

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
                } else {
                    throw new Error("Invalid response format");
                }
            } catch (apiError) {
                console.warn("Error fetching user details from API, using localStorage values:", apiError);

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

            // After successfully loading exercises, fetch user sessions
            await fetchUserSessions();

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

    const fetchExercises = async (caminoFitnessId, levelId, axiosConfig) => {
        if (!caminoFitnessId || !levelId) {
            throw new Error(`Datos incompletos: caminoFitnessId=${caminoFitnessId}, levelId=${levelId}`);
        }

        console.log(`Fetching exercises for camino=${caminoFitnessId}, level=${levelId}`);

        // Realizar la solicitud para obtener los ejercicios según los IDs
        const response = await axios.get(`http://localhost:8080/api/exercises/${caminoFitnessId}/${levelId}`, axiosConfig);

        // Verificar la respuesta de los ejercicios
        console.log("Ejercicios obtenidos:", response.data);

        if (Array.isArray(response.data)) {
            setExercises(response.data);
            setFilteredExercises(response.data);
        } else {
            console.warn("La respuesta no es un array:", response.data);
            setExercises([]);
            setFilteredExercises([]);
        }

        setLoading(false);
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

    // Function to fetch user sessions
    const fetchUserSessions = async () => {
        try {
            const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/sessions/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Ensure we're setting an array, even if the response is empty or not as expected
            setSessions(Array.isArray(response.data) ? response.data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching sessions:', err);
            setError(err.response?.data?.message || 'Failed to load sessions');
            // Set sessions to empty array in case of error
            setSessions([]);
        }
    };

    // Function to generate sessions with level-based filtering and camino fitness adjustments
    const generateSessions = async () => {
        setLoading(true);
        setGenerationSuccess(false);
        try {
            const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');

            // First get the base sessions
            const response = await axios.post('http://localhost:8080/api/sessions/generate', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let sessionsData = Array.isArray(response.data) ? response.data : [];

            // Apply filtering based on user level
            if (userDetails) {
                // Get level name from user details
                const levelName = userDetails.levelName ? userDetails.levelName.toLowerCase() : '';
                const caminoFitnessName = userDetails.caminoFitnessName ? userDetails.caminoFitnessName.toLowerCase() : '';

                console.log("Applying filters - Level:", levelName, "Camino:", caminoFitnessName);

                // Filter sessions based on level
                let maxSessions = 5; // Default to highest (profesional)

                if (levelName === 'principiante') {
                    maxSessions = 3;
                } else if (levelName === 'intermedio' || levelName === 'intermediante') {
                    maxSessions = 4;
                }
                // For 'avanzado' and 'profesional', keep maxSessions as 5

                // Limit sessions based on user level
                sessionsData = sessionsData.slice(0, maxSessions);

                // Adjust sets and reps based on camino fitness
                sessionsData = sessionsData.map(session => {
                    let sets = 3;
                    let reps = 12;

                    // Set reps and sets based on camino fitness type
                    if (caminoFitnessName === 'fuerza') {
                        sets = 3;
                        reps = 6;
                    } else if (caminoFitnessName === 'deportista') {
                        sets = 4;
                        reps = 16;
                    } else if (caminoFitnessName === 'hipertrofia') {
                        sets = 3;
                        reps = 12;
                    } else if (caminoFitnessName === 'entrenamiento hibrido' || caminoFitnessName === 'híbrido') {
                        sets = 4;
                        reps = 12;
                    }
                    // For 'otro', we'll keep whatever came from the server or allow the user to modify

                    // Update the exercises with the new sets and reps values
                    const updatedExercises = session.exercises.map(exercise => ({
                        ...exercise,
                        sets: sets,
                        reps: reps
                    }));

                    return {
                        ...session,
                        exercises: updatedExercises
                    };
                });
            }

            // Update the sessions in the UI
            setSessions(sessionsData);
            setGenerationSuccess(true);
            setError(null);
        } catch (err) {
            console.error('Error generating sessions:', err);
            setError(err.response?.data?.message || 'Failed to generate sessions');
            setGenerationSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    // Function to update weight for an exercise
    const updateWeight = async (sessionExerciseId, weight) => {
        try {
            const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/sessions/exercise/${sessionExerciseId}/weight`,
                { weight },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            // Update local state to reflect the change
            setSessions(prevSessions =>
                prevSessions.map(session => ({
                    ...session,
                    exercises: session.exercises.map(exercise =>
                        exercise.id === sessionExerciseId
                            ? { ...exercise, weight }
                            : exercise
                    )
                }))
            );
        } catch (err) {
            console.error('Error updating weight:', err);
            setError(err.response?.data?.message || 'Failed to update weight');
        }
    };

    const handleWeightChange = (sessionExerciseId, value) => {
        // Update local state but only for the specific exercise
        setSessions(prevSessions =>
            prevSessions.map(session => ({
                ...session,
                exercises: session.exercises.map(exercise =>
                    exercise.id === sessionExerciseId
                        ? { ...exercise, weight: parseFloat(value) || 0 }
                        : exercise
                )
            }))
        );
    };

    // Function to handle weight blur (save when user leaves input)
    const handleWeightBlur = (sessionExerciseId, weight) => {
        updateWeight(sessionExerciseId, weight);
    };

    // Toggle session expansion
    const toggleSession = (sessionId) => {
        setActiveSession(activeSession === sessionId ? null : sessionId);
        setSelectedSessionForAdd(null); // Reset selected session when toggling
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        if (term.trim() === "") {
            setFilteredExercises(exercises);
        } else {
            const filtered = exercises.filter(
                exercise =>
                    exercise.name.toLowerCase().includes(term) ||
                    (exercise.description && exercise.description.toLowerCase().includes(term)) ||
                    (exercise.muscleGroup && exercise.muscleGroup.toLowerCase().includes(term))
            );
            setFilteredExercises(filtered);
        }
    };

    // Select a session to add exercises to
    const selectSessionForAdd = (sessionId) => {
        setSelectedSessionForAdd(sessionId === selectedSessionForAdd ? null : sessionId);
    };

    // Add exercise to a session
    const addExerciseToSession = async (exercise, sessionId) => {
        try {
            const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');

            // Get the session to determine sets and reps
            const session = sessions.find(s => s.id === sessionId);
            if (!session) return;

            // Get sets and reps from existing exercises or default values
            let sets = 3;
            let reps = 12;

            if (session.exercises.length > 0) {
                sets = session.exercises[0].sets || sets;
                reps = session.exercises[0].reps || reps;
            } else if (userDetails) {
                const caminoFitnessName = userDetails.caminoFitnessName.toLowerCase();

                if (caminoFitnessName === 'fuerza') {
                    sets = 3;
                    reps = 6;
                } else if (caminoFitnessName === 'deportista') {
                    sets = 4;
                    reps = 16;
                } else if (caminoFitnessName === 'hipertrofia') {
                    sets = 3;
                    reps = 12;
                } else if (caminoFitnessName === 'entrenamiento hibrido' || caminoFitnessName === 'híbrido') {
                    sets = 4;
                    reps = 12;
                }
            }

            // Add the exercise to the session
            const response = await axios.post(`http://localhost:8080/api/sessions/${sessionId}/exercise`,
                {
                    exerciseId: exercise.id,
                    sets: sets,
                    reps: reps,
                    weight: 0 // Default weight
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Update local state to reflect the change
            if (response.data) {
                const newSessionExercise = response.data;

                setSessions(prevSessions =>
                    prevSessions.map(session => {
                        if (session.id === sessionId) {
                            return {
                                ...session,
                                exercises: [...session.exercises, {
                                    ...newSessionExercise,
                                    exercise: exercise
                                }]
                            };
                        }
                        return session;
                    })
                );
            }

            // Show success message
            alert(`Exercise ${exercise.name} added to session`);

        } catch (err) {
            console.error('Error adding exercise to session:', err);
            setError(err.response?.data?.message || 'Failed to add exercise to session');
        }
    };

    // Remove exercise from session
    const removeExerciseFromSession = async (sessionId, sessionExerciseId) => {
        try {
            const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');

            // Call API to remove exercise
            await axios.delete(`http://localhost:8080/api/sessions/${sessionId}/exercise/${sessionExerciseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Update local state to reflect the change
            setSessions(prevSessions =>
                prevSessions.map(session => {
                    if (session.id === sessionId) {
                        return {
                            ...session,
                            exercises: session.exercises.filter(ex => ex.id !== sessionExerciseId)
                        };
                    }
                    return session;
                })
            );

        } catch (err) {
            console.error('Error removing exercise from session:', err);
            setError(err.response?.data?.message || 'Failed to remove exercise from session');
        }
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
            <h1>My Fitness Program</h1>

            {/* Sessions generation section */}
            <div className="generate-section">
                <button
                    className="generate-button"
                    onClick={generateSessions}
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Generate Training Sessions'}
                </button>
                {error && <p className="error-message">{error}</p>}
                {generationSuccess && <p className="success-message">Sessions generated successfully!</p>}
            </div>

            <div className="content-container">
                {/* Sessions panel */}
                <div className="sessions-panel">
                    <h2>Your Training Sessions</h2>

                    {Array.isArray(sessions) && sessions.length > 0 ? (
                        <div className="sessions-list">
                            {sessions.map((session, index) => (
                                <div key={session.id || `session-${index}`} className={`session-card ${activeSession === session.id ? 'active' : ''}`}>
                                    <div
                                        className="session-header"
                                        onClick={() => toggleSession(session.id)}
                                    >
                                        <h3>{session.sessionType}</h3>
                                        <span className="toggle-icon">
                                            {activeSession === session.id ? '▼' : '▶'}
                                        </span>
                                    </div>

                                    {activeSession === session.id && (
                                        <div className="session-details">
                                            <div className="exercises-table">
                                                <div className="table-header">
                                                    <div className="col-exercise">Exercise</div>
                                                    <div className="col-muscle">Muscle Group</div>
                                                    <div className="col-sets">Sets</div>
                                                    <div className="col-reps">Reps</div>
                                                    <div className="col-weight">Weight (kg)</div>
                                                    <div className="col-actions">Actions</div>
                                                </div>

                                                {session.exercises && Array.isArray(session.exercises) ? (
                                                    session.exercises.map((exercise, idx) => (
                                                        <div className="table-row" key={exercise.id || `exercise-${session.id}-${idx}`}>
                                                            <div className="col-exercise">
                                                                <strong>{exercise.exercise?.name || 'Unknown Exercise'}</strong>
                                                                <p className="exercise-description">{exercise.exercise?.description || ''}</p>
                                                            </div>
                                                            <div className="col-muscle">{exercise.exercise?.muscleGroup || 'Unknown'}</div>
                                                            <div className="col-sets">{exercise.sets || 0}</div>
                                                            <div className="col-reps">{exercise.reps || 0}</div>
                                                            <div className="col-weight">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.5"
                                                                    value={exercise.weight || 0}
                                                                    onChange={(e) => handleWeightChange(exercise.id, e.target.value)}
                                                                    onBlur={(e) => handleWeightBlur(exercise.id, parseFloat(e.target.value) || 0)}
                                                                />
                                                            </div>
                                                            <div className="col-actions">
                                                                {exercise.exercise?.videoUrl && (
                                                                    <a
                                                                        href={exercise.exercise.videoUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="video-link"
                                                                    >
                                                                        Video
                                                                    </a>
                                                                )}
                                                                <button
                                                                    className="remove-button"
                                                                    onClick={() => removeExerciseFromSession(session.id, exercise.id)}
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="table-row">
                                                        <div style={{ padding: '20px', textAlign: 'center' }}>No exercises found for this session</div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="session-actions">
                                                <button
                                                    className="add-exercise-button"
                                                    onClick={() => selectSessionForAdd(session.id)}
                                                >
                                                    {selectedSessionForAdd === session.id ? 'Cancel' : 'Add Exercise'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        !loading && <p className="no-sessions">No training sessions available. Generate sessions to get started!</p>
                    )}
                </div>

                {/* Exercise search and selection panel */}
                {selectedSessionForAdd && (
                    <div className="exercise-selection-panel">
                        <h2>Add Exercise to Session</h2>

                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search exercises..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="search-input"
                            />
                        </div>

                        <div className="filtered-exercises">
                            {filteredExercises.length > 0 ? (
                                filteredExercises.map(exercise => (
                                    <div key={exercise.id} className="exercise-item">
                                        <div className="exercise-info">
                                            <h4>{exercise.name}</h4>
                                            <p className="muscle-group">{exercise.muscleGroup}</p>
                                            <p className="description">{exercise.description}</p>
                                        </div>
                                        <button
                                            className="add-button"
                                            onClick={() => addExerciseToSession(exercise, selectedSessionForAdd)}
                                        >
                                            Add
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="no-results">No exercises found matching your search.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseView;