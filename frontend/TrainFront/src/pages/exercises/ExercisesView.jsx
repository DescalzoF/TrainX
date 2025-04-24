import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function ExerciseView() {
    const { caminoName } = useParams();  // Extraemos el nombre del camino desde la URL
    const [exercises, setExercises] = useState([]);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                // Aquí obtendrás los ejercicios de la API según el nombre del camino
                const response = await axios.get(`/api/camino/${caminoName}/exercises`);
                setExercises(response.data);
            } catch (error) {
                console.error('Error al cargar los ejercicios:', error);
            }
        };

        fetchExercises();
    }, [caminoName]);

    return (
        <div>
            <h2>Comienza tu Camino Fitness {caminoName}</h2>
            <ul>
                {exercises.map((exercise, index) => (
                    <li key={index}>
                        <h4>{exercise.name}</h4>
                        <p>{exercise.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ExerciseView;