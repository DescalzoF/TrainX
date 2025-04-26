
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        const storedUserId = localStorage.getItem('userId'); // Recuperar userId del localStorage

        if (token && storedUsername && storedUserId) {
            // Decodificar el token para verificar su expiración
            const decodedToken = jwtDecode(token);

            // Verificar si el token ha expirado
            const isTokenExpired = decodedToken.exp * 1000 < Date.now();

            if (isTokenExpired) {
                logout();
            } else {
                // Si el token no ha expirado, lo usamos para autenticar la sesión
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Restaurar el username y userId desde localStorage
                setCurrentUser({
                    username: storedUsername,
                    id: storedUserId // Asignar el ID recuperado
                });
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

        // Decodificar el token para obtener el username y userId
        const decodedToken = jwtDecode(userData.token);
        const username = decodedToken.username || decodedToken.sub;
        const userId = decodedToken.id // Obtener el ID del usuario

        // Guardar el username y userId en localStorage
        localStorage.setItem('username', username);
        localStorage.setItem('userId', userId); // Guardar el ID en localStorage

        setCurrentUser({
            username,
            id: userId // Incluir el ID en el estado del usuario
        });
        setIsLoggedIn(true);
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
            // Eliminar el token, username y userId de localStorage
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('userId'); // Eliminar también el userId
            localStorage.removeItem('profilePicture');

            setCurrentUser(null);
            setIsLoggedIn(false);
        }
    };

    // Función para obtener el ID del usuario actual
    const getCurrentUserId = () => {
        return currentUser?.id || localStorage.getItem('userId');
    };

    const value = {
        currentUser,
        isLoggedIn,
        isLoading,
        login,
        logout,
        getCurrentUserId, // Exportar la nueva función
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const useAuth = () => {
    return useContext(AuthContext);
};

export { useAuth };
