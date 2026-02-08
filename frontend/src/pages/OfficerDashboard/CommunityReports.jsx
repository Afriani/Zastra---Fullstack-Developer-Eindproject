// src/pages/OfficerDashboard/CommunityReports.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "../../css/OFFICER DASHBOARD/communityreports.css";

// All Icons
import errorIcon from "../../assets/pictures/user-report-detail/warning.png";
import refreshIcon from "../../assets/pictures/assigned-report/refresh.png";
import clockIcon from "../../assets/pictures/officer-dashboard/created-at.png";
import announcementIcon from "../../assets/pictures/announcement.png";
import categoryIcon from "../../assets/pictures/officer-dashboard/category.png";
import locationIcon from "../../assets/pictures/user-report-detail/location.png";
import mailboxIcon from "../../assets/pictures/officer-dashboard/mailbox.png";

function CommunityReports() {
    const navigate = useNavigate();
    const [allReports, setAllReports] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [errorReports, setErrorReports] = useState(null);
    const [errorAnnouncements, setErrorAnnouncements] = useState(null);

    // State for filters
    const [reportFilter, setReportFilter] = useState("ALL");
    const [reportSearch, setReportSearch] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        fetchAllSubmittedReports(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportFilter, reportSearch, currentPage]);

    useEffect(() => {
        fetchAdminAnnouncements();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAllSubmittedReports = async (page = 0) => {
        setLoadingReports(true);
        setErrorReports(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            // Build query parameters - don't send status if it's "ALL"
            let url = `http://localhost:8080/api/reports/all-submitted?page=${page}&size=5`;

            // Only add status filter if it's not "ALL"
            if (reportFilter !== "ALL") {
                url += `&status=${reportFilter}`;
            }

            // Add search parameter if provided
            if (reportSearch.trim()) {
                url += `&search=${encodeURIComponent(reportSearch)}`;
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Check if response is paginated
            if (response.data.content) {
                setAllReports(response.data.content);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || 0);
                setCurrentPage(page);
            } else {
                // Fallback for non-paginated response - manually paginate
                const allData = response.data;
                const startIndex = page * 5;
                const endIndex = startIndex + 5;
                const paginatedData = allData.slice(startIndex, endIndex);

                setAllReports(paginatedData);
                setTotalPages(Math.ceil(allData.length / 5));
                setTotalElements(allData.length);
                setCurrentPage(page);
            }
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

    // Pagination handlers
    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageClick = (pageNum) => {
        setCurrentPage(pageNum);
    };

    // Reset to page 0 when filters change
    const handleFilterChange = (newFilter) => {
        setReportFilter(newFilter);
        setCurrentPage(0);
    };

    const handleSearchChange = (newSearch) => {
        setReportSearch(newSearch);
        setCurrentPage(0);
    };

    const handleRefreshAll = () => {
        fetchAllSubmittedReports(currentPage);
        fetchAdminAnnouncements();
    };

    if (loadingReports && loadingAnnouncements) {
        return (
            <div className="dashboard">
                <div className="main-content">
                    <div className="loading-spinner">Loading community data...</div>
                </div>
            </div>
        );
    }

    if (errorReports && errorAnnouncements) {
        return (
            <div className="dashboard">
                <div className="main-content">
                    <div className="error-message">
                        <h3>
                            <img src={errorIcon} alt="warning-icon" className="community-report-icons" />
                            Error loading page.
                        </h3>
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
                        <button onClick={handleRefreshAll} className="refresh-btn">
                            <img src={refreshIcon} alt="refresh-icon" className="community-report-icons" />
                            Refresh All
                        </button>
                    </div>
                </header>

                {/* Section 1: Admin Announcements */}
                <section className="announcements-section">
                    <h2>Admin Announcements</h2>
                    {loadingAnnouncements ? (
                        <p>Loading announcements...</p>
                    ) : announcements && announcements.length > 0 ? (
                        <div className="announcements-list">
                            {announcements.map((announcement) => (
                                <div key={announcement.id} className="announcement-item">
                                    <div className="announcement-header">
                                        <h3>{announcement.title}</h3>
                                        <span className="announcement-date">
                                            <img src={clockIcon} alt="created-at-icon" className="community-report-icons" />
                                            {formatDate(announcement.createdAt)}
                                        </span>
                                    </div>
                                    <p>{announcement.content}</p>

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
                            <div className="empty-icon">
                                <img src={announcementIcon} alt="announcement-icon" className="community-report-icons" />
                            </div>
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
                            <select
                                value={reportFilter}
                                onChange={(e) => handleFilterChange(e.target.value)}
                                className="filter-select"
                            >
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
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    {loadingReports ? (
                        <p>Loading reports...</p>
                    ) : allReports && allReports.length > 0 ? (
                        <>
                            <div className="reports-list">
                                {allReports.map((report) => (
                                    <div key={report.id} className="report-item">
                                        <div className="report-media">
                                            {report.imageUrls && report.imageUrls.length > 0 ? (
                                                <img src={report.imageUrls[0]} alt="thumb" className="report-thumb" />
                                            ) : report.videoUrl ? (
                                                <video src={report.videoUrl} className="report-thumb" muted />
                                            ) : (
                                                <div className="no-media">No media</div>
                                            )}
                                        </div>
                                        <div className="report-main">
                                            <div className="report-header-community">
                                                <h4>
                                                    #{report.id} - {report.title}
                                                </h4>
                                                <span className={`status-badge status-${report.status?.toLowerCase().replace(/_/g, "-")}`}>
                                                    {report.status?.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                            <p className="report-description">{report.description?.slice(0, 120)}...</p>
                                            <div className="report-meta">
                                                <span className="category">
                                                    <img src={categoryIcon} alt="category-icon" className="community-report-icons" />
                                                    {report.category}
                                                </span>
                                                <span className="date">
                                                    <img src={clockIcon} alt="created-at-icon" className="community-report-icons" />
                                                    {formatDate(report.createdAt)}
                                                </span>
                                                {report.address && (
                                                    <span className="location">
                                                        <img src={locationIcon} alt="address-icon" className="community-report-icons" />
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

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <>
                                    <div className="pagination">
                                        <button
                                            className="pagination-btn"
                                            onClick={handlePreviousPage}
                                            disabled={currentPage === 0}
                                            aria-label="Previous page"
                                        >
                                            ← Previous
                                        </button>

                                        <div className="pagination-info">
                                            <span>
                                                Page {currentPage + 1} of {totalPages}
                                            </span>
                                            <span className="pagination-total">
                                                ({totalElements} total reports)
                                            </span>
                                        </div>

                                        <button
                                            className="pagination-btn"
                                            onClick={handleNextPage}
                                            disabled={currentPage >= totalPages - 1}
                                            aria-label="Next page"
                                        >
                                            Next →
                                        </button>
                                    </div>

                                    {/* Page Numbers */}
                                    <div className="pagination-numbers">
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <button
                                                key={i}
                                                className={`page-number ${currentPage === i ? 'active' : ''}`}
                                                onClick={() => handlePageClick(i)}
                                                aria-label={`Go to page ${i + 1}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <img src={mailboxIcon} alt="mailbox-icon" className="community-report-icons" />
                            </div>
                            <h3>No Community Reports</h3>
                            <p>No reports match your current filters.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default CommunityReports;