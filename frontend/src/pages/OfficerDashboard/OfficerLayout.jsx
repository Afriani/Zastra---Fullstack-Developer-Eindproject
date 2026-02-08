// src/pages/OfficerDashboard/OfficerLayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";

import SidebarOfficer from "../../components/OfficerDashboard/SidebarOfficer.jsx";
import NotificationBell from "../../components/NotificationBell.jsx";
import "../../css/OFFICER DASHBOARD/officerlayout.css";

export default function OfficerLayout() {
    const navigate = useNavigate();

    // Header state that child pages can update via Outlet context
    const [headerTitle, setHeaderTitle] = useState("Officer Dashboard");
    const [headerSubtitle, setHeaderSubtitle] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || token === "null") {
            navigate("/login");
            return;
        }

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const reqInterceptor = axios.interceptors.request.use(
            (config) => {
                const t = localStorage.getItem("token");
                if (t && t !== "null") {
                    config.headers.Authorization = `Bearer ${t}`;
                } else {
                    delete config.headers.Authorization;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const resInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error?.response?.status === 401 || error?.response?.status === 403) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(reqInterceptor);
            axios.interceptors.response.eject(resInterceptor);
        };
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="dashboard app-with-sidebar">
            <SidebarOfficer onLogout={handleLogout} />

            <div className="main-content">
                <div className="notification-bell-container">
                    <NotificationBell />
                </div>

                <header className="dashboard-header">
                    <div>
                        <h1>{headerTitle}</h1>
                        {headerSubtitle && <div className="header-subtitle">{headerSubtitle}</div>}
                    </div>
                    <div className="header-actions-placeholder" aria-hidden />
                </header>

                <main className="officer-main-content">
                    <div className="officer-page-container">
                        {/* Pass setters to children */}
                        <Outlet context={{ setHeaderTitle, setHeaderSubtitle }} />
                    </div>
                </main>
            </div>
        </div>
    );
}


