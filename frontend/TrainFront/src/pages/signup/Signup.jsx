import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import LogoTitle from "../../components/logotitle/LogoTitle.jsx";
import axios from 'axios';

function Signup() {
    const [formData, setFormData] = useState({
        username: '',
        surname: '',
        password: '',
        confirmPassword: '',
        age: '',
        phoneNumber: '',
        height: '',
        weight: '',
        userPhoto: 'default-profile.jpg',
        address: '',
        email: '',
        sex: 'male',
        isPublic: true,
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: name === 'height' || name === 'weight' ? Number(value) : value
        }));
    };

    // Toggle for the isPublic field
    const handleToggle = () => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            isPublic: !prevFormData.isPublic
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        // Removing confirmPassword before sending to backend
        const userData = { ...formData };
        delete userData.confirmPassword;

        // Log formData being sent
        console.log("FormData being sent:", userData);

        try {
            const response = await axios.post('http://localhost:8080/api/users', userData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log("Response:", response);  // Log response for debugging

            if (response.status !== 201) {
                throw new Error(response.data.message || 'Registration failed');
            }

            navigate('/login');
        } catch (err) {
            if (err.response) {
                // Server responded with an error
                console.error('Server error:', err.response.data);
                setError(err.response.data.message || 'Registration failed');
            } else if (err.request) {
                // Request was made but no response was received
                console.error('No response from server:', err.request);
                setError('No response from server. Please try again.');
            } else {
                // Something else caused the error
                console.error('Error message:', err.message);
                setError('An unexpected error occurred during registration');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="logo-wrapper">
                <LogoTitle />
            </div>
            <div className="signup-form-wrapper">
                <h2>Crea tu cuenta TrainX</h2>
                <p>Únete a nuestra comunidad fitness y comienza tu camino.</p>

                <form onSubmit={handleSubmit} className="signup-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="username">Nombre*</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="surname">Apellido*</label>
                            <input
                                type="text"
                                id="surname"
                                name="surname"
                                value={formData.surname}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email*</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Contraseña*</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Contraseña*</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="age">Edad*</label>
                            <input
                                type="text"
                                id="age"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phoneNumber">Número de teléfono*</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Domicilio*</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="height">Altura (cm)*</label>
                            <input
                                type="number"
                                id="height"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="weight">Peso (kg)*</label>
                            <input
                                type="number"
                                id="weight"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="sex">Sexo*</label>
                            <select
                                id="sex"
                                name="sex"
                                value={formData.sex}
                                onChange={handleChange}
                                required
                            >
                                <option value="male">Hombre</option>
                                <option value="female">Mujer</option>
                                <option value="other">Otro Sexo</option>
                            </select>
                        </div>

                        {/* ------------- Public/Private Toggle ------------- */}
                        <div className="form-group slider-group">
                            <label>Visibilidad de la cuenta</label>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={formData.isPublic}
                                    onChange={handleToggle}
                                />
                                <span className="slider round"></span>
                            </label>
                            {/* The toggle text will match the style of your other labels */}
                            <span>{formData.isPublic ? "Pública" : "Privada"}</span>
                        </div>
                    </div>

                    <div className="form-buttons">
                        <button type="submit" className="signup-button" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                        <button type="button" className="back-button" onClick={() => navigate('/login')}>
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Signup;
