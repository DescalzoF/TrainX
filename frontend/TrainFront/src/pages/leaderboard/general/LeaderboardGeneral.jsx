import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './LeaderboardGeneral.css';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const LeaderboardGeneral = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const currentUsername = localStorage.getItem('username');
    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '-';

    useEffect(() => {
        axios.get('http://localhost:8080/api/exercise-completions/leaderboard-general')
            .then(res => setLeaderboard(res.data))
            .catch(err => console.error('Error loading leaderboard:', err));
    }, []);

    return (
        <div className="leaderboard-wrapper">
            <h1 className="leaderboard-title">🏆 Leaderboard General</h1>
            <div className="leaderboard-container">
                <div className="leaderboard-header">
                    <div>#</div>
                    <div>Usuario</div>
                    <div>Camino</div>
                    <div>Nivel</div>
                    <div className="day-name">Día Frecuente</div>
                    <div>Sesiones</div>
                    <div className="xp-name">XP Total</div>
                    {/* Mover "Racha" al final */}
                    <div className="racha">Racha</div>
                </div>
                {leaderboard
                    .filter(user => user.username !== "TrainXAdmin")
                    .map((user, index) => {
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
                                <div className="level-name">{user.levelName}</div>
                                <div>{capitalize(user.mostFrequentDay)}</div>
                                <div className="session-number">{user.totalSessions || 0}</div>
                                <div className="xp-cell">{user.totalXp} XP</div>
                                {/* Mover el contenido de "Racha" al final */}
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
};

export default LeaderboardGeneral;