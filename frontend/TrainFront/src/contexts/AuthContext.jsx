import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if user is already logged in by looking for session data in localStorage
        const sessionId = localStorage.getItem('sessionId');
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');

        if (sessionId && userId && username) {
            setCurrentUser({ userId, username });
            setIsLoggedIn(true);
        }
    }, []);

    const login = (userData) => {
        setCurrentUser({
            userId: userData.userId,
            username: userData.username,
        });
        setIsLoggedIn(true);
    };

    const logout = () => {
        setCurrentUser(null);
        setIsLoggedIn(false);
    };

    const value = {
        currentUser,
        isLoggedIn,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}