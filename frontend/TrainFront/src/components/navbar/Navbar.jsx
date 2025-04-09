import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { FaCoins } from "react-icons/fa6";
import './Navbar.css';
import logoImage from '../../assets/trainx-logo.png';
import { MdOutlineArrowDropDown } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";

function Navbar({ isLoggedIn, username, onLogout }) {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const dropdownRef = useRef(null); // Create a ref for the dropdown

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        // Load profile picture from localStorage if available
        const savedProfilePicture = localStorage.getItem('profilePicture');
        if (savedProfilePicture) {
            setProfilePicture(savedProfilePicture);
        }

        // Listen for profile picture updates
        const handleProfilePictureUpdate = () => {
            const updatedProfilePicture = localStorage.getItem('profilePicture');
            setProfilePicture(updatedProfilePicture);
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('profilePictureUpdated', handleProfilePictureUpdate);

        // Cleanup scroll and custom event listeners
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('profilePictureUpdated', handleProfilePictureUpdate);
        };
    }, []);

    // Handle clicks outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If dropdownRef is set and the clicked target is not inside the dropdown ref
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
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

    // Handler for nav links that redirects to home if not logged in
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
