import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

export default function ProgressPage() {
    const [progressData, setProgressData] = useState({
        currentWeek: {
            totalWeight: 0,
            totalReps: 0,
            totalSets: 0,
            totalXP: 0,
            dailyProgress: []
        },
        currentMonth: {
            totalWeight: 0,
            totalReps: 0,
            totalSets: 0,
            totalXP: 0,
            weeklyProgress: []
        }
    });

    const [userId, setUserId] = useState(1); // Default user ID, should be replaced with actual logged-in user ID
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('week');

    useEffect(() => {
        // Fetch user's progress data
        const fetchProgressData = async () => {
            setIsLoading(true);
            try {
                // Real API calls
                const weeklyResponse = await fetch(`/api/progress/weekly/${userId}`);
                const monthlyResponse = await fetch(`/api/progress/monthly/${userId}`);

                if (!weeklyResponse.ok || !monthlyResponse.ok) {
                    throw new Error('Failed to fetch progress data');
                }

                const weekData = await weeklyResponse.json();
                const monthData = await monthlyResponse.json();

                setProgressData({
                    currentWeek: weekData,
                    currentMonth: monthData
                });

            } catch (err) {
                setError('Failed to load progress data');
                console.error(err);

                // Fallback to mock data if API fails
                const mockWeekData = generateMockWeekData();
                const mockMonthData = generateMockMonthData();

                setProgressData({
                    currentWeek: mockWeekData,
                    currentMonth: mockMonthData
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProgressData();
    }, [userId]);

    // Mock data generator functions
    function generateMockWeekData() {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dailyProgress = days.map(day => {
            const workoutDone = Math.random() > 0.3; // 70% chance of workout on any day
            return {
                day,
                weight: workoutDone ? Math.floor(Math.random() * 1000) + 500 : 0, // 500-1500kg
                reps: workoutDone ? Math.floor(Math.random() * 100) + 50 : 0, // 50-150 reps
                sets: workoutDone ? Math.floor(Math.random() * 15) + 5 : 0, // 5-20 sets
                xp: workoutDone ? Math.floor(Math.random() * 200) + 50 : 0, // 50-250 XP
            };
        });

        // Calculate totals
        const totals = dailyProgress.reduce((acc, day) => {
            return {
                totalWeight: acc.totalWeight + day.weight,
                totalReps: acc.totalReps + day.reps,
                totalSets: acc.totalSets + day.sets,
                totalXP: acc.totalXP + day.xp
            };
        }, { totalWeight: 0, totalReps: 0, totalSets: 0, totalXP: 0 });

        return {
            ...totals,
            dailyProgress
        };
    }

    function generateMockMonthData() {
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const weeklyProgress = weeks.map(week => {
            return {
                week,
                weight: Math.floor(Math.random() * 4000) + 2000, // 2000-6000kg
                reps: Math.floor(Math.random() * 400) + 200, // 200-600 reps
                sets: Math.floor(Math.random() * 60) + 20, // 20-80 sets
                xp: Math.floor(Math.random() * 800) + 200, // 200-1000 XP
            };
        });

        // Calculate monthly totals
        const totals = weeklyProgress.reduce((acc, week) => {
            return {
                totalWeight: acc.totalWeight + week.weight,
                totalReps: acc.totalReps + week.reps,
                totalSets: acc.totalSets + week.sets,
                totalXP: acc.totalXP + week.xp
            };
        }, { totalWeight: 0, totalReps: 0, totalSets: 0, totalXP: 0 });

        return {
            ...totals,
            weeklyProgress
        };
    }

    if (isLoading) return <div className="loading-container">Loading progress data...</div>;
    if (error) return <div className="error-message">{error}</div>;

    const { currentWeek, currentMonth } = progressData;

    return (
        <div className="progress-page">
            <h1 className="page-title">Your Fitness Progress</h1>

            {/* Toggle between week and month views */}
            <div className="tab-container">
                <div className="tab-buttons">
                    <button
                        className={`tab-button ${activeTab === 'week' ? 'active' : ''}`}
                        onClick={() => setActiveTab('week')}
                    >
                        This Week
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'month' ? 'active' : ''}`}
                        onClick={() => setActiveTab('month')}
                    >
                        This Month
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid">
                {/* Total Weight */}
                <div className="stat-card">
                    <h3 className="stat-title">Total Weight</h3>
                    <p className="stat-value weight-value">
                        {activeTab === 'week' ? currentWeek.totalWeight : currentMonth.totalWeight} kg
                    </p>
                </div>

                {/* Total Reps */}
                <div className="stat-card">
                    <h3 className="stat-title">Total Reps</h3>
                    <p className="stat-value reps-value">
                        {activeTab === 'week' ? currentWeek.totalReps : currentMonth.totalReps}
                    </p>
                </div>

                {/* Total Sets */}
                <div className="stat-card">
                    <h3 className="stat-title">Total Sets</h3>
                    <p className="stat-value sets-value">
                        {activeTab === 'week' ? currentWeek.totalSets : currentMonth.totalSets}
                    </p>
                </div>

                {/* Total XP */}
                <div className="stat-card">
                    <h3 className="stat-title">Total XP</h3>
                    <p className="stat-value xp-value">
                        {activeTab === 'week' ? currentWeek.totalXP : currentMonth.totalXP} XP
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                {/* Weight Progress Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">Weight Lifted</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={activeTab === 'week' ? currentWeek.dailyProgress : currentMonth.weeklyProgress}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={activeTab === 'week' ? 'day' : 'week'} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="weight" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* XP Progress Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">XP Earned</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={activeTab === 'week' ? currentWeek.dailyProgress : currentMonth.weeklyProgress}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={activeTab === 'week' ? 'day' : 'week'} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="xp" stroke="#f97316" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Reps Progress Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">Repetitions</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={activeTab === 'week' ? currentWeek.dailyProgress : currentMonth.weeklyProgress}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={activeTab === 'week' ? 'day' : 'week'} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="reps" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sets Progress Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">Sets Completed</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={activeTab === 'week' ? currentWeek.dailyProgress : currentMonth.weeklyProgress}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={activeTab === 'week' ? 'day' : 'week'} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="sets" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}