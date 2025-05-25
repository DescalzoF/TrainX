// TrainFront/src/pages/DuelRouter/DuelRouter.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const DuelRouter = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [hasActiveDuel, setHasActiveDuel] = useState(false);
    const [error, setError] = useState(null);
    const location = useLocation();

    useEffect(() => {
        checkActiveDuel();
    }, []);

    const checkActiveDuel = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/duels/active-duel', {
                withCredentials: true
            });
            setHasActiveDuel(response.data.hasActiveDuel);
        } catch (err) {
            console.error("Error checking active duel:", err);
            setError("Failed to check duel status");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="duel-router-loading">
                <div className="duel-router-spinner"></div>
                <p>Verificando estado del duelo...</p>
            </div>
        );
    }

    // If user tries to access /duel-competition without an active duel, redirect to /challenges
    if (location.pathname === '/duel-competition' && !hasActiveDuel) {
        return <Navigate to="/challenges" replace />;
    }

    // If user tries to access /challenges with an active duel, redirect to /duel-competition
    if (location.pathname === '/challenges' && hasActiveDuel) {
        return <Navigate to="/duel-competition" replace />;
    }

    // Otherwise, render the children (the protected route)
    return children;
};

export default DuelRouter;