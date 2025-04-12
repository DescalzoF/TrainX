import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/navbar/Navbar.jsx';
import Login from './pages/login/Login.jsx';
import Signup from './pages/signup/Signup.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import HomeLoggedIn from './pages/HomeLoggedIn/HomeLoggedIn.jsx';
import HomeNotLoggedIn from './pages/HomeNotLoggedIn/HomeNotLoggedIn.jsx';
import Perfil from './pages/perfil/Perfil.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    return children;
};

// Create a wrapper component for the Navbar that conditionally renders it
const NavbarWrapper = () => {
    const location = useLocation();
    const { isLoggedIn, currentUser, logout } = useAuth();
    const hideNavbarPaths = ['/login', '/signup'];
    const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

    return shouldShowNavbar ? (
        <Navbar
            isLoggedIn={isLoggedIn}
            username={currentUser?.username}
            onLogout={logout}
        />
    ) : null;
};

function AppContent() {
    const { isLoggedIn, currentUser, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="app">
            <NavbarWrapper />
            <main className="app-content">
                <Routes>
                    <Route
                        path="/"
                        element={isLoggedIn ? <HomeLoggedIn username={currentUser?.username} /> : <HomeNotLoggedIn />}
                    />
                    <Route
                        path="/login"
                        element={!isLoggedIn ? <Login /> : <Navigate to="/" />}
                    />
                    <Route
                        path="/signup"
                        element={!isLoggedIn ? <Signup /> : <Navigate to="/" />}
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/camino"
                        element={
                            <ProtectedRoute>
                                <div className="dashboard">
                                    <h1>Welcome to Camino Fitness</h1>
                                    <p>Your personalized fitness journey starts here!</p>
                                    <p>This is a placeholder for the Camino Fitness page content.</p>
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/perfil"
                        element={
                            <ProtectedRoute>
                                <Perfil />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;