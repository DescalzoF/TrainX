const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const GymApiService = {
    getAllGyms: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/gimnasios`);
            if (!response.ok) {
                throw new Error(`Error fetching gyms: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching gyms:', error);
            throw error;
        }
    },

    getGymById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/gimnasios/${id}`);
            if (!response.ok) {
                throw new Error(`Error fetching gym: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching gym with ID ${id}:`, error);
            throw error;
        }
    },

    createGym: async (gymData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/gimnasios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gymData)
            });

            if (!response.ok) {
                throw new Error(`Error creating gym: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating gym:', error);
            throw error;
        }
    },

    updateGym: async (id, gymData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/gimnasios/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gymData)
            });

            if (!response.ok) {
                throw new Error(`Error updating gym: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error updating gym with ID ${id}:`, error);
            throw error;
        }
    },

    deleteGym: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/gimnasios/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error deleting gym: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error deleting gym with ID ${id}:`, error);
            throw error;
        }
    },
    convertToDTO: (gymData) => {
        return {
            id: gymData.id || null,
            name: gymData.name,
            latitud: gymData.geometry.location.lat,
            longitud: gymData.geometry.location.lng,
            calificacion: Math.round(gymData.rating) || 0,
            direccion: gymData.vicinity
        };
    },

    convertFromDTO: (dto) => {
        return {
            place_id: `api-${dto.id}`,
            name: dto.name,
            vicinity: dto.direccion,
            rating: dto.calificacion,
            geometry: {
                location: {
                    lat: dto.latitud,
                    lng: dto.longitud
                }
            },
            isFromAPI: true,
            user_ratings_total: 1
        };
    }
};

export default GymApiService;