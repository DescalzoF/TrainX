import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home({ isLoggedIn, username }) {
    const navigate = useNavigate();

    if (isLoggedIn) {
        return (
            <div className="home-container">
                <section className="hero-section">
                    <div className="hero-content">
                        <h1>Bienvenido, {username}!</h1>
                        <p>Estas listo para continuar tu camino fitness con TrainX?</p>
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
                            <div className="feature-icon">🏋️</div>
                            <h3>Tus ejercicios</h3>
                            <p>Podes guardar tus ejercicios 100% personalizados y a gusto! </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Check Your Progress</h3>
                            <p>See how far you've come with your fitness goals and achievements</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🏆</div>
                            <h3>This Week's Challenges</h3>
                            <p>New challenges are waiting for you - earn more coins and experience</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">👥</div>
                            <h3>Community Updates</h3>
                            <p>See what others in the TrainX community are achieving</p>
                        </div>
                    </div>
                </section>

                <section className="cta-section">
                    <h2>Ready for Today's Workout?</h2>
                    <p>Your Camino Fitness journey continues</p>
                    <button className="primary-button" onClick={() => navigate('/camino')}>
                        Start Camino Fitness
                    </button>
                </section>
            </div>
        );
    }

    return (
        <div className="home-container">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Start Your Fitness Journey Today</h1>
                    <p>Track your progress, join challenges, and reach your fitness goals with TrainX</p>
                    <div className="hero-buttons">
                        <button className="primary-button" onClick={() => navigate('/signup')}>
                            Sign Up Now
                        </button>
                        <button className="secondary-button" onClick={() => navigate('/login')}>
                            Login
                        </button>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <h2>Why Choose TrainX</h2>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🏋️</div>
                        <h3>Personalized Workouts</h3>
                        <p>Get customized workout plans tailored to your fitness level and goals</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Progress Tracking</h3>
                        <p>Monitor your improvements with detailed statistics and achievements</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🏆</div>
                        <h3>Weekly Challenges</h3>
                        <p>Compete with others and earn coins through exciting weekly challenges</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">👥</div>
                        <h3>Community Support</h3>
                        <p>Join a supportive community of fitness enthusiasts to stay motivated</p>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <h2>Ready to Transform Your Fitness Journey?</h2>
                <p>Join thousands of users who have already started their path to better health</p>
                <button className="primary-button" onClick={() => navigate('/signup')}>
                    Get Started for Free
                </button>
            </section>
        </div>
    );
}

export default Home;