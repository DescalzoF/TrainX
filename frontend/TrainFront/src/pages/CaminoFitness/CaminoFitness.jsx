import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CaminoFitness.css';
import iconoDeportista from "../../assets/icono-deportista.png";
import iconoFuerza from "../../assets/icono-fuerza.png";
import iconoHibrido from "../../assets/icono-hibrido.jpg";
import iconoHipertrofia from "../../assets/icono-hipertrofia.png";
import iconoVarios from "../../assets/icono-varios.png";
import ConfirmationModal from "../../components/confirmationmodal/ConfirmationModal.jsx";
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

function CaminoFitness() {
    const { getCurrentUserId } = useAuth();
    const navigate = useNavigate();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedCamino, setSelectedCamino] = useState(null);
    const [selectedCaminoId, setSelectedCaminoId] = useState(null);
    const [caminoOptions, setCaminoOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const iconMapping = {
        "Deportista": iconoDeportista,
        "Fuerza": iconoFuerza,
        "Hibrido": iconoHibrido,
        "Hipertrofia": iconoHipertrofia,
        "Otro": iconoVarios
    };

    useEffect(() => {
        const fetchCaminoOptions = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/caminoFitness');
                console.log("Respuesta de la API:", response.data);

                if (Array.isArray(response.data)) {
                    setCaminoOptions(response.data);
                } else {
                    console.error("API no devolvió un array:", response.data);
                    setCaminoOptions([]); // en caso de error, setea un array vacío
                }
            } catch (error) {
                console.error("Error al obtener los caminos:", error);
                setError("No se pudieron cargar los caminos. Intenta nuevamente.");
            } finally {
                setLoading(false);
            }
        };

        fetchCaminoOptions();
    }, []);

    const handleCaminoSelect = (camino) => {
        setSelectedCamino(camino.nameCF);
        setSelectedCaminoId(camino.idCF);
        console.log("Camino seleccionado:", camino);
        setShowConfirmation(true);
    };

    const handleConfirm = (confirmed) => {
        setShowConfirmation(false);
        if (confirmed) {
            navigate(`/exercises/${selectedCaminoId}/Principiante`);
        }
    };

    const handleChangeCamino = () => {
        setSelectedCamino(null);
        setSelectedCaminoId(null);
    };

    if (loading) {
        return (
            <div className="camino-container">
                <div className="loading">Cargando opciones...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="camino-container">
                <div className="error">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Reintentar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="camino-container">
            <div className="camino-header">
                <h1>Explora tu Camino Fitness</h1>
                <p className="subtitle">Elegí lo correcto, Transforma tu vida, Sé mejor</p>
            </div>

            <div className="caminos-list">
                {Array.isArray(caminoOptions) && caminoOptions.length > 0 ? (
                    caminoOptions.map((camino) => (
                        <div
                            key={camino.idCF}
                            className="camino-option"
                            onClick={() => handleCaminoSelect(camino)}
                        >
                            <div className="camino-icon-container">
                                <img
                                    src={iconMapping[camino.nameCF] || iconoVarios}
                                    alt={`${camino.nameCF} Icon`}
                                    className="camino-icon"
                                />
                            </div>
                            <div className="camino-info">
                                <h3>{camino.nameCF}</h3>
                                <p className="complete-description">
                                    {camino.descriptionCF}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-options">
                        No hay caminos disponibles en este momento.
                    </div>
                )}
            </div>

            {showConfirmation && (
                <ConfirmationModal
                    onConfirm={handleConfirm}
                    caminoSeleccionado={selectedCamino}
                    userId={getCurrentUserId()}
                    selectedCaminoId={selectedCaminoId}
                />
            )}

            <div className="footer-note">
                <p>Si se encuentra en necesidad de atención psicológica se puede contactar al número</p>
                <p className="phone-number">Teléfono: +54 9 11 999 9999 (local los)</p>
            </div>
        </div>
    );
}

export default CaminoFitness;
