import { useState, useEffect } from 'react';
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
    const [googleLoading, setGoogleLoading] = useState(false);
    const navigate = useNavigate();
    const { login, getCurrentCaminoFitnessId } = useAuth();

    // Initialize Google Sign-In
    useEffect(() => {
        const initializeGoogleSignIn = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                    callback: handleGoogleSignIn,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });

                // Render the Google Sign-In button
                window.google.accounts.id.renderButton(
                    document.getElementById("google-signin-button"),
                    {
                        theme: "outline",
                        size: "large",
                        width: "100%",
                        text: "signin_with",
                        shape: "rectangular",
                    }
                );
            }
        };

        // Load Google Sign-In script
        if (!window.google) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogleSignIn;
            document.head.appendChild(script);
        } else {
            initializeGoogleSignIn();
        }
    }, []);

    const handleGoogleSignIn = async (response) => {
        setGoogleLoading(true);
        setError('');

        try {
            const result = await axios.post('http://localhost:8080/api/auth/google', {
                token: response.credential
            });

            const data = result.data;

            if (result.status === 200) {
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
                throw new Error(data.message || 'Google sign-in failed');
            }

        } catch (err) {
            console.error("Google sign-in error:", err);
            setError(err.response?.data?.message || 'Error al iniciar sesión con Google');
        } finally {
            setGoogleLoading(false);
        }
    };

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

                    <div className="login-separator">
                        <span>o</span>
                    </div>

                    <div className="google-signin-container">
                        <div id="google-signin-button" className={googleLoading ? 'loading' : ''}></div>
                        {googleLoading && <div className="google-loading-text">Iniciando sesión con Google...</div>}
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