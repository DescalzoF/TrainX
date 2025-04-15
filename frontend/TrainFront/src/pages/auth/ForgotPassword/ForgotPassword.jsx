import { useState } from 'react';
import './ForgotPassword.css'; // Estilos específicos para ForgotPassword
import LogoTitle from "../../../components/logotitle/LogoTitle.jsx";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/auth/forgot-password', {
                username,
                email
            });

            const data = response.data;

            if (response.status === 200) {
                // Redirigir a la página de reset de contraseña
                navigate('/reset-password');
            } else {
                throw new Error(data.message || 'Error al recuperar la contraseña');
            }
        } catch (err) {
            console.error("Forgot password error:", err);
            setError(err.response?.data?.message || 'Username or email is incorrect');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-form-wrapper">
                <LogoTitle />
                <h2>Recuperar Contraseña</h2>
                <p>Introduce tu nombre de usuario y correo electrónico</p>

                <form onSubmit={handleSubmit} className="forgot-password-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="username">Usuario</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="forgot-password-button" disabled={isLoading}>
                        {isLoading ? 'Cargando...' : 'Enviar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;
