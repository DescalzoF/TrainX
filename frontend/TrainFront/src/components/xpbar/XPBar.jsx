import { useState, useEffect, useRef } from 'react';
import './XPBar.css';
import { useAuth } from '../../contexts/AuthContext';
import { useXP } from '../../contexts/XPContext.jsx';

function XPBar() {
    const { isLoggedIn, currentUser } = useAuth();
    const { xp, refreshXP, subscribeToXPChanges } = useXP();
    const [totalXp, setTotalXp] = useState(0);
    const [loading, setLoading] = useState(true);
    const [leveledUp, setLeveledUp] = useState(false);
    const [animatedXP, setAnimatedXP] = useState(0);
    const updateIntervalRef = useRef(null);

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

    // Initial loading and setup of periodic refresh
    useEffect(() => {
        if (isLoggedIn && currentUser) {
            setLoading(true);

            // Fetch XP immediately
            refreshXP().then(() => {
                setLoading(false);
            }).catch(error => {
                console.error('Error fetching initial XP:', error);
                setLoading(false);
            });

            // Setup interval for periodic XP updates
            updateIntervalRef.current = setInterval(() => {
                refreshXP();
            }, 10000); // Refresh every 10 seconds
        }

        return () => {
            if (updateIntervalRef.current) {
                clearInterval(updateIntervalRef.current);
            }
        };
    }, [isLoggedIn, currentUser, refreshXP]);

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
        if (xp && xp.totalXp !== undefined) {
            const newTotalXp = xp.totalXp;

            // Only process if the XP actually changed
            if (newTotalXp !== totalXp) {
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

                console.log(`XP Bar updated: ${totalXp} -> ${newTotalXp}`);
            }
        }
    }, [xp, totalXp]);

    if (!isLoggedIn || loading) {
        return null;
    }

    // Calculate current level info
    const levelInfo = calculateLevelInfo(animatedXP);

    return (
        <div className={`xp-bar-container ${leveledUp ? 'level-up-animation' : ''}`}>
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