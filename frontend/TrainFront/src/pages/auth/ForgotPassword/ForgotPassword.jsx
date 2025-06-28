import { useState } from 'react';
import './ForgotPassword.css';
import LogoTitle from "../../../components/logotitle/LogoTitle.jsx";
import axios from 'axios';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/auth/forgot-password', {
                email
            });

            if (response.status === 200) {
                setMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
            }
        } catch (err) {
            console.error("Forgot password error:", err);
            setError(err.response?.data?.message || 'Error al enviar el correo de recuperación');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-form-wrapper">
                <LogoTitle />
                <h2>Recuperar Contraseña</h2>
                <p>Introduce tu correo electrónico para recibir un enlace de recuperación</p>

                <form onSubmit={handleSubmit} className="forgot-password-form">
                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}

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
                        {isLoading ? 'Enviando...' : 'Enviar Enlace'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;