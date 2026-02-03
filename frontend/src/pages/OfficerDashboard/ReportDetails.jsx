// src/pages/OfficerDashboard/ReportDetails.jsx

import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import axios from "axios";

// Leaflet imports
import {MapContainer, TileLayer, Marker, Popup} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

import "../../css/OFFICER DASHBOARD/reportdetails.css";
import SidebarOfficer from "../../components/OfficerDashboard/SidebarOfficer.jsx";

// All Icons
import backArrowIcon from "../../assets/pictures/officer-report-detail/back-arrow.png"
import descriptionIcon from "../../assets/pictures/user-report-detail/description.png"
import cameraIcon from "../../assets/pictures/user-report-detail/images.png"
import searchIcon from "../../assets/pictures/user-report-detail/view.png"
import videoIcon from "../../assets/pictures/user-report-detail/video.png"
import historyIcon from "../../assets/pictures/email-service/report-status-update.png"
import userIcon from "../../assets/pictures/profile.png"
import clockIcon from "../../assets/pictures/user-report-detail/timestamp.png"
import infoIcon from "../../assets/pictures/officer-report-detail/info.png"
import locationIcon from "../../assets/pictures/user-report-detail/location.png"
import mapIcon from "../../assets/pictures/user-report-detail/map-view.png"
import actionIcon from "../../assets/pictures/officer-report-detail/action.png"
import officerIcon from "../../assets/pictures/user-report-detail/asigned-officer.png"
import directionIcon from "../../assets/pictures/officer-dashboard/direction.png"
import closeIcon from "../../assets/pictures/officer-report-detail/close.png"
import saveIcon from "../../assets/pictures/officer-report-detail/save.png"
import messageIcon from "../../assets/pictures/my-inbox/right-speech-ballon.png"
import errorIcon from "../../assets/pictures/officer-report-detail/error.png"

// Status-specific icons
import submittedIcon from "../../assets/pictures/submitted.gif";
import inReviewIcon from "../../assets/pictures/inreview.gif";
import inProgressIcon from "../../assets/pictures/inprogress.gif";
import resolvedIcon from "../../assets/pictures/resolved.gif";
import rejectedIcon from "../../assets/pictures/reject.gif";
import cancelledIcon from "../../assets/pictures/cancel.gif";

export default function ReportDetails() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [statusNote, setStatusNote] = useState("");
    const [userRole, setUserRole] = useState(null);
    const [resolvedPhoto, setResolvedPhoto] = useState(null);

    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Map status to icon
    const statusIcons = {
        'SUBMITTED': submittedIcon,
        'IN_REVIEW': inReviewIcon,
        'IN_PROGRESS': inProgressIcon,
        'RESOLVED': resolvedIcon,
        'REJECTED': rejectedIcon,
        'CANCELLED': cancelledIcon
    };

    // Map status to display text
    const statusLabels = {
        'SUBMITTED': 'Submitted',
        'IN_REVIEW': 'In Review',
        'IN_PROGRESS': 'In Progress',
        'RESOLVED': 'Resolved',
        'REJECTED': 'Rejected',
        'CANCELLED': 'Cancelled'
    };

    // Clear resolvedPhoto if status changes away from RESOLVED
    useEffect(() => {
        if (selectedStatus !== "RESOLVED") {
            setResolvedPhoto(null);
        }
    }, [selectedStatus]);

    // Officer transition rules
    const getValidOfficerTransitions = (currentStatus) => {
        const transitions = {
            'SUBMITTED': ['IN_REVIEW'],
            'IN_REVIEW': ['IN_PROGRESS'],
            'IN_PROGRESS': ['RESOLVED'],
            'RESOLVED': [],
            'REJECTED': [],
            'CANCELLED': []
        };
        return transitions[currentStatus] || [];
    };

    // All status options for admins
    const getAllStatusOptions = () => [
        'SUBMITTED', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CANCELLED'
    ];

    useEffect(() => {
        if (!id) {
            setError("No report id provided");
            setLoading(false);
            return;
        }

        // Get user role from token
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserRole(payload.role || payload.authorities?.[0]?.authority);
            } catch {
                console.warn("Could not parse token for role");
            }
        }

        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        // Set initial selected status when report loads
        if (report && !selectedStatus) {
            setSelectedStatus(report.status);
        }
    }, [report, selectedStatus]);

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const resp = await axios.get(`http://localhost:8080/api/reports/${id}`, {
                headers: {Authorization: `Bearer ${token}`}
            });

            setReport(resp.data);
            setSelectedStatus(resp.data.status);
        } catch (err) {
            console.error("Failed to load report details:", err);
            if (err.response?.status === 404) {
                setError("Report not found");
            } else if (err.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            } else if (err.response?.status === 403) {
                setError("Access denied");
            } else {
                setError("Failed to load report details");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (selectedStatus === "RESOLVED" && !resolvedPhoto) {
            alert("Please attach a resolution photo before resolving.");
            return;
        }

        if (selectedStatus === report.status && !statusNote.trim() && !resolvedPhoto) {
            alert("No changes to save");
            return;
        }

        setIsUpdating(true);
        try {
            const token = localStorage.getItem("token");

            // Log reportId before API call
            console.log("reportId before API call:", id);

            // Use officer-specific endpoint for officers
            const endpoint = `/api/reports/officer/reports/${id}/status-with-photo`;
            const formData = new FormData();
            formData.append("status", selectedStatus);
            formData.append("notes", statusNote.trim());
            if (selectedStatus === "RESOLVED" && resolvedPhoto) {
                formData.append("resolvedPhoto", resolvedPhoto);
            }

            const resp = await axios.put(endpoint, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Do NOT set Content-Type; axios sets it automatically
                }
            });

            if (resp.data && resp.data.message) {
                alert(`${resp.data.message}`);
                await fetchReport(); // Refresh the report details
                setStatusNote("");
                setResolvedPhoto(null);
            } else {
                alert("Status updated successfully!");
                await fetchReport();
                setStatusNote("");
                setResolvedPhoto(null);
            }


        } catch (err) {
            console.error("Status update failed:", err);
            const errorMsg = err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Unknown error occurred";
            alert(`Failed to update status: ${errorMsg}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleBack = () => navigate(-1);
    const openLightbox = (url) => setLightboxImage(url);
    const closeLightbox = () => setLightboxImage(null);

    if (loading) {
        return (
            <div className="dashboard">
                <SidebarOfficer onLogout={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                }}/>
                <div className="main-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading report details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <SidebarOfficer onLogout={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                }}/>
                <div className="main-content">
                    <div className="error-container">
                        <div className="error-icon">
                            <img src={errorIcon} alt="error-icon" className="officer-report-detail" />
                        </div>
                        <h3>{error}</h3>
                        <button onClick={handleBack} className="btn-primary">Go Back</button>
                    </div>
                </div>
            </div>
        );
    }

    if (!report) {
        return null;
    }

    // Map center (fallback to Jakarta if no coordinates)
    const latNum = Number(report.latitude);
    const lngNum = Number(report.longitude);
    const hasValidCoords = Number.isFinite(latNum) && Number.isFinite(lngNum);
    const position = hasValidCoords
        ? [latNum, lngNum]
        : [-6.2088, 106.8456]; // Default to Jakarta

    // Get available status options based on user role
    const getAvailableStatusOptions = () => {
        if (userRole === 'ROLE_OFFICER') {
            const validTransitions = getValidOfficerTransitions(report.status);
            return [report.status, ...validTransitions]; // Include current status + valid transitions
        }
        return getAllStatusOptions(); // Admins can select any status
    };

    const availableStatuses = getAvailableStatusOptions();

    return (
        <div className="dashboard">

            <div className="main-content report-details-container">
                <div className="report-header-detail">
                    <button onClick={handleBack} className="btn-back">
                        <span className="back-icon">
                            <img src={backArrowIcon} alt="back-icon" className="officer-report-detail" />
                        </span>
                        Back
                    </button>
                    <div className="report-title">
                        <h1>Report #{report.id}</h1>
                        <h2>{report.title}</h2>
                    </div>
                    <div className={`status-badge status-badge-${report.status?.toLowerCase()}`}>
                        {report.status}
                    </div>
                </div>

                <div className="report-content">
                    <div className="report-main-content">
                        <section className="card description-card">
                            <div className="card-header">
                                <h3>
                                    <img src={descriptionIcon} alt="description-icon" className="officer-report-detail" />
                                    Description
                                </h3>
                            </div>
                            <div className="card-body">
                                <p>{report.description}</p>
                            </div>
                        </section>

                        <section className="card media-section">
                            <div className="card-header">
                                <h3>
                                    <img src={cameraIcon} alt="camera-icon" className="officer-report-detail" />
                                    Media Files
                                </h3>
                            </div>
                            <div className="card-body">
                                <div className="media-subsection">
                                    <h4>Images</h4>
                                    {report.imageUrls && report.imageUrls.length > 0 ? (
                                        <div className="images-grid">
                                            {report.imageUrls.map((url, idx) => (
                                                <div
                                                    key={idx}
                                                    className="image-container"
                                                    onClick={() => openLightbox(url)}
                                                >
                                                    <img src={url} alt={`Report evidence ${idx + 1}`}/>
                                                    <div className="image-overlay">
                                                        <span>
                                                            <img src={searchIcon} alt="search-icon" className="officer-report-detail" />
                                                            View
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-media">
                                            <span>
                                                <img src={cameraIcon} alt="camera-icon" className="officer-report-detail" />
                                            </span>
                                            <p>No images attached</p>
                                        </div>
                                    )}
                                </div>

                                <div className="media-subsection">
                                    <h4>Video</h4>
                                    {report.videoUrl ? (
                                        <div className="video-wrapper">
                                            <video controls width="100%" src={report.videoUrl}/>
                                        </div>
                                    ) : (
                                        <div className="no-media">
                                            <span>
                                                <img src={videoIcon} alt="video-icon" className="officer-report-detail" />
                                            </span>
                                            <p>No video attached</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="card status-history-card">
                            <div className="card-header">
                                <h3 className="status-history">
                                    <img src={historyIcon} alt="status-history-icon" className="officer-report-detail" />
                                    Status History
                                </h3>
                            </div>

                            <div className="card-body">
                                {report.statusHistory && report.statusHistory.length > 0 ? (
                                    <div className="status-timeline">
                                        {report.statusHistory.map((s, i) => (
                                            <div key={i} className="timeline-item">
                                                <div className="timeline-marker"></div>
                                                <div className="timeline-content">
                                                    <div className="status-info">
                                                        <span className={`status-label status-${s.status?.toLowerCase()}`}>
                                                            {s.status}
                                                        </span>
                                                        {s.notes && <p className="status-notes">{s.notes}</p>}
                                                        {s.resolvedPhotoUrl && (
                                                            <div className="resolution-photo-container">
                                                                <img
                                                                    src={s.resolvedPhotoUrl}
                                                                    alt={`Resolution for status ${s.status}`}
                                                                    className="resolution-photo"
                                                                    onClick={() => openLightbox(s.resolvedPhotoUrl)}
                                                                />
                                                                <div className="photo-caption">Resolution Photo</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="status-meta">
                                                        <span className="updated-by">
                                                            <img src={userIcon} alt="user-icon" className="officer-report-detail" />
                                                            {s.updatedBy || "System"}
                                                        </span>
                                                        <span className="timestamp">
                                                            <img src={clockIcon} alt="clock-icon" className="officer-report-detail" />
                                                            {s.timestamp ? new Date(s.timestamp).toLocaleString() : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-history">
                                        <span>
                                            <img src={historyIcon} alt="status-history-icon" className="officer-report-detail" />
                                        </span>
                                        <p>No status updates yet</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <aside className="report-sidebar">
                        <section className="card details-card">
                            <div className="card-header">
                                <h4>
                                    <img src={infoIcon} alt="info-icon" className="officer-report-detail" />
                                    Report Details
                                </h4>
                            </div>
                            <div className="card-body">
                                <div className="detail-item">
                                    <span className="detail-label">Category:</span>
                                    <span className="detail-value">{report.category}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Current Status:</span>
                                    <span className={`detail-value status-${report.status?.toLowerCase()}`}>
                                        {report.status}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Created:</span>
                                    <span className="detail-value">
                                        {new Date(report.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                {report.updatedAt && (
                                    <div className="detail-item">
                                        <span className="detail-label">Last Updated:</span>
                                        <span className="detail-value">
                                            {new Date(report.updatedAt).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                <div className="detail-item">
                                    <span className="detail-label">Reported by:</span>
                                    <span className="detail-value">{report.authorName}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Assigned Officer:</span>
                                    <span className="detail-value">
                                        {report.officerName || "Unassigned"}
                                    </span>
                                </div>
                                {userRole === 'ROLE_OFFICER' && (
                                    <div className="detail-item">
                                        <span className="detail-label">Your Role:</span>
                                        <span className="detail-value officer-role">
                                            <img src={officerIcon} alt="officer-icon" className="officer-report-detail" />
                                            Officer
                                        </span>
                                    </div>
                                )}

                            </div>
                        </section>

                        <section className="card location-card">
                            <div className="card-header">
                                <h4>
                                    <img src={locationIcon} alt="location-icon" className="officer-report-detail" />
                                    Location
                                </h4>
                            </div>
                            <div className="card-body">
                                {report.address ? (
                                    <div className="location-info">
                                        <div className="address-line">
                                            {report.address.streetName} {report.address.houseNumber}
                                        </div>
                                        <div className="address-line">
                                            {report.address.city}, {report.address.province}
                                        </div>
                                        {hasValidCoords && (
                                            <div className="coordinates">
                                                <img src={locationIcon} alt="location-icon" className="officer-report-detail" />
                                                {latNum.toFixed(6)}, {lngNum.toFixed(6)}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="no-location">
                                        <span>
                                            <img src={locationIcon} alt="location-icon" className="officer-report-detail" />
                                        </span>
                                        <p>No location information</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Always render Map Card; Map will use numeric coords when available, otherwise fallback */}
                        <section className="card map-card">
                            <div className="card-header">
                                <h4>
                                    <img src={mapIcon} alt="map-icon" className="officer-report-detail" />
                                    Map View
                                </h4>
                            </div>
                            <div className="card-body">
                                <div className="map-container">
                                    <MapContainer
                                        key={`${position[0]}-${position[1]}`}
                                        center={position}
                                        zoom={15}
                                        className="report-map"
                                        whenCreated={(map) => {
                                            // invalidate size after layout settle
                                            setTimeout(() => map.invalidateSize(), 200);
                                            // single resize listener (avoid adding many)
                                            const onResize = () => map.invalidateSize();
                                            window.addEventListener('resize', onResize);
                                            // remove listener when map is removed
                                            map.on('unload', () => window.removeEventListener('resize', onResize));
                                        }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <Marker position={position}>
                                            <Popup>
                                                <div className="popup-location-header">
                                                    <img src={locationIcon} alt="location-icon" className="officer-report-detail" />
                                                    <strong>Report Location</strong><br/>
                                                    {report.address?.streetName ? `${report.address.streetName} ${report.address.houseNumber || ''}, ` : ''}
                                                    {report.address?.city ? `${report.address.city}, ` : ''}
                                                    {report.address?.province || ''}
                                                </div>

                                                {/* Google Maps directions link (opens in new tab / Google Maps app on mobile) */}
                                                <a
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(latNum)},${encodeURIComponent(lngNum)}&travelmode=driving`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="gmaps-directions-link"
                                                >
                                                    <img src={directionIcon} alt="direction-icon" className="officer-report-detail" />
                                                    Open in Google Maps for Directions
                                                </a>
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                            </div>
                        </section>

                        <section className="card actions-card">
                            <div className="card-header">
                                <h4>
                                    <img src={actionIcon} alt="action-icon" className="officer-report-detail" />
                                    Actions
                                </h4>
                                {userRole === 'ROLE_OFFICER' && (
                                    <div className="officer-notice">
                                        <small>
                                            <img src={officerIcon} alt="officer-icon" className="officer-report-detail" />
                                            Officer transitions: SUBMITTED→IN_REVIEW→IN_PROGRESS→RESOLVED
                                        </small>
                                    </div>
                                )}
                            </div>
                            <div className="card-body">
                                <div className="status-update-section">
                                    <label htmlFor="status-select">Update Status:</label>

                                    {/* Custom Dropdown with Images */}
                                    <div className="custom-select-wrapper">
                                        <div
                                            className="custom-select-trigger"
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                        >
                                            <img
                                                src={statusIcons[selectedStatus]}
                                                alt={statusLabels[selectedStatus]}
                                                className="status-icon-dropdown"
                                            />
                                            <span>{statusLabels[selectedStatus]}</span>
                                            <span className="dropdown-arrow">{dropdownOpen ? '▲' : '▼'}</span>
                                        </div>
                                        {dropdownOpen && (
                                            <div className="custom-select-options">
                                                {availableStatuses.map(status => (
                                                    <div
                                                        key={status}
                                                        className={`custom-option ${selectedStatus === status ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            setSelectedStatus(status);
                                                            setDropdownOpen(false);
                                                        }}
                                                    >
                                                        <img
                                                            src={statusIcons[status]}
                                                            alt={statusLabels[status]}
                                                            className="status-icon-dropdown"
                                                        />
                                                        <span>{statusLabels[status]}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <label htmlFor="status-note">Add Note (Optional):</label>
                                    <textarea
                                        id="status-note"
                                        className="status-note-input"
                                        placeholder="Add a note about this status change..."
                                        value={statusNote}
                                        onChange={(e) => setStatusNote(e.target.value)}
                                        disabled={isUpdating}
                                        rows={3}
                                    />

                                    {selectedStatus === "RESOLVED" && (
                                        <div className="resolved-photo-upload">
                                            <label htmlFor="resolved-photo">Attach Resolution Photo:</label>
                                            <input
                                                id="resolved-photo"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setResolvedPhoto(e.target.files[0])}
                                                disabled={isUpdating}
                                            />
                                        </div>
                                    )}

                                    <button
                                        className={`btn-primary save-status-btn ${isUpdating ? 'loading' : ''}`}
                                        onClick={handleStatusUpdate}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? (
                                            <>
                                                <span className="spinner"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <img src={saveIcon} alt="save-icon" className="officer-report-detail" />
                                                Save Status
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="action-buttons">
                                    <button
                                        className="btn-secondary"
                                        onClick={() => navigate(`/officer/reports/${report.id}/messages`)}
                                    >
                                        <img src={messageIcon} alt="message-icon" className="officer-report-detail" />
                                        View Messages
                                    </button>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxImage && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={closeLightbox}>
                            <img src={closeIcon} alt="close-icon" className="officer-report-detail" />
                        </button>
                        <img src={lightboxImage} alt="Full size preview" className="lightbox-image"/>
                    </div>
                </div>
            )}
        </div>
    );
}


