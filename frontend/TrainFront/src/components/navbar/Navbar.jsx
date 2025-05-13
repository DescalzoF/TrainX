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
    // Add a ref to track if we're using the default profile picture
    const isDefaultProfilePicture = useRef(false);

    // Fetch user profile data (including coins and profile picture)
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !isLoggedIn) {
                console.error('No token found or user not logged in');
                return;
            }

            // Fetch complete profile data from the profile endpoint
            const profileResponse = await fetch(`http://localhost:8080/api/profile/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (profileResponse.ok) {
                const profileData = await profileResponse.json();

                // Update coins from profile data
                if (profileData.coins !== undefined) {
                    setUserCoins(profileData.coins || 0);
                }

                // Update profile picture if available
                if (profileData.userPhoto) {
                    setProfilePicture(profileData.userPhoto);
                    localStorage.setItem('profilePicture', profileData.userPhoto);
                    isDefaultProfilePicture.current = false;
                } else {
                    // If no photo is provided from the server, mark as using default
                    isDefaultProfilePicture.current = true;
                }
            } else {
                console.error('Failed to fetch user profile:', profileResponse.status);

                // Fallback to coins-only endpoint if profile endpoint fails
                fetchUserCoins();
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);

            // Fallback to coins-only endpoint if profile endpoint fails
            fetchUserCoins();
        }
    };

    // Original coins-only fetch as fallback
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

    // Effect for scroll detection and initial profile data loading
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Check for stored profile picture immediately on component mount
        const savedProfilePicture = localStorage.getItem('profilePicture');
        if (savedProfilePicture) {
            setProfilePicture(savedProfilePicture);
            isDefaultProfilePicture.current = false;
        } else {
            isDefaultProfilePicture.current = true;
        }

        // Set up polling for user data if logged in
        if (isLoggedIn) {
            // Fetch profile data immediately on login
            fetchUserProfile();

            // Set up polling interval for continuous updates - every 10 seconds
            coinPollingIntervalRef.current = setInterval(() => {
                fetchUserProfile();
            }, 10000); // 10 seconds
        }

        // Clean up all event listeners and intervals
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (coinPollingIntervalRef.current) {
                clearInterval(coinPollingIntervalRef.current);
            }
        };
    }, [isLoggedIn, currentUser]);

    // Additional effect to handle login state changes and refetch profile when needed
    useEffect(() => {
        if (isLoggedIn) {
            // When login state changes to true, fetch profile data
            fetchUserProfile();

            // Set up interval if not already set
            if (!coinPollingIntervalRef.current) {
                coinPollingIntervalRef.current = setInterval(() => {
                    fetchUserProfile();
                }, 10000);
            }
        } else {
            // Clear interval when logged out
            if (coinPollingIntervalRef.current) {
                clearInterval(coinPollingIntervalRef.current);
                coinPollingIntervalRef.current = null;
            }

            // Reset user data when logged out
            setUserCoins(0);
            setProfilePicture(null);
            isDefaultProfilePicture.current = true;
        }
    }, [isLoggedIn]);

    // Custom event listeners for external updates to profile data
    useEffect(() => {
        // Handler for coin updates
        const handleCoinUpdate = () => {
            fetchUserProfile();
        };

        // Handler for profile picture updates
        const handleProfileUpdate = () => {
            const updatedPicture = localStorage.getItem('profilePicture');
            if (updatedPicture) {
                setProfilePicture(updatedPicture);
                isDefaultProfilePicture.current = false;
            } else {
                // If no picture in localStorage, we're using default, don't refetch
                isDefaultProfilePicture.current = true;
            }
        };

        // Listen for custom events from other components
        window.addEventListener('coinsUpdated', handleCoinUpdate);
        window.addEventListener('profilePictureUpdated', handleProfileUpdate);
        window.addEventListener('userLoggedIn', fetchUserProfile);

        return () => {
            window.removeEventListener('coinsUpdated', handleCoinUpdate);
            window.removeEventListener('profilePictureUpdated', handleProfileUpdate);
            window.removeEventListener('userLoggedIn', fetchUserProfile);
        };
    }, []);

    // Effect for handling clicks outside the dropdown
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
        // Clear the polling interval when logging out
        if (coinPollingIntervalRef.current) {
            clearInterval(coinPollingIntervalRef.current);
            coinPollingIntervalRef.current = null;
        }

        await logout();
        // Reset local state
        setProfilePicture(null);
        setUserCoins(0);
        isDefaultProfilePicture.current = true;
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

            if (path === '/progress') {
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

    // Handle image loading errors - with improved logic
    const handleProfileImageError = () => {
        console.log("Profile image failed to load");

        // Only clear profile picture from state and local storage if it wasn't already the default
        if (!isDefaultProfilePicture.current) {
            setProfilePicture(null);
            localStorage.removeItem('profilePicture');
            isDefaultProfilePicture.current = true;
            // We don't need to refetch if we're now using the default icon
        }
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
                                            onError={handleProfileImageError}
                                        />
                                    ) : (
                                        <CgProfile size={34} />
                                    )}
                                </button>
                                {profileDropdownOpen && (
                                    <div className="profile-dropdown-content">
                                        <a href="#" onClick={(e) => handleNavClick(e, '/perfil')}>
                                            Perfil <CgProfile size={20} style={{ marginLeft: '3px' }} />
                                        </a>
                                        <a href="#" onClick={(e) => handleNavClick(e, '/tienda')} className="coins-link">
                                            Monedas {userCoins} <FaCoins size={18} style={{ marginLeft: '3px', color: '#FFD700' }} />
                                        </a>
                                        <a href="#" onClick={handleLogout}>
                                            Logout <IoIosLogOut size={20} style={{ marginLeft: '3px' }}/>
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