import '../../css/HOME/contactus.css';
import React, { useState } from 'react';

// All Icons
import telephoneIcone from "../../assets/pictures/contact-us/telephone.png"
import whatsappIcone from "../../assets/pictures/my-inbox/left-speech-ballon.png"
import emailIcon from "../../assets/pictures/contact-us/email.png"

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
                    <h3>
                        <img src={telephoneIcone} alt="telephone-icon" className="contact-us-icon" />️
                        Call Us
                    </h3>
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
                    <h3>
                        <img src={whatsappIcone} alt="whatsapp-icon" className="contact-us-icon" />️
                        WhatsApp
                    </h3>
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
                    <h3>
                        <img src={emailIcon} alt="email-icon" className="contact-us-icon" />️
                        Email
                    </h3>
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
                <footer />

            </div>
        </div>
    );
}

export default ContactUs;


