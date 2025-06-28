import { useState, useEffect } from 'react';
import './ResetPassword.css';
import LogoTitle from "../../../components/logotitle/LogoTitle.jsx";
import axios from 'axios';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState('');
    const [tokenValid, setTokenValid] = useState(null); // null = checking, true = valid, false = invalid
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            validateToken(tokenFromUrl);
        } else {
            setTokenValid(false);
            setError('Token de recuperación no válido');
        }
    }, [searchParams]);

    // ✅ Validar token al cargar la página
    const validateToken = async (tokenToValidate) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/auth/validate-reset-token?token=${tokenToValidate}`);
            if (response.status === 200) {
                setTokenValid(true);
            }
        } catch (err) {
            setTokenValid(false);
            if (err.response?.status === 400) {
                setError('El enlace de recuperación ha expirado o no es válido');
            } else {
                setError('Error al validar el enlace de recuperación');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/auth/reset-password', {
                token: token,
                newPassword: newPassword,
            });

            if (response.status === 200) {
                navigate('/login', {
                    state: { message: 'Contraseña restablecida exitosamente' }
                });
            }
        } catch (err) {
            console.error("Reset password error:", err);
            if (err.response?.status === 400) {
                setError('El enlace de recuperación ha expirado o no es válido');
            } else {
                setError(err.response?.data?.message || 'Error al restablecer la contraseña');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Mostrar estado de carga mientras valida
    if (tokenValid === null) {
        return (
            <div className="reset-password-container">
                <div className="reset-password-form-wrapper">
                    <LogoTitle />
                    <div className="loading-message">
                        <p>Validando enlace de recuperación...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Mostrar mensaje de error si token inválido/expirado
    if (tokenValid === false) {
        return (
            <div className="reset-password-container">
                <div className="reset-password-form-wrapper">
                    <LogoTitle />
                    <div className="error-container">
                        <h2>⚠️ Enlace No Válido</h2>
                        <div className="error-message">{error}</div>
                        <p>Los enlaces de recuperación expiran después de 10 minutos por motivos de seguridad.</p>
                        <Link to="/forgot-password" className="retry-button">
                            Solicitar Nuevo Enlace
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Mostrar formulario si token es válido
    return (
        <div className="reset-password-container">
            <div className="reset-password-form-wrapper">
                <LogoTitle />
                <h2>Restablecer Contraseña</h2>
                <p>Introduce tu nueva contraseña</p>

                <form onSubmit={handleSubmit} className="reset-password-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="newPassword">Nueva Contraseña</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="reset-password-button" disabled={isLoading}>
                        {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;