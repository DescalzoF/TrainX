import { useEffect, useState } from "react";
import axios from "axios";
import { Award, Check, ChevronDown, ChevronUp, Coins } from "lucide-react";
import confetti from 'canvas-confetti';
import './DesafiosSemanales.css'; // Import the new CSS file

const DesafiosSemanales = () => {
    const [desafios, setDesafios] = useState([]);
    const [loadingDesafios, setLoadingDesafios] = useState(true);
    const [errorDesafios, setErrorDesafios] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [expandedDesafio, setExpandedDesafio] = useState(null);
    const [coinsAnimation, setCoinsAnimation] = useState(null);

    // State to store the randomly selected weekly challenge
    const [randomDesafio, setRandomDesafio] = useState(null);

    useEffect(() => {
        fetchDesafios();
    }, []);

    const fetchDesafios = async () => {
        try {
            // Get the token from localStorage
            const token = localStorage.getItem("jwtToken") || localStorage.getItem("token");

            if (!token) {
                setErrorDesafios("No se encontró el token JWT.");
                setLoadingDesafios(false);
                return;
            }

            const axiosConfig = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            };

            const response = await axios.get("http://localhost:8080/api/desafios-semanales/pendientes", axiosConfig);

            if (response.data && Array.isArray(response.data)) {
                // Store all desafios
                setDesafios(response.data);

                // Select a random desafio for this week if we have any
                if (response.data.length > 0) {
                    // Check if we already have a stored weekly challenge ID in localStorage
                    const storedWeeklyDesafioId = localStorage.getItem("weeklyDesafioId");
                    const lastUpdatedWeek = localStorage.getItem("weeklyDesafioUpdatedAt");
                    const currentWeek = getWeekNumber(new Date());

                    // If we have a stored ID and it's from the current week
                    if (storedWeeklyDesafioId && lastUpdatedWeek === currentWeek.toString()) {
                        // Find the stored desafio in our current list
                        const storedDesafio = response.data.find(d => d.id.toString() === storedWeeklyDesafioId);
                        if (storedDesafio) {
                            // Use the stored challenge if it still exists in our pending list
                            setRandomDesafio(storedDesafio);
                        } else {
                            // If the stored challenge is no longer in our list, select a new one
                            selectRandomDesafio(response.data);
                        }
                    } else {
                        // Select a new random challenge for this week
                        selectRandomDesafio(response.data);
                    }
                } else {
                    setRandomDesafio(null);
                }
            } else {
                console.warn("La respuesta de desafíos no es un array:", response.data);
                setDesafios([]);
                setRandomDesafio(null);
            }
            setLoadingDesafios(false);
        } catch (err) {
            console.error("Error al cargar los desafíos:", err);
            setErrorDesafios("Error al cargar los desafíos semanales.");
            setLoadingDesafios(false);
        }
    };

    // Helper function to get current week number
    const getWeekNumber = (date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

    // Function to select a random desafio and store it
    const selectRandomDesafio = (desafiosList) => {
        if (!desafiosList || desafiosList.length === 0) return;

        // Pick a random challenge
        const randomIndex = Math.floor(Math.random() * desafiosList.length);
        const selected = desafiosList[randomIndex];

        // Store the ID and current week in localStorage
        localStorage.setItem("weeklyDesafioId", selected.id.toString());
        localStorage.setItem("weeklyDesafioUpdatedAt", getWeekNumber(new Date()).toString());

        // Set as the current week's challenge
        setRandomDesafio(selected);
    };

    const completarDesafio = async (desafioId) => {
        try {
            // Get the token from localStorage
            const token = localStorage.getItem("jwtToken") || localStorage.getItem("token");

            if (!token) {
                console.error("No token found");
                return;
            }

            const axiosConfig = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            };

            const response = await axios.post(
                `http://localhost:8080/api/desafios-semanales/${desafioId}/completar`,
                {},
                axiosConfig
            );

            const result = response.data;

            // Mostrar animación de monedas
            setCoinsAnimation({
                amount: result.monedasGanadas,
                desafioId: desafioId
            });

            // Actualizar mensaje de éxito
            setSuccessMessage(`¡Enhorabuena! Has completado el desafío y ganado ${result.monedasGanadas} monedas.`);

            // Trigger confetti effect for completed challenge
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FFFF00', '#DAA520'],
                disableForReducedMotion: true,
                zIndex: 2000,
                decay: 0.94,
                scalar: 1.2
            });

            // Ocultar el mensaje después de unos segundos
            setTimeout(() => {
                setSuccessMessage("");
                setCoinsAnimation(null);

                // Refrescar los desafíos
                fetchDesafios();
            }, 3000);

        } catch (err) {
            console.error("Error al completar el desafío:", err);
            setErrorDesafios("Error al completar el desafío.");
        }
    };

    const toggleExpand = (id) => {
        if (expandedDesafio === id) {
            setExpandedDesafio(null);
        } else {
            setExpandedDesafio(id);
        }
    };

    if (loadingDesafios) {
        return (
            <div className="loading-challenges">
                <div className="spinner-small"></div>
                <p>Cargando desafíos...</p>
            </div>
        );
    }

    if (errorDesafios) {
        return (
            <div className="error-challenges">
                <p>{errorDesafios}</p>
                <button
                    onClick={() => {
                        setErrorDesafios(null);
                        setLoadingDesafios(true);
                        fetchDesafios();
                    }}
                    className="retry-button-small"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (!randomDesafio) {
        return (
            <div className="no-challenges">
                <p>¡Has completado todos los desafíos de esta semana!</p>
                <p className="subtitle">Vuelve la próxima semana para más desafíos.</p>
            </div>
        );
    }

    return (
        <div className="weekly-challenges-section">
            <h2>Desafío Semanal</h2>

            {/* Success message notification */}
            {successMessage && (
                <div className="success-message-container">
                    <div className="success-message">
                        <span>{successMessage}</span>
                    </div>
                </div>
            )}

            <div className="challenges-list">
                <div
                    key={randomDesafio.id}
                    className="challenge-card"
                >
                    {coinsAnimation && coinsAnimation.desafioId === randomDesafio.id && (
                        <div className="coins-animation">
                            <Coins size={16} className="coins-icon" />
                            <span className="coins-amount">+{coinsAnimation.amount}</span>
                        </div>
                    )}

                    <div
                        className="challenge-header"
                        onClick={() => toggleExpand(randomDesafio.id)}
                    >
                        <div className="challenge-title">
                            <Award className="award-icon" size={24} />
                            <div>
                                <h3>{randomDesafio.descripcion}</h3>
                                <div className="reward-info">
                                    <Coins size={16} className="coins-icon-small" />
                                    <span>{randomDesafio.valorMonedas} monedas</span>
                                </div>
                            </div>
                        </div>
                        <div className="expand-icon">
                            {expandedDesafio === randomDesafio.id ? (
                                <ChevronUp size={20} />
                            ) : (
                                <ChevronDown size={20} />
                            )}
                        </div>
                    </div>

                    {expandedDesafio === randomDesafio.id && (
                        <div className="challenge-details">
                            <p>
                                Completa este desafío para ganar {randomDesafio.valorMonedas} monedas.
                                Recuerda que solo puedes completar cada desafío una vez por semana.
                            </p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    completarDesafio(randomDesafio.id);
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