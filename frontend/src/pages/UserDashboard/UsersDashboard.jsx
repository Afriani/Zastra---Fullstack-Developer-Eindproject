import React, { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";   // ✅ replaced axios

import "../../css/USER DASHBOARD/userdashboard.css";

// GIFs
import submittedGif from "../../assets/pictures/submitted.gif";
import inReviewGif from "../../assets/pictures/inreview.gif";
import inProgressGif from "../../assets/pictures/inprogress.gif";
import resolvedGif from "../../assets/pictures/resolved.gif";
import rejectedGif from "../../assets/pictures/reject.gif";
import cancelledGif from "../../assets/pictures/cancel.gif";
import totalGif from "../../assets/pictures/totalreport.gif";
import loudspeaker from "../../assets/pictures/officer-dashboard/loudspeaker.png";
import recentActivity from "../../assets/pictures/email-service/report-status-update.png";
import communityReport from "../../assets/pictures/overview.png";

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

        const fetchProfile = async () => {
            try {
                const res = await axiosInstance.get("/api/users/me");
                setHeaderTitle(`Welcome back, ${res.data.firstName || "User"}!`);
                setHeaderSubtitle(`Your last login was ${formatRelativeTime(res.data.lastLogin)}`);
            } catch (err) {
                console.error("Failed to load profile:", err);
            }
        };

        const fetchDashboardStats = async () => {
            try {
                const res = await axiosInstance.get("/api/reports/my/stats");
                setStats(res.data);
            } catch (err) {
                console.error("Failed to load dashboard stats:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchPublicReports = async (page = 0) => {
            setLoadingPublic(true);
            try {
                const res = await axiosInstance.get(`/api/reports/public?page=${page}&size=5`);
                setPublicReports(res.data.content || []);
                setTotalPages(res.data.totalPages || 0);
                setTotalElements(res.data.totalElements || 0);
                setCurrentPage(page);
            } catch (err) {
                console.error("Failed to load public reports:", err);
            } finally {
                setLoadingPublic(false);
            }
        };

        const fetchAnnouncements = async () => {
            try {
                const res = await axiosInstance.get("/api/announcements/public");
                setAnnouncements(res.data || []);
            } catch (err) {
                console.error("Failed to load announcements:", err);
                setAnnouncements([]);
            } finally {
                setLoadingAnnouncements(false);
            }
        };

        fetchProfile();
        fetchDashboardStats();
        fetchPublicReports(currentPage);
        fetchAnnouncements();

        const intervalId = setInterval(() => {
            fetchPublicReports(currentPage);
            fetchDashboardStats();
        }, 30000);

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
            if (/^\d{4}-\d{2}-\d{2} \d{2}:/.test(s)) s = s.replace(" ", "T");
            const d = new Date(s);
            if (!isNaN(d.getTime())) date = d;
            if (!date && !s.endsWith("Z") && !s.includes("+") && !s.includes("-")) {
                const d2 = new Date(s + "Z");
                if (!isNaN(d2.getTime())) date = d2;
            }
        }

        if (!date) return "Never";

        const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
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
        return rtf.format(-Math.floor(diffDays / 365), "year");
    };

    const formatStatus = (status) =>
        status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

    const goToReportDetail = (id) => navigate(`/user-report/${id}`);

    const handlePreviousPage = () => currentPage > 0 && setCurrentPage(currentPage - 1);
    const handleNextPage = () => currentPage < totalPages - 1 && setCurrentPage(currentPage + 1);
    const handlePageClick = (num) => setCurrentPage(num);

    const getReportImage = (report) => {
        if (!report) return null;

        const keys = [
            "imageUrl", "firstImageUrl", "thumbnail", "coverImage", "photoUrl",
            "image", "thumbnailUrl", "picture", "images", "photos",
            "attachments", "media", "imageUrls", "photosUrls"
        ];

        for (const key of keys) {
            const val = report[key];
            if (typeof val === "string" && val.trim() !== "") return val;
            if (Array.isArray(val) && val.length > 0) return val[0];
        }

        return "";
    };

    const handleImageError = (e) => e.target.classList.add("no-image");

    return (
        <div className="content-inner">

            {/* Report Status Cards */}
            <section className="panel">
                <Link to="/user-report?filter=pending" className="card-link">
                    <div className="card pending clickable">
                        <img src={submittedGif} className="card-gif" alt="Submitted" />
                        <h4>SUBMITTED</h4>
                        <p>{loading ? "..." : stats.pendingReports}</p>
                    </div>
                </Link>

                <Link to="/user-report?filter=in-review" className="card-link">
                    <div className="card in-review clickable">
                        <img src={inReviewGif} className="card-gif" alt="Review" />
                        <h4>IN REVIEW</h4>
                        <p>{loading ? "..." : stats.inReviewReports}</p>
                    </div>
                </Link>

                <Link to="/user-report?filter=in-progress" className="card-link">
                    <div className="card in-progress clickable">
                        <img src={inProgressGif} className="card-gif" alt="Progress" />
                        <h4>IN PROGRESS</h4>
                        <p>{loading ? "..." : stats.inProgressReports}</p>
                    </div>
                </Link>

                <Link to="/user-report?filter=resolved" className="card-link">
                    <div className="card resolved clickable">
                        <img src={resolvedGif} className="card-gif" alt="Resolved" />
                        <h4>RESOLVED</h4>
                        <p>{loading ? "..." : stats.resolvedReports}</p>
                    </div>
                </Link>

                <Link to="/user-report?filter=rejected" className="card-link">
                    <div className="card rejected clickable">
                        <img src={rejectedGif} className="card-gif" alt="Rejected" />
                        <h4>REJECTED</h4>
                        <p>{loading ? "..." : stats.rejectedReports}</p>
                    </div>
                </Link>

                <Link to="/user-report?filter=rejected" className="card-link">
                    <div className="card cancelled clickable">
                        <img src={cancelledGif} className="card-gif" alt="Cancelled" />
                        <h4>CANCELLED</h4>
                        <p>{loading ? "..." : stats.cancelledReports}</p>
                    </div>
                </Link>

                <Link to="/user-report" className="card-link">
                    <div className="card total clickable">
                        <img src={totalGif} className="card-gif" alt="Total" />
                        <h4>Total Reports</h4>
                        <p>{loading ? "..." : stats.totalReports}</p>
                    </div>
                </Link>
            </section>

            {/* Announcements */}
            <section className="announcements">
                <h4>
                    <img src={loudspeaker} alt="announcement" className="announcement" />
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
                                    By {a.createdByName || "Admin"} •{" "}
                                    {formatRelativeTime(a.createdAt)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No announcements at this time</p>
                )}
            </section>

            {/* Recent Activity */}
            <section className="updates">
                <h4>
                    <img src={recentActivity} alt="recent" className="announcement" />
                    Recent Activity
                </h4>
                <ul>
                    {loading ? (
                        <li>Loading recent activity...</li>
                    ) : stats.recentReports.length > 0 ? (
                        stats.recentReports.map((r) => (
                            <li key={r.id}>
                                <span className="recent-desc">
                                    Report #{r.id} - "{r.title}" is now{" "}
                                    <em>{formatStatus(r.status)}</em>
                                </span>
                                <button
                                    className="link-button"
                                    onClick={() => goToReportDetail(r.id)}
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

            {/* Community Reports */}
            <section className="community">
                <h4>
                    <img src={communityReport} alt="community" className="announcement" />
                    Community Reports
                </h4>

                {loadingPublic ? (
                    <p>Loading community reports...</p>
                ) : publicReports.length > 0 ? (
                    <>
                        <ul className="community-list">
                            {publicReports.map((r) => (
                                <li
                                    key={r.id}
                                    className="community-item"
                                    onClick={() => goToReportDetail(r.id)}
                                >
                                    <div className="community-thumb">
                                        <img
                                            src={getReportImage(r)}
                                            alt={r.title}
                                            className="community-image"
                                            onError={handleImageError}
                                        />
                                    </div>

                                    <div className="community-details">
                                        <Link
                                            to={`/user-report/${r.id}`}
                                            className="community-title"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <strong>{r.title}</strong>
                                        </Link>

                                        <p>{(r.description || "").slice(0, 120)}...</p>

                                        <div className="community-meta">
                                            <span>Status: {formatStatus(r.status)}</span>
                                            <span> • </span>
                                            <span>By {r.authorName || "Anonymous"}</span>
                                            <span> • </span>
                                            <span>{formatRelativeTime(r.createdAt)}</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* Pagination */}
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 0}
                            >
                                ← Previous
                            </button>

                            <div className="pagination-info">
                                <span>Page {currentPage + 1} of {totalPages}</span>
                                <span className="pagination-total">
                                    ({totalElements} total reports)
                                </span>
                            </div>

                            <button
                                className="pagination-btn"
                                onClick={handleNextPage}
                                disabled={currentPage >= totalPages - 1}
                            >
                                Next →
                            </button>
                        </div>

                        <div className="pagination-numbers">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    className={`page-number ${currentPage === i ? "active" : ""}`}
                                    onClick={() => handlePageClick(i)}
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