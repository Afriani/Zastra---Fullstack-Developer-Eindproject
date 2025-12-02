import {Link} from 'react-router-dom';

function NavBar() {
    return (
        <div className="nav-menu">
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
            </ul>
        </div>
);
}

export default NavBar;
