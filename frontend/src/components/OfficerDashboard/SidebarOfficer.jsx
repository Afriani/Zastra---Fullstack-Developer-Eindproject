// src/components/OfficerDashboard/SidebarOfficer.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "../../css/OFFICER DASHBOARD/SidebarOfficer.css";

import { HiMenuAlt3 } from "react-icons/hi"; // or HiMenu, GiHamburgerMenu, etc.

// images for officer sidebar (place near other imports)
import overviewIcon from '../../assets/pictures/overview.png';
import newReportIcon from '../../assets/pictures/newreport.png';
import myReportIcon from '../../assets/pictures/myreport.png';
import myInboxIcon from '../../assets/pictures/myinbox.png';
import myProfileIcon from '../../assets/pictures/myprofile.png';
import logoutIcon from "../../assets/pictures/logout.png";

function SidebarOfficer({ onLogout }) {
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

            {/* Sidebar */}
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

                <nav className="sidebar-nav" aria-label="Officer navigation">
                    <ul>
                        <li>
                            <Link
                                to="/officer/dashboard"
                                className={`nav-item-final ${location.pathname === "/officer/dashboard" ? "active" : ""}`}
                                onClick={handleNavClick}
                            >
                                <img src={overviewIcon} alt="Dashboard" className="nav-icon-final" />
                                <span className="nav-label">Overview</span>
                            </Link>
                        </li>

                        <li>
                            <Link
                                to="/officer/reports"
                                className={`nav-item-final ${location.pathname === "/officer/reports" ? "active" : ""}`}
                                onClick={handleNavClick}
                            >
                                <img src={newReportIcon} alt="Assigned Reports" className="nav-icon-final" />
                                <span className="nav-label">Assigned Reports</span>
                            </Link>
                        </li>

                        <li>
                            <Link
                                to="/officer/inbox"
                                className={`nav-item-final ${location.pathname === "/officer/inbox" ? "active" : ""}`}
                                onClick={handleNavClick}
                            >
                                <img src={myInboxIcon} alt="My Inbox" className="nav-icon-final" />
                                <span className="nav-label">My Inbox</span>
                            </Link>
                        </li>

                        <li>
                            <Link
                                to="/officer/community"
                                className={`nav-item-final ${location.pathname === "/officer/community" ? "active" : ""}`}
                                onClick={handleNavClick}
                            >
                                <img src={myReportIcon} alt="Community Reports" className="nav-icon-final" />
                                <span className="nav-label">Community Reports</span>
                            </Link>
                        </li>

                        <li>
                            <Link
                                to="/officer/profile"
                                className={`nav-item-final ${location.pathname === "/officer/profile" ? "active" : ""}`}
                                onClick={handleNavClick}
                            >
                                <img src={myProfileIcon} alt="Profile" className="nav-icon-final" />
                                <span className="nav-label">Profile</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="logout-container-officer">
                    <button
                        onClick={handleLogoutClick}
                        className="logout-btn-officer"
                    >
                        <img src={logoutIcon} alt="Logout" className="logout-icon" />
                        <span className="nav-label">Logout</span>
                    </button>
                </div>

            </aside>
        </>
    );
}

export default SidebarOfficer;