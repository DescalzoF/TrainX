import './LogoTitle.css';
import { useNavigate } from 'react-router-dom';
import logoImage from "../../assets/trainx-logo.png";

const LogoTitle = () => {
    const navigate = useNavigate();

    return (
        <div className="logo-title" onClick={() => navigate('/')}>
            <img src={logoImage} alt="TrainX Logo" className="logo-image" />
            <h1 className="logo-text">TrainX</h1>
        </div>
    );
};

export default LogoTitle;
