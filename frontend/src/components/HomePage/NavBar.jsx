import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';

function NavBar() {
    const { isAuthenticated, role } = useContext(AuthContext);

    const getDashboardLink = () => {
        const normalizedRole = (role || "").toString().toUpperCase().replace("ROLE_", "");
        if (normalizedRole === "ADMIN") return "/admin";
        if (normalizedRole === "OFFICER") return "/officer";
        return "/user-dashboard";
    };

    return (
        <div className="nav-menu">
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>

                {isAuthenticated ? (
                    <li><Link to={getDashboardLink()} className="dashboard-link">My Dashboard</Link></li>
                ) : (
                    <li><Link to="/login">Login</Link></li>
                )}
            </ul>
        </div>
    );
}

export default NavBar;