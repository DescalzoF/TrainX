import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { format, parseISO, addDays, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import './DuelCompetition.css';

const DuelCompetition = () => {
    const navigate = useNavigate();
    const [currentUsername, setCurrentUsername] = useState('');
    const [activeDuel, setActiveDuel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [progressData, setProgressData] = useState({
        currentUser: { completed: 0, total: 0 },
        opponent: { completed: 0, total: 0 }
    });
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [isCurrentUserChallenger, setIsCurrentUserChallenger] = useState(false);
    const [showStartAnimation, setShowStartAnimation] = useState(false);
    const [duelJustEnded, setDuelJustEnded] = useState(false);
    const [todayExercise, setTodayExercise] = useState(null);
    const [loadingExercise, setLoadingExercise] = useState(false);
    const [completingExercise, setCompletingExercise] = useState(false);
    const [exerciseDeadline, setExerciseDeadline] = useState(null);
    const [exerciseTimeRemaining, setExerciseTimeRemaining] = useState(null);
    const [hasExpired, setHasExpired] = useState(false);
    const toastTimeoutRef = useRef(null);
    const hasCheckedStartAnimationRef = useRef(false);
    const exerciseTimerRef = useRef(null);
    const duelEndAnimationTimeoutRef = useRef(null);

    useEffect(() => {
        fetchActiveDuel();

        return () => {
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
            if (exerciseTimerRef.current) clearInterval(exerciseTimerRef.current);
            if (duelEndAnimationTimeoutRef.current) clearTimeout(duelEndAnimationTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        let timer;
        if (activeDuel) {
            timer = setInterval(() => {
                updateTimeRemaining();

                if (exerciseDeadline) {
                    updateExerciseTimeRemaining();
                }
            }, 1000);

            // Check if duel has just started and show animation
            if (!hasCheckedStartAnimationRef.current) {
                checkDuelStartStatus();
                hasCheckedStartAnimationRef.current = true;
            }

            // Check if duel has ended
            checkDuelEndStatus();

            // Fetch today's exercise
            fetchTodayExercise();
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [activeDuel]);

    // Reset hasExpired when todayExercise changes
    useEffect(() => {
        if (todayExercise) {
            setHasExpired(false);

            // Set exercise deadline to end of the exercise day
            if (todayExercise.date) {
                const exerciseDate = new Date(todayExercise.date);
                const deadline = new Date(
                    exerciseDate.getFullYear(),
                    exerciseDate.getMonth(),
                    exerciseDate.getDate(),
                    23, 59, 59, 999
                );
                setExerciseDeadline(deadline);

                // Setup timer for exercise
                if (exerciseTimerRef.current) {
                    clearInterval(exerciseTimerRef.current);
                }

                exerciseTimerRef.current = setInterval(() => {
                    updateExerciseTimeRemaining(deadline);
                }, 1000);
            }
        }
    }, [todayExercise]);

    const checkDuelEndStatus = () => {
        if (!activeDuel || !activeDuel.duel.endDate) return;

        const endDate = new Date(activeDuel.duel.endDate);
        const now = new Date();

        // Check if duel has ended
        const duelEnded = now >= endDate;

        if (duelEnded) {
            // Check if we haven't shown the end animation for this duel yet
            const hasSeenEndAnimation = localStorage.getItem(`seen_duel_end_${activeDuel.duel.id}`);

            if (!hasSeenEndAnimation) {
                // Show end animation
                setDuelJustEnded(true);
                localStorage.setItem(`seen_duel_end_${activeDuel.duel.id}`, 'true');

                // After showing the message for a few seconds, navigate to challenges
                duelEndAnimationTimeoutRef.current = setTimeout(() => {
                    navigate('/challenges');
                }, 5000); // Show message for 5 seconds before redirecting
            }
        }
    };

    const checkDuelStartStatus = () => {
        if (!activeDuel || !activeDuel.duel.startDate) return;

        const startDate = new Date(activeDuel.duel.startDate);
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds

        // Show animation if duel started less than a day ago and user hasn't seen it
        if (now >= startDate && now - startDate < oneDay) {
            const hasSeenAnimation = localStorage.getItem(`seen_duel_start_${activeDuel.duel.id}`);
            if (!hasSeenAnimation) {
                setShowStartAnimation(true);
                localStorage.setItem(`seen_duel_start_${activeDuel.duel.id}`, 'true');
            }
        }
    };

    const fetchTodayExercise = async () => {
        if (!activeDuel || !activeDuel.duel.id) return;

        setLoadingExercise(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/duels/${activeDuel.duel.id}/exercises/today`, {
                withCredentials: true
            });

            if (response.data) {
                setTodayExercise(response.data);

                // Set deadline for this exercise
                if (response.data.date) {
                    const exerciseDate = new Date(response.data.date);
                    const deadline = new Date(
                        exerciseDate.getFullYear(),
                        exerciseDate.getMonth(),
                        exerciseDate.getDate(),
                        23, 59, 59, 999
                    );
                    setExerciseDeadline(deadline);
                }
            } else {
                setTodayExercise(null);
            }
        } catch (err) {
            console.error("Error fetching today's exercise:", err);
            setTodayExercise(null);
        } finally {
            setLoadingExercise(false);
        }
    };

    const fetchNextExercise = async () => {
        if (!activeDuel || !activeDuel.duel.id) return;

        setLoadingExercise(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/duels/${activeDuel.duel.id}/exercises/next`, {
                withCredentials: true
            });

            if (response.data) {
                setTodayExercise(response.data);
                showToast('Nuevo ejercicio disponible', 'info');

                // Set deadline for this exercise
                if (response.data.date) {
                    const exerciseDate = new Date(response.data.date);
                    const deadline = new Date(
                        exerciseDate.getFullYear(),
                        exerciseDate.getMonth(),
                        exerciseDate.getDate(),
                        23, 59, 59, 999
                    );
                    setExerciseDeadline(deadline);
                }
            } else {
                setTodayExercise(null);
            }
        } catch (err) {
            console.error("Error fetching next exercise:", err);
            // Don't change todayExercise here to preserve the expired one
        } finally {
            setLoadingExercise(false);
        }
    };

    const updateExerciseTimeRemaining = (deadline = exerciseDeadline) => {
        if (!deadline) return;

        const now = new Date();
        if (now >= deadline) {
            setExerciseTimeRemaining({ expired: true });

            // If just expired and not marked as expired yet, fetch the next exercise
            if (!hasExpired) {
                setHasExpired(true);
                showToast('El tiempo para completar este ejercicio ha expirado', 'info');
                fetchNextExercise(); // Automatically fetch next exercise when current expires
            }
            return;
        }

        const diff = deadline - now;
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setExerciseTimeRemaining({ hours, minutes, seconds, expired: false });
    };

    const completeExercise = async () => {
        if (!activeDuel || !todayExercise || !todayExercise.id) return;

        // Check if exercise deadline has passed
        if (exerciseTimeRemaining && exerciseTimeRemaining.expired) {
            showToast('El tiempo para completar este ejercicio ha expirado', 'error');
            return;
        }

        setCompletingExercise(true);
        try {
            await axios.post(`http://localhost:8080/api/duels/${activeDuel.duel.id}/exercises/${todayExercise.id}/complete`, {}, {
                withCredentials: true
            });

            showToast('¡Ejercicio completado con éxito!', 'success');

            // Refresh duel data to update scores
            fetchActiveDuel();
            fetchTodayExercise();
        } catch (err) {
            console.error("Error completing exercise:", err);
            showToast('Error al completar el ejercicio', 'error');
        } finally {
            setCompletingExercise(false);
        }
    };

    const showToast = (message, type = 'success') => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

        setToast({ show: true, message, type });

        toastTimeoutRef.current = setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 4000);
    };

    const fetchActiveDuel = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/duels/active-duel', {
                withCredentials: true
            });

            if (response.data.hasActiveDuel) {
                setActiveDuel(response.data);

                // Get the current username from localStorage
                const currentUsername = localStorage.getItem('username');
                setCurrentUsername(currentUsername || '');

                const duel = response.data.duel;

                // Determine if current user is challenger by comparing localStorage username
                // with the challengerUsername from the duel data
                const isChallenger = currentUsername === duel.challengerUsername;
                setIsCurrentUserChallenger(isChallenger);

                // Calculate progress
                calculateProgress(response.data.duel, isChallenger);
            } else {
                setActiveDuel(null);
            }
        } catch (err) {
            console.error("Error fetching active duel:", err);
            setError("No se pudo cargar el duelo activo. Inténtalo de nuevo más tarde.");
            showToast('Error al cargar el duelo activo', 'error');
        } finally {
            setLoading(false);
        }
    };

    const calculateProgress = (duel, isChallenger) => {
        const totalDays = 7;
        let currentUserCompleted, opponentCompleted;

        if (isChallenger) {
            currentUserCompleted = duel.challengerScore || 0;
            opponentCompleted = duel.challengedScore || 0;
        } else {
            currentUserCompleted = duel.challengedScore || 0;
            opponentCompleted = duel.challengerScore || 0;
        }

        setProgressData({
            currentUser: {
                completed: currentUserCompleted,
                total: totalDays
            },
            opponent: {
                completed: opponentCompleted,
                total: totalDays
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            const date = parseISO(dateString);
            return format(date, 'dd MMM yyyy', { locale: es });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    const updateTimeRemaining = () => {
        if (!activeDuel || !activeDuel.duel.startDate) return;

        const startDateStr = activeDuel.duel.startDate;
        const now = new Date();

        // Parse the date from backend
        const startDateObj = new Date(startDateStr);

        // Set time to 23:59:59 of the start date (essentially midnight)
        const startDate = new Date(
            startDateObj.getFullYear(),
            startDateObj.getMonth(),
            startDateObj.getDate(),
            23, 59, 59, 999
        );

        console.log('Original startDate string:', startDateStr);
        console.log('Parsed date object:', startDateObj);
        console.log('Start date set to end of day:', startDate);
        console.log('Current time:', now);
        console.log('Time difference (ms):', startDate - now);

        // If current time is past the start date, switch to end date countdown
        if (now >= startDate) {
            if (activeDuel.duel.endDate) {
                const endDate = new Date(activeDuel.duel.endDate);
                if (now >= endDate) {
                    setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                } else {
                    const diff = endDate - now;
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    setTimeRemaining({ days, hours, minutes, seconds });
                }
            } else {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
            return;
        }

        // Calculate time remaining until start date
        const diff = startDate - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeRemaining({days, hours, minutes, seconds});
    };

    const generateDailyProgress = (duel) => {
        if (!duel || !duel.startDate) return [];

        const startDate = parseISO(duel.startDate);
        const days = [];

        for (let i = 0; i < 7; i++) {
            const currentDate = addDays(startDate, i);
            const dateStr = format(currentDate, 'yyyy-MM-dd');

            let currentUserCompleted, opponentCompleted;

            if (isCurrentUserChallenger) {
                currentUserCompleted = duel.challengerDailyStatus && duel.challengerDailyStatus[dateStr];
                opponentCompleted = duel.challengedDailyStatus && duel.challengedDailyStatus[dateStr];
            } else {
                currentUserCompleted = duel.challengedDailyStatus && duel.challengedDailyStatus[dateStr];
                opponentCompleted = duel.challengerDailyStatus && duel.challengerDailyStatus[dateStr];
            }

            days.push({
                date: currentDate,
                day: i + 1,
                currentUserCompleted,
                opponentCompleted,
                isPast: currentDate < new Date(),
                isToday: format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            });
        }

        return days;
    };

    const closeStartAnimation = () => {
        setShowStartAnimation(false);
    };

    if (loading) {
        return (
            <div className="duel-competition duel-competition--with-margin">
                <div className="duel-competition__loading">
                    <div className="duel-competition__spinner"></div>
                    <p>Cargando duelo activo...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="duel-competition duel-competition--with-margin">
                <div className="duel-competition__error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h2>Algo salió mal</h2>
                    <p>{error}</p>
                    <button className="duel-competition__retry-button" onClick={fetchActiveDuel}>
                        <i className="fas fa-sync-alt"></i> Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (!activeDuel || !activeDuel.hasActiveDuel) {
        return (
            <div className="duel-competition duel-competition--with-margin">
                <div className="duel-competition__no-duel">
                    <i className="fas fa-dumbbell duel-competition__no-duel-icon"></i>
                    <h2>No tienes un duelo activo</h2>
                    <p>Desafía a otro usuario para comenzar un duelo semanal.</p>
                    <a href="/duelos" className="duel-competition__find-button">
                        <i className="fas fa-search"></i> Buscar Rivales
                    </a>
                </div>
            </div>
        );
    }
    const duel = activeDuel.duel;
    const dailyProgress = generateDailyProgress(duel);
    const isCurrentUserWinning = progressData.currentUser.completed > progressData.opponent.completed;
    const isTied = progressData.currentUser.completed === progressData.opponent.completed;

    // Get opponent username by comparing with current username from localStorage
    let opponentUsername;
    if (currentUsername === duel.challengerUsername) {
        // If current user is challenger, opponent is the challenged user
        opponentUsername = duel.challengedUsername;
    } else {
        // If current user is the challenged user, opponent is the challenger
        opponentUsername = duel.challengerUsername;
    }

    // Check if duel has started
    const duelStarted = duel.startDate && new Date() >= new Date(duel.startDate);

    // Check if duel has ended
    const duelEnded = duel.endDate && new Date() >= new Date(duel.endDate);

    // Check if today's exercise is already completed
    const isExerciseCompleted = todayExercise && todayExercise.completed;

    // Check if exercise deadline has expired
    const isExerciseExpired = exerciseTimeRemaining && exerciseTimeRemaining.expired;

    return (
        <div className="duel-competition duel-competition--with-margin">
            {/* Start Animation */}
            {showStartAnimation && (
                <div className="duel-competition__start-animation" onClick={closeStartAnimation}>
                    <div className="duel-competition__start-animation-content">
                        <i className="fas fa-fire-alt duel-competition__start-animation-icon"></i>
                        <h2>¡El duelo ha comenzado!</h2>
                        <p>Completa los ejercicios diarios para ganar puntos.</p>
                    </div>
                </div>
            )}

            {/* Duel End Animation */}
            {duelJustEnded && (
                <div className="duel-competition__start-animation">
                    <div className="duel-competition__start-animation-content">
                        <i className="fas fa-trophy duel-competition__start-animation-icon"></i>
                        <h2>¡El duelo ha finalizado!</h2>
                        <p>
                            {isCurrentUserWinning
                                ? '¡Felicidades! Has ganado el duelo.'
                                : !isCurrentUserWinning && !isTied
                                    ? `${opponentUsername} ha ganado el duelo.`
                                    : 'El duelo ha terminado en empate.'}
                        </p>
                        <p className="duel-competition__redirect-message">Redirigiendo a la página de desafíos...</p>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className={`duel-competition__toast duel-competition__toast--${toast.type}`}>
                    <div className="duel-competition__toast-icon">
                        {toast.type === 'success' && <i className="fas fa-check-circle"></i>}
                        {toast.type === 'error' && <i className="fas fa-times-circle"></i>}
                        {toast.type === 'info' && <i className="fas fa-info-circle"></i>}
                    </div>
                    <div className="duel-competition__toast-content">
                        <p>{toast.message}</p>
                    </div>
                </div>
            )}

            <div className="duel-competition__header">
                <h1 className="duel-competition__title">Duelo Semanal</h1>
                <div className="duel-competition__timer">
                    <div className="duel-competition__countdown">
                        <div className="duel-competition__countdown-title">
                            <i className="fas fa-clock"></i>
                            {!duelStarted ? "Comienza en:" : duelEnded ? "El duelo ha finalizado" : "Finaliza en:"}
                        </div>
                        {(!duelStarted || !duelEnded) && timeRemaining && (
                            <div className="duel-competition__countdown-units">
                                <div className="duel-competition__countdown-unit">
                                    <div className="duel-competition__countdown-value">{timeRemaining.days}</div>
                                    <div className="duel-competition__countdown-label">Días</div>
                                </div>
                                <div className="duel-competition__countdown-unit">
                                    <div className="duel-competition__countdown-value">{timeRemaining.hours}</div>
                                    <div className="duel-competition__countdown-label">Horas</div>
                                </div>
                                <div className="duel-competition__countdown-unit">
                                    <div className="duel-competition__countdown-value">{timeRemaining.minutes}</div>
                                    <div className="duel-competition__countdown-label">Minutos</div>
                                </div>
                                <div className="duel-competition__countdown-unit">
                                    <div className="duel-competition__countdown-value">{timeRemaining.seconds}</div>
                                    <div className="duel-competition__countdown-label">Segundos</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="duel-competition__arena">
                <div className="duel-competition__competitors">
                    <div className="duel-competition__competitor">
                        <div className="duel-competition__competitor-avatar">
                            <span>{currentUsername ? currentUsername.charAt(0).toUpperCase() : 'T'}</span>
                        </div>
                        <h2 className="duel-competition__competitor-name">Tú</h2>
                    </div>

                    <div className="duel-competition__versus">
                        <div className="duel-competition__score">
            <span className={`duel-competition__score-value ${isCurrentUserWinning ? 'duel-competition__score-value--winning' : ''}`}>
                {progressData.currentUser.completed}
            </span>
                            <span>-</span>
                            <span className={`duel-competition__score-value ${!isCurrentUserWinning && !isTied ? 'duel-competition__score-value--winning' : ''}`}>
                {progressData.opponent.completed}
            </span>
                        </div>
                        <div className="duel-competition__bet">
                            <span className="duel-competition__bet-label">Apuesta</span>
                            <span className="duel-competition__bet-amount">
                <i className="fas fa-coins"></i> {duel.betAmount} monedas
            </span>
                        </div>
                    </div>

                    <div className="duel-competition__competitor">
                        <div className="duel-competition__competitor-avatar duel-competition__competitor-avatar--opponent">
                            <span>{opponentUsername ? opponentUsername.charAt(0).toUpperCase() : 'O'}</span>
                        </div>
                        <h2 className="duel-competition__competitor-name">{opponentUsername}</h2>
                    </div>
                </div>

                <div className="duel-competition__info">
                    <div className="duel-competition__info-item">
                        <i className="fas fa-calendar-day"></i>
                        <span className="duel-competition__info-label">Inicio:</span>
                        <span>{formatDate(duel.startDate)}</span>
                    </div>
                    <div className="duel-competition__info-item">
                        <i className="fas fa-calendar-check"></i>
                        <span className="duel-competition__info-label">Fin:</span>
                        <span>{formatDate(duel.endDate)}</span>
                    </div>
                    <div className="duel-competition__info-item">
                        <i className="fas fa-trophy"></i>
                        <span className="duel-competition__info-label">Ganador:</span>
                        <span>
                            {duelEnded
                                ? isCurrentUserWinning
                                    ? 'Tú'
                                    : !isCurrentUserWinning && !isTied
                                        ? opponentUsername
                                        : 'Empate'
                                : 'Pendiente'}
                        </span>
                    </div>
                </div>

                <div className="duel-competition__progress-container">
                    <h3 className="duel-competition__progress-title">Progreso diario</h3>
                    <div className="duel-competition__progress-days">
                        {dailyProgress.map((day, index) => (
                            <div
                                key={index}
                                className={`duel-competition__day ${day.isToday ? 'duel-competition__day--today' : ''}`}
                            >
                                <div className="duel-competition__day-header">
                                    <span className="duel-competition__day-number">Día {day.day}</span>
                                    <span className="duel-competition__day-date">{format(day.date, 'dd MMM', { locale: es })}</span>
                                </div>
                                <div className="duel-competition__day-results">
                                    <div className={`duel-competition__day-result ${day.currentUserCompleted ? 'duel-competition__day-result--completed-red' : ''}`}>
                                        <i className={day.currentUserCompleted ? 'fas fa-check-circle' : 'far fa-circle'}></i>
                                    </div>
                                    <div className={`duel-competition__day-result ${day.opponentCompleted ? 'duel-competition__day-result--completed-blue' : ''}`}>
                                        <i className={day.opponentCompleted ? 'fas fa-check-circle' : 'far fa-circle'}></i>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="duel-competition__progress-bars">
                    <div className="duel-competition__progress-bar-container">
                        <div className="duel-competition__progress-label">
                            <span>Tú</span>
                            <span>{progressData.currentUser.completed}/{progressData.currentUser.total}</span>
                        </div>
                        <div className="duel-competition__progress-track">
                            <div
                                className="duel-competition__progress-fill duel-competition__progress-fill--red"
                                style={{width: `${(progressData.currentUser.completed / progressData.currentUser.total) * 100}%`}}
                            ></div>
                        </div>
                    </div>
                    <div className="duel-competition__progress-bar-container">
                        <div className="duel-competition__progress-label">
                            <span>{opponentUsername}</span>
                            <span>{progressData.opponent.completed}/{progressData.opponent.total}</span>
                        </div>
                        <div className="duel-competition__progress-track">
                            <div
                                className="duel-competition__progress-fill duel-competition__progress-fill--blue"
                                style={{width: `${(progressData.opponent.completed / progressData.opponent.total) * 100}%`}}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Today's Exercise Section */}
                <div className="duel-competition__today-section">
                    {!duelStarted ? (
                        <div className="duel-competition__waiting">
                            <i className="fas fa-hourglass-half duel-competition__waiting-icon"></i>
                            <h3>El duelo aún no ha comenzado</h3>
                            <p>Los ejercicios estarán disponibles cuando el duelo comience.</p>
                        </div>
                    ) : duelEnded ? (
                        <div className="duel-competition__waiting">
                            <i className="fas fa-flag-checkered duel-competition__waiting-icon"></i>
                            <h3>El duelo ha finalizado</h3>
                            <p>Ya no hay más ejercicios disponibles para este duelo.</p>
                        </div>
                    ) : loadingExercise ? (
                        <div className="duel-competition__loading-exercise">
                            <div className="duel-competition__spinner"></div>
                            <p>Cargando ejercicio del día...</p>
                        </div>
                    ) : !todayExercise ? (
                        <div className="duel-competition__waiting">
                            <i className="fas fa-calendar-times duel-competition__waiting-icon"></i>
                            <h3>No hay ejercicio disponible hoy</h3>
                            <p>Vuelve mañana para continuar con el duelo.</p>
                        </div>
                    ) : (
                        <div className="duel-competition__exercise">
                            <div className="duel-competition__exercise-header">
                                <h3>Ejercicio del día</h3>
                                <span className="duel-competition__exercise-date">
                                    {todayExercise.date ? formatDate(todayExercise.date) : 'Fecha no disponible'}
                                </span>
                            </div>

                            {/* Exercise Deadline Countdown */}
                            {!isExerciseCompleted && !isExerciseExpired && exerciseTimeRemaining && (
                                <div className="duel-competition__exercise-deadline">
                                    <h5>Tiempo restante para completar:</h5>
                                    <div className="duel-competition__exercise-timer">
                                        <span>{exerciseTimeRemaining.hours} horas</span>
                                        <span>{exerciseTimeRemaining.minutes} minutos</span>
                                        <span>{exerciseTimeRemaining.seconds} segundos</span>
                                    </div>
                                </div>
                            )}

                            {/* Expired Message */}
                            {isExerciseExpired && !isExerciseCompleted && (
                                <div className="duel-competition__exercise-deadline">
                                    <div className="duel-competition__expired">
                                        <i className="fas fa-exclamation-circle"></i>
                                        Tiempo expirado
                                    </div>
                                </div>
                            )}

                            <div className="duel-competition__exercise-content">
                                <h2 className="duel-competition__exercise-name">{todayExercise.name}</h2>
                                <p className="duel-competition__exercise-description">{todayExercise.description}</p>

                                {isExerciseCompleted ? (
                                    <div className="duel-competition__exercise-completed">
                                        <i className="fas fa-check-circle"></i>
                                        Ya has completado este ejercicio.
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            className="duel-competition__complete-button"
                                            onClick={completeExercise}
                                            disabled={completingExercise || isExerciseExpired}
                                        >
                                            {completingExercise ? (
                                                <>
                                                    <div className="duel-competition__button-spinner"></div>
                                                    Completando...
                                                </>
                                            ) : isExerciseExpired ? (
                                                <>
                                                    <i className="fas fa-times-circle"></i>
                                                    Tiempo expirado
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-check-circle"></i>
                                                    Marcar como completado
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DuelCompetition;