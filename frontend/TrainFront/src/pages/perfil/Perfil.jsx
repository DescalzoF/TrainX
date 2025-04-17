import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Perfil.css';
import { FaEye, FaEyeSlash, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

function Perfil() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        surname: '',
        password: '',
        weight: '',
        height: '',
        address: '',
        phoneNumber: '',
        age: '',
        sex: '',
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

                const response = await axios.get('http://localhost:8080/api/users/me/currentUser', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = response.data;
                console.log("Fetched user data:", data);

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
                    isPublic: data.isPublic || true,
                    role: data.role || 'USER',
                    coins: data.coins || 0,
                    xpFitness: data.xpFitness || 0
                };

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
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError("No se pudo cargar los datos del usuario. Por favor, inténtelo de nuevo más tarde.");
            } finally {
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
            setPreviewImage(reader.result);
            setUserData(prevData => ({
                ...prevData,
                userPhoto: reader.result
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setSuccessMessage('');
        setError(null);
    };

    const handleCancel = () => {
        setUserData(originalData);
        setIsEditing(false);
        setError(null);
        setSuccessMessage('');

        // Reset preview image to original
        if (originalData.userPhoto && originalData.userPhoto !== 'default.jpg') {
            setPreviewImage(originalData.userPhoto);
        } else {
            setPreviewImage(null);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            // Preserve fields that shouldn't be changed directly
            const updatedFields = {
                ...userData,
                // Ensure these fields are not lost during update
                coins: originalData.coins,
                xpFitness: originalData.xpFitness,
                role: originalData.role
            };

            // Remove password if it's empty
            if (!updatedFields.password) {
                delete updatedFields.password;
            }

            // Use the profile update endpoint
            const response = await axios.put('http://localhost:8080/api/profile/update', updatedFields, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to update profile');
            }

            // Update original data with new values
            setOriginalData({...userData, password: ''});
            setUserData({...userData, password: ''});

            // Save profile picture to localStorage if needed
            if (userData.userPhoto && userData.userPhoto !== originalData.userPhoto) {
                localStorage.setItem('profilePicture', previewImage);
                // Notify other components that profile picture has been updated
                window.dispatchEvent(new Event('profilePictureUpdated'));
            }

            setIsEditing(false);
            setSuccessMessage('Perfil actualizado con éxito');

            // Scroll to top to show success message
            window.scrollTo(0, 0);
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

            const response = await axios.delete('http://localhost:8080/api/users/delete', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                // Logout and redirect to home
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

    if (isLoading && !userData.username) {
        return <div className="loading">Cargando datos de usuario...</div>;
    }

    return (
        <div className="perfil-container">
            <h1>Mi Perfil</h1>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <form onSubmit={handleSubmit} className="perfil-form">
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
                            <p className="upload-info">Formato: JPG, PNG. Tamaño máximo: 5MB</p>
                        </div>
                    )}
                </div>

                <div className="form-row">
                    <div className="form-group half">
                        <label htmlFor="username">Nombre</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={userData.username}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-group half">
                        <label htmlFor="surname">Apellido</label>
                        <input
                            type="text"
                            id="surname"
                            name="surname"
                            value={userData.surname}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                        disabled  // Email should not be editable
                    />
                </div>

                {isEditing && (
                    <div className="form-group password-input-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={userData.password}
                                onChange={handleChange}
                                placeholder="Introduce nueva contraseña"
                            />
                            <button
                                type="button"
                                className="toggle-password-visibility"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        <p className="field-info">Dejar en blanco para mantener la actual</p>
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group half">
                        <label htmlFor="weight">Peso (kg)</label>
                        <input
                            type="number"
                            id="weight"
                            name="weight"
                            value={userData.weight}
                            onChange={handleChange}
                            min="30"
                            max="300"
                            step="0.1"
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-group half">
                        <label htmlFor="height">Altura (cm)</label>
                        <input
                            type="number"
                            id="height"
                            name="height"
                            value={userData.height}
                            onChange={handleChange}
                            min="100"
                            max="250"
                            step="1"
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group half">
                        <label htmlFor="age">Edad</label>
                        <input
                            type="text"
                            id="age"
                            name="age"
                            value={userData.age}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-group half">
                        <label htmlFor="sex">Sexo</label>
                        <select
                            id="sex"
                            name="sex"
                            value={userData.sex}
                            onChange={handleChange}
                            disabled={!isEditing}
                        >
                            <option value="male">Hombre</option>
                            <option value="female">Mujer</option>
                            <option value="other">Otro</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group half">
                        <label htmlFor="address">Domicilio</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={userData.address}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-group half">
                        <label htmlFor="phoneNumber">Número de teléfono</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={userData.phoneNumber}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group half">
                        <label htmlFor="isPublic">Perfil público</label>
                        <select
                            id="isPublic"
                            name="isPublic"
                            value={userData.isPublic.toString()}
                            onChange={(e) => setUserData({...userData, isPublic: e.target.value === 'true'})}
                            disabled={!isEditing}
                        >
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                </div>

                {/* Read-only fields to display */}
                <div className="form-row">
                    <div className="form-group half">
                        <label htmlFor="coins">Monedas</label>
                        <input
                            type="number"
                            id="coins"
                            name="coins"
                            value={userData.coins || 0}
                            disabled={true}
                        />
                    </div>

                    <div className="form-group half">
                        <label htmlFor="xpFitness">XP Fitness</label>
                        <input
                            type="number"
                            id="xpFitness"
                            name="xpFitness"
                            value={userData.xpFitness || 0}
                            disabled={true}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    {isEditing ? (
                        <>
                            <button type="submit" className="btn-submit">Guardar cambios</button>
                            <button type="button" className="btn-cancel" onClick={handleCancel}>Cancelar</button>
                        </>
                    ) : (
                        <>
                            <button type="button" className="btn-edit" onClick={handleEdit}>Editar perfil</button>
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