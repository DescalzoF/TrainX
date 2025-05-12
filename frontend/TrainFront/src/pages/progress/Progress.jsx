import React, {useEffect, useState} from 'react';
import axios from 'axios';
import './Progress.css';
import {
    FaBolt,
    FaCalendarAlt,
    FaChartBar,
    FaChartLine,
    FaChartPie,
    FaClock,
    FaDumbbell,
    FaExclamationTriangle,
    FaFireAlt,
    FaMedal,
    FaRunning,
    FaSpinner,
    FaTrophy,
    FaWeight
} from 'react-icons/fa';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

const Progress = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalXp: 0,
        totalCompletions: 0,
        favoriteExercise: '',
        averageWeight: 0
    });
    const [extendedStats, setExtendedStats] = useState({
        maxWeightLifted: 0,
        mostFrequentDay: '',
        longestStreak: 0,
        totalSessions: 0,
        averageRepsPerSet: 0,
        currentStreak: 0,
        weeklyGoalProgress: 0
    });

    // State for real data from API
    const [weeklyActivity, setWeeklyActivity] = useState({});
    const [weeklyPerformance, setWeeklyPerformance] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const username = localStorage.getItem('username');
        setUser(username || 'Usuario');

        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Token de autenticación no encontrado.');
                setLoading(false);
                return;
            }

            try {
                // Using only the two original endpoints
                // Fetch basic stats
                const basicStatsPromise = axios.get('http://localhost:8080/api/exercise-completions/summary', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Fetch extended stats
                const extendedStatsPromise = axios.get('http://localhost:8080/api/exercise-completions/extended-summary', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Wait for both requests to complete
                const [basicRes, extendedRes] = await Promise.all([basicStatsPromise, extendedStatsPromise]);

                const basicData = basicRes.data || {};
                setStats({
                    totalXp: Number(basicData.totalXp || 0),
                    totalCompletions: Number(basicData.totalCompletions || 0),
                    favoriteExercise: basicData.favoriteExercise || 'Ninguno',
                    averageWeight: Number(basicData.averageWeight || 0)
                });

                const extendedData = extendedRes.data || {};
                setExtendedStats({
                    maxWeightLifted: Number(extendedData.maxWeightLifted || 0),
                    mostFrequentDay: extendedData.mostFrequentDay || 'No disponible',
                    longestStreak: Number(extendedData.longestStreak || 0),
                    totalSessions: Number(extendedData.totalSessions || 0),
                    averageRepsPerSet: Number(extendedData.averageRepsPerSet || 0),
                    currentStreak: Number(extendedData.currentStreak || 0),
                    weeklyGoalProgress: Number(extendedData.weeklyGoalProgress || 0)
                });

                // Set real data for visualizations from extended stats
                if (extendedData.weeklyActivity) {
                    setWeeklyActivity(extendedData.weeklyActivity || {});
                }

                if (extendedData.weeklyPerformance) {
                    // Ensure each entry has proper number formatting
                    const formattedPerformance = (extendedData.weeklyPerformance || []).map(week => ({
                        name: week.name,
                        totalWeight: Number(week.totalWeight || 0),
                        totalReps: Number(week.totalReps || 0),
                        xp: Number(week.xp || 0)
                    }));
                    setWeeklyPerformance(formattedPerformance);
                }

                if (extendedData.recentActivity) {
                    setRecentActivity(extendedData.recentActivity || []);
                }

                console.log("Weekly Performance Data:", extendedData.weeklyPerformance);
                console.log("Recent Activity Data:", extendedData.recentActivity);

            } catch (err) {
                console.error('Error al obtener estadísticas:', err);
                setError('No se pudieron cargar las estadísticas.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Get today's day index (0 = Monday, 6 = Sunday)
    const getTodayIndex = () => {
        const today = new Date().getDay();
        // Convert Sunday (0) to index 6, and Monday (1) to index 0
        return today === 0 ? 6 : today - 1;
    };

    // Calculate progress circle circumference and offset
    const calculateCircleProgress = (percentage) => {
        const radius = 76;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        return { circumference, offset };
    };

    const { circumference, offset } = calculateCircleProgress(extendedStats.weeklyGoalProgress);

    // Transform weekly activity object into array format needed by chart
    const getWeeklyActivityArray = () => {
        // Default days in Spanish
        const dayOrder = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

        // Create array with the correct order of days
        return dayOrder.map(day => ({
            day: day,
            exercises: weeklyActivity[day] || 0
        }));
    };

    // Format a date to a Spanish-friendly format
    const formatDate = (isoDateString) => {
        if (!isoDateString) return '';

        const date = new Date(isoDateString);
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
    };

    if (loading) return (
        <div className="progress-loading">
            <FaSpinner className="fa-spin" />
            <p>Cargando datos de progreso...</p>
        </div>
    );

    if (error) return (
        <div className="progress-error">
            <FaExclamationTriangle />
            <p>{error}</p>
        </div>
    );

    const weeklyActivityData = getWeeklyActivityArray();

    return (
        <div className="progress-container">
            <h1 className="progress-title">Progreso de {user}</h1>
            <div className="progress-stats-section">
                <h2 className="section-title"><FaChartLine /> Estadísticas Básicas</h2>
                <div className="progress-summary">
                    <div className="summary-card">
                        <div className="summary-icon"><FaTrophy /></div>
                        <div className="summary-content">
                            <h3>XP Total</h3>
                            <div className="summary-value">{stats.totalXp}</div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon"><FaDumbbell /></div>
                        <div className="summary-content">
                            <h3>Ejercicios Completados</h3>
                            <div className="summary-value">{stats.totalCompletions}</div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon"><FaChartLine /></div>
                        <div className="summary-content">
                            <h3>Peso Promedio</h3>
                            <div className="summary-value">{stats.averageWeight.toFixed(1)} kg</div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon"><FaCalendarAlt /></div>
                        <div className="summary-content">
                            <h3>Sesiones Totales</h3>
                            <div className="summary-value">{extendedStats.totalSessions}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Streak Section */}
            <div className="streak-container">
                <h2 className="section-title"><FaFireAlt /> Rachas y Objetivos</h2>
                <div className="streak-content">
                    <div className="streak-metric">
                        <div className="streak-value">{extendedStats.currentStreak}</div>
                        <div className="streak-label">Racha Actual<br/>(días)</div>
                    </div>

                    <div className="streak-divider"></div>

                    <div className="progress-circle-container">
                        <svg className="progress-circle">
                            <circle
                                className="progress-circle-bg"
                                cx="80"
                                cy="80"
                                r="76"
                            />
                            <circle
                                className="progress-circle-value"
                                cx="80"
                                cy="80"
                                r="76"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                            />
                        </svg>
                        <div className="progress-circle-text">
                            <div className="circle-percentage">{extendedStats.weeklyGoalProgress}%</div>
                            <div className="circle-label">de objetivo semanal</div>
                        </div>
                    </div>

                    <div className="streak-divider"></div>

                    <div className="streak-metric">
                        <div className="streak-value">{extendedStats.longestStreak}</div>
                        <div className="streak-label">Racha más Larga<br/>(días)</div>
                    </div>
                </div>
            </div>

            <div className="progress-stats-section">
                <h2 className="section-title">Estadísticas Detalladas</h2>
                <div className="progress-summary">
                    <div className="summary-card">
                        <div className="summary-icon"><FaWeight /></div>
                        <div className="summary-content">
                            <h3>Peso Máximo Levantado</h3>
                            <div className="summary-value">{extendedStats.maxWeightLifted.toFixed(1)} kg</div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon"><FaCalendarAlt /></div>
                        <div className="summary-content">
                            <h3>Día Más Frecuente</h3>
                            <div className="summary-value">{extendedStats.mostFrequentDay}</div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon"><FaFireAlt /></div>
                        <div className="summary-content">
                            <h3>Racha Más Larga</h3>
                            <div className="summary-value">{extendedStats.longestStreak} días</div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon"><FaMedal /></div>
                        <div className="summary-content">
                            <h3>Sesiones Totales</h3>
                            <div className="summary-value">{extendedStats.totalSessions}</div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon"><FaClock /></div>
                        <div className="summary-content">
                            <h3>Promedio Reps por Serie</h3>
                            <div className="summary-value">{extendedStats.averageRepsPerSet.toFixed(1)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="progress-charts">
                <div className="chart-container">
                    <h2><FaChartBar /> Rendimiento Semanal</h2>
                    {weeklyPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300} className="performance-chart">
                            <LineChart data={weeklyPerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke= "black"  />
                                <YAxis yAxisId="left" orientation="left" stroke="black" label={{ value: 'Peso Total', angle: -90, position: 'insideLeft', stroke: 'black' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="black" label={{ value: 'Repeticiones', angle: 90, position: 'insideRight', stroke: 'black'  }} />
                                <Tooltip
                                    formatter={(value, name, props) => {
                                        // Custom tooltip to show more details
                                        switch(name) {
                                            case 'totalWeight':
                                                return [`${value.toFixed(2)} kg`, 'Peso Total'];
                                            case 'totalReps':
                                                return [`${value}`, 'Repeticiones Totales'];
                                            default:
                                                return value;
                                        }
                                    }}
                                />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="totalWeight"
                                    stroke="#0070f3"
                                    name="Peso Total (kg)"
                                    activeDot={{ r: 8 }}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="totalReps"
                                    stroke="gray"
                                    name="Repeticiones Totales"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-activity">No hay datos de rendimiento disponibles</div>
                    )}
                </div>

                <div className="chart-container">
                    <h2><FaChartPie /> Actividad Semanal</h2>
                    <div className="weekly-activity">
                        {weeklyActivityData.map((item, index) => {
                            const todayIndex = getTodayIndex();
                            const isToday = index === todayIndex;
                            // Avoid division by zero if all values are 0
                            const maxExercises = Math.max(...weeklyActivityData.map(d => d.exercises)) || 1;
                            const heightPercentage = (item.exercises / maxExercises) * 100;

                            return (
                                <div className="day-column" key={item.day}>
                                    <div className="day-bar-container">
                                        <div
                                            className={`day-bar ${isToday ? 'active' : ''}`}
                                            style={{ height: `${heightPercentage}%` }}
                                        >
                                            <span className="bar-value">{item.exercises}</span>
                                        </div>
                                    </div>
                                    <div className="day-label">{item.day}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="recent-activity">
                <h2 className="section-title"><FaRunning /> Actividad Reciente</h2>
                <div className="activity-list">
                    {recentActivity && recentActivity.length > 0 ? (
                        recentActivity.map(activity => (
                            <div className="activity-item" key={activity.id || Math.random()}>
                                <div className="activity-icon">
                                    <FaDumbbell />
                                </div>
                                <div className="activity-details">
                                    <div className="activity-exercise">{activity.exercise || "Ejercicio"}</div>
                                    <div className="activity-stats">
                                        {activity.weight || 0} kg × {activity.reps || 0} reps × {activity.sets || 0} series
                                    </div>
                                    <div className="activity-date">{formatDate(activity.completedAt)}</div>
                                </div>
                                <div className="activity-xp">
                                    <FaBolt /> {typeof activity.xp === 'number' ? activity.xp : 0}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-activity">No hay actividad reciente para mostrar</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Progress;