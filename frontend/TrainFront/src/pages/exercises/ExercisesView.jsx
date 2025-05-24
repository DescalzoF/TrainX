import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./ExercisesView.css";
import confetti from 'canvas-confetti';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useXP } from "../../contexts/XPContext.jsx";
import DesafiosSemanales from "../DesafiosSemanales/DesafiosSemanales.jsx";
import ResetCaminoModal from "../../components/resetCaminoModal/ResetCaminoModal.jsx";
import AdminDesafioSemanales from "../../components/AdminDesafioSemanales/AdminDesafioSemanales.jsx";

const ExerciseView = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [completedExerciseIds, setCompletedExerciseIds] = useState({});
    const [justCompletedId, setJustCompletedId] = useState(null);
    const [exerciseInputs, setExerciseInputs] = useState({});
    const [showResetModal, setShowResetModal] = useState(false);
    const [latestCompletions, setLatestCompletions] = useState({});
    const [loadingCompletions, setLoadingCompletions] = useState(true);
    const [availableExercises, setAvailableExercises] = useState([]);
    const [loadingAvailableExercises, setLoadingAvailableExercises] = useState(false);
    const [isOtroCamino, setIsOtroCamino] = useState(false);
    const [showExercisePicker, setShowExercisePicker] = useState(false);
    const [currentRow, setCurrentRow] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loadingRole, setLoadingRole] = useState(true);

    // Admin logic from gimnasios.jsx
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminActive, setAdminActive] = useState(false);

    const { currentUser } = useAuth();
    const { updateXP, refreshXP } = useXP();
    const username = currentUser?.username || "Usuario";

    // Track input refs for each exercise
    const inputRefs = useRef({});

    // Debug completed exercises
    useEffect(() => {
        console.log("Current completedExerciseIds:", completedExerciseIds);
    }, [completedExerciseIds]);

    // Fetch user role
    const fetchUserRole = async () => {
        try {
            const token = localStorage.getItem("jwtToken") || localStorage.getItem("token");
            if (!token) {
                setLoadingRole(false);
                return;
            }

            const response = await axios.get(
                "http://localhost:8080/api/users/role",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.data && response.data.role) {
                setUserRole(response.data.role);
                // Set isAdmin based on the role
                const adminStatus = response.data.role === 'ADMIN';
                setIsAdmin(adminStatus);
                console.log("User role:", response.data.role, "Is Admin:", adminStatus);
            }
        } catch (error) {
            console.error("Error fetching user role:", error);
            setUserRole("USER"); // Default to USER role if there's an error
            setIsAdmin(false);
        } finally {
            setLoadingRole(false);
        }
    };

    // Reset state when user changes
    useEffect(() => {
        setCompletedExerciseIds({});
        setExercises([]);
        setUserDetails(null);
        setError(null);
        setJustCompletedId(null);
        setExerciseInputs({});
        setLatestCompletions({});
        setAvailableExercises([]);
        setUserRole(null);
        setIsAdmin(false);
        setAdminActive(false);

        if (!currentUser?.id) {
            setLoading(false);
            setLoadingRole(false);
            return;
        }

        setLoading(true);
        setLoadingCompletions(true);
        setLoadingRole(true);
        refreshXP();
        fetchUserRole();
        fetchUserData();
    }, [currentUser, refreshXP]);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("jwtToken") || localStorage.getItem("token");
            if (!token) {
                setError("No se encontró el token JWT.");
                setLoading(false);
                return;
            }

            const axiosConfig = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            };

            const caminoFitnessId = localStorage.getItem("caminoFitnessId");
            const levelId = localStorage.getItem("levelId") || "principiante";

            // Check if user selected "Otro" camino (id = 5)
            setIsOtroCamino(caminoFitnessId === "5");

            try {
                const response = await axios.get(
                    "http://localhost:8080/api/users/exerciseDetails",
                    axiosConfig
                );

                if (response.data && typeof response.data === 'object') {
                    setUserDetails(response.data);
                    await fetchExercises(response.data.caminoFitnessId, response.data.levelId, axiosConfig);

                    // Fetch available exercises for the current level only if it's "Otro" camino
                    if (response.data.caminoFitnessId === 5 || response.data.caminoFitnessId === "5") {
                        await fetchAvailableExercises(response.data.levelId, axiosConfig);
                    }
                } else {
                    throw new Error("Formato de respuesta inválido");
                }
            } catch (apiError) {
                console.warn("Error al obtener detalles del usuario, usando localStorage:", apiError);
                if (caminoFitnessId) {
                    const fallback = {
                        caminoFitnessId,
                        levelId,
                        userId: currentUser.id
                    };
                    setUserDetails(fallback);
                    await fetchExercises(caminoFitnessId, levelId, axiosConfig);

                    // Fetch available exercises for the current level only if it's "Otro" camino
                    if (caminoFitnessId === "5") {
                        await fetchAvailableExercises(levelId, axiosConfig);
                    }
                } else {
                    throw new Error("No se pudo obtener la información del camino fitness y nivel.");
                }
            }
        } catch (err) {
            handleError(err);
        }
    };

    const fetchAvailableExercises = async (levelId, axiosConfig) => {
        try {
            setLoadingAvailableExercises(true);
            const response = await axios.get(
                `http://localhost:8080/api/exercises/level/${levelId}`,
                axiosConfig
            );

            if (Array.isArray(response.data)) {
                setAvailableExercises(response.data);
            } else {
                console.warn("La respuesta de ejercicios por nivel no es un array:", response.data);
                setAvailableExercises([]);
            }
        } catch (error) {
            console.error("Error fetching available exercises:", error);
            setAvailableExercises([]);
        } finally {
            setLoadingAvailableExercises(false);
        }
    };

    const fetchExercises = async (caminoFitnessId, levelId, axiosConfig) => {
        if (!caminoFitnessId || !levelId) {
            throw new Error(`Datos incompletos: caminoFitnessId=${caminoFitnessId}, levelId=${levelId}`);
        }
        const response = await axios.get(
            `http://localhost:8080/api/exercises/${caminoFitnessId}/${levelId}`,
            axiosConfig
        );
        if (Array.isArray(response.data)) {
            const enriched = response.data.map(ex => ({
                ...ex,
                id: String(ex.id),
                sets: ex.sets || 3,
                reps: ex.reps || 12,
                xpFitnessReward: ex.xpFitnessReward || 50
            }));
            setExercises(enriched);

            // Initialize input refs for each exercise
            const inputs = {};
            enriched.forEach(ex => {
                const id = String(ex.id);
                inputs[id] = {
                    sets: ex.sets,
                    reps: ex.reps,
                    weight: 0
                };
            });
            setExerciseInputs(inputs);

            // Now fetch the latest completions for each exercise
            await fetchLatestCompletions(enriched, axiosConfig);
        } else {
            console.warn("La respuesta de ejercicios no es un array:", response.data);
            setExercises([]);
            setLoadingCompletions(false);
        }
        setLoading(false);
    };

    // New function to fetch the latest completion data for all exercises
    const fetchLatestCompletions = async (exercisesList, axiosConfig) => {
        try {
            const completionsData = {};

            // Create an array of promises for all fetch requests
            const fetchPromises = exercisesList.map(async (exercise) => {
                try {
                    const id = String(exercise.id);
                    const response = await axios.get(
                        `http://localhost:8080/api/exercise-completions/latest/${id}`,
                        axiosConfig
                    );

                    // If we get a successful response with data
                    if (response.status === 200 && response.data) {
                        completionsData[id] = response.data;
                    }
                } catch (error) {
                    // If 204 No Content or other error, we just don't update that exercise
                    console.warn(`No previous completion found for exercise ${exercise.id}`);
                }
            });

            // Wait for all requests to complete
            await Promise.all(fetchPromises);

            // Update state with the gathered data
            setLatestCompletions(completionsData);

            // Update exercise inputs with latest completion data where available
            const updatedInputs = {...exerciseInputs};

            Object.entries(completionsData).forEach(([id, completion]) => {
                updatedInputs[id] = {
                    sets: completion.sets,
                    reps: completion.reps,
                    weight: completion.weight || 0
                };
            });

            setExerciseInputs(updatedInputs);
        } catch (error) {
            console.error("Error fetching latest completions:", error);
        } finally {
            setLoadingCompletions(false);
        }
    };

    const handleInputChange = (exerciseId, field, value) => {
        const id = String(exerciseId);
        setExerciseInputs(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };

    const completeExercise = async (exerciseId, xpAmount) => {
        try {
            const id = String(exerciseId);
            if (completedExerciseIds[id]) return;

            const token = localStorage.getItem("jwtToken") || localStorage.getItem("token");
            if (!token) return;
            const userId = userDetails?.userId || currentUser.id;
            if (!userId) return;

            // Get the input values for this exercise
            const exercise = inputRefs.current[id];
            if (!exercise) {
                console.error("Could not find input refs for exercise", id);
                return;
            }

            const sets = parseInt(exercise.sets.value) || 3;
            const reps = parseInt(exercise.reps.value) || 12;
            const weight = parseFloat(exercise.weight.value) || 0;
            const xpValue = Number(xpAmount) || 0;

            // Update UI first - show completion and XP gain immediately
            // Create a new object to ensure React sees the state change
            const updatedCompletedExercises = { ...completedExerciseIds };
            updatedCompletedExercises[id] = true;
            setCompletedExerciseIds(updatedCompletedExercises);

            // Set the just completed exercise ID
            setJustCompletedId(id);

            // Show confetti effect
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                disableForReducedMotion: true,
                zIndex: 2000,
                decay: 0.94,
                scalar: 0.8
            });

            // Send data to backend
            const response = await axios.post(
                "http://localhost:8080/api/exercise-completions",
                {
                    exerciseId: parseInt(id),
                    sets,
                    reps,
                    weight
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            // Extract XP from response if available, otherwise use the expected amount
            const earnedXp = response.data?.xpReward || xpValue;

            // Show XP notification
            showXpNotification(earnedXp);

            // Update XP after API response
            updateXP(earnedXp);
            refreshXP();

            // Update the latest completion data for this exercise
            setLatestCompletions(prev => ({
                ...prev,
                [id]: {
                    ...response.data,
                    sets,
                    reps,
                    weight
                }
            }));

            console.log("Exercise completion recorded:", response.data);
        } catch (err) {
            console.error('Error al completar el ejercicio:', err);
            // Try to recover the UI state if there was an error
            const updatedCompletedExercises = { ...completedExerciseIds };
            delete updatedCompletedExercises[String(exerciseId)];
            setCompletedExerciseIds(updatedCompletedExercises);
            setJustCompletedId(null);
            alert("Error al guardar el ejercicio completado. Por favor, intenta nuevamente.");
        }
    };

    const showXpNotification = (xpAmount) => {
        const box = document.createElement('div');
        box.className = 'xp-success-box';
        box.innerHTML = `
      <div class="xp-success-icon">🏆</div>
      <div class="xp-success-content">
        <div class="xp-success-title">¡Ejercicio completado!</div>
        <div class="xp-success-message">XP recompensado: <span class="xp-points">+${xpAmount}</span></div>
      </div>
    `;
        document.body.appendChild(box);
        setTimeout(() => document.body.removeChild(box), 4000);
    };

    const handleError = (err) => {
        console.error("Error completo:", err);
        if (err.response) {
            const status = err.response.status;
            if (status === 401) setError("No estás autenticado. Por favor, inicia sesión nuevamente.");
            else if (status === 403) setError("No tienes permisos para acceder a este recurso.");
            else if (status === 404) setError("Recurso no encontrado. Verifica las rutas API.");
            else setError(`Error del servidor: ${status} - ${JSON.stringify(err.response.data)}`);
        } else if (err.request) {
            setError("No se recibió respuesta del servidor. Verifica tu conexión.");
        } else {
            setError(`Error en la solicitud: ${err.message}`);
        }
        setLoading(false);
        setLoadingCompletions(false);
    };

    const openResetModal = () => {
        setShowResetModal(true);
    };

    const closeResetModal = () => {
        setShowResetModal(false);
    };

    // Open exercise picker for a specific row
    const openExercisePicker = (rowIndex) => {
        setCurrentRow(rowIndex);
        setShowExercisePicker(true);
    };

    // Close exercise picker
    const closeExercisePicker = () => {
        setShowExercisePicker(false);
        setCurrentRow(null);
    };

    // Select an exercise from the picker
    const selectExercise = (exercise) => {
        // Create a new array with the selected exercise replacing the one at currentRow
        const updatedExercises = [...exercises];

        // Prepare the enriched exercise object
        const enrichedExercise = {
            ...exercise,
            id: String(exercise.id),
            sets: exercise.sets || 3,
            reps: exercise.reps || 12,
            xpFitnessReward: exercise.xpFitnessReward || 50
        };

        // If currentRow is within the array bounds, replace it
        if (currentRow !== null && currentRow >= 0 && currentRow < updatedExercises.length) {
            updatedExercises[currentRow] = enrichedExercise;
            setExercises(updatedExercises);

            // Initialize input refs for the new exercise
            const id = String(exercise.id);
            setExerciseInputs(prev => ({
                ...prev,
                [id]: {
                    sets: exercise.sets || 3,
                    reps: exercise.reps || 12,
                    weight: 0
                }
            }));

            // Initialize the input ref
            if (!inputRefs.current[id]) {
                inputRefs.current[id] = {
                    sets: null,
                    reps: null,
                    weight: null
                };
            }
        } else {
            // If currentRow is not valid, add as a new exercise
            setExercises(prev => [...prev, enrichedExercise]);

            // Initialize input refs for the new exercise
            const id = String(exercise.id);
            setExerciseInputs(prev => ({
                ...prev,
                [id]: {
                    sets: exercise.sets || 3,
                    reps: exercise.reps || 12,
                    weight: 0
                }
            }));

            // Initialize the input ref
            if (!inputRefs.current[id]) {
                inputRefs.current[id] = {
                    sets: null,
                    reps: null,
                    weight: null
                };
            }
        }

        // Close the exercise picker
        closeExercisePicker();
    };

    // Get default value for an input field with fallbacks
    const getDefaultValue = (exerciseId, field, defaultVal) => {
        const id = String(exerciseId);
        // First check if we have a latest completion value
        if (latestCompletions[id] && latestCompletions[id][field] !== undefined) {
            return latestCompletions[id][field];
        }
        // Then check if we have a value in exerciseInputs
        if (exerciseInputs[id] && exerciseInputs[id][field] !== undefined) {
            return exerciseInputs[id][field];
        }
        // Finally fall back to the provided default
        return defaultVal;
    };

    if (loading || loadingRole) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando datos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Error al cargar los datos</h2>
                <p>{error}</p>
                <button
                    onClick={() => { setError(null); setLoading(true); fetchUserData(); }}
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

            {/* Admin Toggle Button - Only show if user is admin */}
            {isAdmin && (
                <div className="admin-toggle-container">
                    <button
                        className={`admin-toggle-button ${adminActive ? 'active' : ''}`}
                        onClick={() => setAdminActive(!adminActive)}
                    >
                        {adminActive ? 'Salir del Modo Admin' : 'Modo Admin'}
                    </button>
                </div>
            )}

            <div className="content-container">
                {/* Weekly Challenges Section - Conditional rendering based on admin mode */}
                {isAdmin && adminActive ? (
                    <AdminDesafioSemanales />
                ) : (
                    <DesafiosSemanales />
                )}

                {/* Main workout area */}
                <div className="sessions-panel">
                    <div className="workout-area">
                        <div className="session-card active">
                            <div className="session-header">
                                <h3>Cuerpo Completo</h3>
                            </div>
                            <div className="session-details">
                                {loadingCompletions ? (
                                    <div className="loading-mini">
                                        <p>Cargando historial de ejercicios...</p>
                                    </div>
                                ) : (
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
                                        {exercises.length > 0 ? (
                                            exercises.map((ex, index) => {
                                                const id = String(ex.id);
                                                // Only show completed style if this is the just completed exercise
                                                const completed = justCompletedId === id && completedExerciseIds[id];
                                                const xp = ex.xpFitnessReward;

                                                // Get previous completion values or defaults
                                                const defaultSets = getDefaultValue(id, 'sets', ex.sets);
                                                const defaultReps = getDefaultValue(id, 'reps', ex.reps);
                                                const defaultWeight = getDefaultValue(id, 'weight', 0);

                                                // Initialize refs if needed
                                                if (!inputRefs.current[id]) {
                                                    inputRefs.current[id] = {
                                                        sets: null,
                                                        reps: null,
                                                        weight: null
                                                    };
                                                }

                                                return (
                                                    <div className={`table-row ${completed ? 'completed-row' : ''}`} key={`${id}-${index}`}>
                                                        <div
                                                            className={`col-exercise ${isOtroCamino ? 'exercise-selector' : ''}`}
                                                            onClick={isOtroCamino ? () => openExercisePicker(index) : undefined}
                                                        >
                                                            <strong>{ex.name}</strong>
                                                            {isOtroCamino && <span className="exercise-selector-icon">▼</span>}
                                                        </div>
                                                        <div className="col-description"><p className="exercise-description">{ex.description}</p></div>
                                                        <div className="col-reps">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                step="1"
                                                                defaultValue={defaultReps}
                                                                ref={el => inputRefs.current[id].reps = el}
                                                                onChange={(e) => handleInputChange(id, 'reps', e.target.value)}
                                                                disabled={completedExerciseIds[id]}
                                                            />
                                                        </div>
                                                        <div className="col-sets">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                step="1"
                                                                defaultValue={defaultSets}
                                                                ref={el => inputRefs.current[id].sets = el}
                                                                onChange={(e) => handleInputChange(id, 'sets', e.target.value)}
                                                                disabled={completedExerciseIds[id]}
                                                            />
                                                        </div>
                                                        <div className="col-weight">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.5"
                                                                defaultValue={defaultWeight}
                                                                ref={el => inputRefs.current[id].weight = el}
                                                                onChange={(e) => handleInputChange(id, 'weight', e.target.value)}
                                                                disabled={completedExerciseIds[id]}
                                                            />
                                                        </div>
                                                        <div className="col-xp">
                                                            <button
                                                                className={`xp-reward-button ${completed ? 'completed' : ''}`}
                                                                onClick={() => completeExercise(id, xp)}
                                                                disabled={completedExerciseIds[id]}
                                                            >
                                                                {completed ? <span className="completed-text">✓ Completado</span> : `+${xp} XP`}
                                                            </button>
                                                        </div>
                                                        <div className="col-actions">
                                                            {ex.videoUrl && (
                                                                <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="video-link">
                                                                    <i className="fa fa-youtube-play"></i> Video
                                                                </a>
                                                            )}
                                                            {latestCompletions[id] && (
                                                                <span className="last-completed" title={`Última vez completado: ${new Date(latestCompletions[id].completedAt).toLocaleDateString()}`}>
                                                                    <i className="fa fa-history"></i>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="table-row empty-message">
                                                <div style={{ padding: '20px', textAlign: 'center' }}>
                                                    {isOtroCamino
                                                        ? "Haga clic en \"Agregar ejercicio\" para comenzar"
                                                        : "No hay ejercicios disponibles para este camino"
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cambiar Camino button */}
                        <div className="cambiar-camino-container">
                            <button
                                className="cambiar-camino-button"
                                onClick={openResetModal}
                            >
                                Cambiar Camino
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exercise Picker Modal - Only shown for Otro camino */}
            {isOtroCamino && showExercisePicker && (
                <div className="exercise-picker-modal">
                    <div className="exercise-picker-content">
                        <div className="exercise-picker-header">
                            <h3>Seleccionar Ejercicio</h3>
                            <button className="close-picker-button" onClick={closeExercisePicker}>×</button>
                        </div>

                        {loadingAvailableExercises ? (
                            <div className="loading-mini">
                                <p>Cargando ejercicios disponibles...</p>
                            </div>
                        ) : (
                            <div className="exercise-picker-list">
                                {availableExercises.length > 0 ? (
                                    availableExercises.map(exercise => (
                                        <div
                                            key={exercise.id}
                                            className="exercise-picker-item"
                                            onClick={() => selectExercise(exercise)}
                                        >
                                            <div className="exercise-picker-name">{exercise.name}</div>
                                            <div className="exercise-picker-muscle">{exercise.muscleGroup}</div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-exercises-message">No hay ejercicios disponibles para este nivel</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reset Camino Modal */}
            {showResetModal && (
                <ResetCaminoModal
                    onClose={closeResetModal}
                    userId={userDetails?.userId || currentUser?.id}
                />
            )}
        </div>
    );
};

export default ExerciseView;