
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
    const { login } = useAuth();

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
                // The JWT token should be in the response
                login({
                    token: data.token,
                    username: data.username
                });

                // Redirect user to the homepage or dashboard
                navigate('/dashboard');
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
