import { useState } from 'react';
import './CaminoFitness.css';
import iconoDeportista from "../../assets/icono-deportista.png";
import iconoFuerza from "../../assets/icono-fuerza.png";
import iconoHibrido from "../../assets/icono-hibrido.jpg";
import iconoHipertrofia from "../../assets/icono-hipertrofia.png";
import iconoVarios from "../../assets/icono-varios.png";

function CaminoFitness() {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedCamino, setSelectedCamino] = useState(null);

    const handleCaminoSelect = (camino) => {
        setSelectedCamino(camino);
        setShowConfirmation(true);
    };

    const handleConfirm = (confirmed) => {
        if (confirmed) {
            // Logic to proceed with the selected camino
            console.log(`Confirmed selection: ${selectedCamino}`);
            // Navigate to next step or load data
        }
        setShowConfirmation(false);
    };

    return (
        <div className="camino-container">
            <div className="camino-header">
                <h1>Explora tu Camino Fitness</h1>
                <p className="subtitle">Elegí lo correcto, Transforma tu vida, Sé mejor</p>
            </div>

            {showConfirmation ? (
                <div className="confirmation-modal">
                    <div className="confirmation-content">
                        <h2>¿Estás seguro?</h2>
                        <div className="confirmation-buttons">
                            <button className="no-button" onClick={() => handleConfirm(false)}>No</button>
                            <button className="si-button" onClick={() => handleConfirm(true)}>Si</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="caminos-list">
                    <div className="camino-option" onClick={() => handleCaminoSelect('Deportista')}>
                        <div className="camino-icon-container">
                            <img src={iconoDeportista} alt="Deportista Icon" className="camino-icon" />
                        </div>
                        <div className="camino-info">
                            <h3>Deportista</h3>
                            <p className="complete-description">
                                Optimiza tu rendimiento para competir. Elige entre rutinas genéricas o arma tu propia plantilla
                                de entrenamiento enfocada en agilidad, resistencia y velocidad. Además, te damos una estimación
                                calórica acorde a tu nivel de actividad y objetivos, y herramientas para buscar alimentos
                                que se ajusten a tu dieta.
                            </p>
                        </div>
                    </div>

                    <div className="camino-option" onClick={() => handleCaminoSelect('Fuerza')}>
                        <div className="camino-icon-container">
                            <img src={iconoFuerza} alt="Fuerza Icon" className="camino-icon" />
                        </div>
                        <div className="camino-info">
                            <h3>Fuerza</h3>
                            <p className="complete-description">
                                Entrena para levantar más. Accede a programas estructurados o crea tu propia rutina
                                basada en los grandes levantamientos. Calcula tus necesidades calóricas para ganar
                                fuerza sin excedentes innecesarios y encuentra fácilmente el valor nutricional de lo que comés.
                            </p>
                        </div>
                    </div>

                    <div className="camino-option" onClick={() => handleCaminoSelect('Hibrido')}>
                        <div className="camino-icon-container">
                            <img src={iconoHibrido} alt="Hibrido Icon" className="camino-icon" />
                        </div>
                        <div className="camino-info">
                            <h3>Hibrido</h3>
                            <p className="complete-description">
                                Desarrollá fuerza y resistencia al mismo tiempo. Te damos rutinas balanceadas o
                                plantillas editables para personalizar según tus objetivos. Incluye cálculo calórico
                                adaptado a este enfoque versátil y acceso a una base de datos de alimentos.
                            </p>
                        </div>
                    </div>

                    <div className="camino-option" onClick={() => handleCaminoSelect('Hipertrofia')}>
                        <div className="camino-icon-container">
                            <img src={iconoHipertrofia} alt="Hipertrofia Icon" className="camino-icon" />
                        </div>
                        <div className="camino-info">
                            <h3>Hipertrofia</h3>
                            <p className="complete-description">
                                Buscás crecer. Te ofrecemos rutinas clásicas de volumen o plantillas personalizables
                                para armar tu split ideal. Calculamos tus calorías de mantenimiento o superávit y
                                podés consultar macros y calorías de tus comidas.
                            </p>
                        </div>
                    </div>

                    <div className="camino-option" onClick={() => handleCaminoSelect('Otro')}>
                        <div className="camino-icon-container">
                            <img src={iconoVarios} alt="Otros Caminos Icon" className="camino-icon" />
                        </div>
                        <div className="camino-info">
                            <h3>Otro Camino</h3>
                            <p className="complete-description">
                                ¿Tenés un enfoque diferente? Sea salud general, estética, rehabilitación o simplemente
                                moverte más, armá tu rutina ideal o usá nuestras sugerencias. Incluye cálculo calórico
                                general y buscador de alimentos para mantenerte al día.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="footer-note">
                <p>Si se encuentra en necesidad de atención psicológica se puede contactar al número</p>
                <p className="phone-number">Teléfono: +54 9 11 999 9999 (local los)</p>
            </div>
        </div>
    );
}

export default CaminoFitness;