// src/pages/OfficerDashboard/AssignedReports.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import "../../css/OFFICER DASHBOARD/assignedreports.css";

const API_BASE = "http://localhost:8080/api/reports/officer";

// All Assigned Report Images
import errors from "../../assets/pictures/user-report-detail/warning.png"
import refresh from "../../assets/pictures/assigned-report/refresh.png"
import category from "../../assets/pictures/officer-dashboard/category.png"
import created from "../../assets/pictures/officer-dashboard/created-at.png"
import address from "../../assets/pictures/user-report-detail/location.png"
import mailbox from "../../assets/pictures/officer-dashboard/mailbox.png"

// normalize/validate incoming status query param to backend enum names
const normalizeStatusParam = (raw) => {
    if (!raw) return null;
    const s = raw.trim().replace(/-/g, "_").replace(/\s+/g, "_").toUpperCase();
    // map common alternatives
    if (s === "CANCELLED") return "CANCELLED"; // adjust if backend uses CANCELLED instead
    if (s === "INREVIEW") return "IN_REVIEW";
    if (s === "INPROGRESS") return "IN_PROGRESS";
    return s;
};

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function AssignedReports() {
    const navigate = useNavigate();
    const _location = useLocation();
    const query = useQuery();

    const rawStatus = query.get("status");
    const status = normalizeStatusParam(rawStatus);

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); // used to trigger manual refresh

    const fetchAssignedReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const url =
                status && status !== "ALL"
                    ? `${API_BASE}/assigned-reports?status=${encodeURIComponent(status)}`
                    : `${API_BASE}/assigned-reports`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setReports(response.data || []);
        } catch (err) {
            console.error("Failed to load assigned reports:", err);
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            } else if (err.response?.status === 403) {
                setError("Access denied. Officer privileges required.");
            } else {
                setError("Failed to load assigned reports");
            }
        } finally {
            setLoading(false);
        }
    }, [status, navigate, refreshKey]);

    useEffect(() => {
        fetchAssignedReports();
    }, [fetchAssignedReports]);

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const handleFilterChange = (e) => {
        const v = e.target.value;
        if (!v || v === "ALL") {
            navigate("/officer/reports");
        } else {
            navigate(`/officer/reports?status=${encodeURIComponent(v)}`);
        }
    };

    const friendlyLabel = (s) => {
        if (!s || s === "ALL") return "All Assigned Reports";
        return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    };

    if (loading) {
        return (
            <div className="dashboard">
                <div className="main-content">
                    <div className="loading-spinner">Loading assigned reports...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <div className="main-content">
                    <div className="error-message">
                        <h3>
                            <img src={errors} alt="error-icon" className="assigned-report" />
                            {error}
                        </h3>
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
                {/* Header */}
                <header className="page-header">
                    <div className="header-content">
                        <h1>{friendlyLabel(status)}</h1>
                        <p>Manage reports assigned to you</p>
                    </div>

                    <div className="header-actions">
                        <select
                            value={rawStatus ?? "ALL"}
                            onChange={handleFilterChange}
                            className="filter-select"
                            aria-label="Filter reports by status"
                        >
                            <option value="ALL">All Status</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="CANCELLED">Canceled</option>
                        </select>

                        <button
                            onClick={() => setRefreshKey((k) => k + 1)}
                            className="refresh-btn"
                            aria-label="Refresh reports"
                        >
                            <img src={refresh} alt="refresh-icon" className="assigned-report" />
                            Refresh
                        </button>
                    </div>
                </header>

                {/* Reports List */}
                <section className="reports-section">
                    {reports && reports.length > 0 ? (
                        <div className="reports-list">
                            {reports.map((report) => (
                                <div key={report.id} className="report-item">
                                    {/* LEFT SIDE: Media preview */}
                                    <div className="report-media">
                                        {report.imageUrls && report.imageUrls.length > 0 ? (
                                            <img src={report.imageUrls[0]} alt="thumb" className="report-thumb" />
                                        ) : report.videoUrl ? (
                                            <video src={report.videoUrl} className="report-thumb" muted />
                                        ) : (
                                            <div className="no-media">No media</div>
                                        )}
                                    </div>

                                    {/* RIGHT SIDE: Report details */}
                                    <div className="report-main">
                                        <div className="report-header-assigned">
                                            <h4>
                                                #{report.id} - {report.title}
                                            </h4>
                                            <span
                                                className={`status-badge status-${report.status?.toLowerCase().replace(/_/g, "-")}`}
                                            >
                                                {report.status?.replace(/_/g, " ")}
                                            </span>
                                        </div>

                                        <p className="report-description">{report.description?.slice(0, 120)}...</p>

                                        <div className="report-meta">
                                            <span className="category">
                                                <img src={category} alt="category-icon" className="assigned-report" />
                                                {report.category}
                                            </span>
                                            <span className="date">
                                                <img src={created} alt="created-at-icon" className="assigned-report" />
                                                {formatDate(report.createdAt)}
                                            </span>
                                            {report.address && (
                                                <span className="location">
                                                    <img src={address} alt="address-icon" className="assigned-report" />
                                                    {report.address.city}, {report.address.province}
                                                </span>
                                            )}
                                        </div>

                                        <div className="report-actions">
                                            <Link to={`/officer/reports/${report.id}`} className="btn-view">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <img src={mailbox} alt="mailbox-icon" className="assigned-report" />
                            </div>
                            <h3>No Assigned Reports</h3>
                            <p>You don't have any reports assigned to you yet.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default AssignedReports;


