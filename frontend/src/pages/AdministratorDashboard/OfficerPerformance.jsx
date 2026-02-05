import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    Legend,
} from "recharts";
import OfficerPerformanceTrendTable from "./OfficerPerformanceTrendTable";
import "../../css/ADMIN DASHBOARD/officerperformance.css";

function OfficerPerformance() {
    const token = localStorage.getItem("token");
    const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

    const [officers, setOfficers] = useState([{ id: null, name: "All Officers" }]);
    const [filters, setFilters] = useState({
        officerId: null,
        range: "30d",
        from: "",
        to: "",
    });

    const [summary, setSummary] = useState(null);
    const [trend, setTrend] = useState({
        resolutionTrend: [],
        firstResponseTrend: [],
        volume: [],
    });
    const [byCategory, setByCategory] = useState([]);
    const [outliers, setOutliers] = useState({
        slowestResolutions: [],
        oldestOpen: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Listen to the custom event from Overview widget to preselect officer
    useEffect(() => {
        const handler = (e) => {
            const id = e.detail?.officerId ?? null;
            setFilters((f) => ({ ...f, officerId: id }));
        };
        window.addEventListener("navigate-admin-performance", handler);
        return () => window.removeEventListener("navigate-admin-performance", handler);
    }, []);

    useEffect(() => {
        const loadMeta = async () => {
            try {
                const offs = await axios.get(
                    "http://localhost:8080/api/admin/performance/officers",
                    { headers: authHeaders }
                );
                setOfficers([{ id: null, name: "All Officers" }, ...(offs.data || [])]);
            } catch {
                // ignore
            }
        };
        loadMeta();
    }, [authHeaders]);

    const resolveDates = () => {
        if (filters.range === "custom" && filters.from && filters.to) {
            return { from: filters.from, to: filters.to };
        }
        const now = new Date();
        let days = 30;
        if (filters.range === "7d") days = 7;
        if (filters.range === "90d") days = 90;
        const to = now.toISOString().slice(0, 10);
        const fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const from = fromDate.toISOString().slice(0, 10);
        return { from, to };
    };

    const fetchAll = async () => {
        setLoading(true);
        setError("");
        try {
            const { from, to } = resolveDates();
            const params = new URLSearchParams();
            if (filters.officerId) params.append("officerId", filters.officerId);
            params.append("from", from);
            params.append("to", to);

            const [sum, tr, byCat, outs] = await Promise.all([
                axios.get(
                    `http://localhost:8080/api/admin/performance/summary?${params.toString()}`,
                    { headers: authHeaders }
                ),
                axios.get(
                    `http://localhost:8080/api/admin/performance/trend?${params.toString()}&interval=week`,
                    { headers: authHeaders }
                ),
                axios.get(
                    `http://localhost:8080/api/admin/performance/by-category?${params.toString()}`,
                    { headers: authHeaders }
                ),
                axios.get(
                    `http://localhost:8080/api/admin/performance/outliers?${params.toString()}&limit=10`,
                    { headers: authHeaders }
                ),
            ]);

            setSummary(sum.data || null);
            setTrend({
                resolutionTrend: tr.data?.resolutionTrend || [],
                firstResponseTrend: tr.data?.firstResponseTrend || [],
                volume: tr.data?.volume || [],
            });
            setByCategory(byCat.data || []);
            setOutliers(outs.data || { slowestResolutions: [], oldestOpen: [] });
        } catch (e) {
            console.error(e);
            setError("Failed to load performance data.");
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            const { from, to } = resolveDates();
            const params = new URLSearchParams();
            if (filters.officerId) params.append("officerId", filters.officerId);
            params.append("from", from);
            params.append("to", to);

            const res = await axios.get(
                `http://localhost:8080/api/admin/performance/export.csv?${params.toString()}`,
                {
                    headers: authHeaders,
                    responseType: "blob",
                }
            );

            const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `performance-report-${from}-to-${to}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Export failed", e);
            alert("Failed to export CSV. Please try again.");
        }
    };

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.officerId, filters.range, filters.from, filters.to]);

    const formatTick = (isoDate) => {
        const d = new Date(isoDate);
        const days =
            filters.range === "7d"
                ? 7
                : filters.range === "30d"
                    ? 30
                    : filters.range === "90d"
                        ? 90
                        : 30;

        if (days <= 14)
            return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
        if (days <= 90)
            return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
        return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
    };

    const hasChartData =
        (trend.resolutionTrend?.length > 0 &&
            trend.resolutionTrend.some((p) => p.avgDays > 0)) ||
        (trend.volume?.length > 0 &&
            trend.volume.some((v) => v.opened > 0 || v.resolved > 0));

    return (
        <div className="officer-perf">
            <div className="admin-content-section">
                <h2>Officer Quality Performance</h2>

                {/* Filters */}
                <div className="filters-row">
                    <select
                        value={filters.officerId ?? ""}
                        onChange={(e) =>
                            setFilters((f) => ({
                                ...f,
                                officerId: e.target.value ? Number(e.target.value) : null,
                            }))
                        }
                    >
                        {officers.map((o) => (
                            <option key={String(o.id)} value={o.id ?? ""}>
                                {o.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.range}
                        onChange={(e) =>
                            setFilters((f) => ({ ...f, range: e.target.value }))
                        }
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="custom">Custom range</option>
                    </select>

                    {filters.range === "custom" && (
                        <>
                            <input
                                type="date"
                                value={filters.from}
                                onChange={(e) =>
                                    setFilters((f) => ({ ...f, from: e.target.value }))
                                }
                            />
                            <input
                                type="date"
                                value={filters.to}
                                onChange={(e) =>
                                    setFilters((f) => ({ ...f, to: e.target.value }))
                                }
                            />
                        </>
                    )}

                    <button className="btn" onClick={fetchAll} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>

                    <button className="btn" onClick={handleExportCSV}>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="kpi-grid">
                <div className="stat-card stat-card-resolution">
                    <div className="stat-title">Avg Resolution Days</div>
                    <div className="stat-value">
                        {summary?.avgResolutionDays?.toFixed?.(1) ?? "-"}
                    </div>
                </div>
                <div className="stat-card stat-card-response">
                    <div className="stat-title">Median First Response (hrs)</div>
                    <div className="stat-value">
                        {summary?.medianFirstResponseHours?.toFixed?.(1) ?? "-"}
                    </div>
                </div>
                <div className="stat-card stat-card-rate">
                    <div className="stat-title">Resolution Rate</div>
                    <div className="stat-value">
                        {summary?.resolutionRatePct != null
                            ? `${summary.resolutionRatePct.toFixed(0)}%`
                            : "-"}
                    </div>
                </div>
                <div className="stat-card stat-card-sla">
                    <div className="stat-title">SLA Compliance</div>
                    <div className="stat-value">
                        {summary?.slaCompliancePct != null
                            ? `${summary.slaCompliancePct.toFixed(0)}%`
                            : "-"}
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="admin-content-section">
                    <h3>Avg Resolution Days (Weekly)</h3>
                    <div className="chart-box">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trend.resolutionTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" tickFormatter={formatTick} />
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

                <div className="admin-content-section">
                    <h3>Volume (Opened vs Resolved)</h3>
                    <div className="chart-box">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trend.volume}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" tickFormatter={formatTick} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    dataKey="opened"
                                    name="Opened"
                                    fill="#f59e0b"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="resolved"
                                    name="Resolved"
                                    fill="#10b981"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Fallback Table */}
            {!hasChartData && (
                <div className="admin-content-section">
                    <h3>Trend Data (Fallback View)</h3>
                    <OfficerPerformanceTrendTable
                        days={
                            filters.range === "7d"
                                ? 7
                                : filters.range === "90d"
                                    ? 90
                                    : filters.range === "30d"
                                        ? 30
                                        : 30
                        }
                        officerId={filters.officerId}
                    />
                </div>
            )}

            {/* By Category */}
            <div className="admin-content-section">
                <h3>Performance by Category</h3>
                <div className="list">
                    {byCategory.length === 0 ? (
                        <div className="empty">No data.</div>
                    ) : (
                        byCategory.map((row) => (
                            <div key={row.category} className="list-row">
                                <div className="list-title">{row.category}</div>
                                <div className="list-meta">
                                    <span className="badge">Count: {row.count}</span>
                                    <span className="badge">
                                        Avg Days:{" "}
                                        {row.avgResolutionDays?.toFixed?.(1) ?? "-"}
                                    </span>
                                    <span className="badge">
                                        SLA:{" "}
                                        {row.slaCompliancePct != null
                                            ? `${row.slaCompliancePct.toFixed(0)}%`
                                            : "-"}
                                    </span>
                                    <span className="badge">
                                        Reopen:{" "}
                                        {row.reopenRatePct != null
                                            ? `${row.reopenRatePct.toFixed(0)}%`
                                            : "-"}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Outliers */}
            <div className="admin-content-section">
                <h3>Outliers</h3>
                <div className="two-col">
                    <div className="list">
                        <h4>Slowest Resolutions</h4>
                        {outliers.slowestResolutions.length === 0 ? (
                            <div className="empty">None.</div>
                        ) : (
                            outliers.slowestResolutions.map((o) => (
                                <div key={o.reportId} className="list-row">
                                    <div className="list-title">Report #{o.reportId}</div>
                                    <div className="list-meta">
                                        <span className="badge">{o.category}</span>
                                        <span className="badge">
                                            Days: {o.days?.toFixed?.(1) ?? "-"}
                                        </span>
                                        <span className="date">
                                            {new Date(o.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="list">
                        <h4>Oldest Open</h4>
                        {outliers.oldestOpen.length === 0 ? (
                            <div className="empty">None.</div>
                        ) : (
                            outliers.oldestOpen.map((o) => (
                                <div key={o.reportId} className="list-row">
                                    <div className="list-title">Report #{o.reportId}</div>
                                    <div className="list-meta">
                                        <span className="badge">{o.category}</span>
                                        <span className="badge">
                                            Age: {o.ageDays?.toFixed?.(1) ?? "-"}
                                        </span>
                                        <span className="date">
                                            {new Date(o.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {loading && (
                <div className="admin-content-section">Loading...</div>
            )}
            {error && (
                <div className="admin-content-section error-message">{error}</div>
            )}
        </div>
    );
}

export default OfficerPerformance;