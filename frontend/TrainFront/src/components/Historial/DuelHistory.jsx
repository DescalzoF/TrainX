// TrainFront/src/components/Historial/DuelHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './DuelHistory.css';

const DuelHistory = () => {
    const navigate = useNavigate();
    const [duels, setDuels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('all');

    useEffect(() => {
        fetchDuelHistory();
    }, []);

    const fetchDuelHistory = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/duels/history', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDuels(response.data);
        } catch (err) {
            console.error('Error fetching duel history:', err);
            setError('No se pudo cargar el historial de duelos');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha inválida';

            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                timeZone: 'UTC'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Error en fecha';
        }
    };

    const handleViewDuel = (duelId) => {
        navigate(`/duel-competition/${duelId}`);
    };

    const getDuelOutcomeLabel = (duel) => {
        if (duel.wasTie) return 'Empate';
        return duel.userWon ? 'Victoria' : 'Derrota';
    };

    const getDuelOutcomeClass = (duel) => {
        if (duel.wasTie) return 'draw';
        return duel.userWon ? 'win' : 'loss';
    };

    const getFilteredDuels = () => {
        if (selectedFilter === 'all') return duels;
        if (selectedFilter === 'wins') return duels.filter(duel => duel.userWon);
        if (selectedFilter === 'losses') return duels.filter(duel => !duel.userWon && !duel.wasTie);
        if (selectedFilter === 'draws') return duels.filter(duel => duel.wasTie);
        return duels;
    };

    const calculateDuelDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return 'Duración desconocida';

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays === 1 ? '1 día' : `${diffDays} días`;
    };

    const filteredDuels = getFilteredDuels();
    const totalDuels = duels.length;
    const wins = duels.filter(duel => duel.userWon).length;
    const losses = duels.filter(duel => !duel.userWon && !duel.wasTie).length;
    const draws = duels.filter(duel => duel.wasTie).length;

    return (
        <div className={`duel-history ${expanded ? 'duel-history--expanded' : 'duel-history--collapsed'}`}>
            <div className="duel-history__header" onClick={toggleExpanded}>
                <div className="duel-history__header-content">
                    <i className="fas fa-history duel-history__icon"></i>
                    <h2>Historial de Duelos</h2>
                    {duels.length > 0 && (
                        <div className="duel-history__badges">
                            <span className="duel-history__count">{totalDuels}</span>
                            <span className="duel-history__stat duel-history__stat--wins">{wins} V</span>
                            <span className="duel-history__stat duel-history__stat--losses">{losses} D</span>
                            <span className="duel-history__stat duel-history__stat--draws">{draws} E</span>
                        </div>
                    )}
                </div>
                <i className={`fa fa-chevron-down duel-history__toggle-icon ${!expanded ? 'duel-history__toggle-icon--collapsed' : ''}`}></i>
            </div>

            {expanded && (
                <div className="duel-history__content">
                    {loading ? (
                        <div className="duel-history__loading">
                            <div className="duel-history__loading-spinner"></div>
                            <p>Cargando historial de duelos...</p>
                        </div>
                    ) : error ? (
                        <div className="duel-history__error">
                            <i className="fas fa-exclamation-triangle"></i>
                            <p>{error}</p>
                            <button className="duel-history__retry-button" onClick={fetchDuelHistory}>
                                <i className="fas fa-sync-alt"></i> Reintentar
                            </button>
                        </div>
                    ) : duels.length === 0 ? (
                        <div className="duel-history__empty">
                            <i className="fas fa-scroll duel-history__empty-icon"></i>
                            <p>No tienes duelos previos</p>
                            <span>Desafía a otros usuarios para comenzar tu historial de combates</span>
                        </div>
                    ) : (
                        <>
                            <div className="duel-history__filters">
                                <button
                                    className={`duel-history__filter-btn ${selectedFilter === 'all' ? 'duel-history__filter-btn--active' : ''}`}
                                    onClick={() => setSelectedFilter('all')}
                                >
                                    Todos <span className="duel-history__filter-count">{totalDuels}</span>
                                </button>
                                <button
                                    className={`duel-history__filter-btn ${selectedFilter === 'wins' ? 'duel-history__filter-btn--active' : ''}`}
                                    onClick={() => setSelectedFilter('wins')}
                                >
                                    Victorias <span className="duel-history__filter-count duel-history__filter-count--wins">{wins}</span>
                                </button>
                                <button
                                    className={`duel-history__filter-btn ${selectedFilter === 'losses' ? 'duel-history__filter-btn--active' : ''}`}
                                    onClick={() => setSelectedFilter('losses')}
                                >
                                    Derrotas <span className="duel-history__filter-count duel-history__filter-count--losses">{losses}</span>
                                </button>
                                <button
                                    className={`duel-history__filter-btn ${selectedFilter === 'draws' ? 'duel-history__filter-btn--active' : ''}`}
                                    onClick={() => setSelectedFilter('draws')}
                                >
                                    Empates <span className="duel-history__filter-count duel-history__filter-count--draws">{draws}</span>
                                </button>
                            </div>

                            <div className="duel-history__list">
                                {filteredDuels.map((duel) => {
                                    const currentUserScore = duel.wasUserChallenger ? duel.challengerScore : duel.challengedScore;
                                    const opponentScore = duel.wasUserChallenger ? duel.challengedScore : duel.challengerScore;
                                    const currentUserInitial = duel.wasUserChallenger ? duel.challengerUsername.charAt(0).toUpperCase() : duel.challengedUsername.charAt(0).toUpperCase();
                                    const opponentInitial = duel.opponentUsername.charAt(0).toUpperCase();

                                    return (
                                        <div key={duel.id} className="duel-history__item" onClick={() => handleViewDuel(duel.id)}>
                                            <div className="duel-history__item-ribbon duel-history__item-ribbon--right"></div>
                                            <div className="duel-history__item-ribbon duel-history__item-ribbon--left"></div>

                                            <div className="duel-history__item-header">
                                                <div className="duel-history__date-container">
                                                    <i className="far fa-calendar-check"></i>
                                                    <span className="duel-history__date">{formatDate(duel.endDate)}</span>
                                                </div>
                                                <span className={`duel-history__outcome duel-history__outcome--${getDuelOutcomeClass(duel)}`}>
                                                    {getDuelOutcomeLabel(duel)}
                                                </span>
                                            </div>

                                            <div className="duel-history__players">
                                                <div className="duel-history__player">
                                                    <div className="duel-history__avatar duel-history__avatar--you">
                                                        {currentUserInitial}
                                                    </div>
                                                    <span className="duel-history__username">Tú</span>
                                                    <div className="duel-history__score-container">
                                                        <span className="duel-history__score">{currentUserScore}</span>
                                                        <span className="duel-history__score-label">puntos</span>
                                                    </div>
                                                </div>

                                                <div className="duel-history__battle-info">
                                                    <div className="duel-history__vs">
                                                        <i className="fas fa-bolt"></i>
                                                    </div>
                                                    <div className="duel-history__battle-type">
                                                        {duel.wasUserChallenger ? "Desafiaste" : "Te desafiaron"}
                                                    </div>
                                                </div>

                                                <div className="duel-history__player">
                                                    <div className="duel-history__avatar duel-history__avatar--opponent">
                                                        {opponentInitial}
                                                    </div>
                                                    <span className="duel-history__username">{duel.opponentUsername}</span>
                                                    <div className="duel-history__score-container">
                                                        <span className="duel-history__score">{opponentScore}</span>
                                                        <span className="duel-history__score-label">puntos</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="duel-history__details">
                                                <div className="duel-history__detail">
                                                    <i className="fas fa-coins"></i>
                                                    <span>{duel.betAmount} monedas</span>
                                                </div>
                                                <div className="duel-history__detail">
                                                    <i className="fas fa-hourglass-half"></i>
                                                    <span>{calculateDuelDuration(duel.startDate, duel.endDate)}</span>
                                                </div>
                                                {duel.wasTie && (
                                                    <div className="duel-history__detail duel-history__detail--special">
                                                        <i className="fas fa-balance-scale"></i>
                                                        <span>Empate técnico</span>
                                                    </div>
                                                )}
                                                {duel.winnerUsername && !duel.wasTie && (
                                                    <div className="duel-history__detail duel-history__detail--special">
                                                        <i className="fas fa-trophy"></i>
                                                        <span>Ganador: {duel.winnerUsername}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {filteredDuels.length === 0 && (
                                <div className="duel-history__no-results">
                                    <i className="fas fa-filter"></i>
                                    <p>No se encontraron duelos con el filtro seleccionado</p>
                                    <button className="duel-history__clear-filter" onClick={() => setSelectedFilter('all')}>
                                        Mostrar todos
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default DuelHistory;