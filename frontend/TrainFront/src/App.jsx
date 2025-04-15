// App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/navbar/Navbar.jsx';
import Login from './pages/login/Login.jsx';
import Signup from './pages/signup/Signup.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import HomeLoggedIn from './pages/HomeLoggedIn/HomeLoggedIn.jsx';
import HomeNotLoggedIn from './pages/HomeNotLoggedIn/HomeNotLoggedIn.jsx';
import Perfil from './pages/perfil/Perfil.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import CaminoFitness from './pages/CaminoFitness/CaminoFitness.jsx';
import ForgotPassword from './pages/auth/ForgotPassword/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword/ResetPassword.jsx';
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
    const hideNavbarPaths = ['/login', '/signup', '/reset-password', '/forgot-password'];
    const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

    return shouldShowNavbar ? (
        <Navbar
            isLoggedIn={isLoggedIn}
            username={currentUser?.username} // Make sure this is passed to Navbar
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
                                <Dashboard username={currentUser?.username} />  {/* Pass username here */}
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/perfil"
                        element={
                            <ProtectedRoute>
                                <Perfil username={currentUser?.username} />  {/* Pass username here */}
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/camino"
                        element={
                            <ProtectedRoute>
                                <CaminoFitness username={currentUser?.username} />  {/* Pass username here */}
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/forgot-password"
                           element={
                        <ForgotPassword />} />
                    <Route
                        path="/reset-password"
                        element={<ResetPassword />} />
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
