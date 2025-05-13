import React, { useState, useEffect } from 'react';
import {
    FaPlus,
    FaTimes,
    FaStar,
    FaRegStar,
    FaStarHalfAlt,
    FaDumbbell,
    FaMapMarkerAlt,
    FaEdit,
    FaTrash,
    FaSearch
} from 'react-icons/fa';
import { IoLocationSharp } from 'react-icons/io5';
import { HiLocationMarker } from 'react-icons/hi';
import './AdminGymManagement.css';
import axios from "axios";

const GymApiServiceMethods = {
    convertToDTO: (gymData) => {
        return {
            id: gymData.id || null,
            name: gymData.name,
            latitud: gymData.geometry.location.lat,
            longitud: gymData.geometry.location.lng,
            calificacion: Math.round(gymData.rating) || 0,
            direccion: gymData.vicinity
        };
    }
};

const AdminGymManagement = ({ mapInstance, updateGyms, userLocation }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingGym, setEditingGym] = useState(null);
    const [adminGyms, setAdminGyms] = useState([]);
    const [newGym, setNewGym] = useState({ name: '', vicinity: '', rating: 0, lat: '', lng: '' });
    const [formErrors, setFormErrors] = useState({});
    const [mapMarker, setMapMarker] = useState(null);
    const [ratingHover, setRatingHover] = useState(0);
    const [showGymList, setShowGymList] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);

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

    const addGymToDB = async (gymData) => {
        try {
            const token = localStorage.getItem('token');
            const gymDTO = GymApiServiceMethods.convertToDTO(gymData);

            const response = await axios.post(
                'http://localhost:8080/api/gimnasios/add',
                gymDTO,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error('Error adding gym:', error);
            throw error;
        }
    };

    const updateGymInDB = async (gymId, gymData) => {
        try {
            const token = localStorage.getItem('token');
            const gymDTO = GymApiServiceMethods.convertToDTO(gymData);

            const response = await axios.put(
                `http://localhost:8080/api/gimnasios/${gymId}`,
                gymDTO,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating gym:', error);
            throw error;
        }
    };

    const deleteGymFromDB = async (gymId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:8080/api/gimnasios/delete/${gymId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error('Error deleting gym:', error);
            throw error;
        }
    }

    // Toggle form visibility
    const toggleAddForm = () => {
        // If we were editing, clear editing state
        if (editingGym) {
            setEditingGym(null);
        }

        setShowAddForm(!showAddForm);

        // Reset form state when opening
        if (!showAddForm) {
            setNewGym({
                name: '',
                vicinity: '',
                rating: 0,
                lat: userLocation ? userLocation.lat.toFixed(6) : '',
                lng: userLocation ? userLocation.lng.toFixed(6) : ''
            });
            setFormErrors({});
            // Enable map click listener
            if (mapInstance) {
                mapInstance.once('click', handleMapClick);
            }
        } else {
            // Remove marker when closing form
            if (mapMarker) {
                mapMarker.remove();
                setMapMarker(null);
            }
        }
    };

    // Toggle gym list visibility
    const toggleGymList = () => {
        setShowGymList(!showGymList);
    };

    // Start editing a gym
    const startEditing = (gym) => {
        setEditingGym(gym);
        setShowAddForm(true);
        setShowGymList(false);

        // Populate form with gym data
        setNewGym({
            name: gym.name,
            vicinity: gym.vicinity,
            rating: gym.rating || 0,
            lat: gym.geometry.location.lat.toFixed(6),
            lng: gym.geometry.location.lng.toFixed(6)
        });

        // Add marker to the map
        if (mapMarker) {
            mapMarker.remove();
        }

        // Add marker at gym location
        if (typeof L !== 'undefined' && mapInstance) {
            const editMarker = L.marker(
                [gym.geometry.location.lat, gym.geometry.location.lng],
                {
                    icon: L.divIcon({
                        className: 'admin-marker-icon',
                        html: '<div class="admin-pin"><div class="admin-pin-inner"><i class="fa fa-dumbbell"></i></div></div>',
                        iconSize: [40, 40],
                        iconAnchor: [20, 40]
                    })
                }
            ).addTo(mapInstance);

            setMapMarker(editMarker);

            // Show popup on marker
            editMarker.bindPopup(`<div class="popup-preview">
                <strong>${gym.name}</strong>
                <p>${gym.vicinity}</p>
            </div>`).openPopup();

            // Center map on gym
            mapInstance.setView([gym.geometry.location.lat, gym.geometry.location.lng], 15);

            // Enable map click listener for updating location
            mapInstance.once('click', handleMapClick);
        }
    };

    // Delete a gym
    const deleteGym = async (gymId) => {
        // Confirm before deleting
        if (!window.confirm('¿Estás seguro que deseas eliminar este gimnasio?')) {
            return;
        }

        try {
            // Delete from the backend
            await deleteGymFromDB(gymId);

            // Filter out the deleted gym
            const updatedGyms = adminGyms.filter(gym => gym.id !== gymId);

            // Update state
            setAdminGyms(updatedGyms);

            // Update parent component
            updateGyms(updatedGyms);
        } catch (error) {
            console.error('Failed to delete gym:', error);
            alert('Error al eliminar el gimnasio. Intenta de nuevo más tarde.');
        }
    };

    // Reverse geocode coordinates to address
    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await response.json();

            if (data && data.display_name) {
                return data.display_name;
            }
            return null;
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            return null;
        }
    };

    // Handle map click to select location
    const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;

        // Update form with selected coordinates
        setNewGym({
            ...newGym,
            lat: lat.toFixed(6),
            lng: lng.toFixed(6)
        });

        setSelectedLocation({ lat, lng });

        // Add marker to the map
        if (mapMarker) {
            mapMarker.remove();
        }

        // Make sure L is defined before using it
        if (typeof L !== 'undefined') {
            // Create a new marker with a custom icon for admin-added gyms
            const newMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'admin-marker-icon',
                    html: '<div class="admin-pin"><div class="admin-pin-inner"><i class="fa fa-dumbbell"></i></div></div>',
                    iconSize: [40, 40],
                    iconAnchor: [20, 40]
                })
            }).addTo(mapInstance);

            setMapMarker(newMarker);

            // Show popup on marker
            newMarker.bindPopup(`<div class="popup-preview">
                <strong>${newGym.name || 'Nuevo Gimnasio'}</strong>
                <p>${newGym.vicinity || 'Dirección no establecida'}</p>
            </div>`).openPopup();
        }

        // Re-enable click listener for changing location
        if (mapInstance) {
            mapInstance.once('click', handleMapClick);
        }
    };

    // Update marker popup when gym name or address changes
    useEffect(() => {
        if (mapMarker && (newGym.name || newGym.vicinity)) {
            mapMarker.getPopup()?.setContent(`<div class="popup-preview">
                <strong>${newGym.name || 'Nuevo Gimnasio'}</strong>
                <p>${newGym.vicinity || 'Dirección no establecida'}</p>
            </div>`);
        }
    }, [newGym.name, newGym.vicinity, mapMarker]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewGym({ ...newGym, [name]: value });

        // Clear error for this field when user starts typing
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: null });
        }
    };

    // Handler for location button click
    const useCurrentLocation = () => {
        setLoading(true);
        setError(null);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    // Update form with coordinates
                    setNewGym({
                        ...newGym,
                        lat: lat.toFixed(6),
                        lng: lng.toFixed(6)
                    });

                    setSelectedLocation({ lat, lng });

                    // Update map view
                    if (mapInstance) {
                        mapInstance.setView([lat, lng], 15);
                    }

                    // Add marker to the map
                    if (mapMarker) {
                        mapMarker.remove();
                    }

                    if (typeof L !== 'undefined' && mapInstance) {
                        const newMarker = L.marker([lat, lng], {
                            icon: L.divIcon({
                                className: 'admin-marker-icon',
                                html: '<div class="admin-pin"><div class="admin-pin-inner"><i class="fa fa-dumbbell"></i></div></div>',
                                iconSize: [40, 40],
                                iconAnchor: [20, 40]
                            })
                        }).addTo(mapInstance);

                        setMapMarker(newMarker);

                        // Show popup on marker
                        newMarker.bindPopup(`<div class="popup-preview">
                            <strong>${newGym.name || 'Nuevo Gimnasio'}</strong>
                            <p>${newGym.vicinity || 'Dirección no establecida'}</p>
                        </div>`).openPopup();
                    }

                    // Try to get address from coordinates
                    reverseGeocode(lat, lng)
                        .then(addressResult => {
                            if (addressResult) {
                                // Ensure the address includes "Buenos Aires, Argentina"
                                const fullAddress = addressResult.toLowerCase().includes("buenos aires")
                                    ? addressResult
                                    : `${addressResult}, Buenos Aires, Argentina`;

                                setNewGym(prev => ({
                                    ...prev,
                                    vicinity: fullAddress
                                }));
                            }
                            setLoading(false);
                        })
                        .catch(error => {
                            console.error("Failed to get address:", error);
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

    // Handle star rating click
    const handleRatingClick = (rating) => {
        setNewGym({ ...newGym, rating });

        // Clear error for rating when user sets it explicitly
        if (formErrors.rating) {
            setFormErrors({ ...formErrors, rating: null });
        }
    };

    // Handle rating hover
    const handleRatingHover = (rating) => {
        setRatingHover(rating);
    };

    // Reset rating hover when mouse leaves
    const handleRatingLeave = () => {
        setRatingHover(0);
    };

    // Get star icon based on value and current rating
    const getStarIcon = (position) => {
        const value = ratingHover || newGym.rating;

        if (value >= position) {
            return <FaStar className="star-icon filled" />;
        } else if (value >= position - 0.5) {
            return <FaStarHalfAlt className="star-icon half-filled" />;
        } else {
            return <FaRegStar className="star-icon" />;
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!newGym.name.trim()) {
            errors.name = 'El nombre es obligatorio';
        }

        if (!newGym.vicinity.trim()) {
            errors.vicinity = 'La dirección es obligatoria';
        }

        if (!newGym.lat || isNaN(parseFloat(newGym.lat))) {
            errors.lat = 'Latitud inválida';
        }

        if (!newGym.lng || isNaN(parseFloat(newGym.lng))) {
            errors.lng = 'Longitud inválida';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const gymData = {
            name: newGym.name,
            vicinity: newGym.vicinity,
            rating: parseFloat(newGym.rating) || null,
            geometry: {
                location: {
                    lat: parseFloat(newGym.lat),
                    lng: parseFloat(newGym.lng)
                }
            },
            isAdminAdded: true,
        };

        try {
            if (editingGym) {
                // Update existing gym - use ID from backend
                gymData.id = editingGym.id;

                // Send update to the backend
                const updatedGymDTO = await updateGymInDB(gymData.id, gymData);

                // Convert the response DTO back to our format
                const updatedGym = {
                    ...gymData,
                    id: updatedGymDTO.id,
                    vicinity: updatedGymDTO.direccion,
                    geometry: {
                        location: {
                            lat: updatedGymDTO.latitud,
                            lng: updatedGymDTO.longitud
                        }
                    },
                    rating: updatedGymDTO.calificacion
                };

                // Update the gym in the list
                const updatedGyms = adminGyms.map(gym =>
                    gym.id === updatedGym.id ? updatedGym : gym
                );

                setAdminGyms(updatedGyms);
                updateGyms(updatedGyms);
                setEditingGym(null); // Clear editing state
            } else {
                // Add new gym - the backend will assign an ID
                const newGymDTO = await addGymToDB(gymData);

                // Convert the response DTO back to our format
                const newGymWithId = {
                    ...gymData,
                    id: newGymDTO.id,
                    vicinity: newGymDTO.direccion,
                    geometry: {
                        location: {
                            lat: newGymDTO.latitud,
                            lng: newGymDTO.longitud
                        }
                    },
                    rating: newGymDTO.calificacion
                };

                // Add the new gym to the list
                const updatedGyms = [...adminGyms, newGymWithId];
                setAdminGyms(updatedGyms);
                updateGyms(updatedGyms);
            }

            // Reset form and close
            setNewGym({
                name: '',
                vicinity: '',
                rating: 0,
                lat: '',
                lng: ''
            });

            setShowAddForm(false);

            // Remove marker
            if (mapMarker) {
                mapMarker.remove();
                setMapMarker(null);
            }
        } catch (error) {
            console.error('Failed to save gym:', error);
            alert('Error al guardar el gimnasio. Intenta de nuevo más tarde.');
        }
    };

    // Render gym list
    const renderGymList = () => {
        if (!showGymList || adminGyms.length === 0) {
            return null;
        }

        return (
            <div className="admin-gym-list">
                <div className="admin-list-header">
                    <h3>Gimnasios Administrados</h3>
                    <button className="close-list-button" onClick={toggleGymList}>
                        <FaTimes />
                    </button>
                </div>
                <div className="admin-gym-items">
                    {adminGyms.map(gym => (
                        <div key={gym.id} className="admin-gym-item">
                            <div className="gym-details">
                                {gym.image && (
                                    <div className="gym-image-thumbnail">
                                        <img src={gym.image} alt={gym.name} />
                                    </div>
                                )}
                                <div className="gym-info">
                                    <h4>{gym.name}</h4>
                                    <p>{gym.vicinity}</p>
                                    <div className="gym-rating">
                                        {gym.rating && (
                                            <>
                                                {Array(5).fill().map((_, i) => {
                                                    if (i < Math.floor(gym.rating)) {
                                                        return <FaStar key={i} className="star-icon filled small" />;
                                                    } else if (i < Math.ceil(gym.rating) && !Number.isInteger(gym.rating)) {
                                                        return <FaStarHalfAlt key={i} className="star-icon half-filled small" />;
                                                    } else {
                                                        return <FaRegStar key={i} className="star-icon small" />;
                                                    }
                                                })}
                                                <span className="rating-value small">
                                                    {gym.rating.toFixed(1)}/5
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="gym-actions">
                                <button
                                    className="edit-gym-button"
                                    onClick={() => startEditing(gym)}
                                    title="Editar gimnasio"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    className="delete-gym-button"
                                    onClick={() => deleteGym(gym.id)}
                                    title="Eliminar gimnasio"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="admin-gym-management">
            <div className="admin-buttons-container">
                {!showAddForm && (
                    <>
                        <button
                            className="admin-add-button"
                            onClick={toggleAddForm}
                        >
                            <FaPlus /> Agregar Gimnasio
                        </button>
                        {adminGyms.length > 0 && (
                            <button
                                className="admin-manage-button"
                                onClick={toggleGymList}
                            >
                                <FaDumbbell /> Administrar Gimnasios ({adminGyms.length})
                            </button>
                        )}
                    </>
                )}
            </div>

            {showAddForm && (
                <div className="admin-form-container">
                    <div className="admin-form-header">
                        <FaDumbbell className="form-icon" />
                        <h3>{editingGym ? 'Editar Gimnasio' : 'Agregar Nuevo Gimnasio'}</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="admin-gym-form">
                        <div className="form-columns">
                            <div className="form-column">
                                <div className="form-group">
                                    <label htmlFor="name">
                                        <span className="label-text">Nombre del Gimnasio</span>
                                        <span className="required-indicator">*</span>
                                    </label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            placeholder="Ej: PowerFit Gym"
                                            value={newGym.name}
                                            onChange={handleInputChange}
                                            className={formErrors.name ? 'error' : ''}
                                        />
                                    </div>
                                    {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="vicinity">
                                        <span className="label-text">Dirección</span>
                                        <span className="required-indicator">*</span>
                                    </label>
                                    <div className="input-wrapper">
                                        <IoLocationSharp className="input-icon" />
                                        <input
                                            type="text"
                                            id="vicinity"
                                            name="vicinity"
                                            placeholder="Ej: Av. Corrientes 1234, CABA"
                                            value={newGym.vicinity}
                                            onChange={handleInputChange}
                                            className={formErrors.vicinity ? 'error' : ''}
                                        />
                                    </div>
                                    {formErrors.vicinity && <span className="error-message">{formErrors.vicinity}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="rating">Calificación</label>
                                    <div className="star-rating-container" onMouseLeave={handleRatingLeave}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className="star-wrapper"
                                                onClick={() => handleRatingClick(star)}
                                                onMouseEnter={() => handleRatingHover(star)}
                                            >
                                                {getStarIcon(star)}
                                            </span>
                                        ))}
                                        <span className="rating-value">
                                            {ratingHover || newGym.rating || 0}/5
                                        </span>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group half-width">
                                        <label htmlFor="lat">
                                            <span className="label-text">Latitud</span>
                                            <span className="required-indicator">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="lat"
                                            name="lat"
                                            value={newGym.lat}
                                            onChange={handleInputChange}
                                            className={formErrors.lat ? 'error' : ''}
                                        />
                                        {formErrors.lat && <span className="error-message">{formErrors.lat}</span>}
                                    </div>

                                    <div className="form-group half-width">
                                        <label htmlFor="lng">
                                            <span className="label-text">Longitud</span>
                                            <span className="required-indicator">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="lng"
                                            name="lng"
                                            value={newGym.lng}
                                            onChange={handleInputChange}
                                            className={formErrors.lng ? 'error' : ''}
                                        />
                                        {formErrors.lng && <span className="error-message">{formErrors.lng}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="form-column">
                                <div className="location-help-card">
                                    <div className="card-header">
                                        <HiLocationMarker className="location-icon" />
                                        <h4>Ubicación del Gimnasio</h4>
                                    </div>
                                    <div className="card-content">
                                        <p>Selecciona la ubicación exacta del gimnasio haciendo clic en el mapa, o usa uno de los siguientes métodos:</p>
                                        <button
                                            type="button"
                                            className="location-button"
                                            onClick={useCurrentLocation}
                                            disabled={loading || !navigator.geolocation}
                                        >
                                            {loading ? 'Obteniendo ubicación...' : (
                                                <>
                                                    <FaMapMarkerAlt /> Usar mi ubicación actual
                                                </>
                                            )}
                                        </button>

                                        {error && <div className="location-error">{error}</div>}

                                        <div className="location-tip">
                                            <strong>Tip:</strong> Puedes hacer zoom en el mapa para mayor precisión.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="submit-button">
                                {editingGym ? (
                                    <>
                                        <FaEdit /> Guardar Cambios
                                    </>
                                ) : (
                                    <>
                                        <FaPlus /> Agregar Gimnasio
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={toggleAddForm}
                            >
                                <FaTimes /> Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {renderGymList()}
        </div>
    );
};

export default AdminGymManagement;