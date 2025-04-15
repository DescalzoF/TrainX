import { useNavigate } from 'react-router-dom';
import './HomeLoggedIn.css';
import { FaPlus, FaWeightHanging } from "react-icons/fa";
import { MdOutlineSportsBaseball, MdOutlineSportsRugby, MdOutlineSportsSoccer } from "react-icons/md";
import { GiMuscleUp } from "react-icons/gi";
import { useAuth } from '../../contexts/AuthContext';

function HomeLoggedIn() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleCaminoClick = () => {
        navigate('/camino');
    };

    return (
        <div className="home-container">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Bienvenido, {currentUser?.username || 'usuario'}!</h1>
                    <p>Estas listo para continuar tu camino fitness con TrainX</p>
                    <div className="hero-buttons">
                        <button className="primary-button" onClick={handleCaminoClick}>
                            Arranca tu camino fitness ahora!
                        </button>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <h2>Tu Camino Fitness</h2>

                <div className="caminos-grid">
                    <div className="camino-card" onClick={handleCaminoClick}>
                        <div className="camino-card-icon">
                            <div className="icon-container horizontal">
                                <MdOutlineSportsBaseball size={50} />
                                <MdOutlineSportsSoccer size={50} />
                                <MdOutlineSportsRugby size={50} />
                            </div>
                        </div>
                        <h3>Deportista</h3>
                        <p className="camino-description">Creado para acceder tu mejor performance en el deporte que te guste!</p>
                    </div>

                    <div className="camino-card" onClick={handleCaminoClick}>
                        <div className="camino-card-icon">
                            <FaWeightHanging size={50} />
                        </div>
                        <h3>Fuerza</h3>
                        <p className="camino-description">Diseñado para maximizar tu fuerza!</p>
                    </div>

                    <div className="camino-card" onClick={handleCaminoClick}>
                        <div className="camino-card-icon">
                            <div className="icon-container horizontal">
                                <FaWeightHanging size={50} />
                                <GiMuscleUp size={50} />
                            </div>
                        </div>
                        <h3>Hibrido</h3>
                        <p className="camino-description">El camino para mejorar en todos aspectos!</p>
                    </div>

                    <div className="camino-card" onClick={handleCaminoClick}>
                        <div className="camino-card-icon">
                            <GiMuscleUp size={50} />
                        </div>
                        <h3>Hipertrofia</h3>
                        <p className="camino-description">Diseñado para maximizar tu crecimiento muscular!</p>
                    </div>

                    <div className="camino-card" onClick={handleCaminoClick}>
                        <div className="camino-card-icon">
                            <FaPlus size={50} />
                        </div>
                        <h3>Otro Camino</h3>
                        <p className="camino-description">Elegi que queres hacer con tu Camino Fitness!</p>
                    </div>

                </div>
            </section>

            <section className="cta-section">
                <h3>Interesado hablar con ayuda profesional psicológica?</h3>
                <p>Que nada te detenga</p>
            </section>
        </div>
    );
}

export default HomeLoggedIn;