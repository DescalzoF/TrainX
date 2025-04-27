import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet';
import './Gimnasios.css';
import { FaSearch, FaMapMarkerAlt, FaStar } from 'react-icons/fa';

// WavyText component for loading animation
const WavyText = ({ text }) => {
    return (
        <div className="wavy-text-container">
            {text.split('').map((letter, index) => (
                <span
                    key={index}
                    className="wavy-letter"
                    style={{
                        animationName: 'wave',
                        animationDuration: '1s',
                        animationDelay: `${index * 0.1}s`,
                        animationIterationCount: 'infinite',
                    }}
                >
          {letter === ' ' ? '\u00A0' : letter}
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

    useEffect(() => {
        // Function to fetch user profile and get address
        const fetchUserAddress = async () => {
            try {
                // Get token from localStorage or wherever you store it
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('No authentication token found');
                }

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
                return false;
            } catch (err) {
                console.error("Failed to fetch user profile:", err);
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
        }

        // Cleanup function to destroy map when component unmounts
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        // Clear old markers
        clearMarkers();

        // Add new markers
        if (gyms.length > 0 && mapInstanceRef.current) {
            gyms.forEach((gym, index) => {
                const marker = L.marker([gym.geometry.location.lat, gym.geometry.location.lng])
                    .addTo(mapInstanceRef.current);

                // Add popup with gym info
                const popupContent = `
          <div class="info-window">
            <h3>${gym.name}</h3>
            <p><strong>Rating:</strong> ${gym.rating ? gym.rating + ' ★' : 'No rating'}</p>
            <p><strong>Address:</strong> ${gym.vicinity}</p>
            ${gym.place_id ? `<a href="https://www.google.com/maps/place/?q=place_id:${gym.place_id}" target="_blank">View on Google Maps</a>` : ''}
          </div>
        `;

                marker.bindPopup(popupContent);
                markersRef.current.push(marker);
            });

            // If gyms are available, adjust map view to show all markers
            if (gyms.length > 0) {
                const group = new L.featureGroup(markersRef.current);
                mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
            }
        }
    }, [gyms]);

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
                    setError("Error accessing your location. Please check browser permissions.");
                    setLoading(false);
                }
            );
        } else {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
        }
    };

    // Helper to clear map markers
    const clearMarkers = () => {
        if (mapInstanceRef.current) {
            markersRef.current.forEach(marker => {
                mapInstanceRef.current.removeLayer(marker);
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
            const searchAddress = address.toLowerCase().includes("argentina")
                ? address
                : `${address}, Argentina`;

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
                throw new Error('Address not found');
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            throw error;
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
            setGyms([]);
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
                const lat = element.center ? element.center.lat : element.lat;
                const lng = element.center ? element.center.lon : element.lon;

                return {
                    place_id: element.id.toString(),
                    name: element.tags.name || `Gimnasio ${index + 1}`,
                    vicinity: element.tags["addr:street"]
                        ? `${element.tags["addr:street"]} ${element.tags["addr:housenumber"] || ''}`
                        : "Dirección no disponible",
                    rating: element.tags.rating || null,
                    geometry: {
                        location: {
                            lat: lat,
                            lng: lng
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

            setGyms(processedGyms);

            if (processedGyms.length === 0) {
                setError("No se encontraron gimnasios cercanos. Intente aumentar el radio de búsqueda.");
            }
        } catch (error) {
            console.error("Error fetching gyms:", error);
            setError("Error al buscar gimnasios. Por favor intente nuevamente más tarde.");
            setGyms([]);
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

    return (
        <div className="gimnasios-container">
            <div className="gimnasios-header">
                <h1>
                    <FaMapMarkerAlt /> Encuentra tu gimnasio
                </h1>
                <p>Descubre los mejores gimnasios cerca de ti en Buenos Aires</p>
                {error && (
                    <div className="connection-note">
                        Los datos de gimnasios se obtienen de OpenStreetMap
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
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="gimnasios-content">
                <div className="map-container">
                    <div ref={mapRef} className="map"></div>
                    {loading && (
                        <div className="loading-overlay">
                            <WavyText text="Obteniendo tu ubicación..." />
                        </div>
                    )}
                </div>

                <div className="gym-list">
                    <h2>Gimnasios cercanos</h2>

                    {loadingGyms ? (
                        <div className="loading-gyms">
                            <WavyText text="Buscando gimnasios..." />
                        </div>
                    ) : gyms.length > 0 ? (
                        <ul className="gym-items">
                            {gyms.map((gym, index) => (
                                <li key={gym.place_id} className="gym-item">
                                    <div className="gym-rank">{index + 1}</div>
                                    <div className="gym-info">
                                        <h3>{gym.name}</h3>
                                        {gym.rating && (
                                            <div className="gym-rating">
                                                <FaStar />
                                                {gym.rating}
                                                <span className="gym-reviews">{gym.user_ratings_total || 'N/A'} reseñas</span>
                                            </div>
                                        )}
                                        <div className="gym-address">{gym.vicinity}</div>
                                        <a
                                            href={`https://www.openstreetmap.org/?mlat=${gym.geometry.location.lat}&mlon=${gym.geometry.location.lng}#map=19/${gym.geometry.location.lat}/${gym.geometry.location.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="gym-link"
                                        >
                                            Ver en el mapa
                                        </a>
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
        </div>
    );
};

export default Gimnasios;