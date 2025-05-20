import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './LeaderboardPorNivel.css';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const LeaderboardPorNivel = () => {
    const [groupedLeaderboard, setGroupedLeaderboard] = useState({
        Principiante: [],
        Intermedio: [],
        Avanzado: [],
        Pro: []
    });
    const levelIcons = {
        Principiante: "🐣",
        Intermedio: "🚀",
        Avanzado: "🧠",
        Pro: "🦾"
    };

    const currentUsername = localStorage.getItem('username');

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '-';

    useEffect(() => {
        axios.get('http://localhost:8080/api/exercise-completions/leaderboard-general')
            .then(res => {
                const filtered = res.data.filter(user => user.username !== "TrainXAdmin");

                const grouped = {
                    Principiante: [],
                    Intermedio: [],
                    Avanzado: [],
                    Pro: []
                };

                filtered.forEach(user => {
                    const level = capitalize(user.levelName) || 'Desconocido';
                    if (grouped[level]) {
                        grouped[level].push(user);
                    }
                });

                // Ordenar cada grupo por XP de mayor a menor
                Object.keys(grouped).forEach(level => {
                    grouped[level].sort((a, b) => b.totalXp - a.totalXp);
                });

                setGroupedLeaderboard(grouped);
            })
            .catch(err => console.error('Error loading leaderboard:', err));
    }, []);

    const renderLeaderboard = (levelName, users) => (
        <div key={levelName} className="leaderboard-section">
            <h2 className="level-title">
                {levelIcons[levelName] || "🏆"} Leaderboard {levelName}
            </h2>
            <div className="leaderboard-container">
                <div className="leaderboard-header">
                    <div>#</div>
                    <div>Usuario</div>
                    <div>Camino</div>
                    <div className="day-name">Día Frecuente</div>
                    <div>Sesiones</div>
                    <div className="xp-name">XP Total</div>
                    <div>Racha</div>
                </div>
                {users.map((user, index) => {
                    const isCurrentUser = user.username === currentUsername;
                    return (
                        <div
                            key={user.userId}
                            className={`leaderboard-row ${isCurrentUser ? 'current-user-row' : ''}`}
                        >
                            <div className="rank-number">{index + 1}</div>
                            <div className="user-cell">
                                <img
                                    src={user.profilePictureUrl}
                                    alt={user.username}
                                    className="user-photo"
                                />
                                <span className="username">{user.username}</span>
                            </div>
                            <div className="cf-name">{user.caminoFitnessName}</div>
                            <div>{capitalize(user.mostFrequentDay)}</div>
                            <div className="session-number">{user.totalSessions || 0}</div>
                            <div className="xp-cell">{user.totalXp} XP</div>
                            <div className="streak-cell">
                                {user.currentStreak > 0 ? (
                                    <span className="streak streak-up">
                                        <span className="streak-number">{user.currentStreak}</span> <ArrowUpRight size={18} />
                                    </span>
                                ) : (
                                    <span className="streak streak-down">
                                        0 <ArrowDownRight size={18} />
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="leaderboard-wrapper">
            <h1 className="leaderboard-title">Leaderboard por Nivel</h1>
            {renderLeaderboard("Principiante", groupedLeaderboard.Principiante)}
            {renderLeaderboard("Intermedio", groupedLeaderboard.Intermedio)}
            {renderLeaderboard("Avanzado", groupedLeaderboard.Avanzado)}
            {renderLeaderboard("Pro", groupedLeaderboard.Pro)}
        </div>
    );
};

export default LeaderboardPorNivel;
