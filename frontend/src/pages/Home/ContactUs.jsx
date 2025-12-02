import '../../css/HOME/contactus.css';
import { useState } from 'react';

function ContactUs() {
    const [activeBox, setActiveBox] = useState(null);

    const handleClick = (type) => {
        setActiveBox(prev => (prev === type ? null : type));
    };

    return (
        <div className="contact-container">
            <h1>Contact Us</h1>
            <p className="intro-text">
                Get in touch with the right people at Zastra. We are here to help.
            </p>

            <div className="contact-grid">

                <div className="contact-box">
                    <h3>📞 Call Us</h3>
                    <p>Ask questions or speak to an agent directly.</p>
                    <button className="contact-button" onClick={() => handleClick('phone')}>
                        Show Details
                    </button>
                    {activeBox === 'phone' && (
                        <div className="detail-box">
                            <p>+62-123456789</p>
                        </div>
                    )}
                </div>

                <div className="contact-box">
                    <h3>💬 WhatsApp</h3>
                    <p>Instant messaging support.</p>
                    <button className="contact-button" onClick={() => handleClick('whatsapp')}>
                        Show Details
                    </button>
                    {activeBox === 'whatsapp' && (
                        <div className="detail-box">
                            <p> +62-123456789</p>
                        </div>
                    )}
                </div>

                <div className="contact-box">
                    <h3>📧 Email</h3>
                    <p>Replies within 24 hours.</p>
                    <button className="contact-button" onClick={() => handleClick('email')}>
                        Show Details
                    </button>
                    {activeBox === 'email' && (
                        <div className="detail-box">
                            <p>info.zastra@gmail.com</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default ContactUs;
