import { jwtDecode } from 'jwt-decode';

export function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded.id || null; // porque usás "id" en tu claim del backend
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
    }
}
