import React, { useState, useEffect } from 'react';
import { fetchExercisesForLevel } from '../../services/caminoservice/CaminoService.js'; // Asegúrate de que la ruta sea correcta
import './ExercisesView.css';

function ExercisesView({ selectedCaminoId, selectedLevel }) {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completedExercises, setCompletedExercises] = useState({});

    useEffect(() => {
        const loadExercises = async () => {
            try {
                const exercisesData = await fetchExercisesForLevel(selectedCaminoId, selectedLevel);
                setExercises(exercisesData);
                setLoading(false);
            } catch (error) {
                console.error("Error loading exercises:", error);
                setError(error.message);
                setLoading(false);
            }
        };

        loadExercises();
    }, [selectedCaminoId, selectedLevel]);

    const handleCheckboxChange = (exerciseId) => {
        setCompletedExercises((prev) => ({
            ...prev,
            [exerciseId]: !prev[exerciseId],
        }));
    };

    if (loading) {
        return <div className="loading">Cargando ejercicios...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="exercises-view">
            <h2 className="exercises-title">Ejercicios para Nivel {selectedLevel}</h2>
            {exercises.length > 0 ? (
                <div className="exercise-list">
                    {exercises.map((exercise) => (
                        <div key={exercise.id} className="exercise-card">
                            <div className="exercise-card-header">
                                <h3>{exercise.name}</h3>
                                <div className="exercise-checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={completedExercises[exercise.id] || false}
                                            onChange={() => handleCheckboxChange(exercise.id)}
                                        />
                                        Completado
                                    </label>
                                </div>
                            </div>
                            <p className="exercise-description">{exercise.description}</p>
                            <p><strong>Grupo Muscular:</strong> {exercise.muscleGroup}</p>
                            <p><strong>Series:</strong> {exercise.sets} <strong>Repeticiones:</strong> {exercise.reps}</p>
                            <div className="exercise-video">
                                <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer">Ver Video</a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No hay ejercicios disponibles para este nivel.</p>
            )}
        </div>
    );
}

export default ExercisesView;
