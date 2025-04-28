import { useEffect, useState } from "react";
import axios from "axios";
import "./ExercisesView.css";
import confetti from 'canvas-confetti';

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
    const [muscleGroups, setMuscleGroups] = useState([]);
    const [completedExercises, setCompletedExercises] = useState({});

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

        console.log(`Obteniendo ejercicios para camino=${caminoFitnessId}, nivel=${levelId}`);

        // Realizar la solicitud para obtener los ejercicios según los IDs
        const response = await axios.get(`http://localhost:8080/api/exercises/${caminoFitnessId}/${levelId}`, axiosConfig);

        // Verificar la respuesta de los ejercicios
        console.log("Ejercicios obtenidos:", response.data);

        if (Array.isArray(response.data)) {
            setExercises(response.data);
            setFilteredExercises(response.data);

            // Extraer grupos musculares únicos
            const uniqueMuscleGroups = [...new Set(response.data.map(ex => ex.muscleGroup))];
            setMuscleGroups(uniqueMuscleGroups);
        } else {
            console.warn("La respuesta no es un array:", response.data);
            setExercises([]);
            setFilteredExercises([]);
            setMuscleGroups([]);
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
            console.error('Error al cargar sesiones:', err);
            setError(err.response?.data?.message || 'Error al cargar las sesiones');
            // Set sessions to empty array in case of error
            setSessions([]);
        }
    };

    // Function to generate sessions with level-based filtering and camino fitness adjustments
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

                console.log("Aplicando filtros - Nivel:", levelName, "Camino:", caminoFitnessName);

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

                // Determine exercise limit based on user level
                let exerciseLimit = 6; // Default for 'profesional'
                if (levelName === 'principiante') {
                    exerciseLimit = 4;
                } else if (levelName === 'intermedio' || levelName === 'intermediante') {
                    exerciseLimit = 4;
                } else if (levelName === 'avanzado') {
                    exerciseLimit = 5;
                }

                // Set reps and sets based on camino fitness type
                let sets = 3;
                let reps = 12;
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

                // Inside the generateSessions function, replace the session mapping part with this:
                sessionsData = await Promise.all(sessionsData.map(async (session) => {
                    // Now populate all sessions with appropriate exercises
                    session.exercises = [];

                    // Get session type in lowercase for easier comparison
                    const sessionTypeLower = session.sessionType.toLowerCase();

                    // Define muscle group keywords based on session type
                    let muscleKeywords = [];

                    // Map session types to relevant muscle groups - make sure to include all possible translations
                    if (sessionTypeLower === 'full body' || sessionTypeLower === 'cuerpo completo') {
                        muscleKeywords = ['espalda', 'piernas', 'pecho', 'hombros', 'brazos', 'abdominales'];
                    } else if (sessionTypeLower === 'chest & shoulder' || sessionTypeLower === 'pecho y hombros') {
                        muscleKeywords = ['pecho', 'hombros', 'chest', 'shoulder'];
                    } else if (sessionTypeLower === 'arms' || sessionTypeLower === 'brazos') {
                        muscleKeywords = ['brazos', 'biceps', 'triceps', 'arm', 'bicep', 'tricep'];
                    } else if (sessionTypeLower === 'back & abs' || sessionTypeLower === 'espalda y abdominales') {
                        muscleKeywords = ['espalda', 'abdominales', 'back', 'abs', 'core'];
                    } else if (sessionTypeLower === 'legs' || sessionTypeLower === 'piernas') {
                        muscleKeywords = ['piernas', 'legs', 'quad', 'hamstring', 'glutes'];
                    }

                    console.log(`Sesión: ${session.sessionType}, buscando grupos musculares:`, muscleKeywords);

                    // Filter exercises based on muscle keywords
                    if (exercises && exercises.length > 0) {
                        let matchingExercises = exercises.filter(exercise => {
                            if (userDetails && exercise.level && exercise.caminoFitness) {
                                // More flexible matching for level and caminoFitness
                                const isCorrectLevel = !exercise.level || exercise.level.toLowerCase() === userDetails.levelName.toLowerCase();
                                const isCorrectCamino = !exercise.caminoFitness || exercise.caminoFitness.toLowerCase() === userDetails.caminoFitnessName.toLowerCase();

                                if (!isCorrectLevel || !isCorrectCamino) {
                                    return false;
                                }
                            }

                            if (!exercise.muscleGroup) return false;

                            const muscleGroupLower = exercise.muscleGroup.toLowerCase();
                            return muscleKeywords.some(keyword => {
                                // Check for exact match or containment
                                return muscleGroupLower === keyword ||
                                    muscleGroupLower.includes(keyword) ||
                                    keyword.includes(muscleGroupLower);
                            });
                        });

                        console.log(`Encontrados ${matchingExercises.length} ejercicios que coinciden para ${session.sessionType}`);

                        // Randomize selection of exercises
                        if (matchingExercises.length > 0) {
                            // Shuffle array to get random exercises
                            matchingExercises = matchingExercises
                                .sort(() => 0.5 - Math.random())
                                .slice(0, exerciseLimit);

                            console.log(`Seleccionados ${matchingExercises.length} ejercicios aleatorios para ${session.sessionType}`);
                        }

                        // Create session exercises from matching exercises with unique IDs
                        const sessionExercises = matchingExercises.map(exercise => ({
                            id: `temp-${session.id || Date.now()}-${exercise.id || Math.random().toString(36).substring(2, 9)}`,
                            exercise: exercise,
                            sets: sets,
                            reps: reps,
                            weight: 0,
                            xpFitnessReward: calculateXpReward(exercise, userDetails)
                        }));

                        session.exercises = sessionExercises;
                    }

                    return session;
                }));
            }

            // Update the sessions in the UI
            setSessions(sessionsData);

            // Save sessions to database
            try {
                await saveGeneratedSessions(sessionsData);
                setGenerationSuccess(true);
                setError(null);
            } catch (err) {
                console.error('Error completing session generation:', err);
                setError('Error saving sessions to database');
                setGenerationSuccess(false);
            }
        } catch (err) {
            console.error('Error al generar sesiones:', err);
            setError(err.response?.data?.message || 'Error al generar sesiones');
            setGenerationSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    const saveGeneratedSessions = async (sessions) => {
        try {
            const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
            console.log("Token found:", token ? "Yes (length: " + token.length + ")" : "No");

            // Format sessions before saving
            for (const session of sessions) {
                // Create a properly formatted session object
                const sessionToSave = {
                    sessionType: session.sessionType,
                    // Add userId explicitly if needed
                    userId: localStorage.getItem('userId'),
                    exercises: session.exercises.map(ex => ({
                        exerciseId: ex.exercise.id,
                        sets: ex.sets,
                        reps: ex.reps,
                        weight: ex.weight || 0,
                        xpFitnessReward: ex.xpFitnessReward
                    }))
                };

                console.log("Saving session:", sessionToSave);

                // Save individual session with proper authorization header
                const response = await axios.post(
                    'http://localhost:8080/api/sessions',
                    sessionToSave,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log("Session save response:", response.data);
            }

            console.log('Sessions saved to database successfully');
            return true;
        } catch (err) {
            console.error('Error saving sessions to database:', err);
            if (err.response) {
                console.error('Response status:', err.response.status);
                console.error('Response data:', err.response.data);
            }
            throw err; // Re-throw to handle in the calling function
        }
    };

    // Calculate XP reward based on exercise difficulty and user level
    const calculateXpReward = (exercise, userDetails) => {
        // This is a sample implementation - modify according to your business logic
        const baseXp = 50; // Base XP for any exercise

        // Additional XP based on difficulty
        let difficultyMultiplier = 1;
        if (exercise.difficulty) {
            if (exercise.difficulty.toLowerCase() === 'intermedio') {
                difficultyMultiplier = 1.5;
            } else if (exercise.difficulty.toLowerCase() === 'avanzado') {
                difficultyMultiplier = 2;
            } else if (exercise.difficulty.toLowerCase() === 'profesional') {
                difficultyMultiplier = 2.5;
            }
        }

        // Return calculated XP (round to nearest 10)
        return Math.round((baseXp * difficultyMultiplier) / 10) * 10;
    };

    // Function to update weight for an exercise
    const updateWeight = async (sessionExerciseId, weight) => {
        try {
            const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');

            // For session exercise IDs that start with "temp-", we can't update them on the server yet
            if (sessionExerciseId.startsWith('temp-')) {
                console.log('Cannot update temporary exercise weight on server yet');
                // Just update local state
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
                return;
            }

            // For real IDs, try to update on server
            await axios.put(
                `http://localhost:8080/api/sessions/exercise/${sessionExerciseId}/weight`,
                { weight: parseFloat(weight) || 0 },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
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
            console.error('Error al actualizar el peso:', err);
            // Continue with local state update even if server update fails
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
        }
    };

    const completeExercise = async (sessionExerciseId) => {
        try {
            // Only proceed if the exercise hasn't been completed yet
            if (completedExercises[sessionExerciseId]) {
                return;
            }

            const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');

            // Call the backend endpoint to complete the exercise
            const response = await axios.post(
                `http://localhost:8080/api/session-exercises/${sessionExerciseId}/complete`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Mark this exercise as completed in our local state
            setCompletedExercises(prev => ({
                ...prev,
                [sessionExerciseId]: true
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
            const exerciseData = sessions
                .flatMap(s => s.exercises)
                .find(e => e.id === sessionExerciseId);

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

        } catch (err) {
            console.error('Error al completar el ejercicio:', err);
            setError(err.response?.data?.message || 'Error al completar el ejercicio');
        }
    };

    const handleWeightChange = (sessionExerciseId, value) => {
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

    const filterByMuscleGroup = (muscleGroup) => {
        if (!muscleGroup) {
            // Si no se proporciona grupo muscular, mostrar todos los ejercicios
            setFilteredExercises(exercises);
        } else {
            // Convertir a minúsculas para comparación insensible a mayúsculas/minúsculas
            const muscleGroupLower = muscleGroup.toLowerCase();

            // Filtrar ejercicios que coincidan con el grupo muscular
            const filtered = exercises.filter(exercise => {
                // Si el ejercicio no tiene grupo muscular definido, excluirlo
                if (!exercise.muscleGroup) return false;

                // Convertir el grupo muscular del ejercicio a minúsculas
                const exerciseMuscleGroup = exercise.muscleGroup.toLowerCase();

                // Verificar si coincide exactamente o si es una subcadena
                return exerciseMuscleGroup === muscleGroupLower ||
                    exerciseMuscleGroup.includes(muscleGroupLower) ||
                    // Manejar traducciones comunes
                    (muscleGroupLower === 'espalda' && exerciseMuscleGroup.includes('back')) ||
                    (muscleGroupLower === 'pecho' && exerciseMuscleGroup.includes('chest')) ||
                    (muscleGroupLower === 'hombros' && exerciseMuscleGroup.includes('shoulder')) ||
                    (muscleGroupLower === 'piernas' &&
                        (exerciseMuscleGroup.includes('leg') ||
                            exerciseMuscleGroup.includes('quad') ||
                            exerciseMuscleGroup.includes('hamstring'))) ||
                    (muscleGroupLower === 'brazos' &&
                        (exerciseMuscleGroup.includes('arm') ||
                            exerciseMuscleGroup.includes('bicep') ||
                            exerciseMuscleGroup.includes('tricep'))) ||
                    (muscleGroupLower === 'abdomen' &&
                        (exerciseMuscleGroup.includes('abs') ||
                            exerciseMuscleGroup.includes('core')));
            });

            // Actualizar el estado con los ejercicios filtrados
            setFilteredExercises(filtered);
        }
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
                    weight: 0, // Default weight
                    xpFitnessReward: calculateXpReward(exercise, userDetails) // Add XP reward
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
            alert(`Ejercicio ${exercise.name} añadido a la sesión`);

        } catch (err) {
            console.error('Error al añadir ejercicio a la sesión:', err);
            setError(err.response?.data?.message || 'Error al añadir ejercicio a la sesión');
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
            console.error('Error al eliminar ejercicio de la sesión:', err);
            setError(err.response?.data?.message || 'Error al eliminar ejercicio de la sesión');
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

    const translateSessionType = (sessionType) => {
        const translations = {
            'Upper Body': 'Parte Superior',
            'Lower Body': 'Parte Inferior',
            'Full Body': 'Cuerpo Completo',
            'Push': 'Empuje',
            'Pull': 'Jalón',
            'Legs': 'Piernas',
            'Cardio': 'Cardio',
            'Core': 'Core',
            'Back': 'Espalda',
            'Chest & Shoulder': 'Pecho y Hombros',
            'Arms' : 'Brazos',
            'Back & Abs': 'Espalda y Abdominales',
        };
        return translations[sessionType] || sessionType;
    };

    return (
        <div className="exercises-view-container">
            <h1>Mi Programa de Entrenamiento</h1>

            {/* Sessions generation section */}
            <div className="generate-section">
                <button
                    className="generate-button"
                    onClick={generateSessions}
                    disabled={loading}
                >
                    {loading ? 'Generando...' : 'Generar Sesiones de Entrenamiento'}
                </button>
                {error && <p className="error-message">{error}</p>}
                {generationSuccess && <p className="success-message">¡Sesiones generadas con éxito!</p>}
            </div>

            <div className="content-container">
                {/* Sessions panel */}
                <div className="sessions-panel">
                    <h2>Tus Sesiones de Entrenamiento</h2>

                    {Array.isArray(sessions) && sessions.length > 0 ? (
                        <div className="sessions-list">
                            {sessions.map((session, index) => (
                                <div key={session.id || `session-${index}`} className={`session-card ${activeSession === session.id ? 'active' : ''}`}>
                                    <div
                                        className="session-header"
                                        onClick={() => toggleSession(session.id)}
                                    >
                                        <h3>{translateSessionType(session.sessionType)}</h3>
                                        <span className="toggle-icon">
                                            {activeSession === session.id ? '▼' : '▶'}
                                        </span>
                                    </div>

                                    {activeSession === session.id && (
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

                                                {session.exercises && Array.isArray(session.exercises) ? (
                                                    session.exercises.map((exercise, idx) => (
                                                        <div className="table-row" key={exercise.id || `exercise-${session.id}-${idx}`}>
                                                            <div className="col-exercise">
                                                                <strong>{exercise.exercise?.name || 'Ejercicio Desconocido'}</strong>
                                                            </div>
                                                            <div className="col-description">
                                                                <p className="exercise-description">{exercise.exercise?.description || ''}</p>
                                                            </div>
                                                            <div className="col-reps">{exercise.reps || 0}</div>
                                                            <div className="col-sets">{exercise.sets || 0}</div>
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
                                                                {exercise.exercise?.videoUrl && (
                                                                    <a
                                                                    href={exercise.exercise.videoUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="video-link"
                                                                    >
                                                                    <i className="fa fa-youtube-play"></i> Video
                                                                    </a>
                                                                    )}
                                                                <button
                                                                    className="remove-button"
                                                                    onClick={() => removeExerciseFromSession(session.id, exercise.id)}
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="table-row">
                                                        <div style={{ padding: '20px', textAlign: 'center' }}>No se encontraron ejercicios para esta sesión</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        !loading && <p className="no-sessions">No hay sesiones de entrenamiento disponibles. ¡Genera sesiones para comenzar!</p>
                    )}
                </div>

                {/* Exercise search and selection panel */}
                {selectedSessionForAdd && (
                    <div className="exercise-selection-panel">
                        <h2>Añadir Ejercicio a la Sesión</h2>

                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Buscar ejercicios..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="search-input"
                            />
                        </div>

                        {/* Muscle group filter buttons */}
                        <div className="muscle-group-filters">
                            <button
                                className="filter-button all-button"
                                onClick={() => setFilteredExercises(exercises)}>
                                Todos
                            </button>
                            {muscleGroups.map((group, index) => (
                                <button
                                    key={index}
                                    className="filter-button"
                                    onClick={() => filterByMuscleGroup(group)}>
                                    {group}
                                </button>
                            ))}
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
                                            Añadir
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="no-results">No se encontraron ejercicios que coincidan con tu búsqueda.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseView;