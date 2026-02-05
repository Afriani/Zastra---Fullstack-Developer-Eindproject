// src/pages/AdministratorDashboard/AdminLayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";

import SidebarAdmin from "../../components/AdministratorDashboard/SidebarAdministrator.jsx";
import NotificationBell from "../../components/NotificationBell.jsx";
import "../../css/ADMIN DASHBOARD/adminlayout.css";

export default function AdminLayout() {
    const navigate = useNavigate();
    const [headerTitle, setHeaderTitle] = useState("Admin Dashboard");
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

    useEffect(() => {
        document.title = headerTitle ? `${headerTitle} — Admin` : "Admin Dashboard";
    }, [headerTitle]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="dashboard app-with-sidebar">

            <SidebarAdmin onLogout={handleLogout} />

            <div className="main-content">
                {/* Floating global controls (top-right) */}
                <div className="notification-bell-container">
                    <NotificationBell />
                </div>

                {/* Shared header stays visible but title is dynamic */}
                <header className="dashboard-header">
                    <div>
                        <h1>{headerTitle}</h1>
                        {headerSubtitle && <div className="header-subtitle">{headerSubtitle}</div>}
                    </div>
                    {/* Reserved place for header-level actions if needed */}
                    <div className="header-actions-placeholder" aria-hidden />
                </header>

                {/* Pages render here; we pass setters via Outlet context */}
                <main className="admin-main-content">
                    <div className="admin-page-container">
                        <Outlet context={{ setHeaderTitle, setHeaderSubtitle }} />
                    </div>
                </main>
            </div>
        </div>
    );
}



