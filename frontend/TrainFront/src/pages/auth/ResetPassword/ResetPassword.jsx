import { useState } from 'react';
import './ResetPassword.css'; // Estilos específicos para ResetPassword
import LogoTitle from "../../../components/logotitle/LogoTitle.jsx";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ResetPassword() {
    const [username, setUsername] = useState('');  // Estado para el username
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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
            // Hacemos la solicitud POST con el username y newPassword
            const response = await axios.post('http://localhost:8080/api/auth/reset-password', {
                username: username,   // Aquí se incluye el username
                newPassword: newPassword,
            });

            const data = response.data;

            if (response.status === 200) {
                // Redirigir a la página de login después de un cambio exitoso
                navigate('/login');
            } else {
                throw new Error(data.message || 'Error al restablecer la contraseña');
            }
        } catch (err) {
            console.error("Reset password error:", err);
            setError(err.response?.data?.message || 'Hubo un error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-form-wrapper">
                <LogoTitle />
                <h2>Restablecer Contraseña</h2>
                <p>Introduce tu nueva contraseña</p>

                <form onSubmit={handleSubmit} className="reset-password-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="username">Usuario</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} // Captura el username
                            required
                        />
                    </div>

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
                        {isLoading ? 'Cargando...' : 'Restablecer'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
