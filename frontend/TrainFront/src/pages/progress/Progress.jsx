import React, { useState, useEffect } from 'react';
import { useXP } from '../../contexts/XPContext';
import './Progress.css';

// Icon components
const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
        <path d="M4 22h16"></path>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
        <path d="M9 2v7.5"></path>
        <path d="M15 2v7.5"></path>
        <path d="M12 2v10"></path>
        <path d="M6 8h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2Z"></path>
    </svg>
);

const ChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"></path>
        <path d="M18 17V9"></path>
        <path d="M13 17V5"></path>
        <path d="M8 17v-3"></path>
    </svg>
);

const LightningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
    </svg>
);

function Progress() {
    const { xp, refreshXP } = useXP();
    const [userProgress, setUserProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    // Use XP data to calculate progress metrics
    useEffect(() => {
        // If XP is not available yet, try refreshing
        if (!xp && loading) {
            refreshXP();
            return;
        }

        // Extract XP points from the XP context
        const xpPoints = xp?.totalXp || 0;

        // Calculate derived metrics based on XP points
        const totalExercises = Math.round(xpPoints / 50);
        const totalReps = totalExercises * 12;
        const totalSets = totalExercises * 3;

        // Create progress object with calculated values
        const progressData = {
            xpPoints: xpPoints,
            totalWorkouts: Math.round(xpPoints / 100), // Estimate based on XP
            completedExercises: totalExercises,
            totalReps: totalReps,
            totalSets: totalSets,
            recentAchievements: [
                {
                    id: 1,
                    name: "First Workout",
                    date: new Date().toISOString().split('T')[0]
                },
                {
                    id: 2,
                    name: "Weekly Streak",
                    date: new Date().toISOString().split('T')[0]
                }
            ],
            monthlyStats: [
                { month: "January", workouts: Math.round(xpPoints * 0.1) },
                { month: "February", workouts: Math.round(xpPoints * 0.15) },
                { month: "March", workouts: Math.round(xpPoints * 0.25) },
                { month: "April", workouts: Math.round(xpPoints * 0.5) }
            ]
        };

        setUserProgress(progressData);
        setLoading(false);
    }, [xp, refreshXP, loading]);

    // Show loading state while waiting for XP data
    if (loading) {
        return <div className="progress-loading">Loading your fitness data...</div>;
    }

    // Calculate max workout value for graph scaling
    const maxWorkoutValue = Math.max(...userProgress.monthlyStats.map(stat => stat.workouts));

    return (
        <div className="progress-container">
            <div className="page-title" style={{ paddingTop: "70px" }}>
                <h1>FITNESS TRACKER PRO</h1>
                <p>Track your progress and achieve your fitness goals</p>
            </div>

            <div className="progress-overview">
                <div className="progress-card xp-card">
                    <div className="panel-icon">
                        <LightningIcon />
                    </div>
                    <h3>Total Experience Points</h3>
                    <p className="progress-number">{userProgress.xpPoints}</p>
                    <p className="progress-label">
                        {xp?.levelName ? `Current Level: ${xp.levelName}` : 'Keep it up! You\'re doing great!'}
                    </p>
                </div>

                <div className="progress-card">
                    <h3>Total Workouts</h3>
                    <p className="progress-number">{userProgress.totalWorkouts}</p>
                    <p className="progress-label">Sessions Completed</p>
                </div>

                <div className="progress-card">
                    <h3>Exercises Completed</h3>
                    <p className="progress-number">{userProgress.completedExercises}</p>
                    <p className="progress-label">Total Exercises</p>
                </div>

                <div className="progress-card">
                    <h3>Total Repetitions</h3>
                    <p className="progress-number">{userProgress.totalReps}</p>
                    <p className="progress-label">Reps Performed</p>
                </div>

                <div className="progress-card">
                    <h3>Total Sets</h3>
                    <p className="progress-number">{userProgress.totalSets}</p>
                    <p className="progress-label">Sets Completed</p>
                </div>
            </div>

            <div className="progress-details">
                <div className="achievements-section">
                    <div className="panel-header">
                        <div className="panel-icon">
                            <TrophyIcon />
                        </div>
                        <h2>Recent Achievements</h2>
                    </div>
                    <ul className="achievements-list">
                        {userProgress.recentAchievements.map(achievement => (
                            <li key={achievement.id} className="achievement-item">
                                <span className="achievement-name">
                                    <span className="achievement-badge"></span>
                                    {achievement.name}
                                </span>
                                <span className="achievement-date">{achievement.date}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="monthly-stats">
                    <div className="panel-header">
                        <div className="panel-icon">
                            <ChartIcon />
                        </div>
                        <h2>Monthly Progress</h2>
                    </div>
                    <div className="stats-graph">
                        {userProgress.monthlyStats.map((stat, index) => (
                            <div key={index} className="stat-bar-container">
                                <span className="stat-value">{stat.workouts}</span>
                                <div
                                    className="stat-bar"
                                    style={{ height: `${(stat.workouts / maxWorkoutValue) * 180}px` }}
                                ></div>
                                <span className="stat-month">{stat.month.substring(0, 3)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Progress;