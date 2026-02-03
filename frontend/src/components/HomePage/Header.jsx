import Image from '../../assets/pictures/image.png';
import NavBar from "./NavBar.jsx";

import '../../css/HOME/header.css';
import {useNavigate} from "react-router-dom";

function Header() {

    const navigate = useNavigate();

    return (
        <>
            <header className="header">
                <div
                    className="header-logo"
                    onClick={() => navigate('/')}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') navigate('/'); }}
                >
                    <img src={Image} alt="app-img"/>
                </div>
                <NavBar />
            </header>
        </>
    );
}

export default Header;



