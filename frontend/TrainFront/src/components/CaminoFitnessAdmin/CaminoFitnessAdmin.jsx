import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../pages/CaminoFitness/CaminoFitness.css';
import iconoDeportista from "../../assets/icono-deportista.png";
import iconoFuerza from "../../assets/icono-fuerza.png";
import iconoHibrido from "../../assets/icono-hibrido.jpg";
import iconoHipertrofia from "../../assets/icono-hipertrofia.png";
import iconoVarios from "../../assets/icono-varios.png";
import ConfirmationModal from "../confirmationmodal/ConfirmationModal.jsx";
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

function CaminoFitnessAdmin() {
    const { getCurrentUserId, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedCamino, setSelectedCamino] = useState(null);
    const [selectedCaminoId, setSelectedCaminoId] = useState(null);
    const [caminoOptions, setCaminoOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adminActive, setAdminActive] = useState(false);
    const [editingCamino, setEditingCamino] = useState(null);
    const [formData, setFormData] = useState({ nameCF: '', descriptionCF: '' });
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const iconMapping = {
        "Deportista": iconoDeportista,
        "Fuerza": iconoFuerza,
        "Hibrido": iconoHibrido,
        "Hipertrofia": iconoHipertrofia,
        "Otro": iconoVarios
    };

    useEffect(() => {
        fetchCaminoOptions();
    }, []);

    // Clear success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const fetchCaminoOptions = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/caminoFitness');
            console.log("Respuesta de la API:", response.data);

            if (Array.isArray(response.data)) {
                setCaminoOptions(response.data);
            } else {
                console.error("API no devolvió un array:", response.data);
                setCaminoOptions([]); // en caso de error, setea un array vacío
            }
        } catch (error) {
            console.error("Error al obtener los caminos:", error);
            setError("No se pudieron cargar los caminos. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleCaminoSelect = (camino) => {
        if (adminActive) {
            // In admin mode, don't navigate but prepare for editing
            return;
        }
        setSelectedCamino(camino.nameCF);
        setSelectedCaminoId(camino.idCF);
        console.log("Camino seleccionado:", camino);
        setShowConfirmation(true);
    };

    const handleConfirm = (confirmed) => {
        setShowConfirmation(false);
        if (confirmed) {
            navigate(`/exercises/${selectedCaminoId}/Principiante`);
        }
    };

    const handleToggleAdmin = (active) => {
        setAdminActive(active);
        if (!active) {
            cancelEdit(); // Cancel any ongoing edits when deactivating admin mode
        }
    };

    const startEdit = (camino) => {
        setEditingCamino(camino.idCF);
        setFormData({
            nameCF: camino.nameCF,
            descriptionCF: camino.descriptionCF
        });
        setSaveError(null);
    };

    const cancelEdit = () => {
        setEditingCamino(null);
        setFormData({ nameCF: '', descriptionCF: '' });
        setSaveError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async (caminoId) => {
        try {
            setSaveLoading(true);
            setSaveError(null);

            const response = await axios.put(
                `http://localhost:8080/api/caminoFitness/${caminoId}`,
                formData
            );

            // Update local state with the updated camino
            setCaminoOptions(prev =>
                prev.map(c => c.idCF === caminoId ? response.data : c)
            );

            setSuccessMessage("¡Camino actualizado con éxito!");
            cancelEdit();
        } catch (error) {
            console.error("Error al actualizar el camino:", error);
            setSaveError("No se pudo actualizar el camino. Intenta nuevamente.");
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDelete = async (caminoId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este camino? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            setSaveLoading(true);
            await axios.delete(`http://localhost:8080/api/caminoFitness/${caminoId}`);

            // Remove from local state
            setCaminoOptions(prev => prev.filter(c => c.idCF !== caminoId));
            setSuccessMessage("Camino eliminado con éxito");
        } catch (error) {
            console.error("Error al eliminar el camino:", error);
            setSaveError("No se pudo eliminar el camino. Intenta nuevamente.");
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="camino-container">
                <div className="loading">Cargando opciones...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="camino-container">
                <div className="error">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Reintentar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="camino-container">
            {isAdmin && <AdminToggleButton
                isAdmin={isAdmin}
                onToggle={handleToggleAdmin}
                adminActive={adminActive}
            />}

            <div className="camino-header">
                <h1>Explora tu Camino Fitness</h1>
                <p className="subtitle">Elegí lo correcto, Transforma tu vida, Sé mejor</p>
                {adminActive && <div className="admin-banner">Modo Administrador Activado</div>}
                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                    </div>
                )}
            </div>

            <div className="caminos-list">
                {Array.isArray(caminoOptions) && caminoOptions.length > 0 ? (
                    caminoOptions.map((camino) => (
                        <div
                            key={camino.idCF}
                            className={`camino-option ${editingCamino === camino.idCF ? 'editing' : ''}`}
                            onClick={() => !adminActive && handleCaminoSelect(camino)}
                        >
                            <div className="camino-icon-container">
                                <img
                                    src={iconMapping[camino.nameCF] || iconoVarios}
                                    alt={`${camino.nameCF} Icon`}
                                    className="camino-icon"
                                />
                            </div>

                            {editingCamino === camino.idCF ? (
                                <div className="camino-edit-form">
                                    <input
                                        type="text"
                                        name="nameCF"
                                        value={formData.nameCF}
                                        onChange={handleInputChange}
                                        className="camino-edit-input"
                                        placeholder="Nombre del camino"
                                    />
                                    <textarea
                                        name="descriptionCF"
                                        value={formData.descriptionCF}
                                        onChange={handleInputChange}
                                        className="camino-edit-textarea"
                                        placeholder="Descripción del camino"
                                        rows={4}
                                    />

                                    <div className="camino-edit-actions">
                                        <button
                                            className="camino-save-btn"
                                            onClick={() => handleSave(camino.idCF)}
                                            disabled={saveLoading}
                                        >
                                            <FaSave /> Guardar
                                        </button>
                                        <button
                                            className="camino-cancel-btn"
                                            onClick={cancelEdit}
                                            disabled={saveLoading}
                                        >
                                            <FaTimes /> Cancelar
                                        </button>
                                    </div>

                                    {saveError && <p className="camino-edit-error">{saveError}</p>}
                                </div>
                            ) : (
                                <div className="camino-info">
                                    <div className="camino-header-row">
                                        <h3>{camino.nameCF}</h3>
                                        {adminActive && (
                                            <div className="camino-admin-actions">
                                                <button
                                                    className="camino-edit-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEdit(camino);
                                                    }}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="camino-delete-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(camino.idCF);
                                                    }}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="complete-description">
                                        {camino.descriptionCF}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-options">
                        No hay caminos disponibles en este momento.
                    </div>
                )}
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

export default CaminoFitnessAdmin;