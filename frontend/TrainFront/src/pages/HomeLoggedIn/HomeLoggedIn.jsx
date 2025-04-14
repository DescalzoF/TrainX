import { useNavigate } from 'react-router-dom';
import './HomeLoggedIn.css';
import { FaPlus, FaWeightHanging } from "react-icons/fa";
import { MdOutlineSportsBaseball, MdOutlineSportsRugby, MdSportsSoccer } from "react-icons/md";
import { GiMuscleUp } from "react-icons/gi";
import { useAuth } from '../../contexts/AuthContext';  // Importar useAuth

function HomeLoggedIn() {
    const { currentUser } = useAuth();  // Obtener el usuario desde el AuthContext
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Bienvenido, {currentUser?.username || 'usuario'}!</h1>  {/* Usar currentUser directamente */}
                    <p>Estas listo para continuar tu camino fitness con TrainX</p>
                    <div className="hero-buttons">
                        <button className="primary-button" onClick={() => navigate('/camino')}>
                            Arranca tu camino fitness ahora!
                        </button>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <h2>Tu Camino Fitness</h2>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon"> <MdOutlineSportsBaseball size={40}/> <MdSportsSoccer size={40}/> <MdOutlineSportsRugby size={40}/></div>
                        <h3>Deportista</h3>
                        <p>Creado para acceder tu mejor performance en el deporte que te guste!</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon"> <FaWeightHanging size={90} /></div>
                        <h3>Fuerza</h3>
                        <p>Diseñado para maximizar tu fuerza!</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon"><FaWeightHanging size={50}/> <GiMuscleUp size={50}/></div>
                        <h3>Hibrido</h3>
                        <p>El camino para mejorar en todos aspectos!</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon"> <GiMuscleUp size={90}/></div>
                        <h3>Hipertrofia</h3>
                        <p>Diseñado para maximizar tu crecimiento muscular!</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon"><FaPlus size={90}/></div>
                        <h3>Otro Camino</h3>
                        <p>Elegi que queres hacer con tu Camino Fitness!</p>
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

