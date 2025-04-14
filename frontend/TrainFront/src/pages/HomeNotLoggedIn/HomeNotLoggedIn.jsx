import { useNavigate } from 'react-router-dom';
import './HomeNotLoggedIn.css';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { IoIosStats } from 'react-icons/io';
import { FaTrophy } from 'react-icons/fa';
import { IoChatbox } from 'react-icons/io5';

function HomeNotLoggedIn() {
    const navigate = useNavigate();
    return (
        <div className="home-container">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Arranca tu Camino Fitness hoy!</h1>
                    <p>TrainX cubre todos tus necesidades para que tengas tu mejor experiencia!</p>
                    <div className="hero-buttons">
                        <button className="primary-button" onClick={() => navigate('/signup')}>
                            Sign Up
                        </button>
                        <button className="secondary-button" onClick={() => navigate('/login')}>
                            Login
                        </button>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <h2>Porque elegir TrainX</h2>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon"><GiWeightLiftingUp size={90}/></div>
                        <h3>Workouts personalizados</h3>
                        <p>Te organizamos en base a que buscas y tu nivel en el gimnasio</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon"><IoIosStats size={90}/></div>
                        <h3>Trackeo de progreso</h3>
                        <p>Hacemos un monitoreo de tu progreso y te mostramos como vas transformando</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon"><FaTrophy size={90}/></div>
                        <h3>Desafios Semanales</h3>
                        <p>Podes competir con otras personas completando desafios</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon"><IoChatbox size={90}/></div>
                        <h3>Soporte</h3>
                        <p>Te podes unir a una comunidad de amantes del fitness y hablar atraves del foro</p>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <h3>Interesado hablar con ayuda profresonal psicologica?</h3>
                <p>Que nada te detenga</p>
            </section>
        </div>
    );
}

export default HomeNotLoggedIn;
