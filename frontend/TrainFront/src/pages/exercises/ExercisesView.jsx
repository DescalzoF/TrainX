import { useEffect, useState } from "react";
import axios from "axios";
import "./ExercisesView.css";
import confetti from 'canvas-confetti';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useXP } from "../../contexts/XPContext.jsx";
import { Check } from "lucide-react";
import DesafiosSemanales from "./DesafiosSemanales.jsx";

const ExerciseView = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [completedExerciseIds, setCompletedExerciseIds] = useState({});
    const [justCompletedId, setJustCompletedId] = useState(null);

    const { currentUser } = useAuth();
    const { updateXP, refreshXP } = useXP();
    const username = currentUser?.username || "Usuario";

    // Debug completed exercises
    useEffect(() => {
        console.log("Current completedExerciseIds:", completedExerciseIds);
    }, [completedExerciseIds]);

    // Reset state when user changes
    useEffect(() => {
        setCompletedExerciseIds({});
        setExercises([]);
        setUserDetails(null);
        setError(null);
        setJustCompletedId(null);

        if (!currentUser?.id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        refreshXP();
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

            try {
                const response = await axios.get(
                    "http://localhost:8080/api/users/exerciseDetails",
                    axiosConfig
                );

                if (response.data && typeof response.data === 'object') {
                    setUserDetails(response.data);
                    await fetchExercises(response.data.caminoFitnessId, response.data.levelId, axiosConfig);
                    await fetchCompletedExercises(axiosConfig, response.data.userId || currentUser.id);
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
                    await fetchCompletedExercises(axiosConfig, currentUser.id);
                } else {
                    throw new Error("No se pudo obtener la información del camino fitness y nivel.");
                }
            }
        } catch (err) {
            handleError(err);
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
        } else {
            console.warn("La respuesta de ejercicios no es un array:", response.data);
            setExercises([]);
        }
        setLoading(false);
    };

    const fetchCompletedExercises = async (axiosConfig, userId) => {
        if (!userId) {
            console.warn("No userId para completedExercises");
            setCompletedExerciseIds({});
            return;
        }
        try {
            const response = await axios.get(
                `http://localhost:8080/api/exercises/completed?userId=${userId}`,
                axiosConfig
            );
            if (Array.isArray(response.data)) {
                // Create a fresh object for each API response
                const map = {};
                response.data.forEach(id => { map[String(id)] = true; });
                setCompletedExerciseIds(map);
            } else {
                setCompletedExerciseIds({});
            }
        } catch (err) {
            console.warn("Error fetching completedExercises:", err);
            setCompletedExerciseIds({});
        }
    };

    const completeExercise = async (exerciseId, xpAmount) => {
        try {
            const id = String(exerciseId);
            if (completedExerciseIds[id]) return;

            const token = localStorage.getItem("jwtToken") || localStorage.getItem("token");
            if (!token) return;
            const userId = userDetails?.userId || currentUser.id;
            if (!userId) return;

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

            // Show XP notification
            showXpNotification(xpValue);

            // Update XP immediately without waiting for API response
            updateXP(xpValue);
            refreshXP();

            // Send API request in background
            try {
                await axios.post(
                    "http://localhost:8080/api/exercises/complete",
                    { userId, exerciseId: id, xpFitnessReward: xpValue },
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );
            } catch (err) {
                // Log error but don't alert user or revert UI changes
                console.warn("Error recording exercise completion in backend:", err);
                // We keep the UI state as completed to maintain good UX
            }
        } catch (err) {
            console.error('Error al completar el ejercicio:', err);
            // No alert here, just log the error
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
    };

    if (loading) {
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
            <div className="content-container">
                {/* Weekly Challenges Section - Now using the separate component */}
                <DesafiosSemanales />

                {/* Exercises Section */}
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
                                {exercises.length > 0 ? (
                                    exercises.map(ex => {
                                        const id = String(ex.id);
                                        // Only show completed style if this is the just completed exercise
                                        const completed = justCompletedId === id && completedExerciseIds[id];
                                        const xp = ex.xpFitnessReward;
                                        return (
                                            <div className={`table-row ${completed ? 'completed-row' : ''}`} key={id}>
                                                <div className="col-exercise"><strong>{ex.name}</strong></div>
                                                <div className="col-description"><p className="exercise-description">{ex.description}</p></div>
                                                <div className="col-reps">
                                                    <input type="number" min="1" step="1" defaultValue={ex.reps}/>
                                                </div>
                                                <div className="col-sets">
                                                    <input type="number" min="1" step="1" defaultValue={ex.sets}/>
                                                </div>
                                                <div className="col-weight">
                                                    <input type="number" min="0" step="0.5" defaultValue="0"/>
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
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="table-row"><div style={{ padding: '20px', textAlign: 'center' }}>No se encontraron ejercicios</div></div>
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