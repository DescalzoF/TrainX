import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Perfil.css';
import { FaEye, FaEyeSlash, FaTrashAlt, FaExclamationTriangle, FaUser, FaUserEdit, FaSave,
    FaTimes, FaCoins, FaTrophy, FaWeight, FaRulerVertical, FaPhone, FaTransgender,
    FaMapMarkerAlt, FaEnvelope, FaLock, FaGlobe } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

function Perfil() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        surname: '',
        password: '',
        weight: 0,
        height: 0,
        address: '',
        phoneNumber: '',
        age: '',
        sex: 'male',
        userPhoto: null,
        isPublic: true,
        role: 'USER'
    });
    const [originalData, setOriginalData] = useState({});
    const [previewImage, setPreviewImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8080/api/profile/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = response.data;
                console.log("Fetched user data:", data);

                // Explicitly extract each field to ensure they're properly set
                const formattedData = {
                    username: data.username || '',
                    surname: data.surname || '',
                    email: data.email || '',
                    password: '',  // Password field should be empty for security
                    weight: data.weight || 0,
                    height: data.height || 0,
                    address: data.address || '',
                    phoneNumber: data.phoneNumber || '',
                    age: data.age || '',
                    sex: data.sex || 'male',
                    userPhoto: data.userPhoto || null,
                    isPublic: data.isPublic !== undefined ? data.isPublic : true,
                    role: data.role || 'USER',
                    coins: data.coins || 0,
                    xpFitness: data.xpFitnessEntity?.xpTotal || 0
                };

                // Debug log to verify the formatted data
                console.log("Formatted data:", formattedData);

                setUserData(formattedData);
                setOriginalData(formattedData);

                // Handle profile picture
                if (data.userPhoto && data.userPhoto !== 'default.jpg') {
                    // For base64 images
                    if (data.userPhoto.startsWith('data:')) {
                        setPreviewImage(data.userPhoto);
                    } else {
                        // Set a default path or handle as needed
                        setPreviewImage(`http://localhost:8080/images/${data.userPhoto}`);
                    }
                }

                // Add a small delay before showing content
                setTimeout(() => {
                    setFadeIn(true);
                    setIsLoading(false);
                }, 300);

            } catch (err) {
                console.error('Error fetching user data:', err);
                setError("No se pudo cargar los datos del usuario. Por favor, inténtelo de nuevo más tarde.");
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [navigate, currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevData => ({
            ...prevData,
            [name]: name === 'height' || name === 'weight' ? Number(value) : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {  // 5MB limit
            setError('La imagen no puede superar los 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result;
            setPreviewImage(base64String);
            setUserData(prevData => ({
                ...prevData,
                userPhoto: base64String  // Store the base64 string directly
            }));
        };
        reader.readAsDataURL(file);  // This converts to base64
    };

    const handleEdit = (e) => {
        if (e) e.preventDefault();
        console.log("handleEdit called", new Date().toISOString());
        setIsEditing(true);
        setSuccessMessage(''); // Clear any existing messages
        setError(null);
    };

    const handleCancel = () => {
        setUserData(originalData);
        setIsEditing(false);
        setError(null);
        setSuccessMessage('');

        // Reset preview image to original
        if (originalData.userPhoto && originalData.userPhoto !== 'default.jpg') {
            if (originalData.userPhoto.startsWith('data:')) {
                setPreviewImage(originalData.userPhoto);
            } else {
                setPreviewImage(`http://localhost:8080/images/${originalData.userPhoto}`);
            }
        } else {
            setPreviewImage(null);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const togglePublicProfile = () => {
        setUserData(prevData => ({
            ...prevData,
            isPublic: !prevData.isPublic
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            // Create a copy of the data to send
            const updatedFields = { ...userData };

            // Remove password if it's empty
            if (!updatedFields.password) {
                delete updatedFields.password;
            }

            console.log("Sending updated data:", updatedFields);

            // Use the profile update endpoint
            const response = await axios.put('http://localhost:8080/api/profile/update', updatedFields, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                // Update original data with new values but reset password field
                const updatedData = { ...response.data, password: '' };
                setOriginalData(updatedData);
                setUserData(updatedData);

                // Save profile picture to localStorage if needed
                if (userData.userPhoto && userData.userPhoto !== originalData.userPhoto) {
                    localStorage.setItem('profilePicture', previewImage);
                    // Notify other components that profile picture has been updated
                    window.dispatchEvent(new Event('profilePictureUpdated'));
                }

                setIsEditing(false);
                setSuccessMessage('¡Perfil actualizado con éxito!');

                // Scroll to top to show success message
                window.scrollTo(0, 0);
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || "No se pudo actualizar el perfil. Por favor, inténtelo de nuevo más tarde.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== userData.username) {
            setError("El nombre de usuario no coincide. No se ha eliminado la cuenta.");
            return;
        }

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            // Use the profile delete endpoint
            const response = await axios.delete('http://localhost:8080/api/profile/delete', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                // Logout and redirect to home instead of login
                await logout();
                navigate('/');
            } else {
                throw new Error('Error al eliminar la cuenta');
            }
        } catch (err) {
            console.error('Error deleting account:', err);
            setError(err.response?.data?.message || "No se pudo eliminar la cuenta. Por favor, inténtelo de nuevo más tarde.");
        } finally {
            setIsLoading(false);
            setShowDeleteModal(false);
        }
    };

    const openDeleteModal = () => {
        setShowDeleteModal(true);
        setDeleteConfirmation('');
        setError(null);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeleteConfirmation('');
    };

    const calculateBMI = () => {
        if (userData.weight && userData.height) {
            const heightInMeters = userData.height / 100;
            const bmi = (userData.weight / (heightInMeters * heightInMeters)).toFixed(1);
            return bmi;
        }
        return "N/A";
    };

    const getBMICategory = (bmi) => {
        if (bmi === "N/A") return { text: "No disponible", color: "#777" };

        const numBMI = parseFloat(bmi);
        if (numBMI < 18.5) return { text: "Bajo peso", color: "#f0ad4e" };
        if (numBMI < 25) return { text: "Peso normal", color: "#5cb85c" };
        if (numBMI < 30) return { text: "Sobrepeso", color: "#f0ad4e" };
        return { text: "Obesidad", color: "#d9534f" };
    };

    const bmi = calculateBMI();
    const bmiCategory = getBMICategory(bmi);

    if (isLoading && !userData.username) {

        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Cargando datos de usuario...</p>
            </div>
        );
    }

    return (
        <div className={`perfil-container ${fadeIn ? 'fade-in' : ''}`}>

            {error && <div className="error-message"><FaExclamationTriangle /> {error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <form onSubmit={handleSubmit} className="perfil-form">
                <div className="profile-sections-container">
                    <div className="profile-left-section">
                        <div className="profile-picture-section">
                            <div className="profile-picture-container">
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="Profile"
                                        className="profile-picture-preview"
                                    />
                                ) : (
                                    <div className="profile-picture-placeholder">
                                        <FaUser size={50} color="#ddd" />
                                        <span>No hay foto de perfil</span>
                                    </div>
                                )}
                            </div>
                            {isEditing && (
                                <div className="profile-picture-upload">
                                    <label htmlFor="profile-picture" className="upload-button">
                                        Subir foto
                                    </label>
                                    <input
                                        type="file"
                                        id="profile-picture"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    <p className="upload-info">Formato: JPG, PNG. Máximo: 5MB</p>
                                </div>
                            )}
                        </div>

                        {/* BMI Card */}
                        <div className="bmi-card">
                            <div className="bmi-info">
                                <div className="bmi-data-row">
                                    <FaWeight /> <span>{userData.weight} kg</span>
                                </div>
                                <div className="bmi-data-row" style={{fontWeight: 'bold'}}>
                                    BMI: {bmi} ({bmiCategory.text})
                                </div>
                                <div className="bmi-data-row">
                                    <FaRulerVertical /> <span>{userData.height} cm</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-right-section">
                        <div className="form-section-title">
                            <h2>Información Personal</h2>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label htmlFor="username"><FaUser className="field-icon" /> Nombre</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={userData.username || ''}
                                    disabled={true}
                                    className=""
                                />
                            </div>

                            <div className="form-group half">
                                <label htmlFor="surname"><FaUser className="field-icon" /> Apellido</label>
                                <input
                                    type="text"
                                    id="surname"
                                    name="surname"
                                    value={userData.surname || ''}
                                    disabled={true}
                                    className=""
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email"><FaEnvelope className="field-icon" /> Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={userData.email || ''}
                                disabled
                            />
                        </div>

                        <div className="form-section-title">
                            <h2>Datos Físicos</h2>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label htmlFor="weight"><FaWeight className="field-icon" /> Peso (kg)</label>
                                <input
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    value={userData.weight || 0}
                                    onChange={handleChange}
                                    min="30"
                                    max="300"
                                    step="0.1"
                                    disabled={!isEditing}
                                    className={isEditing ? "editable" : ""}
                                />
                            </div>

                            <div className="form-group half">
                                <label htmlFor="height"><FaRulerVertical className="field-icon" /> Altura (cm)</label>
                                <input
                                    type="number"
                                    id="height"
                                    name="height"
                                    value={userData.height || 0}
                                    min="100"
                                    max="250"
                                    step="1"
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={isEditing ? "editable" : ""}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label htmlFor="age"><FaUser className="field-icon" /> Edad</label>
                                <input
                                    type="text"
                                    id="age"
                                    name="age"
                                    value={userData.age || ''}
                                    min="10"
                                    max="100"
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={isEditing ? "editable" : ""}
                                />
                            </div>

                            <div className="form-group half">
                                <label htmlFor="sex"><FaTransgender className="field-icon" /> Sexo</label>
                                <select
                                    id="sex"
                                    name="sex"
                                    value={userData.sex}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={isEditing ? "editable" : ""}
                                >
                                    <option value="male">Hombre</option>
                                    <option value="female">Mujer</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-section-title">
                            <h2>Contacto</h2>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label htmlFor="address"><FaMapMarkerAlt className="field-icon" /> Domicilio</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={userData.address || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={isEditing ? "editable" : ""}
                                />
                            </div>

                            <div className="form-group half">
                                <label htmlFor="phoneNumber"><FaPhone className="field-icon" /> Número de teléfono</label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={userData.phoneNumber || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={isEditing ? "editable" : ""}
                                />
                            </div>
                        </div>

                        <div className="form-section-title">
                            <h2>Preferencias</h2>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label htmlFor="isPublic" className="switch-label">
                                    <FaGlobe className="field-icon" /> Perfil público
                                    {isEditing ? (
                                        <div className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                id="isPublic"
                                                checked={userData.isPublic}
                                                onChange={togglePublicProfile}
                                                disabled={!isEditing}
                                                className="toggle-input"
                                            />
                                            <span className="toggle-slider"></span>
                                            <span className="toggle-label">{userData.isPublic ? 'Sí' : 'No'}</span>
                                        </div>
                                    ) : (
                                        <span className="static-value">{userData.isPublic ? 'Sí' : 'No'}</span>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    {isEditing ? (
                        <>
                            <button type="submit" className="btn-submit">
                                <FaSave /> Guardar cambios
                            </button>
                            <button type="button" className="btn-cancel" onClick={handleCancel}>
                                <FaTimes /> Cancelar
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="btn-edit"
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent any form submission
                                    handleEdit();
                                    console.log("Edit button clicked", new Date().toISOString());
                                }}
                            >
                                <FaUserEdit /> Editar perfil
                            </button>
                            <button type="button" className="btn-delete" onClick={openDeleteModal}>
                                <FaTrashAlt /> Eliminar cuenta
                            </button>
                        </>
                    )}
                </div>
            </form>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3><FaExclamationTriangle /> Eliminar cuenta</h3>
                        </div>
                        <div className="modal-body">
                            <p>Esta acción eliminará permanentemente tu cuenta y todos los datos asociados. Esta acción no se puede deshacer.</p>
                            <p>Para confirmar, escribe tu nombre de usuario: <strong>{userData.username}</strong></p>
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                className="delete-confirmation-input"
                                placeholder="Introduce tu nombre de usuario"
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-cancel" onClick={closeDeleteModal}>Cancelar</button>
                            <button
                                type="button"
                                className="btn-delete-confirm"
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmation !== userData.username}
                            >
                                Eliminar cuenta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Perfil;