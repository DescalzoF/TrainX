import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in from localStorage
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
                <Navbar
                    isLoggedIn={!!user}
                    username={user?.username}
                    onLogout={handleLogout}
                />
                <main className="app-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/login"
                            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
                        />
                        <Route
                            path="/signup"
                            element={!user ? <Signup /> : <Navigate to="/dashboard" />}
                        />
                        <Route
                            path="/dashboard"
                            element={user ? <Dashboard /> : <Navigate to="/login" />}
                        />
                        {/* Add more protected routes as needed */}
                    </Routes>
                </main>
                <footer className="app-footer">
                    <p>© {new Date().getFullYear()} TrainX Fitness. All rights reserved.</p>
                </footer>
            </div>
        </Router>
    );
}

export default App;