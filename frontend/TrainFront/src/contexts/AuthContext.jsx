import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCaminoFitnessId, setSelectedCaminoFitnessId] = useState(null);

    const hasChosenCaminoFitness = () => {
        return !!selectedCaminoFitnessId || !!localStorage.getItem('caminoFitnessId');
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        const storedUserId = localStorage.getItem('userId');
        const storedCaminoFitnessId = localStorage.getItem('caminoFitnessId');

        if (token && storedUsername && storedUserId) {
            const decodedToken = jwtDecode(token);
            const isTokenExpired = decodedToken.exp * 1000 < Date.now();

            if (isTokenExpired) {
                logout();
            } else {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                setCurrentUser({
                    username: storedUsername,
                    id: storedUserId
                });
                setIsLoggedIn(true);

                // Restaurar el caminoFitnessId si existe
                if (storedCaminoFitnessId) {
                    setSelectedCaminoFitnessId(storedCaminoFitnessId);
                } else {
                    // Si no existe, lo vamos a buscar
                    fetchUserProfile();
                }
            }
        }

        setIsLoading(false);
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found for profile fetch');
                return;
            }
            const response = await axios.get('http://localhost:8080/api/users/currentUser', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const userData = response.data;
            if (userData.caminoFitnessId) {
                setSelectedCaminoFitnessId(userData.caminoFitnessId);
                localStorage.setItem('caminoFitnessId', userData.caminoFitnessId);
            }
            else if (userData.caminoFitnessId === null) {
                return null;
            }
        } catch (error) {
            console.error('Error fetching user profile:', error.response?.data || error.message);
        }
    };

    const login = (userData) => {
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        localStorage.setItem('token', userData.token);

        const decodedToken = jwtDecode(userData.token);
        const username = decodedToken.username || decodedToken.sub;
        const userId = decodedToken.id;

        localStorage.setItem('username', username);
        localStorage.setItem('userId', userId);

        setCurrentUser({
            username,
            id: userId
        });
        setIsLoggedIn(true);

        // Después de loguearse, ir a buscar si ya tenía un camino asignado
        fetchUserProfile();
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/api/auth/logout', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Error during logout:', error.response ? error.response.data : error);
        } finally {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            localStorage.removeItem('caminoFitnessId');
            localStorage.removeItem('profilePicture');

            setCurrentUser(null);
            setIsLoggedIn(false);
            setSelectedCaminoFitnessId(null);
        }
    };

    const getCurrentUserId = () => {
        return currentUser?.id || localStorage.getItem('userId');
    };

    const getCurrentCaminoFitnessId = () => {
        return selectedCaminoFitnessId || localStorage.getItem('caminoFitnessId');
    };

    const setCurrentCaminoFitnessId = (id) => {
        setSelectedCaminoFitnessId(id);
        localStorage.setItem('caminoFitnessId', id);
    };

    const value = {
        currentUser,
        isLoggedIn,
        isLoading,
        login,
        logout,
        getCurrentUserId,
        getCurrentCaminoFitnessId,
        setCurrentCaminoFitnessId,
        hasChosenCaminoFitness,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const useAuth = () => {
    return useContext(AuthContext);
};

export { useAuth };