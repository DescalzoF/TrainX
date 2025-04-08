import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logoImage from '../../assets/trainx-logo.png';

function Navbar({ isLoggedIn, username, onLogout }) {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        const sessionId = localStorage.getItem('sessionId');
        await fetch('http://localhost:8080/api/users/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        });
        localStorage.clear();
        onLogout();
        navigate('/');
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-logo" onClick={() => navigate('/')}>
                <img src={logoImage} alt="TrainX Logo" className="logo-image" />
                <span className="navbar-brand">TrainX</span>
            </div>

            <div className="navbar-links">
                <a href="/camino" className="nav-link">Camino Fitness</a>
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
                        <span className="welcome-text">Hi, {username}</span>
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
