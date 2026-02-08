// src/components/OfficerPerformanceTrendTable.jsx
import React, { useEffect, useState } from "react";
import "../../css/ADMIN DASHBOARD/officerperformancetrendtable.css";

export default function OfficerPerformanceTrendTable({ days = 30, officerId = null }) {
    const [trend, setTrend] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("days", String(days));
        if (officerId) params.set("officerId", String(officerId));

        fetch(`/api/admin/performance/trend?${params.toString()}`)
            .then(res => res.json())
            .then(js => {
                setTrend(js);
                setLoading(false);
            })
            .catch(e => {
                console.error("Failed to load trend", e);
                setTrend(null);
                setLoading(false);
            });
    }, [days, officerId]);

    if (loading) return <div>Loading trend…</div>;
    if (!trend) return <div>No trend data available.</div>;

    const res = trend.resolutionTrend || [];
    const vol = trend.volume || [];
    const volBy = new Map(vol.map(v => [v.period, v.count]));

    return (
        <div className="opt-table-container">
            <table className="opt-table" role="table" aria-label="Officer performance trend">
                <thead>
                <tr>
                    <th>Period</th>
                    <th className="num">Avg Resolution Days</th>
                    <th className="num">Resolved Count</th>
                </tr>
                </thead>
                <tbody>
                {res.map(row => (
                    <tr key={row.period}>
                        <td>{row.period}</td>
                        <td className="num">{(row.avgDays ?? 0).toFixed(2)}</td>
                        <td className="num">{volBy.get(row.period) ?? 0}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}