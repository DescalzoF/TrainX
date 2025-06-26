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
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const navigate = useNavigate();
    const { login, getCurrentCaminoFitnessId } = useAuth();

    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    useEffect(() => {
        const loadGoogleScript = () => {
            if (window.google) {
                initializeGoogleSignIn();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogleSignIn;
            script.onerror = () => {
                console.error('Failed to load Google Sign-In script');
                setError('Error al cargar Google Sign-In');
            };
            document.head.appendChild(script);
        };

        const initializeGoogleSignIn = () => {
            if (window.google && GOOGLE_CLIENT_ID) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: GOOGLE_CLIENT_ID,
                        callback: handleGoogleSignIn,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                        use_fedcm_for_prompt: false, // Disable FedCM
                        ux_mode: 'popup',
                        context: 'signin'
                    });
                } catch (error) {
                    console.error('Google Sign-In initialization error:', error);
                    setError('Error al configurar Google Sign-In');
                }
            } else {
                console.error('Google Client ID not found or Google script not loaded');
            }
        };

        if (GOOGLE_CLIENT_ID) {
            loadGoogleScript();
        } else {
            console.error('Google Client ID not configured');
        }
    }, [GOOGLE_CLIENT_ID]);

    const handleGoogleSignIn = async (response) => {
        setIsGoogleLoading(true);
        setError('');

        try {
            const googleResponse = await axios.post('http://localhost:8080/api/auth/google', {
                token: response.credential
            });

            const data = googleResponse.data;

            if (googleResponse.status === 200) {
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
                throw new Error(data.message || 'Google Sign-In failed');
            }

        } catch (err) {
            console.error("Google Sign-In error:", err);
            setError(err.response?.data?.message || 'Error al iniciar sesión con Google');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleGoogleButtonClick = () => {
        if (!window.google) {
            setError('Google Sign-In no está disponible. Por favor, recarga la página.');
            return;
        }

        if (!GOOGLE_CLIENT_ID) {
            setError('Configuración de Google Sign-In no encontrada.');
            return;
        }

        try {
            // Clear any previous errors
            setError('');

            // Use prompt method with better error handling
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // If prompt doesn't show, try renderButton approach
                    console.log('Prompt not displayed, reason:', notification.getNotDisplayedReason());
                    renderGoogleButton();
                }
            });
        } catch (error) {
            console.error('Google Sign-In prompt error:', error);
            setError('Error al mostrar el inicio de sesión de Google');
        }
    };

    const renderGoogleButton = () => {
        // Create a temporary container for the Google button
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.top = '-1000px';
        document.body.appendChild(tempContainer);

        try {
            window.google.accounts.id.renderButton(tempContainer, {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                shape: 'rectangular',
                text: 'signin_with',
                logo_alignment: 'left'
            });

            // Trigger click on the rendered button
            setTimeout(() => {
                const googleButton = tempContainer.querySelector('div[role="button"]');
                if (googleButton) {
                    googleButton.click();
                }
                document.body.removeChild(tempContainer);
            }, 100);
        } catch (error) {
            console.error('Error rendering Google button:', error);
            document.body.removeChild(tempContainer);
            setError('Error al cargar el botón de Google');
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
                    {error && <div className="login-error-message">{error}</div>}

                    <div className="login-form-group">
                        <label htmlFor="username">Usuario</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="login-form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading || isGoogleLoading}>
                        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>

                    <div className="login-divider">
                        o
                    </div>

                    <button
                        type="button"
                        className="login-google-button"
                        onClick={handleGoogleButtonClick}
                        disabled={isLoading || isGoogleLoading}
                    >
                        <svg className="login-google-icon" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        {isGoogleLoading ? 'Iniciando con Google...' : 'Continuar con Google'}
                    </button>

                    <div className="login-forgot-password-link">
                        <p onClick={() => navigate('/forgot-password')}>¿Olvidaste tu contraseña?</p>
                    </div>
                    <div className="login-create-account-link">
                        <p onClick={() => navigate('/signup')}>Crear una cuenta</p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;