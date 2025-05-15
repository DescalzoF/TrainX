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
    const [levelInfo, setLevelInfo] = useState(null);
    const [previousLevelName, setPreviousLevelName] = useState(null);
    const updateIntervalRef = useRef(null);

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

    // Process XP data whenever it changes
    useEffect(() => {
        if (xp) {
            const currentXp = xp.totalXp || 0;

            // Calculate the progress percentage using minXp and maxXp from the server
            const xpInLevel = currentXp - (xp.minXp || 0);
            const levelRange = (xp.maxXp || 1000) - (xp.minXp || 0);
            const progressPercentage = Math.min(100, Math.max(0, (xpInLevel / levelRange) * 100));

            // Create level info object based on backend data
            const newLevelInfo = {
                name: xp.levelName || 'Unknown',
                min: xp.minXp || 0,
                max: xp.maxXp || 1000,
                currentXp: currentXp,
                xpInLevel,
                levelRange,
                progressPercentage
            };

            // Check if we leveled up
            if (previousLevelName && previousLevelName !== newLevelInfo.name) {
                setLeveledUp(true);
                console.log(`Level up! New level: ${newLevelInfo.name}`);
                setTimeout(() => setLeveledUp(false), 3000);
                // Update levelId in localStorage
                const currentLevelId = parseInt(localStorage.getItem('levelId'), 10);
                if (!isNaN(currentLevelId)) {
                    const newLevelId = currentLevelId + 1;
                    localStorage.setItem('levelId', newLevelId.toString());
                    console.log(`LevelId actualizado a ${newLevelId}`);
                } else {
                    console.warn('No se encontró un levelId válido en localStorage');
                }

                setTimeout(() => setLeveledUp(false), 3000);
            }

            setPreviousLevelName(newLevelInfo.name);
            setLevelInfo(newLevelInfo);
            setTotalXp(currentXp);
            setAnimatedXP(currentXp);
        }
    }, [xp, previousLevelName]);

    // Listen for XP changes from the XP context
    useEffect(() => {
        if (!isLoggedIn || !currentUser) return;

        const unsubscribe = subscribeToXPChanges((newXpData) => {
            // The actual processing of the XP data is handled in the xp effect above
            console.log('XP data received:', newXpData);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [isLoggedIn, currentUser, subscribeToXPChanges]);

    if (!isLoggedIn || loading || !levelInfo) {
        return null;
    }

    // Calculate XP needed for next level
    const xpNeeded = levelInfo.max - levelInfo.currentXp;

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
                    <span> (+{xpNeeded} needed)</span>
                </div>
            </div>
            <div className="level-indicator">
                {levelInfo.name}
            </div>
        </div>
    );
}

export default XPBar;