import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { FaCoins } from "react-icons/fa6";
import './Navbar.css';
import logoImage from '../../assets/trainx-logo.png';
import {MdOutlineArrowDropDown} from "react-icons/md";
import {IoIosLogOut} from "react-icons/io";

function Navbar({ isLoggedIn, username, onLogout }) {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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

    const toggleProfileDropdown = () => {
        setProfileDropdownOpen(!profileDropdownOpen);
    };

    // New handler for nav links that redirects to home if not logged in
    const handleNavClick = (e, path) => {
        if (!isLoggedIn) {
            e.preventDefault();
            navigate('/');
        } else {
            navigate(path);
        }
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-logo" onClick={() => navigate('/')}>
                <img src={logoImage} alt="TrainX Logo" className="logo-image" />
                <span className="navbar-brand">TrainX</span>
            </div>

            <div className="navbar-links">
                <a href="#" onClick={(e) => handleNavClick(e, '/camino')} className="nav-link">Camino Fitness</a>
                <a href="#" onClick={(e) => handleNavClick(e, '/gyms')} className="nav-link">Gimnasios</a>
                <a href="#" onClick={(e) => handleNavClick(e, '/progress')} className="nav-link">Progreso</a>
                <div className="dropdown">
                    <a href="#" onClick={(e) => handleNavClick(e, '/leaderboard')} className="nav-link">
                        Leaderboard <MdOutlineArrowDropDown size={30}/>
                    </a>
                    <div className="dropdown-content">
                        <a href="#" onClick={(e) => handleNavClick(e, '/leaderboard/General')}>General</a>
                        <a href="#" onClick={(e) => handleNavClick(e, '/leaderboard/Por nivel')}>Por nivel</a>
                        <a href="#" onClick={(e) => handleNavClick(e, '/leaderboard/Semanal')}>Semanal</a>
                    </div>
                </div>
                <a href="#" onClick={(e) => handleNavClick(e, '/challenges')} className="nav-link">Duelos Semanales</a>
                <a href="#" onClick={(e) => handleNavClick(e, '/forum')} className="nav-link">Foro</a>
            </div>

            <div className="navbar-menu">
                {isLoggedIn ? (
                    <div className="profile-container">
                        <span className="welcome-text">Hola, {username}</span>
                        <div className="profile-dropdown">
                            <button className="profile-button" onClick={toggleProfileDropdown}>
                                <CgProfile size={34} />
                            </button>
                            {profileDropdownOpen && (
                                <div className="profile-dropdown-content">
                                    <a href="#" onClick={(e) => handleNavClick(e, '/perfil')} style={{ display: 'flex', alignItems: 'center' }}>
                                        Perfil <CgProfile size={20} style={{ marginLeft: '55px' }} />
                                    </a>
                                    <a href="#" onClick={(e) => handleNavClick(e, '/tienda')} style={{ display: 'flex', alignItems: 'center' }}>
                                        Monedas <FaCoins size={20} style={{ marginLeft: '20px' }} />
                                    </a>
                                    <a href="#" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center' }}>
                                        Logout <IoIosLogOut size={20} style={{ marginLeft: '40px' }}/>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
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