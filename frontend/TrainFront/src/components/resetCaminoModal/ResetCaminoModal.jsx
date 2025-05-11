import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ResetCaminoModal.css';

function ResetCaminoModal({ onClose, userId }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showWarning, setShowWarning] = useState(false);
    const navigate = useNavigate();

    const handleResetCamino = async () => {
        if (!userId) {
            setError('No se pudo determinar tu usuario.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const authHeader = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            // Second call: Reset XP to 0
            await axios.put(
                `http://localhost:8080/api/xpfitness/${userId}/reset`,
                {},  // Empty body
                authHeader
            );

            // First call: Unassign camino and level
            await axios.put(
                `http://localhost:8080/api/users/${userId}/unassign-camino-y-nivel`,
                {},  // Empty body as the endpoint doesn't require payload
                authHeader
            );

            // Clear local storage values
            localStorage.removeItem('caminoFitnessId');
            localStorage.removeItem('currentLevelId');

            console.log('Camino fitness, nivel y XP reseteados correctamente');

            // Navigate to camino page
            navigate('/camino');

        } catch (err) {
            console.error('Error al reiniciar camino:', err);
            if (err.response) {
                console.error('Response status:', err.response.status);
                console.error('Response data:', err.response.data);
            }
            const msg = err.response?.data || err.message || 'Error desconocido';
            setError(`Error al cambiar camino: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInitialClick = () => {
        setShowWarning(true);
    };

    const handleCancel = () => {
        if (showWarning) {
            setShowWarning(false);
        } else {
            onClose();
        }
    };

    return (
        <div className="reset-camino-overlay">
            <div className="reset-camino-box">
                {!showWarning ? (
                    <>
                        <h2 className="reset-camino-title">Cambiar Camino Fitness</h2>
                        <p className="reset-camino-description">
                            Puedes cambiar tu camino fitness actual por uno nuevo.
                        </p>
                        <div className="reset-camino-buttons">
                            <button
                                className="btn-reset"
                                onClick={handleInitialClick}
                                disabled={loading}
                            >
                                Cambiar Camino Fitness
                            </button>
                            <button
                                className="btn-cancel"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="reset-camino-title warning">¡Advertencia!</h2>
                        <p className="warning-message">
                            Si cambias tu camino fitness, perderás todo tu progreso actual,
                            incluyendo tu camino, nivel y puntos de experiencia (XP). Esta acción no se puede deshacer.
                        </p>
                        <div className="reset-camino-buttons">
                            <button
                                className={`btn-confirm-reset ${loading ? 'loading' : ''}`}
                                onClick={handleResetCamino}
                                disabled={loading}
                            >
                                {loading ? 'Cargando...' : 'Confirmar cambio'}
                            </button>
                            <button
                                className="btn-cancel"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                        </div>
                    </>
                )}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}

export default ResetCaminoModal;