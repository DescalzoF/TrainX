import { useState, useEffect } from 'react';
import './ExercisesView.css';
import iconoDeportista from "../../assets/icono-deportista.png";
import iconoFuerza from "../../assets/icono-fuerza.png";
import iconoHibrido from "../../assets/icono-hibrido.jpg";
import iconoHipertrofia from "../../assets/icono-hipertrofia.png";
import iconoVarios from "../../assets/icono-varios.png";

function ExercisesView({ selectedCaminoId, onChangeCamino }) {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showChangeWarning, setShowChangeWarning] = useState(false);
    const [caminoDetails, setCaminoDetails] = useState(null);

    // Icon mapping
    const iconMapping = {
        "Deportista": iconoDeportista,
        "Fuerza": iconoFuerza,
        "Hibrido": iconoHibrido,
        "Hipertrofia": iconoHipertrofia,
        "Otro": iconoVarios
    };

    useEffect(() => {
        // Fetch exercises for the selected camino
        const fetchExercises = async () => {
            setLoading(true);
            try {
                // Fetch camino details
                const caminoResponse = await fetch(`http://localhost:8080/api/caminoFitness/${selectedCaminoId}`);
                if (!caminoResponse.ok) {
                    throw new Error('No se pudo cargar la información del camino fitness');
                }
                const caminoData = await caminoResponse.json();
                setCaminoDetails(caminoData);

                // Fetch exercises for this camino
                const exercisesResponse = await fetch(`http://localhost:8080/api/exercises/camino/${selectedCaminoId}`);
                if (!exercisesResponse.ok) {
                    throw new Error('No se pudieron cargar los ejercicios');
                }
                const exercisesData = await exercisesResponse.json();
                setExercises(exercisesData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching exercises:", error);
                setError(error.message);
                setLoading(false);
            }
        };

        if (selectedCaminoId) {
            fetchExercises();
        }
    }, [selectedCaminoId]);

    const handleChangeClick = () => {
        setShowChangeWarning(true);
    };

    const handleConfirmChange = (confirmed) => {
        setShowChangeWarning(false);
        if (confirmed) {
            onChangeCamino();
        }
    };

    if (loading) {
        return <div className="exercises-container"><div className="loading">Cargando ejercicios...</div></div>;
    }

    if (error) {
        return <div className="exercises-container"><div className="error">Error: {error}</div></div>;
    }

    return (
        <div className="exercises-container">
            {showChangeWarning ? (
                <div className="warning-modal">
                    <div className="warning-content">
                        <h2>¡Atención!</h2>
                        <p>Si cambias de camino fitness, perderás toda tu rutina actual para siempre.</p>
                        <p>¿Estás seguro que deseas cambiar?</p>
                        <div className="warning-buttons">
                            <button className="cancel-button" onClick={() => handleConfirmChange(false)}>Cancelar</button>
                            <button className="confirm-button" onClick={() => handleConfirmChange(true)}>Sí, cambiar</button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="exercises-header">
                        {caminoDetails && (
                            <div className="selected-camino">
                                <div className="camino-icon-container">
                                    <img
                                        src={iconMapping[caminoDetails.nameCF] || iconoVarios}
                                        alt={`${caminoDetails.nameCF} Icon`}
                                        className="camino-icon"
                                    />
                                </div>
                                <div className="camino-info">
                                    <h1>{caminoDetails.nameCF}</h1>
                                    <p>{caminoDetails.descriptionCF}</p>
                                </div>
                            </div>
                        )}
                        <button className="change-camino-button" onClick={handleChangeClick}>
                            Cambiar Camino Fitness
                        </button>
                    </div>

                    <div className="exercises-list">
                        {exercises.length === 0 ? (
                            <div className="no-exercises">
                                No hay ejercicios disponibles para este camino fitness.
                            </div>
                        ) : (
                            exercises.map((exercise) => (
                                <div key={exercise.id} className="exercise-card">
                                    <h3>{exercise.name}</h3>
                                    <div className="exercise-details">
                                        <p className="muscle-group"><strong>Grupo muscular:</strong> {exercise.muscleGroup}</p>
                                        <p className="sets-reps"><strong>Series:</strong> {exercise.sets} | <strong>Repeticiones:</strong> {exercise.reps}</p>
                                    </div>
                                    <div className="exercise-description">
                                        <p>{exercise.description}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default ExercisesView;