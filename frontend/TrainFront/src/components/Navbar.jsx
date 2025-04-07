import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logoImage from '../assets/trainx-logo.png'; // You'll need to put the logo in your assets folder

function Navbar({ isLoggedIn, username, onLogout }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const sessionId = localStorage.getItem('sessionId');

            await fetch('http://localhost:8080/api/users/logout', {  // Updated to match API path
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId }),
            });

            // Clear local storage
            localStorage.removeItem('sessionId');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');

            // Call the onLogout callback to update app state
            onLogout();

            // Redirect to home page
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const goToHome = () => {
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo" onClick={goToHome}>
                <img src={logoImage} alt="TrainX Logo" className="logo-image" />
                <span className="navbar-brand">TrainX</span>
            </div>

            <div className="navbar-links">
                <a href="/" className="nav-link">Camino Fitness</a>
                <a href="/gyms" className="nav-link">Gimnasios</a>
                <a href="/progress" className="nav-link">Progreso</a>
                <div className="dropdown">
                    <a href="/leaderboard" className="nav-link">Leaderboard ▼</a>
                    <div className="dropdown-content">
                        <a href="/leaderboard/weekly">Weekly</a>
                        <a href="/leaderboard/monthly">Monthly</a>
                        <a href="/leaderboard/alltime">All Time</a>
                    </div>
                </div>
                <a href="/challenges" className="nav-link">Duelos Semanales</a>
                <a href="/forum" className="nav-link">Foro</a>
            </div>

            <div className="navbar-menu">
                {isLoggedIn ? (
                    <>
                        <span className="welcome-text">Welcome, {username}</span>
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </>
                ) : (
                    <div className="auth-buttons">
                        <button onClick={() => navigate('/login')} className="login-button">Login</button>
                        <button onClick={() => navigate('/signup')} className="signup-button">Sign Up</button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;