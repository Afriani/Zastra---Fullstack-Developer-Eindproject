import React, {useEffect, useState} from "react";
import axios from "axios";
import {useLocation} from "react-router-dom";

import "../../css/USER DASHBOARD/myreport.css";

// Add these imports near the top; place them after your current imports
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// All Icons
import address from "../../assets/pictures/user-report-detail/location.png"

// Fix default icon paths in Leaflet (do once per file where Leaflet components used)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png"
});

// Helper: small delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Forward geocode an address string/object to lat/lon using Nominatim.
 * Returns { lat: Number, lon: Number } or null if not found.
 * NOTE: Nominatim is rate-limited. Keep spacing >= 1000ms between requests for bulk.
 */
async function geocodeAddressOnce(address) {
    try {
        // Build a single-line address string
        let q;
        if (!address) return null;
        if (typeof address === "string") {
            q = address;
        } else {
            // join known fields safely
            const parts = [];
            if (address.houseNumber) parts.push(address.houseNumber);
            if (address.streetName) parts.push(address.streetName);
            if (address.city) parts.push(address.city);
            if (address.province) parts.push(address.province);
            if (address.postalCode) parts.push(address.postalCode);
            q = parts.join(", ");
        }
        if (!q) return null;

        // Nominatim endpoint
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=1&addressdetails=0`;
        const res = await fetch(url, {
            headers: {
                "Accept": "application/json"
                // Can't set User-Agent in browsers; Nominatim asks for identifying referer/email in production.
            }
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return null;
        const item = data[0];
        const lat = Number(item.lat);
        const lon = Number(item.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        return { lat, lon };
    } catch (err) {
        console.warn("Geocode error", err);
        return null;
    }
}

/**
 * Enrich an array of reports with coordinates by geocoding missing coords.
 * This function rate-limits calls to avoid Nominatim throttling.
 * Usage: const enriched = await enrichReportsWithCoords(reports);
 */
async function enrichReportsWithCoords(reports, opts = { delayMs: 1100 }) {
    const out = [];
    for (const r of reports) {
        // If already has latitude & longitude and they are numeric, keep them
        const lat = Number(r.latitude);
        const lon = Number(r.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
            out.push({ ...r, latitude: lat, longitude: lon });
            continue;
        }

        // Try geocoding using address
        const geo = await geocodeAddressOnce(r.address);
        if (geo) {
            out.push({ ...r, latitude: geo.lat, longitude: geo.lon });
        } else {
            // keep original (no coords)
            out.push(r);
        }

        // Wait to be polite (avoid Nominatim rate limit)
        if (opts.delayMs) await sleep(opts.delayMs);
    }
    return out;
}

function MyReport() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedHistory, setExpandedHistory] = useState({});

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const filter = queryParams.get("filter");

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Authentication required.");
                    setLoading(false);
                    return;
                }

                const headers = {Authorization: `Bearer ${token}`};

                // Base endpoint for user's reports
                let url = "http://localhost:8080/api/reports/my";

                // Handle filter logic from dashboard
                if (filter) {
                    const statusMap = {
                        pending: "SUBMITTED",
                        "in-review": "IN_REVIEW",
                        "in-progress": "IN_PROGRESS",
                        resolved: "RESOLVED",
                        rejected: "REJECTED",
                    };

                    const mappedStatus = statusMap[filter];
                    if (mappedStatus) {
                        // If backend supports filtering via query param
                        url = `${url}?status=${mappedStatus}`;
                    }
                }

                // Single axios call with dynamic URL
                const res = await axios.get(url, {headers});

                // After fetching, normalize to an array
                const rawReports = Array.isArray(res.data) ? res.data : res.data?.content ?? res.data ?? [];

                // Enrich with coords (Nominatim). This will rate-limit sequentially.
                // If you have many reports, consider server-side geocoding or caching.
                const enriched = await enrichReportsWithCoords(rawReports, { delayMs: 1100 });
                setReports(enriched);

                console.log("My reports response:", res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch reports.");
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [filter]);

    const statusColors = {
        SUBMITTED: "status submitted",
        IN_REVIEW: "status in-review",
        IN_PROGRESS: "status in-progress",
        RESOLVED: "status resolved",
        REJECTED: "status rejected",
        CANCELLED: "status cancelled"
    };

    const toggleHistory = (reportId) => {
        setExpandedHistory(prev => ({
            ...prev,
            [reportId]: !prev[reportId]
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const truncateDescription = (text, maxLength = 150) => {
        if (!text) return "";
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    const formatNumber = (value, digits = 4, fallback = "N/A") => {
        const n = Number(value);
        return Number.isFinite(n) ? n.toFixed(digits) : fallback;
    };

    // Safe address formatter
    const formatAddress = (address) => {
        if (!address) return "No address provided";

        // If it's already a string, return it
        if (typeof address === "string") {
            return address;
        }

        // If it's an object with expected fields, build a readable string
        try {
            const parts = [];
            if (address.streetName) parts.push(address.streetName);
            if (address.houseNumber) parts.push(address.houseNumber);
            if (address.postalCode) parts.push(address.postalCode);
            if (address.city) parts.push(address.city);
            if (address.province) parts.push(address.province);
            if (address.country) parts.push(address.country);
            const joined = parts.join(", ");
            return joined || "No address provided";
        } catch {
            // Fallback to JSON string for debugging if unexpected shape
            try {
                return JSON.stringify(address);
            } catch {
                return "No address provided";
            }
        }
    };

    return (
        <div className="dashboard">

            <div className="reports-container">

                <div className="report-header">
                    <h2>My Reports</h2>
                    <p className="report-count">{(reports?.length ?? 0)} reports submitted</p>
                </div>

                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading your reports...</p>
                    </div>
                )}

                {error && (
                    <div className="error-state">
                        <p className="error">{error}</p>
                    </div>
                )}

                {!loading && !error && (reports?.length ?? 0) === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h3>No reports yet</h3>
                        <p>You haven't submitted any reports. Create your first report to get started!</p>
                    </div>
                )}

                <div className="cards-grid">
                    {(reports || []).map((report) => (
                        <div className="report-card" key={report?.id ?? Math.random()}>
                            {/* Card Header */}
                            <div className="card-header">
                                <div className="status-row">
                                    <span
                                        className={`status-badge ${statusColors[report?.status] ?? "status unknown"}`}>
                                        {(report?.status ?? "UNKNOWN").replace('_', ' ')}
                                    </span>
                                    <span className="report-id">#{report?.id ?? "-"}</span>
                                </div>
                                <h3 className="report-title">{report?.title ?? "Untitled"}</h3>
                                <p className="category">{report?.category?.displayName ?? (typeof report?.category === "string" ? report.category : "Uncategorized")}</p>
                            </div>

                            {/* Media Section */}
                            {((report?.imageUrls?.length ?? 0) > 0) || !!report?.videoUrl ? (
                                <div className="media-section">
                                    {(report?.imageUrls?.length ?? 0) > 0 && (
                                        <div className="images-grid">
                                            {(report.imageUrls || []).slice(0, 3).map((url, i) => (
                                                <img key={i} src={url} alt={`Report ${i + 1}`}
                                                     className="report-image"/>
                                            ))}
                                            {(report?.imageUrls?.length ?? 0) > 3 && (
                                                <div className="more-images">+{(report.imageUrls.length - 3)}</div>
                                            )}
                                        </div>
                                    )}

                                    {report?.videoUrl && (
                                        <div className="video-section">
                                            <video controls className="report-video">
                                                <source src={report.videoUrl} type="video/mp4"/>
                                                Your browser does not support video playback.
                                            </video>
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            {/* Description */}
                            <div className="description-section">
                                <p className="description">
                                    {truncateDescription(report?.description)}
                                </p>
                            </div>

                            {/* Location */}
                            <div className="location-section">
                                <div className="location-info">
                                    <span className="location-icon">
                                        <img src={address} alt="address-icon" className="my-report-icons" />
                                    </span>
                                    <span className="address">{formatAddress(report?.address)}</span>
                                </div>
                                <div className="coordinates">
                                    {formatNumber(report?.latitude, 4, "N/A")}, {formatNumber(report?.longitude, 4, "N/A")}
                                </div>
                            </div>

                            {/* Small map for this report (show only when coords available) */}
                            {Number.isFinite(Number(report?.latitude)) && Number.isFinite(Number(report?.longitude)) && (
                                <div className="map-wrapper">
                                    <MapContainer
                                        center={[Number(report.latitude), Number(report.longitude)]}
                                        zoom={15}
                                        className="report-map"
                                        scrollWheelZoom={true}   // enable mouse-wheel zoom
                                        minZoom={8}              // user cannot zoom out beyond this
                                        maxZoom={18}             // user cannot zoom in beyond this
                                        doubleClickZoom={true}
                                        dragging={true}
                                        zoomControl={true}
                                        whenCreated={(map) => {
                                            setTimeout(() => map.invalidateSize(), 200);
                                        }}
                                    >
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Marker position={[Number(report.latitude), Number(report.longitude)]}>
                                            <Popup>
                                                <div className="popup-content">
                                                    <img src={address} alt="address-icon" className="my-report-icons" />
                                                    <strong>Report Location</strong><br/>
                                                    {report.address?.streetName ? `${report.address.streetName} ${report.address.houseNumber || ''}, ` : ''}
                                                    {report.address?.city ? `${report.address.city}, ` : ''}
                                                    {report.address?.province || ''}
                                                </div>

                                                {/* Google Maps directions link (opens in new tab / Google Maps app on mobile) */}
                                                <a
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(Number(report.latitude))},${encodeURIComponent(Number(report.longitude))}&travelmode=driving`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="gmaps-directions-link"
                                                >
                                                    ➜ Open in Google Maps (Get Directions)
                                                </a>
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                            )}

                            {/* Officer Info */}
                            <div className="officer-section">
                                <span className="officer-label">Assigned Officer:</span>
                                <span className="officer-name">{report?.officerName ?? "Not assigned"}</span>
                            </div>

                            {/* Dates */}
                            <div className="dates-section">
                                <div className="date-item">
                                    <span className="date-label">Created:</span>
                                    <span className="date-value">{formatDate(report?.createdAt)}</span>
                                </div>
                                {report?.updatedAt && (
                                    <div className="date-item">
                                        <span className="date-label">Updated:</span>
                                        <span className="date-value">{formatDate(report.updatedAt)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Status History */}
                            <div className="history-section">
                                <button
                                    className="history-toggle"
                                    onClick={() => toggleHistory(report?.id)}
                                >
                                    Status History ({report?.statusHistory?.length ?? 0})
                                    <span className={`arrow ${expandedHistory[report?.id] ? 'expanded' : ''}`}>▼</span>
                                </button>

                                {expandedHistory[report?.id] && (
                                    <div className="history-timeline">
                                        {(report?.statusHistory || []).map((h, i) => (
                                            <div key={i} className="timeline-item">
                                                <div className="timeline-dot"></div>
                                                <div className="timeline-content">
                                                    <div className="timeline-header">
                                                        <span className="timeline-status">{h?.status ?? "N/A"}</span>
                                                        <span
                                                            className="timeline-date">{formatDate(h?.timestamp)}</span>
                                                    </div>
                                                    <div className="timeline-details">
                                                        <span
                                                            className="timeline-user">by {h?.updatedBy ?? "System"}</span>
                                                        {h?.notes && <p className="timeline-notes">{h.notes}</p>}

                                                        {/* SHOW Officer-Uploaded Photo if available */}
                                                        {h?.resolvedPhotoUrl && (
                                                            <div className="timeline-photo">
                                                                <img
                                                                    src={h.resolvedPhotoUrl}
                                                                    alt="Resolution proof"
                                                                    className="resolved-photo"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MyReport;


