import React, { useState, useEffect } from 'react';
import { FaCoins, FaCheck, FaLock, FaTimes } from 'react-icons/fa';
import { MdShoppingCart } from 'react-icons/md';
import './Tienda.css';

// Import assets - you'll need to add these to your assets folder
import avatar1 from '../../assets/shop/avatars/avatar1.png';
import avatar2 from '../../assets/shop/avatars/avatar2.png';
import avatar3 from '../../assets/shop/avatars/avatar3.png';

import banner1 from '../../assets/shop/banners/banner1.png';
import banner2 from '../../assets/shop/banners/banner2.png';
import banner3 from '../../assets/shop/banners/banner3.png';

import emblem1 from '../../assets/shop/emblems/emblem1.png';
import emblem2 from '../../assets/shop/emblems/emblem2.png';
import emblem3 from '../../assets/shop/emblems/emblem3.png';

const Tienda = () => {
    const [shopItems, setShopItems] = useState({});
    const [userCoins, setUserCoins] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('PROFILE_PICTURE');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Asset mappings
    const assetMappings = {
        PROFILE_PICTURE: {
            avatar1, avatar2, avatar3
        },
        BANNER: {
            banner1, banner2, banner3
        },
        EMBLEM: {
            emblem1, emblem2, emblem3
        }
    };

    const categoryNames = {
        PROFILE_PICTURE: 'Fotos de Perfil',
        BANNER: 'Banners',
        EMBLEM: 'Emblemas'
    };

    useEffect(() => {
        fetchShopData();
        fetchUserCoins();
    }, []);

    const fetchShopData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/shop/items', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Augment all prices by 100
                const augmentedData = {};
                Object.keys(data).forEach(category => {
                    augmentedData[category] = {};
                    Object.keys(data[category]).forEach(itemName => {
                        augmentedData[category][itemName] = {
                            ...data[category][itemName],
                            price: data[category][itemName].price + 100
                        };
                    });
                });
                setShopItems(augmentedData);
            } else {
                showMessage('Error al cargar los items de la tienda', 'error');
            }
        } catch (error) {
            console.error('Error fetching shop items:', error);
            showMessage('Error de conexión', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserCoins = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/users/current/coins', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUserCoins(data.coins || 0);
            }
        } catch (error) {
            console.error('Error fetching user coins:', error);
        }
    };

    const showMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 3000);
    };

    const handlePurchase = async (itemType, itemName, originalPrice) => {
        // Use original price for API call
        if (userCoins < originalPrice + 100) {
            showMessage('No tienes suficientes monedas', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/shop/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    itemType,
                    itemName
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('¡Compra realizada con éxito!', 'success');
                fetchShopData();
                fetchUserCoins();
                // Trigger coin update event for navbar
                window.dispatchEvent(new Event('coinsUpdated'));
            } else {
                showMessage(data.message || 'Error al realizar la compra', 'error');
            }
        } catch (error) {
            console.error('Error purchasing item:', error);
            showMessage('Error de conexión', 'error');
        }
    };

    const handleEquip = async (itemType, itemName) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/shop/equip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    itemType,
                    itemName
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('¡Item equipado!', 'success');
                fetchShopData();

                // If it's a profile picture, update the navbar
                if (itemType === 'PROFILE_PICTURE') {
                    const assetPath = assetMappings[itemType][itemName];
                    localStorage.setItem('profilePicture', assetPath);
                    window.dispatchEvent(new Event('profilePictureUpdated'));
                    // Also dispatch shop item activation event
                    window.dispatchEvent(new Event('shopItemActivated'));
                }
            } else {
                showMessage(data.message || 'Error al equipar el item', 'error');
            }
        } catch (error) {
            console.error('Error equipping item:', error);
            showMessage('Error de conexión', 'error');
        }
    };

    const handleUnequip = async (itemType, itemName) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/shop/unequip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    itemType,
                    itemName
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('¡Item desequipado!', 'success');
                fetchShopData();

                // If it's a profile picture, clear from navbar
                if (itemType === 'PROFILE_PICTURE') {
                    localStorage.removeItem('profilePicture');
                    window.dispatchEvent(new Event('profilePictureUpdated'));
                    window.dispatchEvent(new Event('shopItemActivated'));
                }
            } else {
                showMessage(data.message || 'Error al desequipar el item', 'error');
            }
        } catch (error) {
            console.error('Error unequipping item:', error);
            showMessage('Error de conexión', 'error');
        }
    };

    const renderItem = (itemName, itemData, itemType) => {
        const asset = assetMappings[itemType][itemName];

        // Skip rendering if asset doesn't exist
        if (!asset) {
            return null;
        }

        const { price, owned, active } = itemData;

        return (
            <div key={itemName} className={`shop-item ${active ? 'active' : ''}`}>
                <div className="item-image">
                    <img src={asset} alt={itemName} />
                    {active && <div className="active-badge"><FaCheck /></div>}
                </div>
                <div className="item-info">
                    <div className="item-price">
                        <FaCoins className="coin-icon" />
                        <span>{price}</span>
                    </div>
                    <div className="item-actions">
                        {!owned ? (
                            <button
                                className={`purchase-btn ${userCoins < price ? 'disabled' : ''}`}
                                onClick={() => handlePurchase(itemType, itemName, price - 100)}
                                disabled={userCoins < price}
                            >
                                {userCoins < price ? <FaLock /> : <MdShoppingCart />}
                                {userCoins < price ? 'Sin monedas' : 'Comprar'}
                            </button>
                        ) : (
                            <div className="equip-actions">
                                {!active ? (
                                    <button
                                        className="activate-btn"
                                        onClick={() => handleEquip(itemType, itemName)}
                                    >
                                        <FaCheck />
                                        Equipar
                                    </button>
                                ) : (
                                    <button
                                        className="unequip-btn"
                                        onClick={() => handleUnequip(itemType, itemName)}
                                    >
                                        Desequipar
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Function to sort items by price (highest to lowest)
    const getSortedItems = (items) => {
        return Object.entries(items).sort(([, a], [, b]) => b.price - a.price);
    };

    if (loading) {
        return (
            <div className="tienda-container">
                <div className="loading">Cargando tienda...</div>
            </div>
        );
    }

    return (
        <div className="tienda-container">
            <div className="tienda-header">
                <h1>🛍️ Tienda TrainX</h1>
                <div className="user-coins">
                    <FaCoins className="coin-icon" />
                    <span>{userCoins} monedas</span>
                </div>
            </div>

            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}

            <div className="category-selector">
                {Object.keys(categoryNames).map(category => (
                    <button
                        key={category}
                        className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {categoryNames[category]}
                    </button>
                ))}
            </div>

            <div className="shop-items-grid">
                {shopItems[selectedCategory] && getSortedItems(shopItems[selectedCategory])
                    .filter(([itemName]) => assetMappings[selectedCategory][itemName]) // Only show items with assets
                    .map(([itemName, itemData]) =>
                        renderItem(itemName, itemData, selectedCategory)
                    )}
            </div>
        </div>
    );
};

export default Tienda;