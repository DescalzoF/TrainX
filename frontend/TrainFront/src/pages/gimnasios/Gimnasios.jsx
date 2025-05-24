import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet';
import './Gimnasios.css';
import { FaSearch, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import AdminGymManagement from '../../components/AdminGymManagement/AdminGymManagement.jsx';
import AdminToggleButton from '../../components/AdminToggleButton/AdminToggleButton.jsx';
const WavyText = ({ text, replay = true }) => {
    const [animation, setAnimation] = useState(true);

    useEffect(() => {
        if (replay) {
            const interval = setInterval(() => {
                setAnimation(prev => !prev);
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [replay]);

    return (
        <div className="wavy-text-container">
            {text.split("").map((letter, index) => (
                <span
                    key={index}
                    className="wavy-letter"
                    style={{
                        display: "inline-block",
                        marginRight: letter === " " ? "0.5em" : "0.05em",
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        color: "#4285F4",
                        animation: animation ? `wave 0.5s ease-in-out ${index * 0.05}s` : "none",
                        position: "relative",
                        transformOrigin: "bottom"
                    }}
                >
                    {letter}
                </span>
            ))}
        </div>
    );
};

const Gimnasios = () => {
    // References
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    // State variables
    const [address, setAddress] = useState('');
    const [searchRadius, setSearchRadius] = useState(5000); // 5km default radius
    const [loading, setLoading] = useState(false);
    const [loadingGyms, setLoadingGyms] = useState(false);
    const [gyms, setGyms] = useState([]);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [defaultLocation] = useState({
        lat: -34.6037, // Buenos Aires latitude
        lng: -58.3816  // Buenos Aires longitude
    });

    // Admin state variables
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminActive, setAdminActive] = useState(false);
    const [adminGyms, setAdminGyms] = useState([]);
    const [apiAvailable, setApiAvailable] = useState(true);

    useEffect(() => {
        // Check if user is admin
        checkUserRole();

        // Load admin gyms from localStorage
        const savedGyms = localStorage.getItem('adminGyms');
        if (savedGyms) {
            try {
                const parsedGyms = JSON.parse(savedGyms);
                setAdminGyms(parsedGyms);
            } catch (error) {
                console.error("Failed to parse stored gyms:", error);
                localStorage.removeItem('adminGyms'); // Remove invalid data
            }
        }
    }, []);

    // Load gyms from backend on component mount
    useEffect(() => {
        fetchGymsFromBackend();
    }, []);

    // Fetch all gyms from backend
    const fetchGymsFromBackend = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:8080/api/gimnasios/all',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Convert backend DTOs to the format expected by the component
            const formattedGyms = response.data.map(gymDTO => ({
                id: gymDTO.id,
                name: gymDTO.name,
                vicinity: gymDTO.direccion,
                rating: gymDTO.calificacion,
                geometry: {
                    location: {
                        lat: gymDTO.latitud,
                        lng: gymDTO.longitud
                    }
                },
                isAdminAdded: true
            }));

            setAdminGyms(formattedGyms);
            // Update parent component
            updateGyms(formattedGyms);
        } catch (error) {
            console.error('Error fetching gyms:', error);
            setError('Error al cargar los gimnasios. Intenta de nuevo más tarde.');
        }
    };

    // Check user role using the endpoint
    const checkUserRole = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                return;
            }

            // Try to get user role
            try {
                const response = await axios.get('http://localhost:8080/api/users/role', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Check if the user role is ADMIN
                if (response.data && response.data.role === 'ADMIN') {
                    setIsAdmin(true);
                }
            } catch (err) {
                console.error("Failed to check user role:", err);
                // For demo purposes, enable admin functionality when backend is unavailable
                if (err.code === 'ERR_NETWORK') {
                    console.log("Backend unavailable, enabling admin mode for demo");
                    setIsAdmin(true);
                    setApiAvailable(false);
                }
            }
        } catch (err) {
            console.error("Error in checkUserRole:", err);
        }
    };

    // Function to update gyms list with admin added gyms
    const updateGyms = (newAdminGyms) => {
        setAdminGyms(newAdminGyms);

        // Combine API gyms with admin gyms and update markers
        const combinedGyms = [...gyms.filter(gym => !gym.isAdminAdded), ...newAdminGyms];
        setGyms(combinedGyms);
    };

    useEffect(() => {
        // Function to fetch user profile and get address
        const fetchUserAddress = async () => {
            try {
                // Get token from localStorage
                const token = localStorage.getItem('token');

                if (!token || !apiAvailable) {
                    return false;
                }

                try {
                    const response = await axios.get('http://localhost:8080/api/profile/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    // Check if user has an address in their profile
                    if (response.data && response.data.address) {
                        // Ensure the address includes "Buenos Aires, Argentina"
                        const fullAddress = response.data.address.toLowerCase().includes("buenos aires")
                            ? response.data.address
                            : `${response.data.address}, Buenos Aires, Argentina`;

                        setAddress(fullAddress);
                        // Use the stored address for search
                        searchByAddress(fullAddress);
                        return true;
                    }
                } catch (err) {
                    console.error("Failed to fetch user profile:", err);
                    if (err.code === 'ERR_NETWORK') {
                        setApiAvailable(false);
                    }
                }
                return false;
            } catch (err) {
                console.error("Error in fetchUserAddress:", err);
                return false;
            }
        };

        // Function to try getting the user's current location
        const tryUserLocation = () => {
            setLoading(true);

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;

                        setUserLocation({ lat, lng });

                        // Update map view
                        if (mapInstanceRef.current) {
                            mapInstanceRef.current.setView([lat, lng], 13);
                        }

                        // Get address from coordinates
                        reverseGeocode(lat, lng)
                            .then(addressResult => {
                                if (addressResult) {
                                    // Ensure address includes Buenos Aires, Argentina
                                    const fullAddress = addressResult.toLowerCase().includes("buenos aires")
                                        ? addressResult
                                        : `${addressResult}, Buenos Aires, Argentina`;

                                    setAddress(fullAddress);
                                }
                                // Search for gyms near the location
                                searchNearbyGyms(lat, lng);
                                setLoading(false);
                            })
                            .catch(error => {
                                console.error("Failed to get address:", error);
                                searchNearbyGyms(lat, lng);
                                setLoading(false);
                            });
                    },
                    (error) => {
                        console.error("Geolocation error:", error);
                        // Fall back to Buenos Aires
                        fallbackToBuenosAires();
                        setLoading(false);
                    }
                );
            } else {
                // Geolocation not supported
                fallbackToBuenosAires();
                setLoading(false);
            }
        };

        // Fallback function for Buenos Aires
        const fallbackToBuenosAires = () => {
            setAddress("Buenos Aires, Argentina");
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([defaultLocation.lat, defaultLocation.lng], 13);
            }
            searchByAddress("Buenos Aires, Argentina");
        };

        // Initialize map if it doesn't exist
        if (!mapInstanceRef.current && mapRef.current) {
            try {
                // Create map instance
                mapInstanceRef.current = L.map(mapRef.current).setView(
                    [defaultLocation.lat, defaultLocation.lng],
                    13
                );

                // Add tile layer (OpenStreetMap)
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19
                }).addTo(mapInstanceRef.current);

                // Start the cascade of location attempts:
                // 1. Try user profile address
                // 2. If no address, try current location
                // 3. Fall back to Buenos Aires
                fetchUserAddress()
                    .then(hasAddress => {
                        if (!hasAddress) {
                            tryUserLocation();
                        }
                    })
                    .catch(() => {
                        tryUserLocation();
                    });
            } catch (error) {
                console.error("Error initializing map:", error);
                setError("Error al cargar el mapa. Por favor, recargue la página.");
            }
        }

        // Cleanup function to destroy map when component unmounts
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [apiAvailable]);

    useEffect(() => {
        // Clear old markers
        clearMarkers();

        if (!mapInstanceRef.current) return;

        // Combine API gyms with admin gyms
        const gymsList = [...gyms.filter(gym => !gym.isAdminAdded)];

        // Only add admin gyms if they are not already included
        if (adminGyms.length > 0) {
            gymsList.push(...adminGyms);
        }

        // Add new markers
        if (gymsList.length > 0) {
            const validGyms = gymsList.filter(gym =>
                gym.geometry?.location?.lat != null &&
                gym.geometry?.location?.lng != null
            );

            validGyms.forEach((gym) => {
                try {
                    const marker = L.marker([gym.geometry.location.lat, gym.geometry.location.lng])
                        .addTo(mapInstanceRef.current);

                    // Add popup with gym info
                    const popupContent = `
                        <div class="info-window">
                            <h3>${gym.name || 'Gimnasio'}</h3>
                            <p><strong>Rating:</strong> ${gym.rating ? gym.rating + ' ★' : 'No rating'}</p>
                            <p><strong>Address:</strong> ${gym.vicinity || 'Sin dirección'}</p>
                            ${gym.place_id && !gym.isAdminAdded ? `<a href="https://www.google.com/maps/place/?q=place_id:${gym.place_id}" target="_blank">View on Google Maps</a>` : ''}
                            ${gym.isAdminAdded ? '<p><strong>Status:</strong> <span style="color:#8e44ad;">Agregado por Administrador</span></p>' : ''}
                        </div>
                    `;

                    marker.bindPopup(popupContent);
                    markersRef.current.push(marker);
                } catch (err) {
                    console.error(`Error adding marker for gym ${gym.name}:`, err);
                }
            });

            // If valid gyms are available, adjust map view to show all markers
            if (markersRef.current.length > 0) {
                try {
                    const group = new L.featureGroup(markersRef.current);
                    const bounds = group.getBounds();
                    if (bounds.isValid()) {
                        mapInstanceRef.current.fitBounds(bounds.pad(0.1));
                    }
                } catch (err) {
                    console.error("Error adjusting map view:", err);
                }
            }
        }
    }, [gyms, adminGyms]);

    // Handler for address input change
    const handleAddressChange = (e) => {
        setAddress(e.target.value);
    };

    // Handler for radius slider change
    const handleRadiusChange = (e) => {
        setSearchRadius(Number(e.target.value));
    };

    // Handler for search button click
    const handleSearch = (e) => {
        e.preventDefault();
        if (address.trim()) {
            searchByAddress(address);
        }
    };

    // Handler for location button click
    const handleUseMyLocation = () => {
        setLoading(true);
        setError(null);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    setUserLocation({ lat, lng });

                    // Update map view
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([lat, lng], 13);
                    }

                    // Get address from coordinates
                    reverseGeocode(lat, lng)
                        .then(addressResult => {
                            if (addressResult) {
                                // Ensure the address includes "Buenos Aires, Argentina"
                                const fullAddress = addressResult.toLowerCase().includes("buenos aires")
                                    ? addressResult
                                    : `${addressResult}, Buenos Aires, Argentina`;

                                setAddress(fullAddress);
                            }
                            // Search for gyms near the location
                            searchNearbyGyms(lat, lng);
                            setLoading(false);
                        })
                        .catch(error => {
                            console.error("Failed to get address:", error);
                            searchNearbyGyms(lat, lng);
                            setLoading(false);
                        });
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setError("Error al acceder a tu ubicación. Por favor verifica los permisos del navegador.");
                    setLoading(false);
                }
            );
        } else {
            setError("La geolocalización no está soportada por tu navegador.");
            setLoading(false);
        }
    };

    // Helper to clear map markers
    const clearMarkers = () => {
        if (mapInstanceRef.current) {
            markersRef.current.forEach(marker => {
                try {
                    mapInstanceRef.current.removeLayer(marker);
                } catch (error) {
                    console.error("Error removing marker:", error);
                }
            });
            markersRef.current = [];
        }
    };

    // Function to get address from coordinates (reverse geocoding)
    const reverseGeocode = async (lat, lng) => {
        try {
            // Using OpenStreetMap's Nominatim for reverse geocoding (free and no API key required)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                { headers: { 'Accept-Language': 'es' } } // Spanish results for Argentina
            );

            if (!response.ok) {
                throw new Error('Reverse geocoding failed');
            }

            const data = await response.json();

            // Format the address
            if (data && data.display_name) {
                // Return a simplified version of the address
                return data.display_name;
            }
            return null;
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            return null;
        }
    };

    // Function to get coordinates from address (forward geocoding)
    const geocodeAddress = async (address) => {
        try {
            // Add "Argentina" to the address if it doesn't already include it
            let searchAddress = address.toLowerCase().includes("argentina")
                ? address
                : `${address}, Argentina`;

            // Add "Buenos Aires" if it's not included
            if (!searchAddress.toLowerCase().includes("buenos aires")) {
                searchAddress = `${searchAddress}, Buenos Aires`;
            }

            // Using OpenStreetMap's Nominatim for geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`,
                { headers: { 'Accept-Language': 'es' } }
            );

            if (!response.ok) {
                throw new Error('Geocoding failed');
            }

            const data = await response.json();

            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            } else {
                // Fallback for demo purposes - use Buenos Aires coordinates
                console.log("Address not found, falling back to default location");
                return {
                    lat: defaultLocation.lat,
                    lng: defaultLocation.lng
                };
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            // Fallback to default location
            return {
                lat: defaultLocation.lat,
                lng: defaultLocation.lng
            };
        }
    };

    // Function to search gyms by address
    const searchByAddress = async (addressInput) => {
        setLoadingGyms(true);
        setError(null);

        try {
            // Get coordinates from address
            const location = await geocodeAddress(addressInput);

            // Update map view
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([location.lat, location.lng], 13);
            }

            // Search for gyms near the location
            await searchNearbyGyms(location.lat, location.lng);
        } catch (error) {
            console.error("Error searching by address:", error);
            setError(`No se pudo encontrar la dirección: ${error.message}`);

            // Still show admin gyms if available
            if (adminGyms.length > 0) {
                setGyms(adminGyms);
            } else {
                setGyms([]);
            }
        } finally {
            setLoadingGyms(false);
        }
    };

    // Function to search for nearby gyms using Overpass API (OpenStreetMap data)
    const searchNearbyGyms = async (lat, lng) => {
        try {
            // Using Overpass API to find gyms - a free alternative to Google Places API
            const radiusInMeters = searchRadius;

            // Overpass query to find gyms, fitness centers, and sport centers
            const overpassQuery = `
                [out:json];
                (
                  node["leisure"="fitness_centre"](around:${radiusInMeters},${lat},${lng});
                  way["leisure"="fitness_centre"](around:${radiusInMeters},${lat},${lng});
                  node["leisure"="sports_centre"](around:${radiusInMeters},${lat},${lng});
                  way["leisure"="sports_centre"](around:${radiusInMeters},${lat},${lng});
                  node["amenity"="gym"](around:${radiusInMeters},${lat},${lng});
                  way["amenity"="gym"](around:${radiusInMeters},${lat},${lng});
                );
                out body center;
            `;

            const response = await fetch(
                `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
            );

            if (!response.ok) {
                throw new Error('Overpass API request failed');
            }

            const data = await response.json();

            // Process and format the results to match our expected structure
            const processedGyms = data.elements.map((element, index) => {
                // For way elements, use the center coordinates
                const latitude = element.center ? element.center.lat : element.lat;
                const longitude = element.center ? element.center.lon : element.lon;

                return {
                    place_id: element.id.toString(),
                    name: element.tags.name || `Gimnasio ${index + 1}`,
                    vicinity: element.tags["addr:street"]
                        ? `${element.tags["addr:street"]} ${element.tags["addr:housenumber"] || ''}`
                        : "Dirección no disponible",
                    rating: element.tags.rating || null,
                    geometry: {
                        location: {
                            lat: latitude,
                            lng: longitude
                        }
                    }
                };
            });

            // Sort by distance from search location (simple approximation)
            processedGyms.sort((a, b) => {
                const distA = calculateDistance(lat, lng, a.geometry.location.lat, a.geometry.location.lng);
                const distB = calculateDistance(lat, lng, b.geometry.location.lat, b.geometry.location.lng);
                return distA - distB;
            });

            // Combine with admin gyms
            const combinedGyms = [...processedGyms, ...adminGyms];
            setGyms(combinedGyms);

            if (processedGyms.length === 0 && adminGyms.length === 0) {
                setError("No se encontraron gimnasios cercanos. Intente aumentar el radio de búsqueda.");
            }
        } catch (error) {
            console.error("Error fetching gyms:", error);
            setError("Error al buscar gimnasios. Por favor intente nuevamente más tarde.");

            // Still show admin gyms if there are any
            if (adminGyms.length > 0) {
                setGyms(adminGyms);
            } else {
                // Add demo gyms for testing when services are not available
                const demoGyms = [
                    {
                        place_id: "demo-1",
                        name: "Gimnasio Demo 1",
                        vicinity: "Av. Corrientes 1234, Buenos Aires",
                        rating: 4.5,
                        user_ratings_total: 42,
                        geometry: {
                            location: {
                                lat: lat - 0.005,
                                lng: lng + 0.003
                            }
                        }
                    },
                    {
                        place_id: "demo-2",
                        name: "Fitness Center Demo",
                        vicinity: "Calle Florida 567, Buenos Aires",
                        rating: 3.8,
                        user_ratings_total: 27,
                        geometry: {
                            location: {
                                lat: lat + 0.003,
                                lng: lng - 0.002
                            }
                        }
                    }
                ];
                setGyms(demoGyms);
                setError("Usando datos de demostración - La API de gimnasios no está disponible");
            }
        }
    };

    // Helper function to calculate distance between two points
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI/180);
    };

    // Toggle admin panel
    const handleAdminToggle = (active) => {
        setAdminActive(active);
    };

    return (
        <div className="gimnasios-container">
            <div className="gimnasios-header">
                <h1>
                    <FaMapMarkerAlt /> Encuentra tu gimnasio
                </h1>
                <p>Descubre los mejores gimnasios cerca de ti en Buenos Aires</p>
                {!apiAvailable && (
                    <div className="connection-note">
                        Modo demostración activo - Backend no disponible
                    </div>
                )}
            </div>

            <div className="search-section">
                <form className="search-form" onSubmit={handleSearch}>
                    <div className="search-input-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Ingresa tu dirección en Buenos Aires"
                            value={address}
                            onChange={handleAddressChange}
                            aria-label="Dirección"
                            required
                        />
                        <button
                            type="submit"
                            className="search-button"
                            disabled={loading || !address.trim()}
                        >
                            <FaSearch /> Buscar
                        </button>
                        <button
                            type="button"
                            className="location-button"
                            onClick={handleUseMyLocation}
                            disabled={loading}
                        >
                            <FaMapMarkerAlt /> Mi ubicación
                        </button>
                    </div>

                    <div className="radius-selector">
                        <label htmlFor="radius">
                            Radio de búsqueda: {(searchRadius / 1000).toFixed(1)} km
                        </label>
                        <input
                            type="range"
                            id="radius"
                            min="1000"
                            max="10000"
                            step="500"
                            value={searchRadius}
                            onChange={handleRadiusChange}
                        />
                    </div>
                </form>

                {/* Admin Gym Management Component */}
                {isAdmin && adminActive && (
                    <AdminGymManagement
                        mapInstance={mapInstanceRef.current}
                        updateGyms={updateGyms}
                        userLocation={userLocation}
                        defaultLocation={defaultLocation}
                    />
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="gimnasios-content">
                <div className="map-container">
                    <div ref={mapRef} className="map"></div>
                    {loading && (
                        <div className="loading-overlay">
                            <WavyText text="Obteniendo tu ubicación..." replay={true} />
                        </div>
                    )}
                </div>

                <div className="gym-list">
                    <h2>Gimnasios cercanos</h2>

                    {loadingGyms ? (
                        <div className="loading-gyms">
                            <WavyText text="Buscando gimnasios..." replay={true} />
                        </div>
                    ) : gyms.length > 0 ? (
                        <ul className="gym-items">
                            {gyms.map((gym, index) => (
                                <li key={gym.place_id || `gym-${index}`} className="gym-item">
                                    <div className="gym-rank">{index + 1}</div>
                                    <div className="gym-info">
                                        <h3>{gym.name}</h3>
                                        {gym.rating && (
                                            <div className="gym-rating">
                                                <FaStar />
                                                {gym.rating}
                                                <span className="gym-reviews">
                                                    {gym.user_ratings_total || 'N/A'} reseñas
                                                </span>
                                            </div>
                                        )}
                                        <div className="gym-address">{gym.vicinity}</div>
                                        {gym.isAdminAdded ? (
                                            <span className="gym-admin-added">Agregado por Admin</span>
                                        ) : (
                                            <a
                                                href={`https://www.openstreetmap.org/?mlat=${gym.geometry.location.lat}&mlon=${gym.geometry.location.lng}#map=19/${gym.geometry.location.lat}/${gym.geometry.location.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="gym-link"
                                            >
                                                Ver en el mapa
                                            </a>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="no-gyms">
                            No se encontraron gimnasios. Intente con otra ubicación o aumente el radio de búsqueda.
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Toggle Button */}
            <AdminToggleButton
                isAdmin={isAdmin}
                onToggle={handleAdminToggle}
                adminActive={adminActive}
            />
        </div>
    );
};

export default Gimnasios;