// components/AdminDashboard/SidebarAdmin.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import "../../css/ADMIN DASHBOARD/sidebaradministrator.css";

import { HiMenuAlt3 } from "react-icons/hi"; // or HiMenu, GiHamburgerMenu, etc.

// Icons for admin sidebar
import overviewIcon from '../../assets/pictures/overview.png';
import myReportIcon from '../../assets/pictures/myreport.png';
import officerPerformanceIcon from '../../assets/pictures/officerperformance.png';
import announcementIcon from '../../assets/pictures/announcement.png';
import myInboxIcon from '../../assets/pictures/myinbox.png';
import myProfileIcon from '../../assets/pictures/myprofile.png';
import logoutIcon from "../../assets/pictures/logout.png";

function SidebarAdmin({ onLogout }) {

    const [open, setOpen] = useState(false);
    const sidebarRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        // Close on route change for mobile
        if (window.innerWidth < 768) setOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (open && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        function handleEscape(e) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open]);

    const toggle = () => setOpen(prev => !prev);
    const close = () => setOpen(false);

    const handleNavClick = () => {
        if (window.innerWidth < 768) close();
    };

    return (
        <>
            {/* Hamburger: hidden while sidebar is open to avoid blocking */}
            <button
                className={`sidebar-toggle-final ${open ? "hidden" : ""}`}
                onClick={toggle}
                aria-label={open ? "Close menu" : "Open menu"}
            >
                <HiMenuAlt3 className="hamburger-icon" />
            </button>

            {/* Overlay (renders only when open) */}
            {open && <div className="sidebar-overlay-final" onClick={close} />}

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={`sidebar-final ${open ? "open" : ""}`}
                aria-hidden={!open && window.innerWidth < 768}
            >
                <div className="sidebar-header-final">
                    <h2>Zastra</h2>
                </div>

                <nav className="sidebar-nav-final" aria-label="Admin navigation">
                    <Link
                        to="/admin/dashboard"
                        className={`nav-item-final ${location.pathname === "/admin/dashboard" ? "active" : ""}`}
                        onClick={handleNavClick}
                    >
                        <img src={overviewIcon} alt="Dashboard" className="nav-icon-final" />
                        <span>Overview</span>
                    </Link>

                    <Link
                        to="/admin/reports"
                        className={`nav-item-final ${location.pathname === "/admin/reports" ? "active" : ""}`}
                        onClick={handleNavClick}
                    >
                        <img src={myReportIcon} alt="Reports" className="nav-icon-final" />
                        <span>Reports</span>
                    </Link>

                    <Link
                        to="/admin/officerperformance"
                        className={`nav-item-final ${location.pathname === "/admin/officerperformance" ? "active" : ""}`}
                        onClick={handleNavClick}
                    >
                        <img src={officerPerformanceIcon} alt="Officer Performance" className="nav-icon-final" />
                        <span>Officer Performance</span>
                    </Link>

                    <Link
                        to="/admin/announcements"
                        className={`nav-item-final ${location.pathname === "/admin/announcements" ? "active" : ""}`}
                        onClick={handleNavClick}
                    >
                        <img src={announcementIcon} alt="Announcements" className="nav-icon-final" />
                        <span>Announcements</span>
                    </Link>

                    <Link
                        to="/admin/inbox"
                        className={`nav-item-final ${location.pathname === "/admin/inbox" ? "active" : ""}`}
                        onClick={handleNavClick}
                    >
                        <img src={myInboxIcon} alt="Inbox" className="nav-icon-final" />
                        <span>Inbox</span>
                    </Link>

                    <Link
                        to="/admin/profile"
                        className={`nav-item-final ${location.pathname === "/admin/profile" ? "active" : ""}`}
                        onClick={handleNavClick}
                    >
                        <img src={myProfileIcon} alt="Profile" className="nav-icon-final" />
                        <span>Profile</span>
                    </Link>
                </nav>

                {/* Logout inside sidebar, sits near bottom via sticky (no footer element) */}
                <div className="logout-container-administrator">
                    <button
                        className="logout-btn-final"
                        onClick={() => { onLogout?.(); handleNavClick(); }}
                    >
                        <img src={logoutIcon} alt="Logout" className="logout-icon" />
                        <span className="nav-label">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default SidebarAdmin;


