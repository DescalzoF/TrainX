import { useState, useEffect } from 'react';
import './CaminoFitness.css';
import ExercisesView from '../../pages/exercises/ExercisesView';
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
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedCamino, setSelectedCamino] = useState(null);
    const [selectedCaminoId, setSelectedCaminoId] = useState(null);
    const [caminoOptions, setCaminoOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showExercises, setShowExercises] = useState(false);

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
                setCaminoOptions(response.data);
            } catch (error) {
                console.error("Failed to fetch camino options:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCaminoOptions();
    }, []);

    const handleCaminoSelect = (camino) => {
        setSelectedCamino(camino.nameCF);
        setSelectedCaminoId(camino.idCF);
        setShowConfirmation(true);
    };

    const handleConfirm = (confirmed) => {
        setShowConfirmation(false);
        if (confirmed) {
            setShowExercises(true);  // Redirige a la vista de ejercicios
        }
    };

    const handleChangeCamino = () => {
        setShowExercises(false);
        setSelectedCamino(null);
        setSelectedCaminoId(null);
    };

    if (loading) {
        return <div className="camino-container"><div className="loading">Cargando opciones...</div></div>;
    }

    if (error) {
        return <div className="camino-container"><div className="error">Error: {error}</div></div>;
    }

    if (showExercises) {
        return (
            <ExercisesView
                selectedCaminoId={selectedCaminoId}
                selectedLevel="Principiante"
                onChangeCamino={handleChangeCamino}
            />
        );
    }

    return (
        <div className="camino-container">
            <div className="camino-header">
                <h1>Explora tu Camino Fitness</h1>
                <p className="subtitle">Elegí lo correcto, Transforma tu vida, Sé mejor</p>
            </div>

            <div className="caminos-list">
                {caminoOptions.map((camino) => (
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
                ))}
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
