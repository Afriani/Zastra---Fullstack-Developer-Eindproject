// src/pages/OfficerDashboard/CommunityReports.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "../../css/OFFICER DASHBOARD/communityreports.css"; // New CSS file

function CommunityReports() {
    const navigate = useNavigate();
    const [allReports, setAllReports] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [errorReports, setErrorReports] = useState(null);
    const [errorAnnouncements, setErrorAnnouncements] = useState(null);

    // State for filters (e.g., category, status, search)
    const [reportFilter, setReportFilter] = useState("ALL");
    const [reportSearch, setReportSearch] = useState("");

    useEffect(() => {
        fetchAllSubmittedReports();
        fetchAdminAnnouncements();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportFilter, reportSearch]); // Re-fetch reports when filters change

    const fetchAllSubmittedReports = async () => {
        setLoadingReports(true);
        setErrorReports(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            // Backend endpoint for ALL submitted reports (potentially with filters)
            const response = await axios.get(
                `http://localhost:8080/api/reports/all-submitted?status=${reportFilter}&search=${reportSearch}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAllReports(response.data);
        } catch (err) {
            console.error("Failed to load all submitted reports:", err);
            setErrorReports("Failed to load community reports.");
        } finally {
            setLoadingReports(false);
        }
    };

    const fetchAdminAnnouncements = async () => {
        setLoadingAnnouncements(true);
        setErrorAnnouncements(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            // Backend endpoint for admin announcements
            const response = await axios.get(
                "http://localhost:8080/api/announcements",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAnnouncements(response.data);
        } catch (err) {
            console.error("Failed to load announcements:", err);
            setErrorAnnouncements("Failed to load announcements.");
        } finally {
            setLoadingAnnouncements(false);
        }
    };

    // ✅ NEW: Mark announcement as read
    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            await axios.post(
                `http://localhost:8080/api/announcements/${id}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Reload announcements to update read status
            fetchAdminAnnouncements();
        } catch (error) {
            console.error("Error marking announcement as read:", error);
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
            default: return "#6c757d";
        }
    };

    // Render loading/error states for the whole page or per section
    if (loadingReports || loadingAnnouncements) {
        return (
            <div className="dashboard">

                <div className="main-content">
                    <div className="loading-spinner">Loading community data...</div>
                </div>
            </div>
        );
    }

    if (errorReports || errorAnnouncements) {
        return (
            <div className="dashboard">

                <div className="main-content">
                    <div className="error-message">
                        <h3>⚠️ Error loading page.</h3>
                        <p>{errorReports || errorAnnouncements}</p>
                        <button onClick={() => navigate("/login")} className="btn-primary">
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">

            <div className="main-content">
                <header className="page-header">
                    <div className="header-content">
                        <h1>Community Reports & Announcements</h1>
                        <p>View all submitted reports and official updates.</p>
                    </div>
                    <div className="header-actions">
                        <button onClick={() => { fetchAllSubmittedReports(); fetchAdminAnnouncements(); }} className="refresh-btn">
                            🔄 Refresh All
                        </button>
                    </div>
                </header>

                {/* Section 1: Admin Announcements */}
                <section className="announcements-section">
                    <h2>Admin Announcements</h2>
                    {announcements && announcements.length > 0 ? (
                        <div className="announcements-list">
                            {announcements.map((announcement) => (
                                <div key={announcement.id} className="announcement-item">
                                    <div className="announcement-header">
                                        <h3>{announcement.title}</h3>
                                        <span className="announcement-date">
                                            🕒 {formatDate(announcement.createdAt)}
                                        </span>
                                    </div>
                                    <p>{announcement.content}</p>

                                    {/* ✅ NEW: Mark as Read functionality */}
                                    <div className="announcement-actions">
                                        {announcement.read ? (
                                            <span className="read-indicator">✓ Read</span>
                                        ) : (
                                            <button
                                                className="btn-mark-read"
                                                onClick={() => markAsRead(announcement.id)}
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📢</div>
                            <h3>No New Announcements</h3>
                            <p>No new announcements from the administration.</p>
                        </div>
                    )}
                </section>

                {/* Section 2: All Submitted Reports */}
                <section className="community-reports-section">
                    <div className="section-header">
                        <h2>All Submitted Reports</h2>
                        <div className="report-filters">
                            <select value={reportFilter} onChange={(e) => setReportFilter(e.target.value)} className="filter-select">
                                <option value="ALL">All Status</option>
                                <option value="SUBMITTED">Submitted</option>
                                <option value="IN_REVIEW">In Review</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={reportSearch}
                                onChange={(e) => setReportSearch(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    {allReports && allReports.length > 0 ? (
                        <div className="reports-list">
                            {allReports.map((report) => (
                                <div key={report.id} className="report-item">
                                    {/* Media preview (similar to AssignedReports) */}
                                    <div className="report-media">
                                        {report.imageUrls && report.imageUrls.length > 0 ? (
                                            <img src={report.imageUrls[0]} alt="thumb" className="report-thumb" />
                                        ) : report.videoUrl ? (
                                            <video src={report.videoUrl} className="report-thumb" muted />
                                        ) : (
                                            <div className="no-media">No media</div>
                                        )}
                                    </div>
                                    {/* Report details */}
                                    <div className="report-main">
                                        <div className="report-header-community">
                                            <h4>
                                                #{report.id} - {report.title}
                                            </h4>
                                            <span
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(report.status) }}
                                            >
                                                {report.status?.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                        <p className="report-description">{report.description?.slice(0, 120)}...</p>
                                        <div className="report-meta">
                                            <span className="category">📂 {report.category}</span>
                                            <span className="date">🕒 {formatDate(report.createdAt)}</span>
                                            {report.address && (
                                                <span className="location">
                                                    📍 {report.address.city}, {report.address.province}
                                                </span>
                                            )}
                                        </div>
                                        <div className="report-actions">
                                            <Link to={`/officer/reports/${report.id}`} className="btn-view">
                                                View Details
                                            </Link>
                                            {/* Optional: "Assign Myself" button for unassigned reports */}
                                            {/* {!report.officerName && (
                                                <button onClick={() => handleAssignReport(report.id)} className="btn-assign">
                                                    Assign Myself
                                                </button>
                                            )} */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <h3>No Community Reports</h3>
                            <p>No reports have been submitted by citizens yet.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default CommunityReports;