import '../../css/HOME/footer.css'

import { useNavigate } from 'react-router-dom';
import Private from './Private.jsx';

import facebook from '../../assets/pictures/facebook.png';
import instagram from '../../assets/pictures/instagram.png';
import twitter from '../../assets/pictures/twitter.png';
import gmail from '../../assets/pictures/gmail.png';
import image from '../../assets/pictures/3D Logo.jpg';

function Footer() {

    const navigate = useNavigate();

    return (
        <div className="footer">

            <div className="footer-left">
                <div
                    className="footer-logo"
                    onClick={() => navigate('/')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') navigate('/'); }}
                >
                    <img src={image} alt="app-img" />
                </div>
                <Private />
            </div>

            <div className="social-medias">
                <p>Follow us</p>
                <ol>
                    <li>
                        <a href="https://www.facebook.com/profile.php?id=61582641181827" target="_blank" rel="noopener noreferrer">
                            <img src={facebook} alt="facebook"/>
                        </a>
                    </li>

                    <li>
                        <a href="https://www.instagram.com/zastraindonesia/" target="_blank" rel="noopener noreferrer">
                            <img src={instagram} alt="instagram"/>
                        </a>
                    </li>

                    <li>
                        <a href="https://x.com/home" target="_blank" rel="noopener noreferrer">
                            <img src={twitter} alt="twitter"/>
                        </a>
                    </li>

                    <li>
                        <a href="mailto:info.zastra@gmail.com" target="_blank" rel="noopener noreferrer">
                            <img src={gmail} alt="gmail"/>
                        </a>
                    </li>
                </ol>
            </div>

        </div>
    )
}

export default Footer;


