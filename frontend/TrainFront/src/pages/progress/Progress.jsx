import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useXP } from '../../contexts/XPContext';
import './Progress.css';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Simple icon components
const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M12 2v10M6 8h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2Z" />
    </svg>
);

const ChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" />
    </svg>
);

function Progress() {
    const { xp } = useXP();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totals: { totalSets: 0, totalReps: 0, totalWeight: 0, totalXP: 0, totalCompletions: 0 },
        averages: { avgSets: 0, avgReps: 0, avgWeight: 0 },
        progressOverTime: [],
        weightProgress: [],
        achievements: [],
        topExercises: []
    });

    // For progress photos
    const [previews, setPreviews] = useState({
        photoOne: '', photoTwo: '', photoThree: ''
    });

    useEffect(() => {
        // Fetch all necessary data
        const fetchData = async () => {
            try {
                // Get exercises data
                const exercisesRes = await axios.get('/api/exercises');
                const exercisesById = {};

                if (Array.isArray(exercisesRes.data)) {
                    exercisesRes.data.forEach(exercise => {
                        exercisesById[exercise.id] = exercise;
                    });
                }

                // Get completions data
                const completionsRes = await axios.get('/api/exercise-completions/me');

                // Get photos
                const photosRes = await axios.get('/api/progress/me');
                setPreviews(photosRes.data);

                // Process exercise data
                processExerciseData(completionsRes.data, exercisesById);

            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Process exercise completion data
    const processExerciseData = (completions, exercisesById) => {
        if (!completions || completions.length === 0) return;

        // Sort completions by date
        const sortedCompletions = [...completions].sort((a, b) =>
            new Date(a.completedAt) - new Date(b.completedAt)
        );

        // Group by exercise and calculate stats
        const exerciseMap = {};
        let totalSets = 0;
        let totalReps = 0;
        let totalWeight = 0;
        let totalXP = 0;

        sortedCompletions.forEach(completion => {
            // Add to totals
            totalSets += completion.sets;
            totalReps += completion.sets * completion.reps;
            totalWeight += completion.sets * completion.reps * completion.weight;
            totalXP += completion.xpReward;

            // Get exercise name
            let exerciseName = "Unknown Exercise";
            if (completion.exercise?.name) {
                exerciseName = completion.exercise.name;
            } else if (completion.exerciseId && exercisesById[completion.exerciseId]) {
                exerciseName = exercisesById[completion.exerciseId].name;
            }

            // Group by exercise
            if (!exerciseMap[exerciseName]) {
                exerciseMap[exerciseName] = {
                    totalXP: 0,
                    count: 0,
                    weightProgress: []
                };
            }

            exerciseMap[exerciseName].totalXP += completion.xpReward;
            exerciseMap[exerciseName].count += 1;
            exerciseMap[exerciseName].weightProgress.push({
                date: new Date(completion.completedAt).toLocaleDateString(),
                weight: completion.weight
            });
        });

        // Generate time series data
        const progressByMonth = {};
        sortedCompletions.forEach(completion => {
            const date = new Date(completion.completedAt);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

            if (!progressByMonth[monthKey]) {
                progressByMonth[monthKey] = {
                    period: monthKey,
                    xp: 0,
                    volume: 0
                };
            }

            progressByMonth[monthKey].xp += completion.xpReward;
            progressByMonth[monthKey].volume += completion.sets * completion.reps * completion.weight;
        });

        // Convert to arrays for charting
        const progressOverTime = Object.values(progressByMonth)
            .sort((a, b) => a.period.localeCompare(b.period));

        // Get top exercises
        const topExercises = Object.entries(exerciseMap)
            .map(([name, data]) => ({ name, totalXP: data.totalXP, count: data.count }))
            .sort((a, b) => b.totalXP - a.totalXP)
            .slice(0, 5);

        // Get weight progress for top 3 exercises
        const topExerciseNames = topExercises.slice(0, 3).map(ex => ex.name);
        const weightProgressData = [];

        topExerciseNames.forEach(name => {
            if (exerciseMap[name]?.weightProgress.length > 1) {
                const sortedProgress = [...exerciseMap[name].weightProgress].sort(
                    (a, b) => new Date(a.date) - new Date(b.date)
                );

                weightProgressData.push({
                    name,
                    data: sortedProgress
                });
            }
        });

        // Generate achievements
        const achievements = [];
        if (sortedCompletions.length > 0) {
            achievements.push({
                id: 1,
                name: 'First Workout',
                date: new Date(sortedCompletions[0].completedAt).toLocaleDateString()
            });
        }

        if (totalXP >= 1000) {
            achievements.push({
                id: 2,
                name: 'Beginner Expert: 1000+ XP',
                date: new Date().toLocaleDateString()
            });
        }

        achievements.push({
            id: 3,
            name: `Versatility: ${Object.keys(exerciseMap).length} different exercises`,
            date: new Date().toLocaleDateString()
        });

        // Set stats
        setStats({
            totals: {
                totalSets,
                totalReps,
                totalWeight: totalWeight.toFixed(1),
                totalXP,
                totalCompletions: sortedCompletions.length,
                totalWorkouts: Math.ceil(sortedCompletions.length / 3)
            },
            averages: {
                avgSets: sortedCompletions.length > 0 ? (totalSets / sortedCompletions.length).toFixed(1) : 0,
                avgReps: totalSets > 0 ? (totalReps / totalSets).toFixed(1) : 0,
                avgWeight: totalReps > 0 ? (totalWeight / totalReps).toFixed(1) : 0
            },
            progressOverTime,
            weightProgress: weightProgressData,
            achievements,
            topExercises
        });
    };

    // Handle file change for photos
    const handleFileChange = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [key]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Submit photos
    const handlePhotoSubmit = (e) => {
        e.preventDefault();
        axios.put('/api/progress/update', previews)
            .then(() => alert('Photos updated successfully!'))
            .catch(err => console.error('Error updating photos:', err));
    };

    if (loading) return <div className="progress-loading">Loading your fitness data...</div>;

    // Format weight progress data for chart
    const prepareWeightData = () => {
        const formattedData = [];
        const allDates = new Set();

        // Get all unique dates
        stats.weightProgress.forEach(exercise => {
            exercise.data.forEach(point => {
                allDates.add(point.date);
            });
        });

        // Sort dates
        const sortedDates = [...allDates].sort((a, b) => new Date(a) - new Date(b));

        // Create data points
        sortedDates.forEach(date => {
            const dataPoint = { date };

            stats.weightProgress.forEach(exercise => {
                const match = exercise.data.find(point => point.date === date);
                dataPoint[exercise.name] = match ? match.weight : null;
            });

            formattedData.push(dataPoint);
        });

        return {
            data: formattedData,
            exercises: stats.weightProgress.map(ex => ex.name)
        };
    };

    const weightData = prepareWeightData();

    return (
        <div className="progress-container">
            <div className="page-title">
                <h1>FITNESS TRACKER</h1>
                <p>Monitor your progress and reach your fitness goals</p>
            </div>

            {/* Summary cards */}
            <div className="progress-overview">
                <div className="progress-card xp-card">
                    <h3>Total XP</h3>
                    <p className="progress-number">{stats.totals.totalXP}</p>
                    <p className="progress-label">{xp?.levelName ? `Current Level: ${xp.levelName}` : 'Keep it up!'}</p>
                </div>
                <div className="progress-card">
                    <h3>Total Workouts</h3>
                    <p className="progress-number">{stats.totals.totalWorkouts}</p>
                </div>
                <div className="progress-card">
                    <h3>Total Weight Lifted</h3>
                    <p className="progress-number">{(stats.totals.totalWeight / 1000).toFixed(1)}t</p>
                </div>
            </div>

            {/* Weight progress chart */}
            <div className="progress-chart-section">
                <div className="panel-header">
                    <h2>Weight Progress by Exercise</h2>
                </div>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weightData.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {weightData.exercises.map((exercise, index) => (
                                <Line
                                    key={exercise}
                                    type="monotone"
                                    dataKey={exercise}
                                    stroke={`hsl(${index * 120}, 70%, 50%)`}
                                    strokeWidth={2}
                                    connectNulls
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* XP progress chart */}
            <div className="progress-chart-section">
                <div className="panel-header">
                    <div className="panel-icon"><ChartIcon /></div>
                    <h2>XP Progress</h2>
                </div>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.progressOverTime}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="xp"
                                name="XP Earned"
                                stroke="#0084ff"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Exercise distribution */}
            <div className="progress-chart-section">
                <div className="panel-header">
                    <h2>Top 5 Exercises</h2>
                </div>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.topExercises}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="totalXP" name="Total XP" fill="#0084ff" />
                            <Bar dataKey="count" name="Times Completed" fill="#00e5ff" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Achievements */}
            <div className="progress-details">
                <div className="achievements-section">
                    <div className="panel-header">
                        <div className="panel-icon"><TrophyIcon /></div>
                        <h2>Achievements</h2>
                    </div>
                    <ul className="achievements-list">
                        {stats.achievements.map(a => (
                            <li key={a.id} className="achievement-item">
                                <span className="achievement-name">{a.name}</span>
                                <span className="achievement-date">{a.date}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Upload section - simplified */}
            <div className="progress-upload-section">
                <h2>Upload Progress Photos</h2>
                <form onSubmit={handlePhotoSubmit} className="upload-form">
                    {['photoOne', 'photoTwo', 'photoThree'].map(key => (
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