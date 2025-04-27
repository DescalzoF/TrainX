import { useState, useEffect } from 'react';
import axios from 'axios';
import './XPBar.css';
import { useAuth } from '../../contexts/AuthContext';

function XPBar() {
    const { isLoggedIn, currentUser } = useAuth();
    const [levelInfo, setLevelInfo] = useState({
        currentXP: 0,
        levelName: 'Principiante', // Default to Principiante if no data
        levelMinXP: 0,
        levelMaxXP: 100,
        progressPercentage: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLevelInfo = async () => {
            if (isLoggedIn && currentUser) {
                try {
                    setLoading(true);

                    // First, get the user's XP fitness info
                    const xpResponse = await axios.get(`/api/xpfitness/${currentUser.id}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (xpResponse.data) {
                        const totalXp = xpResponse.data.totalXp;

                        // Then, get the user's level information
                        const levelResponse = await axios.get(`/api/users/${currentUser.id}/level`, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        });

                        if (levelResponse.data) {
                            const { levelName, levelMinXP, levelMaxXP } = levelResponse.data;

                            // Calculate progress percentage based on current XP within level range
                            const currentLevelXP = totalXp - levelMinXP;
                            const levelXPRange = levelMaxXP - levelMinXP;
                            const progressPercentage = Math.min(
                                Math.max(
                                    (currentLevelXP / levelXPRange) * 100,
                                    0
                                ),
                                100
                            );

                            setLevelInfo({
                                currentXP: totalXp,
                                levelName: levelName || 'Principiante',
                                levelMinXP: levelMinXP || 0,
                                levelMaxXP: levelMaxXP || 100,
                                progressPercentage
                            });
                        }
                    }

                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching XP or level information:', error);
                    setLoading(false);
                }
            }
        };

        fetchLevelInfo();
    }, [isLoggedIn, currentUser]);

    if (!isLoggedIn || loading) {
        return null;
    }

    // Calculate the values to display, defaulting to 0 for any NaN values
    const currentDisplay = isNaN(levelInfo.currentXP - levelInfo.levelMinXP) ? 0 : (levelInfo.currentXP - levelInfo.levelMinXP);
    const maxDisplay = isNaN(levelInfo.levelMaxXP - levelInfo.levelMinXP) ? 100 : (levelInfo.levelMaxXP - levelInfo.levelMinXP);

    // Ensure progress percentage is a valid number
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
                <span>{levelInfo.levelName}</span>
            </div>
        </div>
    );
}

export default XPBar;