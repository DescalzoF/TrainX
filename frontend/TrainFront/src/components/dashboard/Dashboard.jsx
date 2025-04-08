import { useAuth } from '../../contexts/AuthContext.jsx';
import './Dashboard.css';

function Dashboard() {
    const { currentUser } = useAuth();

    return (
        <div className="dashboard">
            <h1>Welcome to Your TrainX Dashboard</h1>
            <div className="dashboard-content">
                <div className="user-profile">
                    <h2>Your Profile</h2>
                    <p>Username: {currentUser?.username}</p>
                    <p>User ID: {currentUser?.userId}</p>
                </div>

                <div className="quick-stats">
                    <h2>Your Fitness Stats</h2>
                    <p>XP: Loading...</p>
                    <p>Coins: Loading...</p>
                    <p>Last Workout: Not available</p>
                </div>

                <div className="actions">
                    <h2>Quick Actions</h2>
                    <button className="action-button">Start Workout</button>
                    <button className="action-button">View Progress</button>
                    <button className="action-button">Set Goals</button>
                </div>
            </div>
        </div>
    );
}
export default Dashboard;