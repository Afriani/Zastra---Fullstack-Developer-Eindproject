import Image from '../../assets/pictures/image.png';
import NavBar from "./NavBar.jsx";

import '../../css/HOME/header.css';
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";

function Header() {
    const navigate = useNavigate();
    const { isAuthenticated, logout, user } = useContext(AuthContext);

    return (
        <>
            <header className="header">
                <div className="header-left-section">
                    <div
                        className="header-logo"
                        onClick={() => navigate('/')}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => { if (e.key === 'Enter') navigate('/'); }}
                    >
                        <img src={Image} alt="app-img" />
                    </div>

                    {isAuthenticated && (
                        <div className="user-welcome-row">
                            <span className="user-welcome">Welcome, {user?.firstName || user?.email}</span>
                            <button onClick={logout} className="logout-btn">Logout</button>
                        </div>
                    )}
                </div>

                <NavBar />
            </header>
        </>
    );
}

export default Header;