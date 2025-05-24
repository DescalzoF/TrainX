import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BetDuelButton.css';

const BetDuelButton = ({ userId, onDuelSent }) => {
    const [showModal, setShowModal] = useState(false);
    const [betAmount, setBetAmount] = useState(50);
    const [userCoins, setUserCoins] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [minBet] = useState(0);

    useEffect(() => {
        if (showModal) {
            const fetchUserCoins = async () => {
                try {
                    const response = await axios.get('http://localhost:8080/api/users/current/coins', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    setUserCoins(response.data.coins);
                } catch (err) {
                    console.error('Error fetching coins:', err);
                    setError('No se pudieron cargar tus monedas.');
                }
            };
            fetchUserCoins();
        }
    }, [showModal]);

    const handleOpenModal = () => {
        setShowModal(true);
        setError(null);
        setBetAmount(50);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleBetChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        const numValue = value === '' ? 0 : parseInt(value);
        setBetAmount(numValue);
    };

    const handleSliderChange = (e) => setBetAmount(parseInt(e.target.value));

    const handleSubmit = async () => {
        if (betAmount < 0) {
            setError('La apuesta no puede ser negativa');
            return;
        }

        if (betAmount > userCoins) {
            setError('No tienes suficientes monedas');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Send betAmount as a number, not a string
            const requestData = {
                challengedUserId: userId,
                betAmount: betAmount  // Keep as number
            };

            console.log('Sending duel challenge:', requestData);

            const response = await axios.post('http://localhost:8080/api/duels/challenge', requestData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Duel challenge response:', response.data);
            setShowModal(false);
            if (onDuelSent) onDuelSent();
        } catch (err) {
            console.error('Error sending duel request:', err);
            if (err.response) {
                console.error('Response status:', err.response.status);
                console.error('Response data:', err.response.data);
            }
            setError(err.response?.data?.message || 'Error al enviar solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bet-duel">
            <button className="weekly-duel__battle-button bet-duel__button" onClick={handleOpenModal}>
                <i className="fa fa-swords"></i>
                <span>Desafiar</span>
            </button>

            {showModal && (
                <div className="bet-duel__overlay">
                    <div className="bet-duel__dialog">
                        <div className="bet-duel__header">
                            <h3>Desafío</h3>
                            <button className="bet-duel__close-button" onClick={handleCloseModal}>×</button>
                        </div>
                        <div className="bet-duel__content">
                            <div className="bet-duel__coins-info">
                                <i className="fa fa-coins bet-duel__coin-icon"></i>
                                <span>{userCoins} monedas</span>
                            </div>

                            <div className="bet-duel__input-container">
                                <label className="bet-duel__label">Apuesta:</label>
                                <input
                                    type="text"
                                    className="bet-duel__input"
                                    value={betAmount}
                                    onChange={handleBetChange}
                                    min={minBet}
                                    placeholder="Monedas"
                                />
                            </div>

                            <div className="bet-duel__slider-container">
                                <input
                                    type="range"
                                    className="bet-duel__slider"
                                    min={0}
                                    max={Math.max(500, userCoins)}
                                    value={betAmount}
                                    onChange={handleSliderChange}
                                    step={10}
                                />
                                <div className="bet-duel__slider-values">
                                    <span>0</span>
                                    <span>{Math.max(500, userCoins)}</span>
                                </div>
                            </div>

                            {error && <div className="bet-duel__error">{error}</div>}
                        </div>
                        <div className="bet-duel__footer">
                            <button className="bet-duel__cancel-button" onClick={handleCloseModal}>
                                Cancelar
                            </button>
                            <button
                                className="bet-duel__send-button"
                                onClick={handleSubmit}
                                disabled={loading || betAmount < 0 || betAmount > userCoins}
                            >
                                {loading ? (
                                    <div className="bet-duel__spinner"></div>
                                ) : (
                                    <>
                                        <i className="fa fa-paper-plane"></i>
                                        <span>Enviar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BetDuelButton;