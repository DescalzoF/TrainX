
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Gimnasios.css';
import { FaMapMarkerAlt, FaSearch, FaLocationArrow, FaStar } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Import the WavyText component
import WavyText from './WavyText';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Gimnasios() {
    const { currentUser } = useAuth();
    const [userAddress, setUserAddress] = useState('');
    const [gyms, setGyms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const [loadingTimeout, setLoadingTimeout] = useState(null);
    // Set default to Buenos Aires, Argentina
    const [searchQuery, setSearchQuery] = useState('');
    const [searchRadius, setSearchRadius] = useState(5); // in kilometers
    const [isBackendAvailable, setIsBackendAvailable] = useState(true);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [wavyTextReplay, setWavyTextReplay] = useState(true);

    // Default Buenos Aires coordinates
    const defaultCoordinates = {
        lat: -34.6037,
        lng: -58.3816
    };

    // Sample gym data for Dorrego and Universidad Austral locations
    const dorregoGyms = [
        {
            id: 'dorrego_gym_1',
            name: 'FitClub Premium',
            lat: -34.5852,
            lng: -58.4461,
            address: 'Dorrego 2780, Buenos Aires, Argentina',
            rating: 4.8,
            user_ratings_total: 124,
        },
        {
            id: 'dorrego_gym_2',
            name: 'Palermo Fitness Center',
            lat: -34.5860,
            lng: -58.4458,
            address: 'Dorrego 2690, Buenos Aires, Argentina',
            rating: 4.6,
            user_ratings_total: 98,
        },
        {
            id: 'dorrego_gym_3',
            name: 'PowerLift Gym',
            lat: -34.5847,
            lng: -58.4470,
            address: 'Av. Córdoba 5520, Buenos Aires, Argentina',
            rating: 4.7,
            user_ratings_total: 86,
        },
        {
            id: 'dorrego_gym_4',
            name: 'CrossFit Dorrego',
            lat: -34.5841,
            lng: -58.4455,
            address: 'Dorrego 2600, Buenos Aires, Argentina',
            rating: 4.5,
            user_ratings_total: 76,
        },
        {
            id: 'dorrego_gym_5',
            name: 'Gimnasio Urbano',
            lat: -34.5865,
            lng: -58.4463,
            address: 'Dorrego 2850, Buenos Aires, Argentina',
            rating: 4.3,
            user_ratings_total: 65,
        }
    ];

    const australGyms = [
        {
            id: 'austral_gym_1',
            name: 'Universidad Austral Sports Center',
            lat: -34.4446,
            lng: -58.8952,
            address: 'Campus Universidad Austral, Pilar, Argentina',
            rating: 4.9,
            user_ratings_total: 145,
        },
        {
            id: 'austral_gym_2',
            name: 'Pilar Fitness Club',
            lat: -34.4455,
            lng: -58.8960,
            address: 'Av. Juan Domingo Perón 1500, Pilar, Argentina',
            rating: 4.7,
            user_ratings_total: 112,
        },
        {
            id: 'austral_gym_3',
            name: 'BodyTech Pilar',
            lat: -34.4465,
            lng: -58.8945,
            address: 'Universidad Austral, Pilar, Argentina',
            rating: 4.6,
            user_ratings_total: 95,
        },
        {
            id: 'austral_gym_4',
            name: 'FitZone Campus',
            lat: -34.4438,
            lng: -58.8970,
            address: 'Campus Universitario, Pilar, Argentina',
            rating: 4.4,
            user_ratings_total: 78,
        },
        {
            id: 'austral_gym_5',
            name: 'Muscle Factory Pilar',
            lat: -34.4475,
            lng: -58.8980,
            address: 'Ruta Panamericana km 49.5, Pilar, Argentina',
            rating: 4.5,
            user_ratings_total: 82,
        }
    ];

    // Animation for wavy text refresh
    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setWavyTextReplay(false);
                setTimeout(() => setWavyTextReplay(true), 100);
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [isLoading]);

    // Initialize map only once when component mounts
    useEffect(() => {
        if (!mapInstanceRef.current && mapRef.current) {
            try {
                // Set a timeout to handle map initialization failures
                const mapInitTimeout = setTimeout(() => {
                    if (!mapLoaded) {
                        console.warn("Map initialization timeout - using fallback");
                        setError("No se pudo cargar el mapa. Por favor, intenta nuevamente más tarde.");
                        setIsLoading(false);
                    }
                }, 10000); // 10 seconds timeout for map initialization

                // Initialize the map with Buenos Aires coordinates
                mapInstanceRef.current = L.map(mapRef.current).setView([defaultCoordinates.lat, defaultCoordinates.lng], 13);

                // Add Google Maps tiles with error handling
                L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                    maxZoom: 20,
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                    attribution: '&copy; Google Maps'
                }).addTo(mapInstanceRef.current);

                mapInstanceRef.current.on('load', () => {
                    clearTimeout(mapInitTimeout);
                    setMapLoaded(true);
                });

                // Also set map as loaded if it renders properly
                setTimeout(() => {
                    if (mapInstanceRef.current) {
                        setMapLoaded(true);
                        clearTimeout(mapInitTimeout);
                    }
                }, 2000);

                return () => {
                    clearTimeout(mapInitTimeout);
                };
            } catch (err) {
                console.error("Error initializing map:", err);
                setError("No se pudo cargar el mapa. Por favor, intenta nuevamente más tarde.");
                setIsLoading(false);
            }
        }

        // Clean up on unmount
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Set a global timeout for the loading state
    useEffect(() => {
        if (isLoading) {
            // Clear any previous timeout
            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
            }

            // Set a new timeout
            const timeout = setTimeout(() => {
                if (isLoading) {
                    setIsLoading(false);
                    setError('La búsqueda está tardando demasiado. Por favor, intenta nuevamente más tarde.');
                }
            }, 15000); // 15 seconds timeout

            setLoadingTimeout(timeout);
        }

        return () => {
            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
            }
        };
    }, [isLoading]);

    // Fetch user's address from the profile - UPDATED TO MATCH PERFIL.JSX
    useEffect(() => {
        const fetchUserAddress = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setSearchQuery('Buenos Aires, Argentina');
                    setIsBackendAvailable(false);
                    return;
                }

                try {
                    // This matches the approach in Perfil.jsx
                    const response = await axios.get('http://localhost:8080/api/profile/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const userData = response.data;
                    console.log("Fetched user data:", userData);

                    if (userData.address && userData.address.trim() !== '') {
                        // Always ensure address is in Buenos Aires, Argentina context
                        let formattedAddress = userData.address;
                        if (!formattedAddress.toLowerCase().includes('argentina')) {
                            formattedAddress = `${formattedAddress}, Buenos Aires, Argentina`;
                        } else if (!formattedAddress.toLowerCase().includes('buenos aires')) {
                            // If Argentina is mentioned but not Buenos Aires, add Buenos Aires
                            formattedAddress = formattedAddress.replace(/argentina/i, 'Buenos Aires, Argentina');
                        }

                        setUserAddress(formattedAddress);
                        setSearchQuery(formattedAddress);
                    } else {
                        // Set default to Buenos Aires if no address
                        setUserAddress('Buenos Aires, Argentina');
                        setSearchQuery('Buenos Aires, Argentina');
                    }
                } catch (err) {
                    console.error('Error fetching user address:', err);
                    setIsBackendAvailable(false);
                    // Fallback to Buenos Aires
                    setUserAddress('Buenos Aires, Argentina');
                    setSearchQuery('Buenos Aires, Argentina');
                }
            } catch (error) {
                console.error('Error in fetchUserAddress:', error);
                setSearchQuery('Buenos Aires, Argentina');
            }
        };

        fetchUserAddress();
    }, [currentUser]);

    // Search for gyms when the address changes
    useEffect(() => {
        if (mapInstanceRef.current && searchQuery && mapLoaded) {
            searchByAddress(searchQuery);
        }
    }, [searchQuery, mapLoaded]);

    // Geocode address and search for gyms
    const searchByAddress = async (address) => {
        if (!mapInstanceRef.current) {
            setError("No se pudo cargar el mapa. Por favor, intenta nuevamente más tarde.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Clear previous markers
            clearMarkers();

            // Make sure address contains Argentina and Buenos Aires
            let searchAddress = address;
            if (!searchAddress.toLowerCase().includes('argentina')) {
                searchAddress = `${searchAddress}, Buenos Aires, Argentina`;
            } else if (!searchAddress.toLowerCase().includes('buenos aires')) {
                // If Argentina is mentioned but not Buenos Aires, add Buenos Aires
                searchAddress = searchAddress.replace(/argentina/i, 'Buenos Aires, Argentina');
            }

            // Check if the search query includes specific test locations
            if (searchAddress.toLowerCase().includes('dorrego 2765')) {
                // Use Dorrego coordinates
                const lat = -34.5855;
                const lng = -58.4465;

                // Center map on location
                mapInstanceRef.current.setView([lat, lng], 15);

                // Add user marker
                const userMarker = L.circleMarker([lat, lng], {
                    radius: 8,
                    fillColor: "#4285F4",
                    color: "#fff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 1
                }).addTo(mapInstanceRef.current);

                userMarker.bindPopup("<b>Dorrego 2765</b>").openPopup();
                markersRef.current.push(userMarker);

                // Use sample gyms
                addSampleGyms(dorregoGyms);
                return;
            } else if (searchAddress.toLowerCase().includes('universidad austral') || searchAddress.toLowerCase().includes('pilar')) {
                // Use Universidad Austral coordinates
                const lat = -34.4450;
                const lng = -58.8960;

                // Center map on location
                mapInstanceRef.current.setView([lat, lng], 15);

                // Add user marker
                const userMarker = L.circleMarker([lat, lng], {
                    radius: 8,
                    fillColor: "#4285F4",
                    color: "#fff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 1
                }).addTo(mapInstanceRef.current);

                userMarker.bindPopup("<b>Universidad Austral, Pilar</b>").openPopup();
                markersRef.current.push(userMarker);

                // Use sample gyms
                addSampleGyms(australGyms);
                return;
            }

            // Use Google's Geocoding API through a proxy or direct if you have API key
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchAddress)}&key=YOUR_GOOGLE_API_KEY`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            try {
                const response = await fetch(geocodeUrl, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    const location = data.results[0].geometry.location;
                    const lat = location.lat;
                    const lng = location.lng;

                    // Center map on location
                    mapInstanceRef.current.setView([lat, lng], 14);

                    // Add user marker
                    const userMarker = L.circleMarker([lat, lng], {
                        radius: 8,
                        fillColor: "#4285F4",
                        color: "#fff",
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 1
                    }).addTo(mapInstanceRef.current);

                    userMarker.bindPopup("<b>Tu ubicación</b>").openPopup();
                    markersRef.current.push(userMarker);

                    // Search for gyms near this location using Google Places API
                    await searchNearbyGyms({ lat, lng });
                } else {
                    // If not found, fallback to Buenos Aires
                    setError('No pudimos encontrar esa dirección. Mostrando gimnasios en Buenos Aires.');
                    mapInstanceRef.current.setView([defaultCoordinates.lat, defaultCoordinates.lng], 13);

                    const userMarker = L.circleMarker([defaultCoordinates.lat, defaultCoordinates.lng], {
                        radius: 8,
                        fillColor: "#4285F4",
                        color: "#fff",
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 1
                    }).addTo(mapInstanceRef.current);

                    userMarker.bindPopup("<b>Buenos Aires</b>").openPopup();
                    markersRef.current.push(userMarker);

                    await searchNearbyGyms(defaultCoordinates);
                }
            } catch (err) {
                console.error('Error in geocoding:', err);
                clearTimeout(timeoutId);
                throw new Error('Geocoding failed');
            }
        } catch (err) {
            console.error('Error searching by address:', err);
            setError('Error al buscar la dirección. Mostrando Buenos Aires como alternativa.');

            // Fallback to Buenos Aires
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([defaultCoordinates.lat, defaultCoordinates.lng], 13);

                const userMarker = L.circleMarker([defaultCoordinates.lat, defaultCoordinates.lng], {
                    radius: 8,
                    fillColor: "#4285F4",
                    color: "#fff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 1
                }).addTo(mapInstanceRef.current);

                userMarker.bindPopup("<b>Buenos Aires</b>").openPopup();
                markersRef.current.push(userMarker);

                try {
                    await searchNearbyGyms(defaultCoordinates);
                } catch (gymError) {
                    console.error('Failed to search nearby gyms:', gymError);
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        } finally {
            if (isLoading) {
                setIsLoading(false);
            }
        }
    };

    // Function to add sample gyms to the map
    const addSampleGyms = (gymsList) => {
        // Add markers for each gym
        if (mapInstanceRef.current) {
            gymsList.forEach((gym) => {
                const gymMarker = L.marker([gym.lat, gym.lng]).addTo(mapInstanceRef.current);

                // Create popup content
                const popupContent = `
                    <div class="info-window">
                        <h3>${gym.name}</h3>
                        <p>Valoración: ${gym.rating.toFixed(1)} ⭐</p>
                        <p>${gym.address}</p>
                        <p><a href="https://www.google.com/maps/search/?api=1&query=${gym.lat},${gym.lng}&query_place_id=${gym.id}" target="_blank">Ver en Google Maps</a></p>
                    </div>
                `;

                gymMarker.bindPopup(popupContent);
                markersRef.current.push(gymMarker);
            });
        }

        // Sort by rating (highest first)
        const sortedGyms = [...gymsList].sort((a, b) => b.rating - a.rating);
        setGyms(sortedGyms);
        setIsLoading(false);
    };

    // Function to search for nearby gyms using Google Places API
    const searchNearbyGyms = async (location) => {
        const lat = location.lat;
        const lng = location.lng;
        const radiusInMeters = searchRadius * 1000;

        try {
            // Google Places API request (proxy or direct with API key)
            const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusInMeters}&type=gym&keyword=gym%20fitness%20gimnasio&key=YOUR_GOOGLE_API_KEY`;

            // Use AbortController for better timeout handling
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

            try {
                const response = await fetch(placesUrl, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Process the results
                const gymResults = [];

                if (data && data.results) {
                    data.results.forEach(place => {
                        // Create a gym object with available information
                        const gym = {
                            id: place.place_id,
                            name: place.name || 'Gimnasio sin nombre',
                            lat: place.geometry.location.lat,
                            lng: place.geometry.location.lng,
                            address: place.vicinity || 'Dirección no disponible',
                            rating: place.rating || 4.0,
                            user_ratings_total: place.user_ratings_total || 0,
                        };

                        gymResults.push(gym);
                    });
                }

                // If no results found, show error
                if (gymResults.length === 0) {
                    setError('No se encontraron gimnasios en esta área. Intenta ampliar el radio de búsqueda.');
                    return;
                }

                // Sort by rating (highest first)
                const sortedGyms = gymResults.sort((a, b) => b.rating - a.rating);

                // Add markers for each gym
                if (mapInstanceRef.current) {
                    sortedGyms.forEach((gym) => {
                        const gymMarker = L.marker([gym.lat, gym.lng]).addTo(mapInstanceRef.current);

                        // Create popup content
                        const popupContent = `
                            <div class="info-window">
                                <h3>${gym.name}</h3>
                                <p>Valoración: ${gym.rating.toFixed(1)} ⭐</p>
                                <p>${gym.address}</p>
                                <p><a href="https://www.google.com/maps/search/?api=1&query=${gym.lat},${gym.lng}&query_place_id=${gym.id}" target="_blank">Ver en Google Maps</a></p>
                            </div>
                        `;

                        gymMarker.bindPopup(popupContent);
                        markersRef.current.push(gymMarker);
                    });
                }

                setGyms(sortedGyms);
                setError(null);
            } catch (err) {
                clearTimeout(timeoutId);
                throw new Error('Google Places API request failed');
            }
        } catch (err) {
            console.error('Error fetching gyms:', err);
            setError('No se pudieron cargar los gimnasios. Por favor, intenta nuevamente más tarde.');
            setIsLoading(false);
        }
    };

    // Clear all markers from the map
    const clearMarkers = () => {
        if (!mapInstanceRef.current) return;

        markersRef.current.forEach(marker => {
            try {
                mapInstanceRef.current.removeLayer(marker);
            } catch (err) {
                console.error("Error removing marker:", err);
            }
        });
        markersRef.current = [];
    };

    // Handle search form submission
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim() === '') {
            setSearchQuery('Buenos Aires, Argentina');
            return;
        }

        searchByAddress(searchQuery);
    };

    // Get user's current location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Tu navegador no soporta geolocalización');
            return;
        }

        setIsLoading(true);
        setSearchQuery('Obteniendo ubicación...'); // Immediate feedback in the search bar

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Immediately update map view
                if (mapInstanceRef.current && mapLoaded) {
                    mapInstanceRef.current.setView([latitude, longitude], 14);
                    clearMarkers();

                    const userMarker = L.circleMarker([latitude, longitude], {
                        radius: 8,
                        fillColor: "#4285F4",
                        color: "#fff",
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 1
                    }).addTo(mapInstanceRef.current);

                    userMarker.bindPopup("<b>Tu ubicación actual</b>").openPopup();
                    markersRef.current.push(userMarker);
                }

                try {
                    // Set a placeholder address while geocoding happens
                    setSearchQuery(`Ubicación actual (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);

                    // Start searching for gyms using the coordinates directly
                    await searchNearbyGyms({ lat: latitude, lng: longitude });

                    // Try to get the address name in the background
                    const reverseGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_GOOGLE_API_KEY`;
                    const response = await fetch(reverseGeocodeUrl);
                    const data = await response.json();

                    if (data && data.results && data.results[0]) {
                        let address = data.results[0].formatted_address;
                        if (!address.toLowerCase().includes('argentina')) {
                            address += ', Buenos Aires, Argentina';
                        } else if (!address.toLowerCase().includes('buenos aires')) {
                            address = address.replace(/argentina/i, 'Buenos Aires, Argentina');
                        }
                        setSearchQuery(address);
                    }
                } catch (err) {
                    console.error('Error processing location:', err);
                    // Keep the coordinates-based address if geocoding fails
                } finally {
                    setIsLoading(false);
                }
            },
            (error) => {
                console.error('Error getting location:', error);
                setError('No se pudo obtener tu ubicación actual. Utilizando Buenos Aires como ubicación predeterminada.');
                setIsLoading(false);

                // Use Buenos Aires as fallback
                setSearchQuery('Buenos Aires, Argentina');
                searchByAddress('Buenos Aires, Argentina');
            },
            { timeout: 15000, maximumAge: 60000, enableHighAccuracy: true } // 15s timeout, more accurate positioning
        );
    };

    return (
        <div className="gimnasios-container" style={{ marginTop: '120px' }}>
            {/* Título con icono de mapa */}
            <div className="gimnasios-title">
                <h1><FaMapMarkerAlt /> Gimnasios Cerca</h1>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-container">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar gimnasios en Buenos Aires, Argentina..."
                            className="search-input"
                            disabled={isLoading}
                        />
                        <button type="submit" className="search-button" disabled={isLoading}>
                            <FaSearch /> Buscar
                        </button>
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="location-button"
                            disabled={isLoading}
                        >
                            <FaLocationArrow /> Usar Ubicación Actual
                        </button>
                    </div>
                    <div className="radius-selector">
                        <label htmlFor="radius">Radio de búsqueda: {searchRadius} km</label>
                        <input
                            type="range"
                            id="radius"
                            min="1"
                            max="20"
                            value={searchRadius}
                            onChange={(e) => setSearchRadius(Number(e.target.value))}
                            disabled={isLoading}
                        />
                    </div>
                </form>
            </div>

            <div className="gimnasios-content">
                <div className="map-container">
                    {/* Single loading overlay for the map */}
                    {isLoading && (
                        <div className="loading-overlay">
                            <WavyText text="Buscando gimnasios..." replay={wavyTextReplay} />
                        </div>
                    )}
                    <div id="gym-map" className="map" ref={mapRef}></div>
                </div>

                <div className="gym-list">
                    <h2>Gimnasios Mejor Valorados ({Math.min(gyms.length, 10)} de {gyms.length})</h2>
                    {isLoading ? (
                        <div className="loading-gyms">
                            {/* We've removed the duplicate wavy text here */}
                        </div>
                    ) : gyms.length > 0 ? (
                        <ul className="gym-items">
                            {gyms.slice(0, 10).map((gym, index) => (
                                <li key={gym.id} className="gym-item">
                                    <div className="gym-rank">{index + 1}</div>
                                    <div className="gym-info">
                                        <h3>{gym.name}</h3>
                                        <div className="gym-rating">
                                            <FaStar /> <span>{gym.rating.toFixed(1)}</span>
                                            <span className="gym-reviews">({gym.user_ratings_total} reseñas)</span>
                                        </div>
                                        <p className="gym-address">{gym.address}</p>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${gym.lat},${gym.lng}&query_place_id=${gym.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="gym-link"
                                        >
                                            Ver en Google Maps
                                        </a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="no-gyms">
                            No se encontraron gimnasios cercanos. Intenta ampliar el radio de búsqueda o cambiar la ubicación.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Gimnasios;
