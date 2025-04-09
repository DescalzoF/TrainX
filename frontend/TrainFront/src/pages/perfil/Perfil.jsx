import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Perfil.css';

function Perfil() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        surname: '',
        contrasena: '',
        weight: '',
        height: '',
        address: '',
        phoneNumber: '',
        age: '',
        sex: '',
        profilePicture: null
    });
    const [originalData, setOriginalData] = useState({});
    const [previewImage, setPreviewImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        const sessionId = localStorage.getItem('sessionId');
        const username = localStorage.getItem('username');

        if (!sessionId || !username) {
            navigate('/login');
            return;
        }

        // Fetch user data
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch('http://localhost:8080/api/users/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Session-ID': sessionId
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();

                const formattedData = {
                    username: data.username || username,
                    surname: data.surname || '',
                    email: data.email || '',
                    contrasena: '',  // Password field should be empty for security
                    weight: data.weight || '',
                    height: data.height || '',
                    address: data.address || '',
                    phoneNumber: data.phoneNumber || '',
                    age: data.age || '',
                    sex: data.sex || 'male',
                    profilePicture: data.userPhoto || null
                };

                setUserData(formattedData);
                setOriginalData(formattedData);

                // If user already has a profile picture, set it as preview
                if (data.userPhoto && data.userPhoto !== 'default-profile.jpg') {
                    setPreviewImage(data.userPhoto);
                }
            } catch (err) {
                setError("No se pudo cargar los datos del usuario. Por favor, inténtelo de nuevo más tarde.");
                console.error('Error fetching user data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

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
                profilePicture: reader.result
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setUserData(originalData);
        setIsEditing(false);
        setError(null);
        setSuccessMessage('');

        // Reset preview image to original
        if (originalData.profilePicture && originalData.profilePicture !== 'default-profile.jpg') {
            setPreviewImage(originalData.profilePicture);
        } else {
            setPreviewImage(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');

        try {
            setIsLoading(true);
            const sessionId = localStorage.getItem('sessionId');

            // Only send changed fields
            const updatedFields = {};
            for (const key in userData) {
                if (userData[key] !== originalData[key] && key !== 'contrasena') {
                    updatedFields[key] = userData[key];
                }
            }

            // Add password only if it was changed
            if (userData.contrasena) {
                updatedFields.password = userData.contrasena;
            }

            const response = await fetch('http://localhost:8080/api/users/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Session-ID': sessionId
                },
                body: JSON.stringify(updatedFields)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            // Update original data
            setOriginalData({...userData});

            // Save profile picture to localStorage for Navbar if needed
            if (userData.profilePicture) {
                localStorage.setItem('profilePicture', userData.profilePicture);
                window.dispatchEvent(new Event('profilePictureUpdated'));
            }

            setIsEditing(false);
            setSuccessMessage('Perfil actualizado con éxito');
        } catch (err) {
            setError("No se pudo actualizar el perfil. Por favor, inténtelo de nuevo más tarde.");
            console.error('Error updating profile:', err);
        } finally {
            setIsLoading(false);
        }
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
                    <div className="form-group">
                        <label htmlFor="contrasena">Contraseña</label>
                        <input
                            type="password"
                            id="contrasena"
                            name="contrasena"
                            value={userData.contrasena}
                            onChange={handleChange}
                            placeholder="Introduce nueva contraseña"
                        />
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
                            type="number"
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

                <div className="form-group">
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

                <div className="form-group">
                    <label htmlFor="phoneNumber">Número de teléfono</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={userData.phoneNumber}
                        onChange={handleChange}
                        pattern="[0-9]{9,15}"
                        title="El número debe tener entre 9 y 15 dígitos"
                        disabled={!isEditing}
                    />
                </div>

                <div className="form-actions">
                    {isEditing ? (
                        <>
                            <button type="submit" className="save-button" disabled={isLoading}>
                                {isLoading ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="save-button"
                            onClick={handleEdit}
                        >
                            Editar perfil
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default Perfil;