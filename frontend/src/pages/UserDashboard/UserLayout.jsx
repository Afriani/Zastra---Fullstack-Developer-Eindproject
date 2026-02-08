import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarUser from "../../components/UserDashboard/SidebarUser.jsx";
import NotificationBell from "../../components/NotificationBell.jsx";
import "../../css/USER DASHBOARD/userlayout.css";

const UserLayout = () => {
    const [headerTitle, setHeaderTitle] = useState("User Dashboard");
    const [headerSubtitle, setHeaderSubtitle] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        // Setup axios interceptor for 401/403 errors
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [navigate]);

    return (
        <div className="user-layout">
            <SidebarUser />

            <div className="user-main-content">
                <div className="notification-bell-container">
                    <NotificationBell />
                </div>

                <div className="user-header">
                    <h1>{headerTitle}</h1>
                    {headerSubtitle && <p>{headerSubtitle}</p>}
                </div>

                <Outlet context={{ setHeaderTitle, setHeaderSubtitle }} />
            </div>
        </div>
    );
};

export default UserLayout;