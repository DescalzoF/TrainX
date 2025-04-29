import { useState, useEffect } from 'react';
import axios from 'axios';
import './XPBar.css';
import { useAuth } from '../../contexts/AuthContext';
import { useXP } from '../../contexts/XPContext.jsx'; // We'll create this context

function XPBar() {
    const { isLoggedIn, currentUser } = useAuth();
    const { xp, subscribeToXPChanges } = useXP(); // Use the XP context
    const [levelInfo, setLevelInfo] = useState({
        totalXp: 0,
        nameLevel: 'Principiante',
        xpMin: 0,
        xpMax: 100,
        progressPercentage: 0
    });
    const [loading, setLoading] = useState(true);

    // Fetch initial XP data
    useEffect(() => {
        const fetchLevelInfo = async () => {
            if (isLoggedIn && currentUser) {
                try {
                    setLoading(true);

                    const response = await axios.get(`http://localhost:8080/api/users/${currentUser.id}/xp-level`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (response.data) {
                        const { totalXp, nameLevel, xpMin, xpMax, progressPercentage } = response.data;

                        setLevelInfo({
                            totalXp: totalXp || 0,
                            nameLevel: nameLevel || 'Principiante',
                            xpMin: xpMin || 0,
                            xpMax: xpMax || 100,
                            progressPercentage: progressPercentage || 0
                        });
                    }

                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching XP and level information:', error);
                    setLoading(false);
                }
            }
        };

        fetchLevelInfo();
    }, [isLoggedIn, currentUser]);

    // Listen for XP changes
    useEffect(() => {
        if (!isLoggedIn || !currentUser) return;

        // Subscribe to XP changes
        const unsubscribe = subscribeToXPChanges((newXpData) => {
            // Update level info when XP changes
            setLevelInfo(prevInfo => {
                // Calculate new progress within the level
                const newTotalXp = newXpData.totalXp;
                const newXpInLevel = newTotalXp - prevInfo.xpMin;
                const levelRange = prevInfo.xpMax - prevInfo.xpMin;
                const newProgressPercentage = Math.min(100, Math.max(0, (newXpInLevel / levelRange) * 100));

                // Check if we need to update level info (if we leveled up)
                if (newTotalXp >= prevInfo.xpMax) {
                    // We should fetch the updated level info from the server
                    fetchUpdatedLevelInfo(currentUser.id);
                    return prevInfo; // Return previous state until we get the new level info
                }

                // Just update the XP and progress within the current level
                return {
                    ...prevInfo,
                    totalXp: newTotalXp,
                    progressPercentage: newProgressPercentage
                };
            });
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [isLoggedIn, currentUser, subscribeToXPChanges]);

    // Function to fetch updated level info when leveling up
    const fetchUpdatedLevelInfo = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/users/${userId}/xp-level`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data) {
                const { totalXp, nameLevel, xpMin, xpMax, progressPercentage } = response.data;
                setLevelInfo({
                    totalXp: totalXp || 0,
                    nameLevel: nameLevel || 'Principiante',
                    xpMin: xpMin || 0,
                    xpMax: xpMax || 100,
                    progressPercentage: progressPercentage || 0
                });
            }
        } catch (error) {
            console.error('Error fetching updated level information:', error);
        }
    };

    // Watch for XP changes from the context
    useEffect(() => {
        if (xp && xp.totalXp !== levelInfo.totalXp) {
            // Update the level info with the new XP
            setLevelInfo(prevInfo => {
                const newXpInLevel = xp.totalXp - prevInfo.xpMin;
                const levelRange = prevInfo.xpMax - prevInfo.xpMin;
                const newProgressPercentage = Math.min(100, Math.max(0, (newXpInLevel / levelRange) * 100));

                return {
                    ...prevInfo,
                    totalXp: xp.totalXp,
                    progressPercentage: newProgressPercentage
                };
            });
        }
    }, [xp]);

    if (!isLoggedIn || loading) {
        return null;
    }

    // Calculate the values to display, showing current XP within the level
    const currentDisplay = isNaN(levelInfo.totalXp - levelInfo.xpMin) ? 0 : (levelInfo.totalXp - levelInfo.xpMin);
    const maxDisplay = isNaN(levelInfo.xpMax - levelInfo.xpMin) ? 100 : (levelInfo.xpMax - levelInfo.xpMin);
    const progressWidth = isNaN(levelInfo.progressPercentage) ? 0 : levelInfo.progressPercentage;

    return (
        <div className="xp-bar-container">
            <div className="xp-bar-wrapper">
                <div
                    className="xp-bar-fill"
                    style={{ width: `${progressWidth}%` }}
                ></div>
                <div className="xp-numbers">
                    <span>{currentDisplay}</span>
                    <span>/{maxDisplay}</span>
                </div>
            </div>
            <div className="level-indicator">
                <span>{levelInfo.nameLevel}</span>
            </div>
        </div>
    );
}

export default XPBar;