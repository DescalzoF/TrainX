import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import LogoTitle from "../../components/logotitle/LogoTitle.jsx";
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login, getCurrentCaminoFitnessId } = useAuth(); // Obtengo la función y estado del contexto

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                username,
                password
            });

            const data = response.data;

            if (response.status === 200) {
                // El JWT token debe estar en la respuesta
                await login({
                    token: data.token,
                    username: data.username
                });

                // Esperamos un poco hasta que el estado se haya actualizado
                const caminoFitnessId = getCurrentCaminoFitnessId(); // Utilizo el estado del contexto

                if (!caminoFitnessId) {
                    // Si el usuario no tiene un camino, lo mando a la página para elegir el camino
                    navigate('/camino');
                } else {
                    // Si ya tiene un camino asignado, lo mando a la página de ejercicio
                    navigate(`/camino/${caminoFitnessId}/level/principiante`);
                }
            } else {
                throw new Error(data.message || 'Login failed');
            }

        } catch (err) {
            console.error("Login error:", err);
            setError(err.response?.data?.message || 'Usuario o contraseña incorrectos');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="logo-wrapper">
                <LogoTitle />
            </div>
            <div className="login-form-wrapper">
                <h2>Bienvenidos a TrainX</h2>
                <p>Arranca ahora!</p>

                <form onSubmit={handleSubmit} className="login-form">
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
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                    <div className="forgot-password-link">
                        <p onClick={() => navigate('/forgot-password')}>¿Olvidaste tu contraseña?</p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
