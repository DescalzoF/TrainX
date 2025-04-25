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

        // Validar props
        if (!userId || !selectedCaminoId) {
            setError('No se pudo determinar tu usuario o camino.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log("PUT http://localhost:8080/api/users/", userId, "/camino");
            console.log("Body:", { caminoFitnessId: selectedCaminoId });

            const response = await axios.put(
                `http://localhost:8080/api/users/${userId}/camino`,
                { caminoFitnessId: selectedCaminoId },
                { headers: { 'Content-Type': 'application/json' } }
            );

            console.log('Respuesta de la API:', response);

            if (response.status === 200) {
                // Confirmamos al padre
                onConfirm(true);
                // Redirigimos
                navigate(`/camino/:caminoId/level/:level`);
            } else {
                console.error('Código inesperado:', response.status, response.data);
                setError(`Error al asignar el camino (${response.status})`);
            }
        } catch (err) {
            console.error('Error en API:', err.response || err);
            const msg = err.response?.data?.message || err.message || 'Error desconocido';
            setError(`Error al asignar el camino fitness: ${msg}`);
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
