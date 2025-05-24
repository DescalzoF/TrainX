import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaChevronRight } from 'react-icons/fa';
import './AdminToggleButton.css';

const AdminToggleButton = ({ isAdmin, onToggle, adminActive }) => {
    const [expanded, setExpanded] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // Hide tooltip after 5 seconds
    useEffect(() => {
        if (showTooltip) {
            const timer = setTimeout(() => {
                setShowTooltip(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [showTooltip]);

    if (!isAdmin) return null;

    const handleToggle = () => {
        onToggle(!adminActive);
        if (!adminActive) {
            setShowTooltip(true);
        }
    };

    const handleMouseEnter = () => {
        setExpanded(true);
    };

    const handleMouseLeave = () => {
        setExpanded(false);
    };

    return (
        <div className="admin-toggle-container">
            {showTooltip && (
                <div className="admin-tooltip">
                    <p>Ahora puedes agregar, editar y eliminar gimnasios</p>
                    <div className="admin-tooltip-arrow"></div>
                </div>
            )}
            <button
                className="admin-toggle-button"
                onClick={handleToggle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-label="Modo administrador"
            >
                <FaShieldAlt className="admin-icon" />
                <span className={`admin-button-text ${expanded ? 'expanded' : ''}`}>
                    {adminActive ? 'Desactivar' : 'Activar'} Admin
                </span>
                <FaChevronRight
                    className="chevron-icon"
                    style={{
                        transform: expanded ? 'rotate(90deg)' : 'rotate(0)',
                    }}
                />
            </button>
        </div>
    );
};

export default AdminToggleButton;