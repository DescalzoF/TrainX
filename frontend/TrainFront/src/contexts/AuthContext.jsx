import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Importamos la librería para decodificar el JWT

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username'); // Recuperamos el username de localStorage

        if (token && storedUsername) {
            // Decodificamos el token para verificar su expiración
            const decodedToken = jwtDecode(token);

            // Verificamos si el token ha expirado
            const isTokenExpired = decodedToken.exp * 1000 < Date.now();

            if (isTokenExpired) {
                logout();
            } else {
                // Si el token no ha expirado, lo usamos para autenticar la sesión
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Restauramos el username desde localStorage
                setCurrentUser({ username: storedUsername });
                setIsLoggedIn(true);
            }
        }

        setIsLoading(false);
    }, []);

    const login = (userData) => {
        // Set JWT token in axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;

        // Save token and user info in localStorage
        localStorage.setItem('token', userData.token);

        // Decodificamos el token para obtener el username
        const decodedToken = jwtDecode(userData.token);
        const username = decodedToken.username || decodedToken.sub; // Si no existe username, usar sub

        // Guardamos el username en localStorage
        localStorage.setItem('username', username);

        setCurrentUser({ username });
        setIsLoggedIn(true);
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/api/users/logout', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            // Eliminar el token y el username de localStorage
            delete axios.defaults.headers.common['Authorization'];
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
