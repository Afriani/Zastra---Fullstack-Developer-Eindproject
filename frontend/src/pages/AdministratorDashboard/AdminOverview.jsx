// src/pages/AdministratorDashboard/AdminOverview.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    Cell
} from "recharts";

import "../../css/ADMIN DASHBOARD/adminoverview.css";

function AdminOverview() {
    const navigate = useNavigate();
    const [statusCounts, setStatusCounts] = useState({
        SUBMITTED: 0,
        IN_REVIEW: 0,
        IN_PROGRESS: 0,
        RESOLVED: 0,
        REJECTED: 0,
        CANCELLED: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [summary, setSummary] = useState(null);
    const [byCategory, setByCategory] = useState([]);
    const [trend, setTrend] = useState([]);
    const [recentReports, setRecentReports] = useState([]);
    const [workload, setWorkload] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    const [officers, setOfficers] = useState([]);
    const [selectedOfficerId, setSelectedOfficerId] = useState(null);
    const [perfSummary, setPerfSummary] = useState(null);
    const [perfTrend, setPerfTrend] = useState([]);

    const token = localStorage.getItem("token");
    const authHeaders = { Authorization: `Bearer ${token}` };

    const STATUS_MAP = {
        SUBMITTED: "SUBMITTED",
        IN_REVIEW: "IN_REVIEW",
        IN_PROGRESS: "IN_PROGRESS",
        RESOLVED: "RESOLVED",
        REJECTED: "REJECTED",
        CANCELLED: "CANCELLED"
    };

    useEffect(() => {
        console.log("byCategory data:", byCategory);
    }, [byCategory]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const [s, c, t, r, w, a, offs] = await Promise.all([
                    axios.get("http://localhost:8080/api/admin/stats/reports/summary?days=180", { headers: authHeaders }),
                    axios.get("http://localhost:8080/api/admin/stats/reports/by-category", { headers: authHeaders }),
                    axios.get("http://localhost:8080/api/admin/stats/reports/resolution-trend?weeks=26", { headers: authHeaders }),
                    axios.get("http://localhost:8080/api/admin/reports/recent?limit=5", { headers: authHeaders }),
                    axios.get("http://localhost:8080/api/admin/stats/officer-workload", { headers: authHeaders }),
                    axios.get("http://localhost:8080/api/announcements/latest?limit=3", { headers: authHeaders }),
                    axios.get("http://localhost:8080/api/admin/performance/officers", { headers: authHeaders })
                ]);

                // DEBUG: Log the data structure
                console.log("Recent Reports:", r.data);
                console.log("Workload:", w.data);
                console.log("Announcements:", a.data);
                console.log("SUMMARY DATA:", s.data);
                console.log("Trend Data:", t.data);

                setSummary(s.data);
                setByCategory(c.data || []);
                setTrend(t.data || []);
                setRecentReports(r.data || []);
                setWorkload(w.data || []);
                setAnnouncements(a.data || []);
                const officerList = offs.data || [];
                setOfficers([{ id: null, name: "All Officers" }, ...officerList]);
            } catch (err) {
                console.error("Failed to load overview data:", err);
                setError("Failed to load overview data.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        const fetchStatusCounts = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:8080/api/admin/stats/reports/status-counts",
                    { headers: authHeaders }
                );
                const raw = res.data;
                const normalized = {};
                Object.entries(raw).forEach(([k, v]) => {
                    normalized[k.toUpperCase()] = Number(v ?? 0);
                });
                setStatusCounts(prev => ({ ...prev, ...normalized }));
            } catch (err) {
                console.warn("status-counts failed; falling back to per-status fetch", err);
                const statusKeys = Object.keys(STATUS_MAP);
                const fallbackResults = {};
                for (const key of statusKeys) {
                    try {
                        const res = await axios.get("http://localhost:8080/api/admin/reports", {
                            headers: authHeaders,
                            params: { status: key, page: 0, size: 1 }
                        });
                        fallbackResults[key] =
                            res.data?.totalElements ?? res.data?.length ?? 0;
                    } catch {
                        fallbackResults[key] = 0;
                    }
                }
                setStatusCounts(fallbackResults);
            }
        };

        if (token) fetchStatusCounts();
    }, [token]);

    useEffect(() => {
        const fetchPerf = async () => {
            try {
                const params = new URLSearchParams();
                if (selectedOfficerId !== null && selectedOfficerId !== undefined) {
                    params.append("officerId", String(selectedOfficerId));
                    params.append("days", "180");
                }

                const [sum, tr] = await Promise.all([
                    axios.get(
                        `http://localhost:8080/api/admin/performance/summary?${params.toString()}`,
                        { headers: authHeaders }
                    ),
                    axios.get(
                        `http://localhost:8080/api/admin/performance/trend?${params.toString()}`,
                        { headers: authHeaders }
                    )
                ]);
                setPerfSummary(sum.data || null);
                setPerfTrend(tr.data?.resolutionTrend || []);
            } catch (err) {
                console.error("Perf widget load error", err);
                setPerfSummary(null);
                setPerfTrend([]);
            }
        };

        fetchPerf();
    }, [selectedOfficerId]);

    useEffect(() => {
        if (officers.length > 1 && selectedOfficerId == null) {
            setSelectedOfficerId(officers[1].id);
        }
    }, [officers, selectedOfficerId]);

    if (loading) {
        return <div className="admin-content-section">Loading overview...</div>;
    }
    if (error) {
        return <div className="admin-content-section error-message">{error}</div>;
    }

    // Cleaned StatCard
    const StatCard = ({ title, value, subtitle, onClick, color = "#0078d4" }) => {
        // We pass color via data-attribute so CSS can target/override if needed
        const clickable = Boolean(onClick);

        return (
            <div
                className={`stat-card${clickable ? " stat-card-clickable" : ""}`}
                data-border-color={color}
                onClick={onClick}
            >
                <div className="stat-title">{title}</div>
                <div className="stat-value">{value}</div>
                {subtitle && <div className="stat-subtitle">{subtitle}</div>}
            </div>
        );
    };

    const openReportsByStatus = (statusKey) => {
        const mapped = STATUS_MAP[statusKey] ?? statusKey ?? "";
        try {
            sessionStorage.setItem(
                "adminReportsFilter",
                JSON.stringify({ status: mapped })
            );
        } catch (err) {
            console.warn("Could not persist adminReportsFilter", err);
        }

        const params = new URLSearchParams();
        if (mapped) params.set("status", mapped);
        navigate(`/admin/reports?${params.toString()}`, { replace: false });
        window.dispatchEvent(
            new CustomEvent("navigate-admin-reports", { detail: { status: mapped } })
        );
    };

    const handleViewFullPerformance = () => {
        const event = new CustomEvent("navigate-admin-performance", {
            detail: { officerId: selectedOfficerId }
        });
        window.dispatchEvent(event);
    };

    return (
        <div className="admin-overview">
            <div className="admin-profile-page">
                <h2>Overview</h2>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="SUBMITTED"
                    value={summary?.totalOpen ?? 0}
                    color="#ef4444"
                    onClick={() => openReportsByStatus("SUBMITTED")}
                />
                <StatCard
                    title="IN REVIEW"
                    value={statusCounts.IN_REVIEW ?? 0}
                    color="#f59e0b"
                    onClick={() => openReportsByStatus("IN_REVIEW")}
                />
                <StatCard
                    title="IN PROGRESS"
                    value={statusCounts.IN_PROGRESS ?? 0}
                    color="#f59e0b"
                    onClick={() => openReportsByStatus("IN_PROGRESS")}
                />
                <StatCard
                    title="RESOLVED"
                    value={statusCounts.RESOLVED ?? 0}
                    color="#10b981"
                    onClick={() => openReportsByStatus("RESOLVED")}
                />
                <StatCard
                    title="REJECTED"
                    value={statusCounts.REJECTED ?? 0}
                    color="#ef4444"
                    onClick={() => openReportsByStatus("REJECTED")}
                />
                <StatCard
                    title="CANCELLED"
                    value={statusCounts.CANCELLED ?? 0}
                    color="#6b7280"
                    onClick={() => openReportsByStatus("CANCELLED")}
                />
                <StatCard
                    title="TOTAL REPORT"
                    value={summary?.totalReports ?? 0}
                />
                <StatCard
                    title="Avg Resolution (180d)"
                    value={
                        (summary?.avgResolutionDays180d || 0) > 0
                            ? Number(summary.avgResolutionDays180d).toFixed(1)
                            : "-"
                    }
                    color="#6366f1"
                    subtitle={
                        (summary?.totalResolved180d || 0) > 0
                            ? `Based on ${summary.totalResolved180d} resolutions`
                            : "No resolutions found"
                    }
                />
            </div>

            <div className="charts-grid">
                <div className="admin-content-section">
                    <h3>Reports by Category</h3>
                    <div className="chart-wrapper chart-wrapper-450">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byCategory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar
                                    dataKey="count"
                                    radius={[4, 4, 0, 0]}
                                >
                                    {byCategory.map((entry, index) => {
                                        const categoryColorMap = {
                                            'Road Damage': '#fca5a5',           // Pastel Red
                                            'Pothole': '#f87171',               // Pastel Dark Red
                                            'Broken Streetlight': '#fde047',    // Pastel Yellow
                                            'Litter': '#fdba74',                // Pastel Orange
                                            'Illegal Dumping': '#fb923c',       // Pastel Deep Orange
                                            'Fallen Tree': '#86efac',           // Pastel Green
                                            'Damaged Playground': '#fcd34d',    // Pastel Golden Yellow
                                            'Broken Bench': '#93c5fd',          // Pastel Blue
                                            'Graffiti': '#c4b5fd',              // Pastel Purple
                                            'Damaged Sign': '#a5b4fc',          // Pastel Indigo
                                            'Other': '#d1d5db'                  // Pastel Gray
                                        };

                                        const color = categoryColorMap[entry.category] || '#bfdbfe';
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })}
                                </Bar>

                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-content-section">
                    <h3>Avg Resolution Days (Weekly)</h3>
                    <div className="chart-wrapper chart-wrapper-450">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="weekStart" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="avgDays"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="admin-content-section performance-section">
                <div className="section-header section-header-flex">
                    <h3>
                        Quality Performance (30d)
                        <span className="performance-officer-name">
                            {" "}
                            —{" "}
                            {officers.find(o => o.id === selectedOfficerId)?.name ||
                                "All Officers"}
                        </span>
                    </h3>
                    <div className="performance-controls">
                        <select
                            className="performance-officer-select"
                            value={selectedOfficerId ?? ""}
                            onChange={(e) =>
                                setSelectedOfficerId(
                                    e.target.value ? Number(e.target.value) : null
                                )
                            }
                        >
                            {officers.map(o => (
                                <option key={String(o.id)} value={o.id ?? ""}>
                                    {o.name}
                                </option>
                            ))}
                        </select>
                        <button
                            className="btn-link performance-link"
                            onClick={handleViewFullPerformance}
                            disabled={officers.length === 0}
                        >
                            View full performance →
                        </button>
                    </div>
                </div>

                <div className="stats-grid">
                    <div
                        className="stat-card perf-stat-card perf-stat-card-avg"
                        data-border-color="#6366f1"
                    >
                        <div className="stat-title">Avg Resolution Days</div>
                        <div className="stat-value">
                            {perfSummary?.avgResolutionDays?.toFixed?.(1) ?? "-"}
                        </div>
                    </div>
                    <div
                        className="stat-card perf-stat-card perf-stat-card-resolution-rate"
                        data-border-color="#10b981"
                    >
                        <div className="stat-title">Resolution Rate</div>
                        <div className="stat-value">
                            {perfSummary?.resolutionRatePct != null
                                ? `${perfSummary.resolutionRatePct.toFixed(0)}%`
                                : "-"}
                        </div>
                    </div>
                    <div
                        className="stat-card perf-stat-card perf-stat-card-sla"
                        data-border-color="#3b82f6"
                    >
                        <div className="stat-title">SLA Compliance</div>
                        <div className="stat-value">
                            {perfSummary?.slaCompliancePct != null
                                ? `${perfSummary.slaCompliancePct.toFixed(0)}%`
                                : "-"}
                        </div>
                    </div>
                </div>

                <div className="chart-wrapper chart-wrapper-350 perf-chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={perfTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="avgDays"
                                stroke="#6366f1"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="lists-grid">
                <div className="admin-content-section">
                    <h3>Recently Submitted</h3>
                    <div className="list">
                        {recentReports.length === 0 ? (
                            <div className="empty">No recent reports.</div>
                        ) : (
                            recentReports.map(r => (
                                <div key={r.id} className="list-row">
                                    <div className="list-title">{r.title}</div>
                                    <div className="list-meta">
                                        <span className="badge">{r.category}</span>
                                        <span
                                            className={`status ${r.status?.toLowerCase().replace(/_/g, "-")}`}
                                        >
                                {r.status?.replace(/_/g, " ")}
                            </span>
                                        <span className="date">
                                {r.createdAtIso ? new Date(r.createdAtIso).toLocaleString('en-GB', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: false
                                }) : "No Date"}
                            </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="admin-content-section">
                    <h3>Officer Workload</h3>
                    <div className="list">
                        {workload.length === 0 ? (
                            <div className="empty">No workload data.</div>
                        ) : (
                            workload.map(w => (
                                <div key={w.officerId} className="list-row">
                                    <div className="list-title">{w.officerName}</div>
                                    <div className="list-meta">
                            <span className="badge">
                                Open assigned: {w.openAssignedCount}
                            </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="admin-content-section">
                    <h3>Latest Announcements</h3>
                    <div className="list">
                        {announcements.length === 0 ? (
                            <div className="empty">No announcements yet.</div>
                        ) : (
                            announcements.map(a => (
                                <div key={a.id} className="list-row">
                                    <div className="list-title">{a.title}</div>
                                    <div className="list-meta">
                            <span
                                className={`badge ${
                                    a.audience === "OFFICERS"
                                        ? "purple"
                                        : "blue"
                                }`}
                            >
                                {a.audience === "OFFICERS"
                                    ? "Officers"
                                    : "All"}
                            </span>
                                        <span className="date">
                                {(a.createdAtIso || a.createdAt) ? new Date(a.createdAtIso || a.createdAt).toLocaleString('en-GB', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: false
                                }) : "No Date"}
                            </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminOverview;


