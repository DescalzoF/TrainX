import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './XPBar.css';
import { useAuth } from '../../contexts/AuthContext';
import { useXP } from '../../contexts/XPContext.jsx';

function XPBar() {
    const { isLoggedIn, currentUser } = useAuth();
    const { xp, subscribeToXPChanges } = useXP();
    const [totalXp, setTotalXp] = useState(0);
    const [loading, setLoading] = useState(true);
    const [leveledUp, setLeveledUp] = useState(false);
    const updateIntervalRef = useRef(null);
    const [animatedXP, setAnimatedXP] = useState(0);

    // Define the level ranges directly in the component
    const LEVEL_RANGES = [
        { name: 'Principiante', min: 0, max: 1000 },
        { name: 'Intermedio', min: 1000, max: 3000 },
        { name: 'Avanzado', min: 3000, max: 6000 },
        { name: 'Pro', min: 6000, max: 10000 },
        { name: 'Pro+', min: 10000, max: 15000 },
        { name: 'Maestro', min: 15000, max: 30000 }
    ];

    // Calculate level info based on total XP
    const calculateLevelInfo = (xpAmount) => {
        // Find the appropriate level range
        const level = LEVEL_RANGES.find(range =>
            xpAmount >= range.min && xpAmount < range.max
        ) || LEVEL_RANGES[LEVEL_RANGES.length - 1]; // Default to highest level if beyond all ranges

        // Calculate progress within the level
        const xpInLevel = xpAmount - level.min;
        const levelRange = level.max - level.min;
        const progressPercentage = Math.min(100, Math.max(0, (xpInLevel / levelRange) * 100));

        return {
            name: level.name,
            min: level.min,
            max: level.max,
            currentXp: xpAmount, // Store the full XP amount
            xpInLevel,
            levelRange,
            progressPercentage
        };
    };

    // Fetch only the total XP from the backend
    useEffect(() => {
        const fetchTotalXP = async () => {
            if (isLoggedIn && currentUser) {
                try {
                    setLoading(true);
                    const response = await axios.get(`http://localhost:8080/api/users/${currentUser.id}/xp-level`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    // We only care about the totalXp value from the response
                    if (response.data && response.data.totalXp !== undefined) {
                        const newTotalXp = response.data.totalXp || 0;
                        setTotalXp(newTotalXp);
                        setAnimatedXP(newTotalXp);

                        // Check if we leveled up (based on our previous knowledge)
                        const previousLevel = calculateLevelInfo(totalXp);
                        const newLevel = calculateLevelInfo(newTotalXp);
                        if (previousLevel.name !== newLevel.name && totalXp > 0) {
                            setLeveledUp(true);
                            console.log(`Level up! New level: ${newLevel.name}`);
                            // You could add a notification/animation here
                            setTimeout(() => setLeveledUp(false), 3000);
                        }
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching XP information:', error);
                    setLoading(false);
                }
            }
        };

        fetchTotalXP();

        // Setup interval for periodic XP updates
        updateIntervalRef.current = setInterval(() => {
            fetchTotalXP();
        }, 10000); // Refresh every 10 seconds

        return () => {
            if (updateIntervalRef.current) {
                clearInterval(updateIntervalRef.current);
            }
        };
    }, [isLoggedIn, currentUser]);

    // Listen for XP changes from the XP context
    useEffect(() => {
        if (!isLoggedIn || !currentUser) return;

        const unsubscribe = subscribeToXPChanges((newXpData) => {
            if (newXpData && newXpData.totalXp !== undefined) {
                const newTotalXp = newXpData.totalXp;

                // Check if we leveled up
                const previousLevel = calculateLevelInfo(totalXp);
                const newLevel = calculateLevelInfo(newTotalXp);

                if (previousLevel.name !== newLevel.name && totalXp > 0) {
                    setLeveledUp(true);
                    console.log(`Level up! New level: ${newLevel.name}`);
                    // You could add a notification/animation here
                    setTimeout(() => setLeveledUp(false), 3000);
                }

                setTotalXp(newTotalXp);
                setAnimatedXP(newTotalXp);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [isLoggedIn, currentUser, totalXp, subscribeToXPChanges]);

    // Watch for direct XP changes from the context
    useEffect(() => {
        if (xp && xp.totalXp !== undefined && xp.totalXp !== totalXp) {
            const newTotalXp = xp.totalXp;

            // Check if we leveled up
            const previousLevel = calculateLevelInfo(totalXp);
            const newLevel = calculateLevelInfo(newTotalXp);

            if (previousLevel.name !== newLevel.name && totalXp > 0) {
                setLeveledUp(true);
                console.log(`Level up! New level: ${newLevel.name}`);
                // You could add a notification/animation here
                setTimeout(() => setLeveledUp(false), 3000);
            }

            setTotalXp(newTotalXp);
            setAnimatedXP(newTotalXp);
        }
    }, [xp, totalXp]);

    if (!isLoggedIn || loading) {
        return null;
    }

    // Calculate current level info
    const levelInfo = calculateLevelInfo(animatedXP);

    return (
        <div className="xp-bar-container">
            <div className="xp-bar-wrapper">
                <div
                    className="xp-bar-fill"
                    style={{ width: `${levelInfo.progressPercentage}%` }}
                ></div>
                <div className="xp-numbers">
                    <span>{levelInfo.currentXp}</span>
                    <span>/{levelInfo.max} XP</span>
                </div>
            </div>
            <div className="level-indicator">
                {levelInfo.name}
            </div>
        </div>
    );
}

export default XPBar;