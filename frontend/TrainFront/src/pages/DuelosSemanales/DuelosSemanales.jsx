import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './DuelosSemanales.css';
import BetDuelButton from '../../components/BetDuelButton/BetDuelButton.jsx';


const DuelosSemanales = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [pendingDuels, setPendingDuels] = useState([]);
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [pendingLoading, setPendingLoading] = useState(true);
    const [showUsers, setShowUsers] = useState(false);
    const [error, setError] = useState(null);
    const [searchingAnimation, setSearchingAnimation] = useState(false);
    const [pendingDuelsExpanded, setPendingDuelsExpanded] = useState(true);
    const [sentRequestsCount, setSentRequestsCount] = useState(0);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const toastTimeoutRef = useRef(null);

    // Fetch pending duel requests on component mount
    useEffect(() => {
        fetchPendingDuels();

        // Clear any toast timeout on unmount
        return () => {
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        };
    }, []);

    const showToast = (message, type = 'success') => {
        // Clear any existing timeout
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

        // Show the toast
        setToast({ show: true, message, type });

        // Set timeout to hide toast after 4 seconds
        toastTimeoutRef.current = setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 4000);
    };

    const fetchPendingDuels = async () => {
        setPendingLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/duels/pending', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Extract the pending duels list and request count
            setPendingDuels(response.data.pendingDuels || []);
            setPendingRequestsCount(response.data.pendingRequestsCount || 0);
        } catch (err) {
            console.error('Error fetching pending duels:', err);
        } finally {
            setPendingLoading(false);
        }
    };

    const togglePendingDuels = () => {
        setPendingDuelsExpanded(!pendingDuelsExpanded);
    };

    const handleAcceptDuel = async (duelId, challengerUsername, betAmount) => {
        setLoading(true);
        try {
            // First check if user has enough coins
            const userResponse = await axios.get('http://localhost:8080/api/users/current/coins', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const userCoins = userResponse.data.coins;

            // If user doesn't have enough coins, show error message and return
            if (userCoins < betAmount) {
                showToast(`Fondos insuficientes: Necesitas ${betAmount} monedas para aceptar este duelo.`, 'error');
                setLoading(false);
                return;
            }

            // If they have enough coins, proceed with accepting the duel
            const response = await axios.post(
                `http://localhost:8080/api/duels/${duelId}/accept`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            // Show success message
            showToast(`Has aceptado el desafío de ${challengerUsername}`, 'success');

            // Important: Wait longer to ensure backend processing is complete
            setTimeout(() => {
                // Use window.location instead of navigate for a full page reload and navigation
                window.location.href = '/duel-competition';
            }, 1000); // Increased to 1000ms (1 second)

        } catch (error) {
            console.error('Error accepting duel:', error);
            showToast('No se pudo aceptar el desafío. Inténtalo de nuevo.', 'error');
            setLoading(false);
        }
        // Note: We're not setting loading to false if successful because we're navigating away
    };

    const handleRejectDuel = async (duelId, challengerUsername) => {
        try {
            await axios.post(`http://localhost:8080/api/duels/${duelId}/reject`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Update pending duels list
            fetchPendingDuels();

            // Show rejection message with custom toast
            showToast(`Has rechazado el duelo con ${challengerUsername}`, 'info');
        } catch (err) {
            console.error('Error rejecting duel:', err);
            showToast('Error al rechazar el duelo', 'error');
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        setSearchingAnimation(true);

        try {
            // Simulate search delay for better UX
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await axios.get('http://localhost:8080/api/duels/users-same-level', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setUsers(response.data);
            setShowUsers(true);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Error al buscar usuarios. Inténtalo de nuevo más tarde.');
        } finally {
            setLoading(false);
            setSearchingAnimation(false);
        }
    };

    const handleDuelSent = () => {
        // Increment the sent requests counter
        setSentRequestsCount(prevCount => prevCount + 1);

        // Refresh pending duels list
        fetchPendingDuels();
    };

    // When clicking "Nueva búsqueda", show the pending duels again
    const handleNewSearch = () => {
        setShowUsers(false);
        setPendingDuelsExpanded(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha pendiente';

        try {
            // Parse the date string and preserve the timezone
            const date = new Date(dateString);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.error('Invalid date:', dateString);
                return 'Fecha inválida';
            }

            // Format with specific options to preserve the correct date
            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'UTC' // Try with UTC or remove this line to use local timezone
            });
        } catch (error) {
            console.error('Error formatting date:', error, dateString);
            return 'Error en fecha';
        }
    };

    return (
        <div className="weekly-duel">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`weekly-duel__toast weekly-duel__toast--${toast.type}`}>
                    <div className="weekly-duel__toast-icon">
                        {toast.type === 'success' && <i className="fa fa-check-circle"></i>}
                        {toast.type === 'error' && <i className="fa fa-exclamation-circle"></i>}
                        {toast.type === 'info' && <i className="fa fa-info-circle"></i>}
                    </div>
                    <div className="weekly-duel__toast-content">
                        <p>{toast.message}</p>
                    </div>
                    <button
                        className="weekly-duel__toast-close"
                        onClick={() => setToast(prev => ({ ...prev, show: false }))}
                    >
                        <i className="fa fa-times"></i>
                    </button>
                </div>
            )}

            <div className="weekly-duel__header">
                <h1>Duelos Semanales</h1>
                <p>Desafía a otros usuarios de tu mismo nivel y demuestra quién es el mejor</p>
            </div>

            {/* Pending Duels Section */}
            <div
                className={`weekly-duel__pending ${pendingDuelsExpanded ? 'weekly-duel__pending--expanded' : 'weekly-duel__pending--collapsed'}`}>
                <div className="weekly-duel__pending-title" onClick={togglePendingDuels}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <i className="fa fa-bell"></i>
                        <span>Solicitudes de Duelo Pendientes {pendingRequestsCount > 0 &&
                            <span style={{
                                background: '#e53e3e',
                                color: 'white',
                                borderRadius: '50%',
                                padding: '0px 8px',
                                fontSize: '0.8rem',
                                marginLeft: '8px'
                            }}>{pendingRequestsCount}</span>}
                        </span>
                    </div>
                    <i className={`fa fa-chevron-down weekly-duel__toggle-icon`}></i>
                </div>

                {pendingDuelsExpanded && (
                    pendingLoading ? (
                        <div className="weekly-duel__pending-loading">
                            <div className="weekly-duel__loading-spinner"></div>
                            <span>Cargando solicitudes...</span>
                        </div>
                    ) : pendingDuels.length > 0 ? (
                        <div className="weekly-duel__pending-list">
                            {pendingDuels.map((duel) => (
                                <div key={duel.id} className="weekly-duel__pending-card">
                                    <div className="weekly-duel__challenger-info">
                                        <div className="weekly-duel__challenger-avatar">
                                            {duel.challengerUsername.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="weekly-duel__challenger-details">
                                            <h3>{duel.challengerUsername}</h3>
                                            <div className="weekly-duel__challenger-level">
                                                Te desafía por <span style={{fontWeight: 'bold', color: '#e53e3e'}}>{duel.betAmount} monedas</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="weekly-duel__status">
                                        <div className="weekly-duel__date">
                                            {duel.startDate ? formatDate(duel.startDate) : 'Fecha pendiente'}
                                        </div>
                                        <div className="weekly-duel__actions">
                                            <button
                                                className="weekly-duel__accept-button"
                                                onClick={() => handleAcceptDuel(duel.id, duel.challengerUsername, duel.betAmount)}
                                            >
                                                <i className="fa fa-check"></i>
                                                <span>Aceptar</span>
                                            </button>
                                            <button
                                                className="weekly-duel__reject-button"
                                                onClick={() => handleRejectDuel(duel.id, duel.challengerUsername)}
                                            >
                                                <i className="fa fa-times"></i>
                                                <span>Rechazar</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="weekly-duel__no-pending">
                            <div className="weekly-duel__no-duels-icon">📪</div>
                            <p>No tienes solicitudes de duelo pendientes</p>
                        </div>
                    )
                )}
            </div>

            {/* Search Button or Animation Section */}
            {!showUsers && !searchingAnimation && (
                <div className="weekly-duel__search">
                    <button
                        className="weekly-duel__search-button"
                        onClick={fetchUsers}
                        disabled={loading}
                    >
                        <i className="fa fa-search weekly-duel__search-icon"></i>
                        Buscar Rivales
                    </button>
                </div>
            )}

            {/* Searching Animation */}
            {searchingAnimation && (
                <div className="weekly-duel__animation">
                    <div className="weekly-duel__battlefield"></div>
                    <div className="weekly-duel__glow"></div>
                    <div className="weekly-duel__rays">
                        <div className="weekly-duel__ray weekly-duel__ray--1"></div>
                        <div className="weekly-duel__ray weekly-duel__ray--2"></div>
                        <div className="weekly-duel__ray weekly-duel__ray--3"></div>
                        <div className="weekly-duel__ray weekly-duel__ray--4"></div>
                        <div className="weekly-duel__ray weekly-duel__ray--5"></div>
                        <div className="weekly-duel__ray weekly-duel__ray--6"></div>
                        <div className="weekly-duel__ray weekly-duel__ray--7"></div>
                        <div className="weekly-duel__ray weekly-duel__ray--8"></div>
                    </div>
                    <div className="weekly-duel__magnifier">
                        <div className="weekly-duel__magnifier-glass"></div>
                        <div className="weekly-duel__magnifier-handle"></div>
                    </div>
                    <div className="weekly-duel__particles">
                        <div className="weekly-duel__particle weekly-duel__particle--1"></div>
                        <div className="weekly-duel__particle weekly-duel__particle--2"></div>
                        <div className="weekly-duel__particle weekly-duel__particle--3"></div>
                        <div className="weekly-duel__particle weekly-duel__particle--4"></div>
                        <div className="weekly-duel__particle weekly-duel__particle--5"></div>
                        <div className="weekly-duel__particle weekly-duel__particle--6"></div>
                    </div>
                    <div className="weekly-duel__clouds">
                        <div className="weekly-duel__cloud weekly-duel__cloud--1"></div>
                        <div className="weekly-duel__cloud weekly-duel__cloud--2"></div>
                        <div className="weekly-duel__cloud weekly-duel__cloud--3"></div>
                    </div>
                    <div className="weekly-duel__searching-text">Buscando Rivales</div>
                </div>
            )}

            {/* Error Message */}
            {error && <div className="weekly-duel__error">{error}</div>}

            {/* User Results */}
            {showUsers && (
                <div className="weekly-duel__rivals">
                    {users.length > 0 ? (
                        <>
                            <div className="weekly-duel__rivals-grid">
                                {users.map((user, index) => (
                                    <div key={user.id} className="weekly-duel__rival-container" style={{'--i': index}}>
                                        <div className="weekly-duel__rival">
                                            <div className="weekly-duel__rival-banner">
                                                <div className="weekly-duel__path-badge">
                                                    {user.caminoFitnessName || "Sin camino"}
                                                </div>
                                            </div>
                                            <div className="weekly-duel__rival-content">
                                                <div className="weekly-duel__rival-profile">
                                                    <span>{user.username.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div className="weekly-duel__rival-username">{user.username}</div>
                                                <div className="weekly-duel__rival-attributes">
                                                    <div className="weekly-duel__attribute-row">
                                                        <div className="weekly-duel__attribute-label">
                                                            <i className="fa fa-dice"></i>
                                                            Duelos ganados
                                                        </div>
                                                        <div className="weekly-duel__attribute-value">
                                                            {user.wins || 0}
                                                        </div>
                                                    </div>
                                                    <div className="weekly-duel__attribute-row">
                                                        <div className="weekly-duel__attribute-label">
                                                            <i className="fa fa-trophy"></i>
                                                            XP Total
                                                        </div>
                                                        <div className="weekly-duel__attribute-value">
                                                            {user.totalXp || 0}
                                                        </div>
                                                    </div>
                                                    <div className="weekly-duel__attribute-row">
                                                        <div className="weekly-duel__attribute-label">
                                                            <i className="fa fa-coins"></i>
                                                            Monedas
                                                        </div>
                                                        <div className="weekly-duel__attribute-value">
                                                            {user.coins || 0}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Use BetDuelButton component instead of direct button */}
                                                <BetDuelButton
                                                    userId={user.id}
                                                    onDuelSent={handleDuelSent}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="weekly-duel__new-search" onClick={handleNewSearch}>
                                <i className="fa fa-search"></i> Nueva búsqueda
                            </button>
                        </>
                    ) : (
                        <div className="weekly-duel__no-rivals">
                            No hay rivales disponibles en este momento.
                            <button className="weekly-duel__search-again" onClick={handleNewSearch}>
                                Nueva búsqueda
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
export default DuelosSemanales;