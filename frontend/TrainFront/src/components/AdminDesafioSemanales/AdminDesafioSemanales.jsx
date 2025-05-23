import { useState, useEffect } from "react";
import axios from "axios";
import { Award, Edit, Trash2, Plus, Save, X, AlertCircle, ChevronDown, ChevronUp, Check, Minimize, Maximize } from "lucide-react";
import "./AdminDesafioSemanales.css";

const AdminDesafioSemanales = () => {
    const [desafios, setDesafios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    const [formData, setFormData] = useState({
        descripcion: "",
        valorMonedas: 100,
        activo: true
    });
    const [notification, setNotification] = useState({
        show: false,
        message: "",
        type: "success"
    });

    const API_BASE_URL = "http://localhost:8080/api";

    useEffect(() => {
        if (!collapsed) {
            fetchDesafios();
        }
    }, [collapsed]);

    // Get authentication token from storage
    const getAuthToken = () => {
        // Try multiple possible token storage keys
        const token = localStorage.getItem("jwtToken") ||
            localStorage.getItem("token") ||
            sessionStorage.getItem("jwtToken") ||
            sessionStorage.getItem("token");

        if (!token) {
            console.error("No authentication token found");
            return null;
        }

        return token;
    };

    // Create axios config with auth headers
    const createAxiosConfig = () => {
        const token = getAuthToken();

        if (!token) {
            throw new Error("No se encontró el token de autenticación.");
        }

        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            withCredentials: true
        };
    };

    const fetchDesafios = async () => {
        try {
            setLoading(true);
            setError(null);

            const axiosConfig = createAxiosConfig();
            const response = await axios.get(
                `${API_BASE_URL}/desafios-semanales`,
                axiosConfig
            );

            setDesafios(response.data);
        } catch (err) {
            console.error("Error fetching desafios:", err);

            if (err.response) {
                switch (err.response.status) {
                    case 401:
                        setError("Error de autenticación. Por favor, inicia sesión nuevamente.");
                        break;
                    case 403:
                        setError("Acceso denegado. Se requieren permisos de administrador.");
                        break;
                    case 404:
                        setError("Endpoint no encontrado. Verifica la configuración del servidor.");
                        break;
                    case 500:
                        setError("Error interno del servidor. Contacta al administrador del sistema.");
                        break;
                    default:
                        setError(`Error del servidor: ${err.response.status} - ${err.response.statusText}`);
                }
            } else if (err.request) {
                setError("No se recibió respuesta del servidor. Comprueba tu conexión a internet y que el servidor esté funcionando.");
            } else {
                setError(`Error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value) || 0 : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form data
        if (!formData.descripcion.trim()) {
            showNotification("La descripción es requerida", "error");
            return;
        }

        if (formData.valorMonedas < 1 || formData.valorMonedas > 1000) {
            showNotification("El valor de monedas debe estar entre 1 y 1000", "error");
            return;
        }

        try {
            const axiosConfig = createAxiosConfig();
            let response;

            const dataToSend = {
                descripcion: formData.descripcion.trim(),
                valorMonedas: formData.valorMonedas,
                activo: formData.activo
            };

            if (editingId) {
                response = await axios.put(
                    `${API_BASE_URL}/desafios-semanales/${editingId}`,
                    dataToSend,
                    axiosConfig
                );
                showNotification("Desafío actualizado con éxito", "success");
            } else {
                response = await axios.post(
                    `${API_BASE_URL}/desafios-semanales`,
                    dataToSend,
                    axiosConfig
                );
                showNotification("Nuevo desafío creado con éxito", "success");
            }

            // Reset form and fetch updated list
            resetForm();
            fetchDesafios();

        } catch (err) {
            console.error("Error saving desafio:", err);

            let errorMessage = "Error al guardar el desafío";
            if (err.response) {
                switch (err.response.status) {
                    case 400:
                        errorMessage = "Datos inválidos. Revisa la información ingresada.";
                        break;
                    case 401:
                        errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
                        break;
                    case 403:
                        errorMessage = "No tienes permisos para realizar esta acción.";
                        break;
                    default:
                        errorMessage = `Error del servidor: ${err.response.status}`;
                }
            }

            showNotification(errorMessage, "error");
        }
    };

    const deleteDesafio = async (id) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este desafío?")) {
            return;
        }

        try {
            const axiosConfig = createAxiosConfig();
            await axios.delete(
                `${API_BASE_URL}/desafios-semanales/${id}`,
                axiosConfig
            );

            showNotification("Desafío eliminado con éxito", "success");
            fetchDesafios();
        } catch (err) {
            console.error("Error deleting desafio:", err);

            let errorMessage = "Error al eliminar el desafío";
            if (err.response) {
                switch (err.response.status) {
                    case 401:
                        errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
                        break;
                    case 403:
                        errorMessage = "No tienes permisos para eliminar desafíos.";
                        break;
                    case 404:
                        errorMessage = "El desafío no existe o ya fue eliminado.";
                        break;
                    default:
                        errorMessage = `Error del servidor: ${err.response.status}`;
                }
            }

            showNotification(errorMessage, "error");
        }
    };

    const editDesafio = (desafio) => {
        setFormData({
            descripcion: desafio.descripcion,
            valorMonedas: desafio.valorMonedas,
            activo: desafio.activo
        });
        setEditingId(desafio.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({
            descripcion: "",
            valorMonedas: 100,
            activo: true
        });
        setEditingId(null);
        setShowForm(false);
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    const showNotification = (message, type) => {
        setNotification({
            show: true,
            message,
            type
        });

        setTimeout(() => {
            setNotification({
                show: false,
                message: "",
                type: "success"
            });
        }, 5000);
    };

    // Show loading state
    if (loading && !collapsed) {
        return (
            <div className="admin-challenges-section">
                <div className="admin-challenges-header">
                    <h2>Administrar Desafíos Semanales</h2>
                    <button className="collapse-button" onClick={toggleCollapse}>
                        <Minimize size={18} />
                    </button>
                </div>
                <div className="loading-challenges">
                    <div className="spinner-small"></div>
                    <p>Cargando desafíos...</p>
                </div>
            </div>
        );
    }

    // Show collapsed state
    if (collapsed) {
        return (
            <div className="admin-challenges-section admin-collapsed">
                <div className="admin-challenges-header">
                    <h2>Administrar Desafíos Semanales</h2>
                    <button className="collapse-button" onClick={toggleCollapse}>
                        <Maximize size={18} />
                    </button>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="admin-challenges-section">
                <div className="admin-challenges-header">
                    <h2>Administrar Desafíos Semanales</h2>
                    <button className="collapse-button" onClick={toggleCollapse}>
                        <Minimize size={18} />
                    </button>
                </div>
                <div className="error-challenges">
                    <AlertCircle size={24} />
                    <p>{error}</p>
                    <button
                        className="retry-button"
                        onClick={() => {
                            setError(null);
                            fetchDesafios();
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-challenges-section">
            <div className="admin-challenges-header">
                <h2>Administrar Desafíos Semanales</h2>
                <div className="header-buttons">
                    {!showForm && (
                        <button
                            className="new-challenge-button"
                            onClick={() => setShowForm(true)}
                        >
                            <Plus size={16} />
                            Nuevo Desafío
                        </button>
                    )}
                    <button className="collapse-button" onClick={toggleCollapse}>
                        <Minimize size={18} />
                    </button>
                </div>
            </div>

            {/* Notification */}
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.type === "success" ? (
                        <Check size={18} />
                    ) : (
                        <AlertCircle size={18} />
                    )}
                    <span>{notification.message}</span>
                    <button
                        className="notification-close"
                        onClick={() => setNotification({ ...notification, show: false })}
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Form for creating/editing */}
            {showForm && (
                <div className="challenge-form-container">
                    <form onSubmit={handleSubmit} className="challenge-form">
                        <div className="form-header">
                            <h3>{editingId ? "Editar Desafío" : "Crear Nuevo Desafío"}</h3>
                            <button
                                type="button"
                                className="close-form-button"
                                onClick={resetForm}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="form-group">
                            <label htmlFor="descripcion">
                                Descripción: <span className="required">*</span>
                            </label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                required
                                maxLength={500}
                                placeholder="Ej: Corre 5km en menos de 30 minutos"
                                rows={3}
                            />
                            <small className="form-hint">
                                {formData.descripcion.length}/500 caracteres
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="valorMonedas">
                                Valor en Monedas: <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                id="valorMonedas"
                                name="valorMonedas"
                                min="1"
                                max="1000"
                                step="1"
                                value={formData.valorMonedas}
                                onChange={handleInputChange}
                                required
                            />
                            <small className="form-hint">Entre 1 y 1000 monedas</small>
                        </div>

                        <div className="form-group">
                            <label>Estado:</label>
                            <div className="status-toggle-wrapper">
                                <button
                                    type="button"
                                    className={`status-toggle-btn ${formData.activo ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, activo: true})}
                                >
                                    <Check size={16} className="status-icon" />
                                    Activo
                                </button>
                                <button
                                    type="button"
                                    className={`status-toggle-btn ${!formData.activo ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, activo: false})}
                                >
                                    <X size={16} className="status-icon" />
                                    Inactivo
                                </button>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={resetForm}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="save-button"
                                disabled={!formData.descripcion.trim()}
                            >
                                <Save size={16} />
                                {editingId ? "Actualizar" : "Guardar"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List of challenges */}
            <div className="admin-challenges-list">
                {desafios.length === 0 ? (
                    <div className="no-challenges">
                        <Award size={48} className="no-challenges-icon" />
                        <h3>No hay desafíos disponibles</h3>
                        <p>Crea el primer desafío semanal para comenzar.</p>
                        <button
                            className="create-first-challenge-btn"
                            onClick={() => setShowForm(true)}
                        >
                            <Plus size={16} />
                            Crear Primer Desafío
                        </button>
                    </div>
                ) : (
                    desafios.map(desafio => (
                        <div key={desafio.id} className={`admin-challenge-card ${!desafio.activo ? 'inactive' : ''}`}>
                            <div className="challenge-card-header" onClick={() => toggleExpand(desafio.id)}>
                                <div className="challenge-title-section">
                                    <Award className={`award-icon ${!desafio.activo ? 'inactive' : ''}`} size={24} />
                                    <div className="challenge-title-info">
                                        <h3>{desafio.descripcion}</h3>
                                        <span className="challenge-value">
                                            {desafio.valorMonedas} moneda{desafio.valorMonedas !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className="challenge-status-actions">
                                    <span className={`status-badge ${desafio.activo ? 'active' : 'inactive'}`}>
                                        {desafio.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                    <div className="expand-icon">
                                        {expandedId === desafio.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                            </div>

                            {expandedId === desafio.id && (
                                <div className="challenge-actions">
                                    <button
                                        className="edit-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            editDesafio(desafio);
                                        }}
                                    >
                                        <Edit size={16} />
                                        Editar
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteDesafio(desafio.id);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                        Eliminar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminDesafioSemanales;