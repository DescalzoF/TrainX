import { useEffect, useState } from "react";
import axios from "axios";
import { Award, Check, ChevronDown, ChevronUp, Coins, RefreshCw, Clock } from "lucide-react";
import confetti from 'canvas-confetti';
import './DesafiosSemanales.css';

const DesafiosSemanales = () => {
    const [currentDesafio, setCurrentDesafio] = useState(null);
    const [completedDesafio, setCompletedDesafio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [coinsAnimation, setCoinsAnimation] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);

    const API_BASE_URL = "http://localhost:8080/api";

    useEffect(() => {
        fetchDesafioStatus();
    }, []);

    // Format time remaining in a human-readable format
    const formatTimeRemaining = (hours) => {
        if (!hours && hours !== 0) return "";

        if (hours < 24) {
            return `${Math.ceil(hours)} horas`;
        } else {
            const days = Math.floor(hours / 24);
            const remainingHours = Math.ceil(hours % 24);

            if (remainingHours === 0) {
                return `${days} días`;
            } else {
                return `${days} días y ${remainingHours} horas`;
            }
        }
    };

    // Get authentication token from storage
    const getAuthToken = () => {
        const token = localStorage.getItem("jwtToken") || localStorage.getItem("token");

        if (!token) {
            console.error("No authentication token found");
            return null;
        }

        return token;
    };

    // Create axios config with auth headers
    const createAxiosConfig = () => {
        const token = getAuthToken();

        if (!token) {
            throw new Error("No se encontró el token de autenticación.");
        }

        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            withCredentials: true
        };
    };

    const fetchDesafioStatus = async () => {
        try {
            setLoading(true);
            setError(null);

            // Create axios config with auth headers
            const axiosConfig = createAxiosConfig();

            // First check if user has a recently completed challenge
            const estadoResponse = await axios.get(
                `${API_BASE_URL}/desafios-semanales/estado`,
                axiosConfig
            );

            console.log("Estado response:", estadoResponse.data);

            // If user has completed a challenge recently, show it with time remaining
            if (estadoResponse.data.locked && estadoResponse.data.completedDesafio) {
                setCompletedDesafio(estadoResponse.data.completedDesafio);
                setTimeRemaining(estadoResponse.data.completedDesafio.horasRestantes || 168); // Default to 7 days (168 hours)
                setCurrentDesafio(null);
            } else {
                // User is not locked, get a random pending challenge
                const pendientesResponse = await axios.get(
                    `${API_BASE_URL}/desafios-semanales/pendientes`,
                    axiosConfig
                );

                console.log("Pendientes response:", pendientesResponse.data);

                if (pendientesResponse.data.desafio) {
                    setCurrentDesafio(pendientesResponse.data.desafio);
                } else {
                    setCurrentDesafio(null);
                }

                setCompletedDesafio(null);
                setTimeRemaining(null);
            }
        } catch (err) {
            console.error("Error fetching desafio status:", err);

            if (err.response) {
                if (err.response.status === 401 || err.response.status === 403) {
                    setError("Error de autenticación. Por favor, inicia sesión nuevamente.");
                } else {
                    setError(`Error del servidor: ${err.response.status}`);
                }
            } else if (err.request) {
                setError("No se recibió respuesta del servidor. Comprueba tu conexión.");
            } else {
                setError(`Error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle challenge completion
    const completarDesafio = async (desafioId) => {
        try {
            // Create axios config with auth headers
            const axiosConfig = createAxiosConfig();

            const response = await axios.post(
                `${API_BASE_URL}/desafios-semanales/${desafioId}/completar`,
                {},
                axiosConfig
            );

            console.log("Completar response:", response.data);

            // Show coins animation
            if (response.data.monedasGanadas) {
                setCoinsAnimation({
                    amount: response.data.monedasGanadas
                });

                // Update success message
                setSuccessMessage(`¡Desafío completado! Has ganado ${response.data.monedasGanadas} monedas.`);
            } else {
                setSuccessMessage("¡Desafío completado!");
            }

            // Trigger confetti effect
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FFFF00', '#DAA520'],
                zIndex: 2000
            });

            // Refresh status after successful completion
            setTimeout(() => {
                setSuccessMessage("");
                setCoinsAnimation(null);
                fetchDesafioStatus();
            }, 3000);

        } catch (err) {
            console.error("Error completing challenge:", err);

            if (err.response && err.response.data) {
                if (err.response.data.horasRestantes) {
                    setError(`Ya has completado este desafío. Disponible nuevamente en ${formatTimeRemaining(err.response.data.horasRestantes)}`);
                } else if (err.response.data.message) {
                    setError(`Error: ${err.response.data.message}`);
                } else {
                    setError("Error al completar el desafío. Por favor, inténtalo de nuevo.");
                }
            } else {
                setError("Error al comunicarse con el servidor.");
            }

            // Clear error after 5 seconds
            setTimeout(() => {
                setError(null);
            }, 5000);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="weekly-challenges-section">
                <div className="challenges-header">
                    <h2>Desafío Semanal</h2>
                </div>
                <div className="loading-challenges">
                    <div className="spinner-small"></div>
                    <p>Cargando desafíos...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="weekly-challenges-section">
                <div className="challenges-header">
                    <h2>Desafío Semanal</h2>
                </div>
                <div className="error-challenges">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Show completed challenge with cooldown timer
    if (completedDesafio) {
        return (
            <div className="weekly-challenges-section">
                <div className="challenges-header">
                    <h2>Desafío Semanal</h2>
                </div>

                <div className="timer-container">
                    <div className="time-remaining">
                        <Clock size={16} className="timer-icon" />
                        <span>Próximo desafío disponible en {formatTimeRemaining(timeRemaining)}</span>
                    </div>
                </div>

                <div className="completed-challenge-section">
                    <div className="challenge-card completed">
                        <div className="completed-badge">
                            <Check size={14} />
                            <span>Completado</span>
                        </div>

                        <div className="challenge-header" onClick={() => setExpanded(!expanded)}>
                            <div className="challenge-title">
                                <Award className="award-icon completed" size={24} />
                                <div>
                                    <h3>{completedDesafio.descripcion}</h3>
                                    <div className="reward-info">
                                        <Coins size={16} className="coins-icon-small" />
                                        <span>{completedDesafio.valorMonedas} monedas</span>
                                    </div>
                                </div>
                            </div>
                            <div className="expand-icon">
                                {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </div>

                        {expanded && (
                            <div className="challenge-details">
                                <p>
                                    Has completado este desafío el {completedDesafio.fechaCompletado
                                    ? new Date(completedDesafio.fechaCompletado).toLocaleDateString()
                                    : "recientemente"}.
                                    Regresa en {formatTimeRemaining(timeRemaining)} para un nuevo desafío.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="weekly-challenges-section">
            <div className="challenges-header">
                <h2>Desafío Semanal</h2>
            </div>

            {/* Success message notification */}
            {successMessage && (
                <div className="success-message-container">
                    <div className="success-message">
                        <span>{successMessage}</span>
                    </div>
                </div>
            )}

            <div className="challenges-list">
                <div key={currentDesafio.id} className="challenge-card">
                    {coinsAnimation && (
                        <div className="coins-animation">
                            <Coins size={16} className="coins-icon" />
                            <span className="coins-amount">+{coinsAnimation.amount}</span>
                        </div>
                    )}

                    <div className="challenge-header" onClick={() => setExpanded(!expanded)}>
                        <div className="challenge-title">
                            <Award className="award-icon" size={24} />
                            <div>
                                <h3>{currentDesafio.descripcion}</h3>
                                <div className="reward-info">
                                    <Coins size={16} className="coins-icon-small" />
                                    <span>{currentDesafio.valorMonedas} monedas</span>
                                </div>
                            </div>
                        </div>
                        <div className="expand-icon">
                            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </div>

                    {expanded && (
                        <div className="challenge-details">
                            <p>
                                Completa este desafío para ganar {currentDesafio.valorMonedas} monedas.
                                Recuerda que solo puedes completar un desafío cada 7 días.
                            </p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    completarDesafio(currentDesafio.id);
                                }}
                                className="complete-challenge-button"
                            >
                                <Check size={16} className="check-icon" />
                                Marcar como completado
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DesafiosSemanales;