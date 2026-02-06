import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';

function NavBar() {
    const { isAuthenticated, logout, user } = useContext(AuthContext);

    return (
        <div className="nav-menu">
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>

                {/* BEWIJS VOOR CONTEXT GEBRUIK */}
                {isAuthenticated ? (
                    <>
                        <li><span className="user-welcome">Welcome, {user?.email}</span></li>
                        <li><button onClick={logout} className="logout-btn">Logout</button></li>
                    </>
                ) : (
                    <li><Link to="/login">Login</Link></li>
                )}
            </ul>
        </div>
    );
}

export default NavBar;


