import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/navbar/Navbar.jsx';
import Login from './pages/login/Login.jsx';
import Signup from './pages/signup/Signup.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import HomeLoggedIn from './pages/HomeLoggedIn/HomeLoggedIn.jsx';
import HomeNotLoggedIn from './pages/HomeNotLoggedIn/HomeNotLoggedIn.jsx';
import Perfil from './pages/perfil/Perfil.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { XPProvider } from './contexts/XPContext.jsx'; // Import the XPProvider
import CaminoFitness from './pages/CaminoFitness/CaminoFitness.jsx';
import CaminoFitnessAdmin from './pages/CaminoFitness/CaminoFitnessAdmin.jsx';
import ForgotPassword from './pages/auth/ForgotPassword/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword/ResetPassword.jsx';
import ExercisesView from './pages/exercises/ExercisesView.jsx';
import Gimnasios from './pages/gimnasios/Gimnasios.jsx';
import './App.css';

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

const AdminRoute = ({ children }) => {
    const { isLoggedIn, isAdmin, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    if (!isAdmin) {
        return <Navigate to="/camino" />;
    }

    return children;
};

const NavbarWrapper = () => {
    const location = useLocation();
    const hideNavbarPaths = ['/login', '/signup', '/reset-password', '/forgot-password'];
    const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

    return shouldShowNavbar ? <Navbar /> : null;
};

function AppContent() {
    const { isLoggedIn, currentUser, isLoading, hasChosenCaminoFitness, getCurrentCaminoFitnessId } = useAuth();

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
                        element={
                            isLoggedIn ? (
                                hasChosenCaminoFitness() ? (
                                    <Navigate to={`/camino/${getCurrentCaminoFitnessId()}/level/principiante`} />
                                ) : (
                                    <HomeLoggedIn />
                                )
                            ) : (
                                <HomeNotLoggedIn />
                            )
                        }
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
                                <Dashboard username={currentUser?.username} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/perfil"
                        element={
                            <ProtectedRoute>
                                <Perfil username={currentUser?.username} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/camino"
                        element={
                            <ProtectedRoute>
                                <CaminoFitness />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/camino/admin"
                        element={
                            <AdminRoute>
                                <CaminoFitnessAdmin />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/camino/:caminoId/level/:level"
                        element={
                            <ProtectedRoute>
                                <ExercisesView />
                            </ProtectedRoute>
                        }
                    />

                    {/* Add the new Gimnasios route */}
                    <Route
                        path="/gyms"
                        element={
                            <ProtectedRoute>
                                <Gimnasios />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/forgot-password"
                           element={<ForgotPassword />} />
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
                <XPProvider> {/* Add the XPProvider here */}
                    <AppContent />
                </XPProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;