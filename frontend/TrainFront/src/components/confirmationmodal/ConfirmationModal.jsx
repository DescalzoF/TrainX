import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ConfirmationModal.css';

function ConfirmationModal({ onConfirm, caminoSeleccionado, userId, selectedCaminoId }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Map of camino IDs to their corresponding level IDs
    const caminoToLevelMap = {
        1: 1,   // Deportista: caminofitnessid 1, levelid 1
        2: 5,   // Fuerza: caminofitnessid 2, levelid 5
        3: 9,   // Entrenamiento Hibrido: caminofitnessid 3, levelid 9
        4: 13,  // Hipertrofia: caminofitnessid 4, levelid 13
        5: 17   // Otro: caminofitnessid 5, levelid 17
    };

    const handleConfirm = async (confirm) => {
        if (!confirm) {
            onConfirm(false);
            return;
        }

        if (!userId || !selectedCaminoId) {
            setError('No se pudo determinar tu usuario o camino.');
            return;
        }

        // Get the corresponding level ID for the selected camino
        const levelId = caminoToLevelMap[selectedCaminoId];

        if (!levelId) {
            setError(`No se encontró nivel para el camino seleccionado (ID: ${selectedCaminoId}).`);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log("Asignando camino y nivel...");
            console.log(`Usuario: ${userId}, Camino: ${selectedCaminoId}, Nivel: ${levelId}`);

            const token = localStorage.getItem('token');
            const authHeader = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            // Realizamos la solicitud PUT para asignar tanto el camino como el nivel en un solo endpoint
            await axios.put(
                `http://localhost:8080/api/users/${userId}/camino-y-nivel`,
                {
                    caminoFitnessId: selectedCaminoId,
                    levelId: levelId
                },
                authHeader
            );

            // Store both caminoFitnessId and currentLevelId in localStorage
            localStorage.setItem('caminoFitnessId', selectedCaminoId);
            localStorage.setItem('currentLevelId', levelId);

            console.log('Camino y nivel asignados correctamente');
            console.log(`Almacenado en localStorage - caminoFitnessId: ${selectedCaminoId}, currentLevelId: ${levelId}`);

            onConfirm(true);

            // Navigate to the correct path with the specific level ID
            navigate(`/camino/${selectedCaminoId}/level/${levelId}`);

        } catch (err) {
            // More detailed error logging
            console.error('Error en API:', err);
            if (err.response) {
                console.error('Response status:', err.response.status);
                console.error('Response data:', err.response.data);
            }
            const msg = err.response?.data?.message || err.message || 'Error desconocido';
            setError(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="confirmation-overlay">
            <div className="confirmation-box">
                <h2 className="confirmation-title">
                    ¿Estás seguro de elegir el camino <span>{caminoSeleccionado}</span>?
                </h2>
                <div className="confirmation-buttons">
                    <button
                        className={`btnconfirm ${loading ? 'loading' : ''}`}
                        onClick={() => handleConfirm(true)}
                        disabled={loading}
                    >
                        {loading ? 'Cargando...' : 'Sí'}
                    </button>
                    <button
                        className={`btn cancel ${loading ? 'loading' : ''}`}
                        onClick={() => handleConfirm(false)}
                        disabled={loading}
                    >
                        No
                    </button>
                </div>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}

export default ConfirmationModal;