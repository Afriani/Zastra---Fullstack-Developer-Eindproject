import React, { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";

import "../../css/USER DASHBOARD/userdashboard.css";

// Import gifs
import submittedGif from "../../assets/pictures/submitted.gif";
import inReviewGif from "../../assets/pictures/inreview.gif";
import inProgressGif from "../../assets/pictures/inprogress.gif";
import resolvedGif from "../../assets/pictures/resolved.gif";
import rejectedGif from "../../assets/pictures/reject.gif";
import cancelledGif from "../../assets/pictures/cancel.gif";
import totalGif from "../../assets/pictures/totalreport.gif";
import loudspeaker from "../../assets/pictures/officer-dashboard/loudspeaker.png";
import recentActivity from "../../assets/pictures/email-service/report-status-update.png"
import communityReport from "../../assets/pictures/overview.png"

function UsersDashboard() {
    const { setHeaderTitle, setHeaderSubtitle } = useOutletContext();
    const [stats, setStats] = useState({
        totalReports: 0,
        pendingReports: 0,
        inReviewReports: 0,
        inProgressReports: 0,
        resolvedReports: 0,
        rejectedReports: 0,
        cancelledReports: 0,
        recentReports: []
    });
    const [publicReports, setPublicReports] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingPublic, setLoadingPublic] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            setLoadingPublic(false);
            return;
        }
        const headers = { Authorization: `Bearer ${token}` };

        const fetchProfile = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/users/me", { headers });

                // Set header title and subtitle based on profile
                setHeaderTitle(`Welcome back, ${res.data.firstName || "User"}!`);
                setHeaderSubtitle(`Your last login was ${formatRelativeTime(res.data.lastLogin)}`);
            } catch (err) {
                console.error("Failed to load profile:", err);
            }
        };

        const fetchDashboardStats = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/reports/my/stats", { headers });
                setStats(
                    res.data || {
                        totalReports: 0,
                        pendingReports: 0,
                        inReviewReports: 0,
                        inProgressReports: 0,
                        resolvedReports: 0,
                        rejectedReports: 0,
                        cancelledReports: 0,
                        recentReports: []
                    }
                );
            } catch (err) {
                console.error("Failed to load dashboard stats:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchPublicReports = async (page = 0) => {
            setLoadingPublic(true);
            try {
                const res = await axios.get(
                    `http://localhost:8080/api/reports/public?page=${page}&size=5`,
                    { headers }
                );
                setPublicReports(res.data.content || []);
                setTotalPages(res.data.totalPages || 0);
                setTotalElements(res.data.totalElements || 0);
                setCurrentPage(page);
                console.log("publicReports page", page, ":", res.data);
            } catch (err) {
                console.error("Failed to load public reports:", err);
            } finally {
                setLoadingPublic(false);
            }
        };

        const fetchAnnouncements = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:8080/api/announcements/public",
                    { headers }
                );
                setAnnouncements(res.data || []);
            } catch (err) {
                console.error("Failed to load announcements:", err);
                setAnnouncements([]);
            } finally {
                setLoadingAnnouncements(false);
            }
        };

        // Initial fetch
        fetchProfile();
        fetchDashboardStats();
        fetchPublicReports(currentPage);
        fetchAnnouncements();

        // Auto-refresh public reports every 30 seconds
        const intervalId = setInterval(() => {
            fetchPublicReports(currentPage);
            fetchDashboardStats(); // Also refresh stats to show new reports count
        }, 30000); // 30000ms = 30 seconds

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [setHeaderTitle, setHeaderSubtitle, currentPage]);

    const formatRelativeTime = (timestamp) => {
        if (!timestamp) return "Never";

        let date = null;

        if (typeof timestamp === "object") {
            const year = timestamp.year ?? timestamp.y ?? null;
            const month = (timestamp.monthValue ?? timestamp.month ?? 1) - 1;
            const day = timestamp.dayOfMonth ?? timestamp.day ?? 1;
            const hour = timestamp.hour ?? 0;
            const minute = timestamp.minute ?? 0;
            const second = timestamp.second ?? 0;
            const ms = Math.floor((timestamp.nano ?? 0) / 1e6);
            if (year) {
                const d = new Date(year, month, day, hour, minute, second, ms);
                if (!isNaN(d.getTime())) date = d;
            }
        }

        if (!date && typeof timestamp === "number") {
            const d = new Date(timestamp);
            if (!isNaN(d.getTime())) date = d;
        }

        if (!date && typeof timestamp === "string") {
            let s = timestamp.trim();
            if (/^\d{4}-\d{2}-\d{2} \d{2}:/.test(s)) {
                s = s.replace(" ", "T");
            }
            const d = new Date(s);
            if (!isNaN(d.getTime())) date = d;

            if (!date && !s.endsWith("Z") && !s.includes("+") && !s.includes("-")) {
                const maybeUtc = s + "Z";
                const d2 = new Date(maybeUtc);
                if (!isNaN(d2.getTime())) date = d2;
            }
        }

        if (!date) return "Never";

        const then = date.getTime();
        const now = Date.now();
        const diffSec = Math.floor((now - then) / 1000);
        const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

        if (diffSec < 60) return rtf.format(-diffSec, "second");
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return rtf.format(-diffMin, "minute");
        const diffHours = Math.floor(diffMin / 60);
        if (diffHours < 24) return rtf.format(-diffHours, "hour");
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 30) return rtf.format(-diffDays, "day");
        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths < 12) return rtf.format(-diffMonths, "month");
        const diffYears = Math.floor(diffDays / 365);
        return rtf.format(-diffYears, "year");
    };

    const formatStatus = (status) => {
        return status
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const goToReportDetail = (id) => navigate(`/user-report/${id}`);

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

    // Helper to choose an image URL for a report (tries several common fields)
    const getReportImage = (report) => {
        if (!report) return null;

        const candidates = [
            "imageUrl",
            "firstImageUrl",
            "thumbnail",
            "coverImage",
            "photoUrl",
            "image",
            "thumbnailUrl",
            "picture",
            "images",
            "photos",
            "attachments",
            "media",
            "imageUrls",
            "photosUrls",
            "pictureUrls"
        ];

        const tryValue = (val) => {
            if (!val) return null;
            if (typeof val === "string" && val.trim() !== "") return val;
            if (Array.isArray(val) && val.length > 0) {
                const first = val[0];
                if (typeof first === "string" && first.trim() !== "") return first;
                if (first && typeof first === "object") {
                    return first.url || first.path || first.src || first.name || null;
                }
                return null;
            }
            if (typeof val === "object") {
                return val.url || val.path || val.src || val[0] || null;
            }
            return null;
        };

        for (const k of candidates) {
            const v = report[k];
            const found = tryValue(v);
            if (found) return found;
        }

        if (report.data && typeof report.data === "object") {
            for (const k of ["image", "imageUrl", "cover", "photos"]) {
                const f = tryValue(report.data[k]);
                if (f) return f;
            }
        }

        if (Array.isArray(report.attachments) && report.attachments.length) {
            const a = report.attachments[0];
            if (a) {
                const fallback =
                    a.url ||
                    a.fileUrl ||
                    a.path ||
                    (a.meta && (a.meta.url || a.meta.path));
                if (fallback) return fallback;
            }
        }

        if (report.id) {
            return `/api/reports/${report.id}/image`;
        }

        // Let CSS handle the visual "no image" placeholder
        return "";
    };

    const handleImageError = (e) => {
        e.target.classList.add("no-image");
    };

    return (
        <div className="content-inner">
            <section className="panel">
                <Link to="/user-report?filter=pending" className="card-link">
                    <div
                        className="card pending clickable"
                        role="button"
                        tabIndex={0}
                        aria-label="Pending Issues"
                    >
                        <img
                            src={submittedGif}
                            alt="Submitted"
                            className="card-gif"
                        />
                        <h4>SUBMITTED</h4>
                        <p>{loading ? "..." : stats.pendingReports}</p>
                    </div>
                </Link>

                <Link to="/user-report?filter=in-review" className="card-link">
                    <div
                        className="card in-review clickable"
                        role="button"
                        tabIndex={0}
                        aria-label="In Review"
                    >
                        <img
                            src={inReviewGif}
                            alt="In Review"
                            className="card-gif"
                        />
                        <h4>IN REVIEW</h4>
                        <p>{loading ? "..." : stats.inReviewReports}</p>
                    </div>
                </Link>

                <Link to="/user-report?filter=in-progress" className="card-link">
                    <div
                        className="card in-progress clickable"
                        role="button"
                        tabIndex={0}
                        aria-label="In Progress"
                    >
                        <img
                            src={inProgressGif}
                            alt="In Progress"
                            className="card-gif"
                        />
                        <h4>IN PROGRESS</h4>
                        <p>{loading ? "..." : stats.inProgressReports}</p>
                    </div>
                </Link>

                <Link to="/user-report?filter=resolved" className="card-link">
                    <div
                        className="card resolved clickable"
                        role="button"
                        tabIndex={0}
                        aria-label="Resolved"
                    >
                        <img
                            src={resolvedGif}
                            alt="Resolved"
                            className="card-gif"
                        />
                        <h4>RESOLVED</h4>
                        <p>{loading ? "..." : stats.resolvedReports}</p>
                    </div>
                </Link>

                <Link to="/user-report?filter=rejected" className="card-link">
                    <div
                        className="card rejected clickable"
                        role="button"
                        tabIndex={0}
                        aria-label="Rejected"
                    >
                        <img
                            src={rejectedGif}
                            alt="Rejected"
                            className="card-gif"
                        />
                        <h4>REJECTED</h4>
                        <p>{loading ? "..." : stats.rejectedReports}</p>
                    </div>
                </Link>

                <Link to="/user-report?filter=rejected" className="card-link">
                    <div
                        className="card cancelled clickable"
                        role="button"
                        tabIndex={0}
                        aria-label="Cancelled"
                    >
                        <img
                            src={cancelledGif}
                            alt="Cancelled"
                            className="card-gif"
                        />
                        <h4>CANCELLED</h4>
                        <p>{loading ? "..." : stats.cancelledReports}</p>
                    </div>
                </Link>

                <Link to="/user-report" className="card-link">
                    <div
                        className="card total clickable"
                        role="button"
                        tabIndex={0}
                        aria-label="Total Reports"
                    >
                        <img
                            src={totalGif}
                            alt="Total Reports"
                            className="card-gif"
                        />
                        <h4>Total Reports</h4>
                        <p>{loading ? "..." : stats.totalReports}</p>
                    </div>
                </Link>
            </section>

            <section className="announcements">
                <h4>
                    <img
                        src={loudspeaker}
                        alt="announcement"
                        className="announcement"
                    />
                    Announcements
                </h4>
                {loadingAnnouncements ? (
                    <p>Loading announcements...</p>
                ) : announcements.length > 0 ? (
                    <ul className="announcement-list">
                        {announcements.map((a) => (
                            <li key={a.id} className="announcement-item">
                                <h5>{a.title}</h5>
                                <p>{a.content || a.message}</p>
                                <span className="announcement-meta">
                                    By{" "}
                                    {a.createdByName ||
                                        a.authorName ||
                                        "Administrator"}{" "}
                                    •{" "}
                                    {a.createdAt
                                        ? formatRelativeTime(a.createdAt)
                                        : ""}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No announcements at this time</p>
                )}
            </section>

            <section className="updates">
                <h4>
                    <img
                        src={recentActivity}
                        alt="recent-activity"
                        className="announcement"
                    />
                    Recent Activity
                </h4>
                <ul>
                    {loading ? (
                        <li>Loading recent activity...</li>
                    ) : (stats.recentReports?.length || 0) > 0 ? (
                        stats.recentReports.map((report) => (
                            <li key={report.id}>
                                <span className="recent-desc">
                                    {report.status === "SUBMITTED" && (
                                        <>
                                            You submitted a new report:{" "}
                                            <strong>{report.title}</strong>
                                        </>
                                    )}
                                    {report.status === "IN_REVIEW" && (
                                        <>
                                            Report <strong>#{report.id}</strong> - "
                                            {report.title}" is now{" "}
                                            <em>
                                                {formatStatus(report.status)}
                                            </em>
                                        </>
                                    )}
                                    {report.status === "IN_PROGRESS" && (
                                        <>
                                            Report <strong>#{report.id}</strong> - "
                                            {report.title}" is currently{" "}
                                            <em>
                                                {formatStatus(report.status)}
                                            </em>
                                        </>
                                    )}
                                    {report.status === "RESOLVED" && (
                                        <>
                                            Issue <strong>#{report.id}</strong> - "
                                            {report.title}" was marked{" "}
                                            <em>
                                                {formatStatus(report.status)}
                                            </em>
                                        </>
                                    )}
                                    {report.status === "REJECTED" && (
                                        <>
                                            Report <strong>#{report.id}</strong> - "
                                            {report.title}" was{" "}
                                            <em>
                                                {formatStatus(report.status)}
                                            </em>
                                        </>
                                    )}
                                    {report.status === "CANCELLED" && (
                                        <>
                                            Report <strong>#{report.id}</strong> - "
                                            {report.title}" was{" "}
                                            <em>
                                                {formatStatus(report.status)}
                                            </em>
                                        </>
                                    )}
                                </span>
                                <button
                                    className="link-button"
                                    onClick={() =>
                                        goToReportDetail(report.id)
                                    }
                                    aria-label={`Open report ${report.id}`}
                                >
                                    Open
                                </button>
                            </li>
                        ))
                    ) : (
                        <li>No recent activity</li>
                    )}
                </ul>
            </section>

            <section className="community">
                <h4>
                    <img
                        src={communityReport}
                        alt="community-report"
                        className="announcement"
                    />
                    Community Reports
                </h4>
                {loadingPublic ? (
                    <p>Loading community reports...</p>
                ) : (publicReports?.length || 0) > 0 ? (
                    <>
                        <ul className="community-list">
                            {publicReports.map((report) => {
                                const imgUrl = getReportImage(report);
                                return (
                                    <li
                                        key={report.id}
                                        className="community-item"
                                        onClick={() =>
                                            goToReportDetail(report.id)
                                        }
                                    >
                                        <div className="community-thumb">
                                            <img
                                                src={imgUrl}
                                                alt={
                                                    report.title ||
                                                    "Report image"
                                                }
                                                className="community-image"
                                                onError={handleImageError}
                                            />
                                        </div>
                                        <div className="community-details">
                                            <Link
                                                to={`/user-report/${report.id}`}
                                                className="community-title"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <strong>{report.title}</strong>
                                            </Link>
                                            <p>
                                                {report.description?.slice(
                                                    0,
                                                    120
                                                ) || ""}
                                                ...
                                            </p>
                                            <div className="community-meta">
                                                <span>
                                                    Status:{" "}
                                                    {formatStatus(
                                                        report.status
                                                    )}
                                                </span>
                                                <span> • </span>
                                                <span>
                                                    By{" "}
                                                    {report.authorName ||
                                                        "Anonymous"}
                                                </span>
                                                <span> • </span>
                                                <span>
                                                    {report.createdAt
                                                        ? formatRelativeTime(
                                                            report.createdAt
                                                        )
                                                        : ""}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Pagination Controls */}
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
                ) : (
                    <p>No community reports found</p>
                )}
            </section>
        </div>
    );
}

export default UsersDashboard;