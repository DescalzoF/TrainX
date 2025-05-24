import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { FaCoins } from "react-icons/fa6";
import './Navbar.css';
import logoImage from '../../assets/trainx-logo.png';
import { MdOutlineArrowDropDown } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { useAuth } from '../../contexts/AuthContext.jsx';
import XPBar from '../XPBar/XPBar';

function Navbar() {
    const navigate = useNavigate();
    const { isLoggedIn, currentUser, logout, getCurrentCaminoFitnessId, hasChosenCaminoFitness } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [userCoins, setUserCoins] = useState(0);
    const dropdownRef = useRef(null);
    // Add a ref for the interval to clean it up properly
    const coinPollingIntervalRef = useRef(null);

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

        // Fetch user coins immediately and set up polling if logged in
        if (isLoggedIn) {
            fetchUserCoins();

            // Set up polling interval for continuous coin updates - every 10 seconds
            coinPollingIntervalRef.current = setInterval(() => {
                fetchUserCoins();
            }, 10000); // Adjust the interval as needed (10000ms = 10 seconds)
        }

        // Clean up all event listeners and intervals
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('profilePictureUpdated', handleProfileUpdate);

            // Clear the interval when component unmounts
            if (coinPollingIntervalRef.current) {
                clearInterval(coinPollingIntervalRef.current);
            }
        };
    }, [isLoggedIn, currentUser]);

    // Custom event listener for coin updates from other components
    useEffect(() => {
        const handleCoinUpdate = () => {
            fetchUserCoins();
        };

        // Listen for a custom event that can be triggered from anywhere when coins change
        window.addEventListener('coinsUpdated', handleCoinUpdate);

        return () => {
            window.removeEventListener('coinsUpdated', handleCoinUpdate);
        };
    }, []);

    const fetchUserCoins = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found for coin fetch');
                return;
            }

            const response = await fetch(`http://localhost:8080/api/users/current/coins`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUserCoins(data.coins || 0);
            } else {
                console.error('Failed to fetch user coins:', response.status);
            }
        } catch (error) {
            console.error('Error fetching user coins:', error);
        }
    };

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
        // Clear the coin polling interval when logging out
        if (coinPollingIntervalRef.current) {
            clearInterval(coinPollingIntervalRef.current);
        }

        await logout();
        // Explicitly navigate to home page with replace to prevent back navigation
        navigate('/', { replace: true });
    };

    const toggleProfileDropdown = () => {
        setProfileDropdownOpen(prev => !prev);
    };

    const handleNavClick = (e, path) => {
        e.preventDefault();
        if (!isLoggedIn) {
            navigate('/');
        } else {

            if (path === '/camino') {
                if (hasChosenCaminoFitness()) {
                    const caminoId = getCurrentCaminoFitnessId();
                    navigate(`/camino/${caminoId}/level/principiante`);
                }
                return;
            }

            if (path === '/progress' || path.startsWith('/leaderboard') || path === '/challenges') {
                if (!hasChosenCaminoFitness()) {
                    return; // Stay on the same page if camino not chosen
                }
            }

            navigate(path);
        }
    };

    const handleLogoClick = () => {
        if (isLoggedIn) {
            if (hasChosenCaminoFitness()) {
                const caminoId = getCurrentCaminoFitnessId();
                navigate(`/camino/${caminoId}/level/principiante`);
                return;
            }
        }
        navigate('/');
    };

    return (
        <div className="navbar-container">
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
                        <a className="nav-link">
                            Leaderboard <MdOutlineArrowDropDown size={30}/>
                        </a>
                        <div className="dropdown-content">
                            <a href="" onClick={(e) => handleNavClick(e, '/leaderboard-general')}>General</a>
                            <a href="" onClick={(e) => handleNavClick(e, '/leaderboard-por-nivel')}>Por nivel</a>
                            <a href="" onClick={(e) => handleNavClick(e, '/leaderboard-semanal')}>Semanal</a>
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
                                        <a href="#" onClick={(e) => handleNavClick(e, '/tienda')} className="coins-link">
                                            Monedas {userCoins} <FaCoins size={18} style={{ marginLeft: '8px', color: '#FFD700' }} />
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

                {/* Add XPBar component here */}
                {isLoggedIn && <XPBar />}
            </nav>
        </div>
    );
}

export default Navbar;