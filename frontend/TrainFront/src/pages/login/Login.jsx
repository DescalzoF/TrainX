import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import LogoTitle from "../../components/logotitle/LogoTitle.jsx";
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { GoogleLogin } from '@react-oauth/google';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login, getCurrentCaminoFitnessId } = useAuth();

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
                await login({
                    token: data.token,
                    username: data.username
                });

                const caminoFitnessId = getCurrentCaminoFitnessId();

                if (!caminoFitnessId) {
                    navigate('/camino');
                } else {
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

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        setIsLoading(true);

        try {
            // Decode the JWT token to get user info
            const decodedToken = JSON.parse(atob(credentialResponse.credential.split('.')[1]));

            // Send the credential to your backend
            const response = await axios.post('http://localhost:8080/api/auth/google', {
                credential: credentialResponse.credential,
                email: decodedToken.email,
                given_name: decodedToken.given_name,
                family_name: decodedToken.family_name
            });

            const data = response.data;

            if (response.status === 200) {
                await login({
                    token: data.token,
                    username: data.username
                });

                const caminoFitnessId = data.caminoFitnessId;

                if (!caminoFitnessId) {
                    navigate('/camino');
                } else {
                    navigate(`/camino/${caminoFitnessId}/level/principiante`);
                }
            } else {
                throw new Error(data.message || 'Google login failed');
            }

        } catch (err) {
            console.error("Google login error:", err);
            setError(err.response?.data?.message || 'Error al iniciar sesión con Google');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Error al iniciar sesión con Google');
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

                    <div className="divider">
                        <span>o</span>
                    </div>

                    <div className="google-login-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            text="continue_with"
                            theme="outline"
                            size="large"
                            width="100%"
                        />
                    </div>

                    <div className="forgot-password-link">
                        <p onClick={() => navigate('/forgot-password')}>¿Olvidaste tu contraseña?</p>
                    </div>
                    <div className="create-account-link">
                        <p onClick={() => navigate('/signup')}>Crear una cuenta</p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;