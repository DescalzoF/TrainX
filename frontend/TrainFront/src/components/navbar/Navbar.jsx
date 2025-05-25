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

// Import shop assets
import avatar1 from '../../assets/shop/avatars/avatar1.png';
import avatar2 from '../../assets/shop/avatars/avatar2.png';

import banner1 from '../../assets/shop/banners/banner1.png';
import banner2 from '../../assets/shop/banners/banner2.png';
import banner3 from '../../assets/shop/banners/banner3.png';

import emblem1 from '../../assets/shop/emblems/emblem1.png';
import emblem2 from '../../assets/shop/emblems/emblem2.png';
import emblem3 from '../../assets/shop/emblems/emblem3.png';

function Navbar() {
    const navigate = useNavigate();
    const { isLoggedIn, currentUser, logout, getCurrentCaminoFitnessId, hasChosenCaminoFitness } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [userCoins, setUserCoins] = useState(0);
    const [activeShopItems, setActiveShopItems] = useState({});
    const dropdownRef = useRef(null);
    const coinPollingIntervalRef = useRef(null);
    const isDefaultProfilePicture = useRef(false);

    // Asset mappings for shop items
    const shopAssetMappings = {
        PROFILE_PICTURE: {
            avatar1, avatar2
        },
        BANNER: {
            banner1, banner2, banner3
        },
        EMBLEM: {
            emblem1, emblem2, emblem3
        }
    };

    const fetchActiveShopItems = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !isLoggedIn) {
                return;
            }

            const response = await fetch('http://localhost:8080/api/shop/active-items', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Active shop items:', data); // Debug log
                setActiveShopItems(data);

                // Update profile picture if user has an active profile picture from shop
                if (data.PROFILE_PICTURE) {
                    const activeProfilePicture = shopAssetMappings.PROFILE_PICTURE[data.PROFILE_PICTURE];
                    if (activeProfilePicture) {
                        setProfilePicture(activeProfilePicture);
                        localStorage.setItem('profilePicture', activeProfilePicture);
                        isDefaultProfilePicture.current = false;
                        console.log('Set active profile picture:', activeProfilePicture); // Debug log
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching active shop items:', error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !isLoggedIn) {
                console.error('No token found or user not logged in');
                return;
            }

            // First fetch active shop items
            await fetchActiveShopItems();

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

                // Only update profile picture from profile data if no active shop item exists
                if (!activeShopItems.PROFILE_PICTURE && profileData.userPhoto) {
                    setProfilePicture(profileData.userPhoto);
                    localStorage.setItem('profilePicture', profileData.userPhoto);
                    isDefaultProfilePicture.current = false;
                } else if (!activeShopItems.PROFILE_PICTURE && !profileData.userPhoto) {
                    isDefaultProfilePicture.current = true;
                    setProfilePicture(null);
                }
            } else {
                console.error('Failed to fetch user profile:', profileResponse.status);
                fetchUserCoins();
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            fetchUserCoins();
        }
    };

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
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        if (isLoggedIn) {
            fetchUserProfile();
            coinPollingIntervalRef.current = setInterval(() => {
                fetchUserProfile();
            }, 10000);
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (coinPollingIntervalRef.current) {
                clearInterval(coinPollingIntervalRef.current);
            }
        };
    }, [isLoggedIn, currentUser]);

    useEffect(() => {
        if (isLoggedIn) {
            fetchUserProfile();
            if (!coinPollingIntervalRef.current) {
                coinPollingIntervalRef.current = setInterval(() => {
                    fetchUserProfile();
                }, 10000);
            }
        } else {
            if (coinPollingIntervalRef.current) {
                clearInterval(coinPollingIntervalRef.current);
                coinPollingIntervalRef.current = null;
            }
            setUserCoins(0);
            setProfilePicture(null);
            setActiveShopItems({});
            isDefaultProfilePicture.current = true;
        }
    }, [isLoggedIn]);

    useEffect(() => {
        const handleCoinUpdate = () => {
            fetchUserProfile();
        };

        const handleProfileUpdate = () => {
            fetchUserProfile();
        };

        const handleShopItemUpdate = () => {
            // Fetch both active items and profile to ensure sync
            fetchActiveShopItems().then(() => {
                fetchUserProfile();
            });
        };

        window.addEventListener('coinsUpdated', handleCoinUpdate);
        window.addEventListener('profilePictureUpdated', handleProfileUpdate);
        window.addEventListener('shopItemActivated', handleShopItemUpdate);
        window.addEventListener('userLoggedIn', fetchUserProfile);

        return () => {
            window.removeEventListener('coinsUpdated', handleCoinUpdate);
            window.removeEventListener('profilePictureUpdated', handleProfileUpdate);
            window.removeEventListener('shopItemActivated', handleShopItemUpdate);
            window.removeEventListener('userLoggedIn', fetchUserProfile);
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
        if (coinPollingIntervalRef.current) {
            clearInterval(coinPollingIntervalRef.current);
            coinPollingIntervalRef.current = null;
        }

        await logout();
        setProfilePicture(null);
        setUserCoins(0);
        setActiveShopItems({});
        isDefaultProfilePicture.current = true;
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

            if (path === '/progress' || path.startsWith('/leaderboard') || path === '/challenges'|| path === '/duelos'|| path === '/challenges') {
                if (!hasChosenCaminoFitness()) {
                    return;
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

    const handleProfileImageError = () => {
        console.log("Profile image failed to load");
        if (!isDefaultProfilePicture.current) {
            setProfilePicture(null);
            localStorage.removeItem('profilePicture');
            isDefaultProfilePicture.current = true;
        }
    };

    // Get active items with proper fallbacks
    const activeBanner = activeShopItems.BANNER ? shopAssetMappings.BANNER[activeShopItems.BANNER] : null;
    const activeEmblem = activeShopItems.EMBLEM ? shopAssetMappings.EMBLEM[activeShopItems.EMBLEM] : null;
    const activeProfilePicture = activeShopItems.PROFILE_PICTURE ? shopAssetMappings.PROFILE_PICTURE[activeShopItems.PROFILE_PICTURE] : null;

    // Determine which profile picture to show (shop item takes precedence)
    const displayProfilePicture = activeProfilePicture || profilePicture;

    return (
        <div className="navbar-container">
            <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
                <div className="navbar-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                    <img src={logoImage} alt="TrainX Logo" className="navbar-logo-image" />
                    <span className="navbar-brand">TrainX</span>
                </div>

                <div className="navbar-links">
                    <a href="" onClick={(e) => handleNavClick(e, '/camino')} className="navbar-nav-link">Camino Fitness</a>
                    <a href="" onClick={(e) => handleNavClick(e, '/gyms')} className="navbar-nav-link">Gimnasios</a>
                    <a href="" onClick={(e) => handleNavClick(e, '/progress')} className="navbar-nav-link">Progreso</a>
                    <div className="navbar-dropdown">
                        <a className="navbar-nav-link">
                            Leaderboard <MdOutlineArrowDropDown size={30}/>
                        </a>
                        <div className="navbar-dropdown-content">
                            <a href="" onClick={(e) => handleNavClick(e, '/leaderboard-general')}>General</a>
                            <a href="" onClick={(e) => handleNavClick(e, '/leaderboard-por-nivel')}>Por nivel</a>
                            <a href="" onClick={(e) => handleNavClick(e, '/leaderboard-semanal')}>Semanal</a>
                        </div>
                    </div>
                    <a href="" onClick={(e) => handleNavClick(e, '/challenges')} className="navbar-nav-link">Duelos Semanales</a>
                    <a href="" onClick={(e) => handleNavClick(e, '/forum')} className="navbar-nav-link">Foro</a>
                </div>

                <div className="navbar-menu">
                    {isLoggedIn ? (
                        <div className="navbar-profile-container">
                            <span className="navbar-welcome-text">Hola, {currentUser?.username}</span>
                            <div className="navbar-profile-dropdown" ref={dropdownRef}>
                                <button className="navbar-profile-button" onClick={toggleProfileDropdown}>
                                    <div className="navbar-profile-display">
                                        {/* Banner at the bottom */}
                                        {activeBanner && (
                                            <img
                                                src={activeBanner}
                                                alt="Banner"
                                                className="navbar-profile-banner"
                                            />
                                        )}

                                        {/* Profile picture or default icon */}
                                        <div className="navbar-profile-picture-container">
                                            {displayProfilePicture ? (
                                                <img
                                                    src={displayProfilePicture}
                                                    alt="Profile"
                                                    className="navbar-profile-image"
                                                    onError={handleProfileImageError}
                                                />
                                            ) : (
                                                <CgProfile size={34} />
                                            )}
                                        </div>

                                        {/* Emblem surrounding the profile picture */}
                                        {activeEmblem && (
                                            <img
                                                src={activeEmblem}
                                                alt="Emblem"
                                                className="navbar-profile-emblem"
                                            />
                                        )}
                                    </div>
                                </button>
                                {profileDropdownOpen && (
                                    <div className="navbar-profile-dropdown-content">
                                        <a href="#" onClick={(e) => handleNavClick(e, '/perfil')}>
                                            Perfil <CgProfile size={20} style={{ marginLeft: '3px' }} />
                                        </a>
                                        <a href="#" onClick={(e) => handleNavClick(e, '/tienda')} className="navbar-coins-link">
                                            Tienda {userCoins} <FaCoins size={18} style={{ marginLeft: '3px', color: '#FFD700' }} />
                                        </a>
                                        <a href="#" onClick={handleLogout}>
                                            Logout <IoIosLogOut size={20} style={{ marginLeft: '3px' }}/>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="navbar-auth-buttons">
                            <button onClick={() => navigate('/login')} className="navbar-login-button">Login</button>
                            <button onClick={() => navigate('/signup')} className="navbar-signup-button">Sign Up</button>
                        </div>
                    )}
                </div>

                {isLoggedIn && <XPBar />}
            </nav>
        </div>
    );
}

export default Navbar;