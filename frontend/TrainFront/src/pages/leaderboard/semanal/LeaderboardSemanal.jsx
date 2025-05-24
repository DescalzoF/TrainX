/* LeaderboardSemanal.jsx */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './LeaderboardSemanal.css';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const LeaderboardSemanal = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const currentUsername = localStorage.getItem('username');

    useEffect(() => {
        axios
            .get('http://localhost:8080/api/exercise-completions/leaderboard-semanal')
            .then(res => setLeaderboard(res.data))
            .catch(err => console.error('Error loading weekly leaderboard:', err));
    }, []);

    return (
        <div className="sem-wrapper">
            <h1 className="sem-title">🏆 Leaderboard Semanal</h1>
            <div className="sem-container">
                <div className="sem-header">
                    <div>#</div>
                    <div>Usuario</div>
                    <div>Nivel</div>
                    <div>Ejercicios</div>
                    <div>Peso Total Levantado (kg)</div>
                    <div>Repes Totales</div>
                    <div className="sem-xp-label">XP Semanal</div>

                </div>

                {leaderboard
                    .filter(user => user.username !== 'TrainXAdmin')
                    .map((user, index) => {
                        const isCurrent = user.username === currentUsername;
                        return (
                            <div
                                key={user.userId}
                                className={`sem-row ${isCurrent ? 'sem-current-row' : ''}`}
                            >
                                <div className="sem-rank">{index + 1}</div>
                                <div className="sem-user-cell">
                                    {user.userPhoto && (
                                        <img
                                            src={user.userPhoto}
                                            alt={user.username}
                                            className="sem-photo"
                                        />
                                    )}
                                    <span className="sem-username">{user.username}</span>
                                </div>
                                <div className="sem-level">{user.levelName}</div>
                                <div className="sem-sessions">{user.weeklyExercisesCompleted || 0}</div>
                                <div className="sem-weight">
                                    {user.totalWeight ? `${user.totalWeight.toFixed(1)}` : '0.0'}
                                </div>
                                <div className="sem-reps">{user.totalWeeklyReps || 0} XP</div>
                                <div className="sem-xp-cell">{user.weeklyXp || 0} </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default LeaderboardSemanal;