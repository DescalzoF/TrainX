import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Create XP context
const XPContext = createContext();

// Create XP provider component
export const XPProvider = ({ children }) => {
    const [xp, setXP] = useState(null);
    const { currentUser, isLoggedIn } = useAuth();
    const [listeners, setListeners] = useState([]);

    // Fetch initial XP data
    useEffect(() => {
        if (isLoggedIn && currentUser) {
            fetchUserXP();
        }
    }, [isLoggedIn, currentUser]);

    // Function to fetch user XP
    const fetchUserXP = useCallback(async () => {
        if (!currentUser?.id) return;

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');

            if (!token) {
                console.error('No authentication token found');
                return;
            }

            const response = await axios.get(`http://localhost:8080/api/users/${currentUser.id}/xp-level`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data) {
                setXP(response.data);

                // Notify all listeners
                listeners.forEach(listener => listener(response.data));
            }
        } catch (error) {
            console.error('Error fetching XP data:', error);
        }
    }, [currentUser, listeners]);

    // Function to update XP
    const updateXP = useCallback(async (xpAmount) => {
        if (!currentUser?.id) return;

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');

            if (!token) {
                console.error('No authentication token found');
                return;
            }

            // Call the API to add XP
            await axios.put(
                `http://localhost:8080/api/xpfitness/${currentUser.id}/addXp/${xpAmount}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            // After updating, fetch the latest XP data
            await fetchUserXP();
        } catch (error) {
            console.error('Error updating XP:', error);
            throw error; // Rethrow to allow error handling in the component
        }
    }, [currentUser, fetchUserXP]);

    // Function to subscribe to XP changes
    const subscribeToXPChanges = useCallback((listener) => {
        setListeners(prevListeners => [...prevListeners, listener]);

        // Return unsubscribe function
        return () => {
            setListeners(prevListeners =>
                prevListeners.filter(l => l !== listener)
            );
        };
    }, []);

    // Context value
    const contextValue = {
        xp,
        updateXP,
        refreshXP: fetchUserXP,
        subscribeToXPChanges
    };

    return (
        <XPContext.Provider value={contextValue}>
            {children}
        </XPContext.Provider>
    );
};

// Custom hook to use the XP context
export const useXP = () => {
    const context = useContext(XPContext);
    if (!context) {
        throw new Error('useXP must be used within an XPProvider');
    }
    return context;
};