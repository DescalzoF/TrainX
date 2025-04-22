import React from 'react';
import './ConfirmationModal.css';

function ConfirmationModal({ onConfirm, caminoSeleccionado }) {
    return (
        <div className="confirmation-overlay">
            <div className="confirmation-box">
                <h2 className="confirmation-title">
                    ¿Estás seguro de elegir el camino <span>{caminoSeleccionado}</span>?
                </h2>
                <div className="confirmation-buttons">
                    <button className="btn confirm" onClick={() => onConfirm(true)}>Sí</button>
                    <button className="btn cancel" onClick={() => onConfirm(false)}>No</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
