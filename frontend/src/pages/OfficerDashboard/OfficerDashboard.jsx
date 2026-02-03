// src/pages/OfficerDashboard/OfficerDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// All Stat Icons
import errorIcon from "../../assets/pictures/error.gif"
import refreshIcon from "../../assets/pictures/refresh.gif"
import submittedIcon from "../../assets/pictures/submitted.gif"
import inreviewIcon from "../../assets/pictures/inreview.gif"
import inprogressIcon from "../../assets/pictures/inprogress.gif"
import resolvedIcon from "../../assets/pictures/resolved.gif"
import cancelIcon from "../../assets/pictures/cancel.gif"
import rejectIcon from "../../assets/pictures/reject.gif"
import totalreportIcon from "../../assets/pictures/totalreport.gif"

// All Quick Action images
import reportview from "../../assets/pictures/reportview.png"
import communityfeed from "../../assets/pictures/communityfeed.png"
import profile from "../../assets/pictures/profile.png"

// All Report Items images
import address from "../../assets/pictures/user-report-detail/location.png"
import categories from "../../assets/pictures/officer-dashboard/category.png"
import created from "../../assets/pictures/officer-dashboard/created-at.png"
import mailbox from "../../assets/pictures/officer-dashboard/mailbox.png"

// All Recent Report images
import viewAll from "../../assets/pictures/officer-dashboard/view-all.png"

import "../../css/OFFICER DASHBOARD/officerdashboard.css";

export default function OfficerDashboard() {
    const navigate = useNavigate();
    const { setHeaderTitle, setHeaderSubtitle } = useOutletContext() || {};

    const [stats, setStats] = useState({
        totalAssignedReports: 0,
        pendingReports: 0,
        inReviewReports: 0,
        inProgressReports: 0,
        resolvedReports: 0,
        rejectedReports: 0,
        cancelledReports: 0,
        recentReports: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wsConnected, setWsConnected] = useState(false);
    const clientRef = useRef(null);

    useEffect(() => {
        if (setHeaderTitle) setHeaderTitle("Officer Dashboard");
        if (setHeaderSubtitle) setHeaderSubtitle("Welcome back! Here's your overview for today.");

        fetchDashboardData();
        setupWebSocket();

        return () => {
            cleanupWebSocket();
        };
    }, []);

    const setupWebSocket = () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const socket = new SockJS("http://localhost:8080/ws-notifications");
            const client = new Client({
                webSocketFactory: () => socket,
                connectHeaders: { Authorization: `Bearer ${token}` },
                onConnect: () => {
                    console.log("STOMP connected");
                    setWsConnected(true);
                    client.subscribe("/user/queue/inbox", (message) => {
                        try {
                            const payload = JSON.parse(message.body);
                            console.log("Inbox notification:", payload);
                            fetchDashboardData();
                        } catch (e) {
                            console.error("Failed to parse STOMP message", e);
                        }
                    });
                },
                onDisconnect: () => setWsConnected(false),
                onStompError: () => setWsConnected(false),
                onWebSocketClose: () => setWsConnected(false),
                onWebSocketError: () => setWsConnected(false),
            });

            clientRef.current = client;
            client.activate();
        } catch (err) {
            console.error("Failed to initialize STOMP client", err);
        }
    };

    const cleanupWebSocket = () => {
        const client = clientRef.current;
        if (client?.active) client.deactivate();
        clientRef.current = null;
        setWsConnected(false);
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) return navigate("/login");

            const res = await axios.get("http://localhost:8080/api/reports/officer/dashboard", {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStats(res.data);
        } catch (err) {
            console.error("Failed to load dashboard data:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem("token");
                navigate("/login");
            } else {
                setError("Failed to load dashboard data");
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

    const getStatusColor = (status) => {
        switch (status) {
            case "SUBMITTED": return "#ffc107";
            case "IN_REVIEW": return "#17a2b8";
            case "IN_PROGRESS": return "#007bff";
            case "RESOLVED": return "#28a745";
            case "REJECTED": return "#dc3545";
            case "CANCELLED": return "#9b9b9b";
            default: return "#6c757d";
        }
    };

    if (loading) {
        return (
            <div className="dashboard-page-loading">
                <div className="loading-spinner">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page-error">
                <div className="error-message">
                    <h3>
                        <img src={errorIcon} alt="error-icon" className="dashboard-icon" />
                        {error}
                    </h3>
                    <button onClick={() => navigate("/login")} className="btn-primary">
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="officer-dashboard-page">

            <header className="officer-dashboard-header">
                <div className="header-content">
                    <h1>Overview</h1>
                    <p>Welcome back! Here's your overview for today.</p>
                </div>
                <button onClick={fetchDashboardData} className="refresh-btn">
                    <img src={refreshIcon} alt="refresh-icon" className="dashboard-icons" />
                    Refresh
                </button>
            </header>

            {/* WebSocket Status Indicator */}
            <div className="page-header-actions">
                <div className="ws-status" title={wsConnected ? "Connected" : "Disconnected"}>
                    <span className={`dot ${wsConnected ? "online" : "offline"}`} />
                    <small>{wsConnected ? "Connected" : "Disconnected"}</small>
                </div>
            </div>

            {/* Stats Overview */}
            <section className="stats-section">
                <div className="stats-grid">
                    <StatCard
                        label="SUBMITTED"
                        gif={submittedIcon}
                        count={stats.pendingReports}
                        onClick={() => navigate("/officer/reports?status=SUBMITTED")}
                    />

                    <StatCard
                        label="IN REVIEW"
                        count={stats.inReviewReports}
                        gif={inreviewIcon}
                        onClick={() => navigate("/officer/reports?status=IN_REVIEW")}
                    />

                    <StatCard
                        label="IN PROGRESS"
                        count={stats.inProgressReports}
                        gif={inprogressIcon}
                        onClick={() => navigate("/officer/reports?status=IN_PROGRESS")}
                    />

                    <StatCard
                        label="RESOLVED"
                        count={stats.resolvedReports}
                        gif={resolvedIcon}
                        onClick={() => navigate("/officer/reports?status=RESOLVED")}
                    />

                    <StatCard
                        label="REJECTED"
                        count={stats.rejectedReports}
                        gif={rejectIcon}
                        onClick={() => navigate("/officer/reports?status=REJECTED")}
                    />

                    <StatCard
                        label="CANCELLED"
                        count={stats.cancelledReports}
                        gif={cancelIcon}
                        onClick={() => navigate("/officer/reports?status=CANCELLED")}
                    />

                    <StatCard
                        label="Total Assigned Reports"
                        count={stats.totalAssignedReports}
                        gif={totalreportIcon}
                        onClick={() => navigate("/officer/reports")}
                    />

                </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    <ActionCard
                        gif={reportview}
                        title="View All Reports"
                        desc="Manage your assigned reports"
                        to="/officer/reports"
                    />

                    <ActionCard
                        gif={communityfeed}
                        title="Community Feed"
                        desc="Browse public reports"
                        to="/officer/community"
                    />

                    <ActionCard
                        gif={profile}
                        title="My Profile"
                        desc="Update your information"
                        to="/officer/profile"
                    />

                </div>
            </section>

            {/* Recent Reports */}
            <section className="recent-reports">
                <div className="section-header">
                    <h2>Recent Assigned Reports</h2>
                    <Link to="/officer/reports" className="view-all-btn">
                        View All
                        <img src={viewAll} alt="view-all-icon" className="recent-report" />

                    </Link>
                </div>
                <div className="reports-container">
                    {stats.recentReports?.length > 0 ? (
                        <div className="reports-list">
                            {stats.recentReports.map((r) => (
                                <ReportItem key={r.id} report={r} formatDate={formatDate} getStatusColor={getStatusColor} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </section>
        </div>
    );
}

// Reusable Stat Card
function StatCard({ label, count, gif, onClick }) {
    return (
        <div className="stat-card" role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === "Enter" && onClick()}>
            <div className="stat-top-row">
                <div className="stat-icon">
                    <img src={gif} alt={label} className="stat-gif" />
                </div>
                <h3 className="stat-number">{count}</h3>
            </div>
            <p className="stat-label">{label}</p>
        </div>
    );
}

// Reusable Action Card
function ActionCard({ gif, title, desc, to }) {
    return (
        <Link to={to} className="action-card">
            <div className="action-icon">
                <img src={gif} alt="action-gif" className="quick-actions-gif"/>
            </div>
            <h4>{title}</h4>
            <p>{desc}</p>
        </Link>
    );
}

const getReportImage = (report) => {
    if (!report) return null;

    const candidates = [
        'imageUrl', 'firstImageUrl', 'thumbnail', 'coverImage',
        'photoUrl', 'image', 'thumbnailUrl', 'picture',
        'images', 'photos', 'attachments', 'media', 'imageUrls',
        'photosUrls', 'pictureUrls'
    ];

    const tryValue = (val) => {
        if (!val) return null;
        if (typeof val === 'string' && val.trim() !== '') return val;
        if (Array.isArray(val) && val.length > 0) {
            const first = val[0];
            if (typeof first === 'string' && first.trim() !== '') return first;
            if (first && typeof first === 'object') {
                return first.url || first.path || first.src || first.name || null;
            }
            return null;
        }
        if (typeof val === 'object') {
            return val.url || val.path || val.src || val[0] || null;
        }
        return null;
    };

    for (const k of candidates) {
        const v = report[k];
        const found = tryValue(v);
        if (found) return found;
    }

    if (report.data && typeof report.data === 'object') {
        for (const k of ['image', 'imageUrl', 'cover', 'photos']) {
            const f = tryValue(report.data[k]);
            if (f) return f;
        }
    }

    if (Array.isArray(report.attachments) && report.attachments.length) {
        const a = report.attachments[0];
        if (a) {
            const fallback = a.url || a.fileUrl || a.path || (a.meta && (a.meta.url || a.meta.path));
            if (fallback) return fallback;
        }
    }

    if (report.id) {
        return `/api/reports/${report.id}/image`;
    }

    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140"><rect width="100%" height="100%" fill="%23e9eef6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23707788">No image</text></svg>';
};

// Report Item
function ReportItem({ report, formatDate }) {
    const imgUrl = getReportImage(report);

    return (
        <div className="report-item">
            {/* Thumbnail on the left */}
            <div className="report-thumb">
                <img
                    src={imgUrl}
                    alt={report.title || "Report image"}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140"><rect width="100%" height="100%" fill="%23e9eef6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23707788">No image</text></svg>';
                    }}
                />
            </div>

            {/* Main content on the right */}
            <div className="report-main">
                <div className="report-header-officer-dashboard">
                    <h4>#{report.id} - {report.title}</h4>
                    <span className={`status-badge status-${report.status.toLowerCase().replace(/_/g, "-")}`}>
                        {report.status.replace(/_/g, " ")}
                    </span>
                </div>
                <p className="report-description">{report.description?.slice(0, 120)}...</p>
                <div className="report-meta">
                    <span className="category">
                        <img src={categories} alt="categories-icon" className="report-items" />
                        {report.category}
                    </span>
                    <span className="date">
                        <img src={created} alt="created-at-icon" className="report-items" />
                        {formatDate(report.createdAt)}
                    </span>
                    {report.address && (
                        <span className="location">
                            <img src={address} alt="address-icon" className="report-items" />
                            {report.address.city}, {report.address.province}
                        </span>
                    )}
                </div>
            </div>

            {/* Action button */}
            <div className="report-actions">
                <Link to={`/officer/reports/${report.id}`} className="btn-view">
                    View Details
                </Link>
            </div>
        </div>
    );
}

// Empty State
function EmptyState() {
    return (
        <div className="empty-state">
            <div className="empty-icon">
                <img src={mailbox} alt="mailbox-icon" className="report-items" />
            </div>
            <h3>No Recent Reports</h3>
            <p>You don't have any assigned reports yet.</p>
        </div>
    );
}


