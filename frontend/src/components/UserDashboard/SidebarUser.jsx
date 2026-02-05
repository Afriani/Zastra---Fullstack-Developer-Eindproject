// src/components/OfficerDashboard/SidebarOfficer.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import '../../css/USER DASHBOARD/sidebar.css';

import { HiMenuAlt3 } from "react-icons/hi"; // or HiMenu, GiHamburgerMenu, etc.

// Icons for sidebar nav items
import logoutIcon from '../../assets/pictures/logout.png';
import overviewIcon from '../../assets/pictures/overview.png';
import newReportIcon from '../../assets/pictures/newreport.png';
import myReportIcon from '../../assets/pictures/myreport.png';
import myInboxIcon from '../../assets/pictures/myinbox.png';
import myProfileIcon from '../../assets/pictures/myprofile.png';

function SidebarUser({onLogout}) {

    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const sidebarRef = useRef(null);

    const toggleSidebar = () => setIsOpen(prev => !prev);
    const closeSidebar = () => setIsOpen(false);

    // Close on route change for mobile
    useEffect(() => {
        if (window.innerWidth < 768) closeSidebar();
    }, [location.pathname]);

    // Close when clicking outside or pressing Escape
    useEffect(() => {
        function handleClickOutside(e) {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        function handleEscape(e) {
            if (e.key === "Escape") setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    const handleLogoutClick = () => {
        if (typeof onLogout === "function") {
            onLogout();
            return;
        }
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Helper for nav links: close sidebar on mobile after clicking a link
    const handleNavClick = () => {
        if (window.innerWidth < 768) closeSidebar();
    };

    return (
        <>
            {/* Hamburger button - hidden when sidebar is open */}
            <button
                className={`menu-btn ${isOpen ? "hidden" : ""}`}
                onClick={toggleSidebar}
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                <HiMenuAlt3 className="hamburger-icon" />
            </button>

            {/* Overlay - visible only when sidebar is open */}
            {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

            {/* SidebarUser with conditional 'active' class */}
            <aside
                ref={sidebarRef}
                className={`sidebar ${isOpen ? "active" : ""}`}
                aria-hidden={!isOpen && window.innerWidth < 768}
            >
                <div className="sidebar-header">
                    <h2>Zastra</h2>
                    <button className="close-btn" onClick={closeSidebar} aria-label="Close menu">
                        ×
                    </button>
                </div>

                <nav>
                    <ul>
                        <li>
                            <Link to="/dashboard" onClick={handleNavClick}>
                                <img src={overviewIcon} alt="Overview" className="nav-icon" />
                                <span>Overview</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/new-report" onClick={handleNavClick}>
                                <img src={newReportIcon} alt="New Report" className="nav-icon" />
                                <span>New Report</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/user-report" onClick={handleNavClick}>
                                <img src={myReportIcon} alt="My Report" className="nav-icon" />
                                <span>My Report</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/my-inbox" onClick={handleNavClick}>
                                <img src={myInboxIcon} alt="My Inbox" className="nav-icon" />
                                <span>My Inbox</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/user-profile" onClick={handleNavClick}>
                                <img src={myProfileIcon} alt="My Profile" className="nav-icon" />
                                <span>My Profile</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="logout-container-user">
                    <button
                        onClick={handleLogoutClick}
                        className="logout-btn-user"
                        aria-label="Logout"
                    >
                        <img src={logoutIcon} alt="Logout" className="logout-icon" />
                        <span className="nav-label">Logout</span>
                    </button>
                </div>

            </aside>

        </>
    );
}

export default SidebarUser;


