import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useXP } from '../../contexts/XPContext';
import './Progress.css';

// Icon components
const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M9 2v7.5" />
        <path d="M15 2v7.5" />
        <path d="M12 2v10" />
        <path d="M6 8h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2Z" />
    </svg>
);

const ChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
    </svg>
);

const LightningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
);

function Progress() {
    const { xp, refreshXP } = useXP();
    const [userProgress, setUserProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    // States for progress photos
    const photoKeys = ['photoOne', 'photoTwo', 'photoThree', 'photoFour', 'photoFive'];
    const [previews, setPreviews] = useState({
        photoOne: '', photoTwo: '', photoThree: '', photoFour: '', photoFive: ''
    });
    const [selectedFiles, setSelectedFiles] = useState({
        photoOne: null, photoTwo: null, photoThree: null, photoFour: null, photoFive: null
    });

    // Fetch existing progress (photos + stats)
    useEffect(() => {
        // Fetch photos
        axios.get('/api/progress/me')
            .then(res => setPreviews(res.data))
            .catch(err => console.error('Error fetching progress photos:', err));
    }, []);

    // Handle file selection & preview
    const handleFileChange = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [key]: reader.result }));
                setSelectedFiles(prev => ({ ...prev, [key]: file }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Submit new photos
    const handlePhotoSubmit = (e) => {
        e.preventDefault();
        const dto = photoKeys.reduce((acc, key) => {
            acc[key] = previews[key] || null;
            return acc;
        }, {});

        axios.put('/api/progress/update', dto)
            .then(() => alert('Photos updated successfully!'))
            .catch(err => console.error('Error updating photos:', err));
    };

    // Fetch XP-based stats
    useEffect(() => {
        if (!xp && loading) {
            refreshXP();
            return;
        }
        const xpPoints = xp?.totalXp || 0;
        const totalExercises = Math.round(xpPoints / 50);
        const totalReps = totalExercises * 12;
        const totalSets = totalExercises * 3;
        setUserProgress({
            xpPoints,
            totalWorkouts: Math.round(xpPoints / 100),
            completedExercises: totalExercises,
            totalReps,
            totalSets,
            recentAchievements: [
                { id: 1, name: 'First Workout', date: new Date().toISOString().split('T')[0] },
                { id: 2, name: 'Weekly Streak', date: new Date().toISOString().split('T')[0] }
            ],
            monthlyStats: [
                { month: 'January', workouts: Math.round(xpPoints * 0.1) },
                { month: 'February', workouts: Math.round(xpPoints * 0.15) },
                { month: 'March', workouts: Math.round(xpPoints * 0.25) },
                { month: 'April', workouts: Math.round(xpPoints * 0.5) }
            ]
        });
        setLoading(false);
    }, [xp, refreshXP, loading]);

    if (loading) return <div className="progress-loading">Loading your fitness data...</div>;

    const maxWorkoutValue = Math.max(...userProgress.monthlyStats.map(s => s.workouts));

    return (
        <div className="progress-container">
            <div className="page-title" style={{ paddingTop: '70px' }}>
                <h1>FITNESS TRACKER PRO</h1>
                <p>Track your progress and achieve your fitness goals</p>
            </div>
            {/* Overview cards */}
            <div className="progress-overview">
                <div className="progress-card xp-card">
                    <div className="panel-icon"><LightningIcon /></div>
                    <h3>Total Experience Points</h3>
                    <p className="progress-number">{userProgress.xpPoints}</p>
                    <p className="progress-label">{xp?.levelName ? `Current Level: ${xp.levelName}` : 'Keep it up!'}</p>
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

            {/* Details section */}
            <div className="progress-details">
                <div className="achievements-section">
                    <div className="panel-header"><div className="panel-icon"><TrophyIcon /></div><h2>Recent Achievements</h2></div>
                    <ul className="achievements-list">
                        {userProgress.recentAchievements.map(a => (
                            <li key={a.id} className="achievement-item">
                                <span className="achievement-name">{a.name}</span>
                                <span className="achievement-date">{a.date}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="monthly-stats">
                    <div className="panel-header"><div className="panel-icon"><ChartIcon /></div><h2>Monthly Progress</h2></div>
                    <div className="stats-graph">
                        {userProgress.monthlyStats.map((stat, i) => (
                            <div key={i} className="stat-bar-container">
                                <span className="stat-value">{stat.workouts}</span>
                                <div className="stat-bar" style={{ height: `${(stat.workouts/maxWorkoutValue)*180}px` }}></div>
                                <span className="stat-month">{stat.month.substring(0,3)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Upload section */}
            <div className="progress-upload-section">
                <h2>Upload Progress Photos</h2>
                <form onSubmit={handlePhotoSubmit} className="upload-form">
                    {photoKeys.map(key => (
                        <div key={key} className="photo-input-container">
                            {previews[key] && <img src={previews[key]} alt="Preview" className="photo-preview" />}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => handleFileChange(e, key)}
                            />
                        </div>
                    ))}
                    <button type="submit" className="upload-button">Save Photos</button>
                </form>
            </div>
        </div>
    );
}

export default Progress;
