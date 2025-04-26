// Navbar.jsx - ensuring logo and path respect selectedCaminoId
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { FaCoins } from "react-icons/fa6";
import './Navbar.css';
import logoImage from '../../assets/trainx-logo.png';
import { MdOutlineArrowDropDown } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { useAuth } from '../../contexts/AuthContext.jsx';

function Navbar() {
    const navigate = useNavigate();
    const { isLoggedIn, currentUser, logout, getCurrentCaminoFitnessId } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        const savedProfilePicture = localStorage.getItem('profilePicture');
        if (savedProfilePicture) setProfilePicture(savedProfilePicture);

        const handleProfileUpdate = () => {
            const updatedPicture = localStorage.getItem('profilePicture');
            if (updatedPicture) setProfilePicture(updatedPicture);
        };
        window.addEventListener('profilePictureUpdated', handleProfileUpdate);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('profilePictureUpdated', handleProfileUpdate);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const toggleProfileDropdown = () => {
        setProfileDropdownOpen(prev => !prev);
    };

    const handleNavClick = (e, path) => {
        e.preventDefault();
        if (!isLoggedIn) {
            navigate('/');
        } else {
            // If path is '/camino', but user already has a camino, redirect to exercises
            if (path === '/camino') {
                const caminoId = getCurrentCaminoFitnessId();
                if (caminoId) {
                    return navigate(`/camino/${caminoId}/level/principiante`);
                }
            }
            navigate(path);
        }
    };

    const handleLogoClick = () => {
        if (isLoggedIn) {
            const caminoId = getCurrentCaminoFitnessId();
            if (caminoId) {
                return navigate(`/camino/${caminoId}/level/principiante`);
            }
        }
        navigate('/');
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                <img src={logoImage} alt="TrainX Logo" className="logo-image" />
                <span className="navbar-brand">TrainX</span>
            </div>

            <div className="navbar-links">
                <a href="" onClick={(e) => handleNavClick(e, '/camino')} className="nav-link">Camino Fitness</a>
                <a href="" onClick={(e) => handleNavClick(e, '/gyms')} className="nav-link">Gimnasios</a>
                <a href="" onClick={(e) => handleNavClick(e, '/progress')} className="nav-link">Progreso</a>
                <div className="dropdown">
                    <a href="" onClick={(e) => handleNavClick(e, '/leaderboard')} className="nav-link">
                        Leaderboard <MdOutlineArrowDropDown size={30}/>
                    </a>
                    <div className="dropdown-content">
                        <a href="#" onClick={(e) => handleNavClick(e, '/leaderboard/General')}>General</a>
                        <a href="#" onClick={(e) => handleNavClick(e, '/leaderboard/Por nivel')}>Por nivel</a>
                        <a href="#" onClick={(e) => handleNavClick(e, '/leaderboard/Semanal')}>Semanal</a>
                    </div>
                </div>
                <a href="" onClick={(e) => handleNavClick(e, '/challenges')} className="nav-link">Duelos Semanales</a>
                <a href="" onClick={(e) => handleNavClick(e, '/forum')} className="nav-link">Foro</a>
            </div>

            <div className="navbar-menu">
                {isLoggedIn ? (
                    <div className="profile-container">
                        <span className="welcome-text">Hola, {currentUser?.username}</span>
                        <div className="profile-dropdown" ref={dropdownRef}>
                            <button className="profile-button" onClick={toggleProfileDropdown}>
                                {profilePicture ? (
                                    <img
                                        src={profilePicture}
                                        alt="Profile"
                                        className="profile-image"
                                    />
                                ) : (
                                    <CgProfile size={34} />
                                )}
                            </button>
                            {profileDropdownOpen && (
                                <div className="profile-dropdown-content">
                                    <a href="#" onClick={(e) => handleNavClick(e, '/perfil')}>
                                        Perfil <CgProfile size={20} style={{ marginLeft: '8px' }} />
                                    </a>
                                    <a href="#" onClick={(e) => handleNavClick(e, '/tienda')}>
                                        Monedas <FaCoins size={20} style={{ marginLeft: '8px' }} />
                                    </a>
                                    <a href="#" onClick={handleLogout}>
                                        Logout <IoIosLogOut size={20} style={{ marginLeft: '8px' }}/>
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
