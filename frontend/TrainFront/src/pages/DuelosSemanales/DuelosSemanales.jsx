import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DuelosSemanales.css';
import BetDuelButton from '../../components/BetDuelButton/BetDuelButton.jsx';

const DuelosSemanales = () => {
    const [users, setUsers] = useState([]);
    const [pendingDuels, setPendingDuels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pendingLoading, setPendingLoading] = useState(true);
    const [showUsers, setShowUsers] = useState(false);
    const [error, setError] = useState(null);
    const [searchingAnimation, setSearchingAnimation] = useState(false);
    const [pendingDuelsExpanded, setPendingDuelsExpanded] = useState(true);
    const [sentRequestsCount, setSentRequestsCount] = useState(0);

    // Fetch pending duel requests on component mount
    useEffect(() => {
        fetchPendingDuels();
    }, []);

    const fetchPendingDuels = async () => {
        setPendingLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/duels/pending', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPendingDuels(response.data);
        } catch (err) {
            console.error('Error fetching pending duels:', err);
        } finally {
            setPendingLoading(false);
        }
    };

    const togglePendingDuels = () => {
        setPendingDuelsExpanded(!pendingDuelsExpanded);
    };

    const handleAcceptDuel = async (duelId) => {
        try {
            await axios.post(`http://localhost:8080/api/duels/${duelId}/accept`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Update pending duels list
            fetchPendingDuels();

            // Show success message
            alert('Duelo aceptado con éxito');
        } catch (err) {
            console.error('Error accepting duel:', err);
            alert('Error al aceptar el duelo');
        }
    };

    const handleRejectDuel = async (duelId) => {
        try {
            await axios.post(`http://localhost:8080/api/duels/${duelId}/reject`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Update pending duels list
            fetchPendingDuels();

            // Show success message
            alert('Duelo rechazado');
        } catch (err) {
            console.error('Error rejecting duel:', err);
            alert('Error al rechazar el duelo');
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

    return (
        <div className="weekly-duel">
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
                        <span>Solicitudes de Duelo Pendientes</span>
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
                                            {duel.challenger.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="weekly-duel__challenger-details">
                                            <h3>{duel.challenger.username}</h3>
                                            <div className="weekly-duel__challenger-level">
                                                Nivel {duel.challenger.level} · {duel.betAmount} monedas
                                            </div>
                                        </div>
                                    </div>
                                    <div className="weekly-duel__status">
                                        <div className="weekly-duel__date">
                                            {new Date(duel.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="weekly-duel__actions">
                                            <button
                                                className="weekly-duel__reject-button"
                                                onClick={() => handleRejectDuel(duel.id)}
                                            >
                                                <i className="fa fa-times"></i>
                                                <span>Rechazar</span>
                                            </button>
                                            <button
                                                className="weekly-duel__accept-button"
                                                onClick={() => handleAcceptDuel(duel.id)}
                                            >
                                                <i className="fa fa-check"></i>
                                                <span>Aceptar</span>
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