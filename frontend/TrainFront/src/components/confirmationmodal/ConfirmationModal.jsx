import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ConfirmationModal.css';

function ConfirmationModal({ onConfirm, caminoSeleccionado, userId, selectedCaminoId }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleConfirm = async (confirm) => {
        if (!confirm) {
            onConfirm(false);
            return;
        }

        if (!userId || !selectedCaminoId) {
            setError('No se pudo determinar tu usuario o camino.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }};

            console.log("Asignando camino...");
            await axios.put(
                `http://localhost:8080/api/users/${userId}/camino`,
                { caminoFitnessId: selectedCaminoId },
                authHeader
            );

            console.log("Asignando nivel...");
            await axios.put(
                `http://localhost:8080/api/users/${userId}/level`,
                { levelId: 1 }, // ID 1 = Principiante
                authHeader
            );

            // After successful assignments, update the local storage
            localStorage.setItem('caminoFitnessId', selectedCaminoId);

            onConfirm(true);
            navigate(`/camino/${selectedCaminoId}/level/principiante`);
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
                        className="btn confirm"
                        onClick={() => handleConfirm(true)}
                        disabled={loading}
                    >
                        {loading ? 'Cargando...' : 'Sí'}
                    </button>
                    <button
                        className="btn cancel"
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
