// AuthContext.jsx needs updates to work with JWT properly
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in by looking for JWT token in localStorage
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        if (token) {
            // Set axios default header for all future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setCurrentUser({ username });
            setIsLoggedIn(true);
        }

        setIsLoading(false);
    }, []);

    const login = (userData) => {
        // Set JWT token in axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;

        // Save token and user info in localStorage
        localStorage.setItem('token', userData.token);
        localStorage.setItem('username', userData.username);

        setCurrentUser({
            username: userData.username,
        });
        setIsLoggedIn(true);
    };

    const logout = async () => {
        try {
            // Call logout endpoint
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/api/users/logout', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            // Remove token from axios headers
            delete axios.defaults.headers.common['Authorization'];

            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('profilePicture');

            setCurrentUser(null);
            setIsLoggedIn(false);
        }
    };

    const value = {
        currentUser,
        isLoggedIn,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}