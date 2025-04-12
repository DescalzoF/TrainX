import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/navbar/Navbar.jsx';
import Login from './pages/login/Login.jsx';
import Signup from './pages/signup/Signup.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import HomeLoggedIn from './pages/HomeLoggedIn/HomeLoggedIn.jsx';
import HomeNotLoggedIn from './pages/HomeNotLoggedIn/HomeNotLoggedIn.jsx';
import Perfil from './pages/perfil/Perfil.jsx'; // Import the new Perfil component
import './App.css';

// Create a wrapper component for the Navbar that conditionally renders it
const NavbarWrapper = ({ isLoggedIn, username, onLogout }) => {
    const location = useLocation();
    const hideNavbarPaths = ['/login', '/signup'];
    const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

    return shouldShowNavbar ? (
        <Navbar
            isLoggedIn={isLoggedIn}
            username={username}
            onLogout={onLogout}
        />
    ) : null;
};

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sessionId = localStorage.getItem('sessionId');
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');

        if (sessionId && userId && username) {
            setUser({
                sessionId,
                userId,
                username
            });
        }

        setLoading(false);
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        setUser(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route path="*" element={
                        <NavbarWrapper
                            isLoggedIn={!!user}
                            username={user?.username}
                            onLogout={handleLogout}
                        />
                    } />
                </Routes>
                <main className="app-content">
                    <Routes>
                        <Route
                            path="/"
                            element={user ? <HomeLoggedIn username={user?.username} /> : <HomeNotLoggedIn />}
                        />
                        <Route
                            path="/login"
                            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
                        />
                        <Route
                            path="/signup"
                            element={!user ? <Signup /> : <Navigate to="/" />}
                        />
                        <Route
                            path="/dashboard"
                            element={user ? <Dashboard /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/camino"
                            element={user ? <div className="dashboard">
                                <h1>Welcome to Camino Fitness</h1>
                                <p>Your personalized fitness journey starts here!</p>
                                <p>This is a placeholder for the Camino Fitness page content.</p>
                            </div> : <Navigate to="/login" />}
                        />
                        {/* Add the new Perfil route */}
                        <Route
                            path="/perfil"
                            element={user ? <Perfil /> : <Navigate to="/login" />}
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;