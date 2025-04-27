// Update ExercisesView.jsx to handle route parameters:
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ExercisesView = () => {
    const { caminoId, level } = useParams();
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                // Adjust the API endpoint based on your backend
                const response = await axios.get(`http://localhost:8080/api/exercises/camino/${caminoId}/level/${level}`);
                setExercises(response.data);
            } catch (error) {
                console.error('Error fetching exercises:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExercises();
    }, [caminoId, level]);

    if (loading) {
        return <div>Loading exercises...</div>;
    }

    return (
        <div className="exercises-container">
            <h1>Exercises for {level}</h1>
            <div className="exercises-list">
                {exercises.length > 0 ? (
                    exercises.map(exercise => (
                        <div key={exercise.id} className="exercise-card">
                            <h3>{exercise.name}</h3>
                            <p>{exercise.description}</p>
                        </div>
                    ))
                ) : (
                    <p>No exercises found for this level.</p>
                )}
            </div>
        </div>
    );
};

export default ExercisesView;