import '../../css/HOME/home.css'
import '../../css/HOME/footer.css'

import logoVideo from "../../assets/videos/Logo.mp4";

import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Home() {

    const location = useLocation();
    const initialMessage = location.state?.message || '';
    const [alertMessage, setAlertMessage] = useState(initialMessage);

    useEffect(() => {
        if (!initialMessage) return;

        // Auto-dismiss after 5 seconds
        const t = setTimeout(() => setAlertMessage(''), 5000);
        return () => clearTimeout(t);
    }, [initialMessage]);

    return (
        <>
            <div className="main-menu">

                {alertMessage && (
                    <div className="home-alert success">
                        <span>{alertMessage}</span>
                        <button
                            className="alert-dismiss"
                            onClick={() => setAlertMessage('')}
                            aria-label="Dismiss message"
                            type="button"
                        >
                            ×
                        </button>
                    </div>
                )}

                <h1>Welcome to Zastra</h1>
                <p>Infrastructure Issue Reporting Platform in Bekasi. This platform enables residents to formally report
                    damaged public infrastructure—such as potholes, broken pedestrian crossings, malfunctioning
                    streetlights, and other related concerns—in a streamlined and accessible manner.
                </p>

                <div className="home-actions">
                    <Link to="/register" className="home-button">Register</Link>
                <Link to="/login" className="home-button">Login</Link>
                </div>

            </div>

            <div className="home-video-wrap">
                <video src={logoVideo} autoPlay muted loop playsInline/>
            </div>
        </>
    )
}

export default Home;


