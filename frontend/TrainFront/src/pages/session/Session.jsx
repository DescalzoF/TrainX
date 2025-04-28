import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Session.css';

const Session = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generationSuccess, setGenerationSuccess] = useState(false);
    const [activeSession, setActiveSession] = useState(null);

    // Fetch existing sessions when component mounts
    useEffect(() => {
        fetchUserSessions();
    }, []);

    // Function to fetch user sessions
    const fetchUserSessions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/sessions/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Ensure we're setting an array, even if the response is empty or not as expected
            setSessions(Array.isArray(response.data) ? response.data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching sessions:', err);
            setError(err.response?.data?.message || 'Failed to load sessions');
            // Set sessions to empty array in case of error
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    // Function to generate sessions
    const generateSessions = async () => {
        setLoading(true);
        setGenerationSuccess(false);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8080/api/sessions/generate', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Ensure we're setting an array, even if the response is empty or not as expected
            setSessions(Array.isArray(response.data) ? response.data : []);
            setGenerationSuccess(true);
            setError(null);
        } catch (err) {
            console.error('Error generating sessions:', err);
            setError(err.response?.data?.message || 'Failed to generate sessions');
            setGenerationSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    // Function to update weight for an exercise
    const updateWeight = async (sessionExerciseId, weight) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/sessions/exercise/${sessionExerciseId}/weight`,
                { weight },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            // Update local state to reflect the change
            setSessions(prevSessions =>
                prevSessions.map(session => ({
                    ...session,
                    exercises: session.exercises.map(exercise =>
                        exercise.id === sessionExerciseId
                            ? { ...exercise, weight }
                            : exercise
                    )
                }))
            );
        } catch (err) {
            console.error('Error updating weight:', err);
            setError(err.response?.data?.message || 'Failed to update weight');
        }
    };

    // Handle weight input change
    const handleWeightChange = (sessionExerciseId, value) => {
        // Update local state immediately for responsive UI
        setSessions(prevSessions =>
            prevSessions.map(session => ({
                ...session,
                exercises: session.exercises.map(exercise =>
                    exercise.id === sessionExerciseId
                        ? { ...exercise, weight: parseFloat(value) || 0 }
                        : exercise
                )
            }))
        );
    };

    // Function to handle weight blur (save when user leaves input)
    const handleWeightBlur = (sessionExerciseId, weight) => {
        updateWeight(sessionExerciseId, weight);
    };

    // Toggle session expansion
    const toggleSession = (sessionId) => {
        setActiveSession(activeSession === sessionId ? null : sessionId);
    };

    // Debugging help
    console.log('Sessions state:', sessions);

    return (
        <div className="session-container">
            <h1>Your Training Sessions</h1>

            {/* Button to generate sessions */}
            <div className="generate-section">
                <button
                    className="generate-button"
                    onClick={generateSessions}
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Generate Training Sessions'}
                </button>
                {error && <p className="error-message">{error}</p>}
                {generationSuccess && <p className="success-message">Sessions generated successfully!</p>}
            </div>

            {/* Sessions list */}
            {Array.isArray(sessions) && sessions.length > 0 ? (
                <div className="sessions-list">
                    {sessions.map((session, index) => (
                        <div key={session.id || `session-${index}`} className="session-card">
                            <div
                                className="session-header"
                                onClick={() => toggleSession(session.id)}
                            >
                                <h2>{session.sessionType}</h2>
                                <span className="toggle-icon">
                                    {activeSession === session.id ? '▼' : '▶'}
                                </span>
                            </div>

                            {activeSession === session.id && (
                                <div className="session-details">
                                    <div className="exercises-table">
                                        <div className="table-header">
                                            <div className="col-exercise">Exercise</div>
                                            <div className="col-muscle">Muscle Group</div>
                                            <div className="col-sets">Sets</div>
                                            <div className="col-reps">Reps</div>
                                            <div className="col-weight">Weight (kg)</div>
                                            <div className="col-video">Video</div>
                                        </div>

                                        {session.exercises && Array.isArray(session.exercises) ? (
                                            session.exercises.map((exercise, idx) => (
                                                <div className="table-row" key={exercise.id || `exercise-${session.id}-${idx}`}>
                                                    <div className="col-exercise">
                                                        <strong>{exercise.exercise?.name || 'Unknown Exercise'}</strong>
                                                        <p className="exercise-description">{exercise.exercise?.description || ''}</p>
                                                    </div>
                                                    <div className="col-muscle">{exercise.exercise?.muscleGroup || 'Unknown'}</div>
                                                    <div className="col-sets">{exercise.sets || 0}</div>
                                                    <div className="col-reps">{exercise.reps || 0}</div>
                                                    <div className="col-weight">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.5"
                                                            value={exercise.weight || 0}
                                                            onChange={(e) => handleWeightChange(exercise.id, e.target.value)}
                                                            onBlur={(e) => handleWeightBlur(exercise.id, parseFloat(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                    <div className="col-video">
                                                        {exercise.exercise?.videoUrl && (
                                                            <a
                                                                href={exercise.exercise.videoUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="video-link"
                                                            >
                                                                Watch Video
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="table-row">
                                                <div style={{ padding: '20px', textAlign: 'center' }}>No exercises found for this session</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                !loading && <p className="no-sessions">No training sessions available. Generate sessions to get started!</p>
            )}
        </div>
    );
};

export default Session;