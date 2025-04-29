import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Create the context
const XPContext = createContext();

// Custom hook to use the XP context
export function useXP() {
    return useContext(XPContext);
}

// XP Provider component
export function XPProvider({ children }) {
    const { isLoggedIn, currentUser } = useAuth();
    const [xp, setXP] = useState(null);
    const [loading, setLoading] = useState(true);
    const [listeners, setListeners] = useState([]);

    // Fetch initial XP data
    useEffect(() => {
        if (isLoggedIn && currentUser) {
            fetchXP();
        } else {
            setXP(null);
            setLoading(false);
        }
    }, [isLoggedIn, currentUser]);

    // Function to fetch XP data
    const fetchXP = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8080/api/users/${currentUser.id}/xp-level`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            const xpData = response.data;
            setXP(xpData);
            setLoading(false);

            // Notify listeners of XP change
            notifyListeners(xpData);
        } catch (error) {
            console.error('Error fetching XP data:', error);
            setLoading(false);
        }
    };

    // Function to update XP
    const updateXP = async (xpAmount) => {
        if (!isLoggedIn || !currentUser) return;

        try {
            // First update locally for immediate feedback
            const updatedXP = {
                ...xp,
                totalXp: xp.totalXp + xpAmount
            };
            setXP(updatedXP);

            // Notify listeners of XP change
            notifyListeners(updatedXP);

            // Then save to server
            await axios.post(
                `http://localhost:8080/api/users/${currentUser.id}/add-xp`,
                { xpAmount },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            // If the user might have leveled up, fetch the updated data
            if (updatedXP.totalXp >= updatedXP.xpMax) {
                fetchXP();
            }
        } catch (error) {
            console.error('Error updating XP:', error);
            // Revert to original XP if update fails
            fetchXP();
        }
    };

    // Function to notify listeners of XP changes
    const notifyListeners = (xpData) => {
        listeners.forEach(listener => listener(xpData));
    };

    // Function to subscribe to XP changes
    const subscribeToXPChanges = useCallback((callback) => {
        setListeners(prev => [...prev, callback]);

        // Return unsubscribe function
        return () => {
            setListeners(prev => prev.filter(listener => listener !== callback));
        };
    }, []);

    // Value to provide to consumers
    const value = {
        xp,
        loading,
        updateXP,
        fetchXP,
        subscribeToXPChanges
    };

    return (
        <XPContext.Provider value={value}>
            {children}
        </XPContext.Provider>
    );
}

export default XPContext;