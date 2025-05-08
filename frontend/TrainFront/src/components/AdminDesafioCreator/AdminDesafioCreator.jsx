import { useState } from "react";
import axios from "axios";
import { Plus, Save, X, AlertCircle } from "lucide-react";
import "./AdminDesafioCreator.css";

const AdminDesafioCreator = ({ isAdmin, adminActive, onDesafioCreated }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        descripcion: "",
        valorMonedas: 50,
        activo: true,
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // If not admin or admin mode not active, don't render
    if (!isAdmin || !adminActive) return null;

    const API_BASE_URL = "http://localhost:8080/api";

    // Get authentication token from storage
    const getAuthToken = () => {
        const token = localStorage.getItem("jwtToken") || localStorage.getItem("token");

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : name === "valorMonedas" ? Number(value) : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const axiosConfig = createAxiosConfig();

            const response = await axios.post(
                `${API_BASE_URL}/desafios-semanales`,
                formData,
                axiosConfig
            );

            setSuccess("¡Desafío creado exitosamente!");
            setFormData({
                descripcion: "",
                valorMonedas: 50,
                activo: true,
            });

            // Notify parent component
            if (onDesafioCreated) {
                onDesafioCreated(response.data);
            }

            // Close form after 2 seconds
            setTimeout(() => {
                setSuccess(null);
                setIsCreating(false);
            }, 2000);

        } catch (err) {
            console.error("Error creating challenge:", err);

            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Error al crear el desafío. Verifica tus permisos de administrador.");
            }
        }
    };

    return (
        <div className="admin-desafio-creator">
            {!isCreating ? (
                <button
                    className="create-desafio-btn"
                    onClick={() => setIsCreating(true)}
                >
                    <Plus size={16} />
                    <span>Crear nuevo desafío</span>
                </button>
            ) : (
                <div className="desafio-form-container">
                    <div className="desafio-form-header">
                        <h3>Crear nuevo desafío semanal</h3>
                        <button
                            className="close-form-btn"
                            onClick={() => setIsCreating(false)}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {error && (
                        <div className="form-error">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="form-success">
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="descripcion">Descripción del desafío:</label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Ej: Realiza 3 series de 10 flexiones"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="valorMonedas">Valor en monedas:</label>
                            <input
                                type="number"
                                id="valorMonedas"
                                name="valorMonedas"
                                min="10"
                                max="1000"
                                value={formData.valorMonedas}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    name="activo"
                                    checked={formData.activo}
                                    onChange={handleChange}
                                />
                                Desafío activo
                            </label>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-desafio-btn">
                                <Save size={16} />
                                <span>Guardar desafío</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminDesafioCreator;