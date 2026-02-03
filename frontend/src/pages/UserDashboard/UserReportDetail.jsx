// src/pages/UserDashboard/UserReportDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Leaflet imports for map
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// All User Report Detail images
import assignedOfficer from "../../assets/pictures/user-report-detail/asigned-officer.png"
import category from "../../assets/pictures/user-report-detail/category.png"
import description from "../../assets/pictures/user-report-detail/description.png"
import images from "../../assets/pictures/user-report-detail/images.png"
import mapViews from "../../assets/pictures/user-report-detail/map-view.png"
import timestamp from "../../assets/pictures/user-report-detail/timestamp.png"
import video from "../../assets/pictures/user-report-detail/video.png"
import view from "../../assets/pictures/user-report-detail/view.png"
import warning from "../../assets/pictures/user-report-detail/warning.png"
import location from "../../assets/pictures/user-report-detail/location.png"
import statusHistory from "../../assets/pictures/email-service/report-status-update.png"
import updatedBy from "../../assets/pictures/profile.png"

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import '../../css/USER DASHBOARD/userreportdetail.css';

const UserReportDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lightboxImage, setLightboxImage] = useState(null);

    // normalize "IN_REVIEW" => "in-review", "RESOLVED" => "resolved"
    const normalizeStatus = (s) => (s ? String(s).toLowerCase().replace(/_/g, '-') : '');

    useEffect(() => {
        console.log('[URD] mounted, useParams id=', id, 'location=', window.location.pathname + window.location.search);
        if (!id) {
            setError("No report id provided");
            setLoading(false);
            return;
        }
        fetchReportDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchReportDetails = async () => {
        console.log('[URD] fetchReportDetails id=', id);
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            console.log('[URD] token present?', !!token);
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(`http://localhost:8080/api/reports/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('[URD] got response', response.status, response.data);
            setReport(response.data);
        } catch (err) {
            console.error('[URD] fetch error', err?.response?.status, err?.response?.data);

            if (err.response?.status === 404) {
                setError('Report not found');
            } else if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else if (err.response?.status === 403) {
                setError('Access denied. You do not have permission to view this report.');
            } else {
                setError('Failed to load report details');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => navigate(-1);
    const openLightbox = (url) => setLightboxImage(url);
    const closeLightbox = () => setLightboxImage(null);

    if (loading) {
        return (
            <div className="main-content">
                <div className="loading-container">
                    <div className="loading-spinner" />
                    <p>Loading report details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-content">
                <div className="error-container">
                    <div className="error-icon">
                        <img src={warning} alt="warning-icon" className="user-report-detail-icons" />️
                    </div>
                    <h3>{error}</h3>
                    <button onClick={handleBack} className="btn-primary">Go Back</button>
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
    const position = hasValidCoords ? [latNum, lngNum] : [-6.2088, 106.8456];

    const statusClass = normalizeStatus(report.status || '');

    return (
        <div className="main-content report-detail-container">
            <button onClick={handleBack} className="back-button" aria-label="Go back">
                ← Back
            </button>

            <div className="report-detail-card">
                <h1>Report #{report.id}</h1>
                <h2>{report.title}</h2>

                <div className="report-meta">
                    <span className={`status-badge ${statusClass}`}>
                        {report.status}
                    </span>
                    <span className="report-date">
                        Created: {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    {report.updatedAt && (
                        <span className="report-date">
                            Updated: {new Date(report.updatedAt).toLocaleDateString()}
                        </span>
                    )}
                </div>

                <div className="report-section">
                    <h3>
                        <img src={description} alt="description-icon" className="user-report-detail-icons" />
                        Description
                    </h3>
                    <p>{report.description}</p>
                </div>

                {report.category && (
                    <div className="report-section">
                        <h3>
                            <img src={category} alt="category-icon" className="user-report-detail-icons" />️
                            Category
                        </h3>
                        <p>{report.category}</p>
                    </div>
                )}

                {report.officerName && (
                    <div className="report-section">
                        <h3>
                            <img src={assignedOfficer} alt="assigned-officer-icon" className="user-report-detail-icons" />
                            Assigned Officer
                        </h3>
                        <p>{report.officerName}</p>
                    </div>
                )}

                {/* Media Section - Images */}
                {report.imageUrls && report.imageUrls.length > 0 && (
                    <div className="report-section media-section">
                        <h3>
                            <img src={images} alt="images-icon" className="user-report-detail-icons" />
                            Images
                        </h3>
                        <div className="media-grid">
                            {report.imageUrls.map((url, idx) => (
                                <div
                                    key={idx}
                                    className="media-item"
                                    onClick={() => openLightbox(url)}
                                >
                                    <img src={url} alt={`Report evidence ${idx + 1}`} />
                                    <div className="media-overlay">
                                        <span>
                                            <img src={view} alt="view-icon" className="user-report-detail-icons" />
                                            View
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Media Section - Video */}
                {report.videoUrl && (
                    <div className="report-section media-section">
                        <h3>
                            <img src={video} alt="video-icon" className="user-report-detail-icons" />
                            Video
                        </h3>
                        <div className="video-container">
                            <video controls width="100%" src={report.videoUrl} />
                        </div>
                    </div>
                )}

                {/* Location Section */}
                <div className="report-section">
                    <h3>
                        <img src={location} alt="ocation-icon" className="user-report-detail-icons" />
                        Location
                    </h3>
                    {report.address ? (
                        <div className="location-info">
                            <p>
                                <strong>Address:</strong> {report.address.streetName} {report.address.houseNumber}
                            </p>
                            <p>
                                <strong>City:</strong> {report.address.city}, {report.address.province}
                            </p>
                            {hasValidCoords && (
                                <p className="coordinates">
                                    <img src={location} alt="ocation-icon" className="user-report-detail-icons" />
                                    {latNum.toFixed(6)}, {lngNum.toFixed(6)}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p>No location information available</p>
                    )}
                </div>

                {/* Map Section */}
                <div className="report-section map-section">
                    <h3>
                        <img src={mapViews} alt="map-view-icon" className="user-report-detail-icons" />
                        Map View</h3>
                    <div className="map-container">
                        <MapContainer
                            key={`${position[0]}-${position[1]}`}
                            center={position}
                            zoom={15}
                            className="leaflet-map"
                            whenCreated={(map) => {
                                setTimeout(() => map.invalidateSize(), 200);
                                const onResize = () => map.invalidateSize();
                                window.addEventListener('resize', onResize);
                                map.on('unload', () => window.removeEventListener('resize', onResize));
                            }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={position}>
                                <Popup>
                                    <div className="popup-content">
                                        <img src={location} alt="report-location-icon" className="user-report-detail-icons" />
                                        <strong>Report Location</strong><br />
                                        {report.address?.streetName ? `${report.address.streetName} ${report.address.houseNumber || ''}, ` : ''}
                                        {report.address?.city ? `${report.address.city}, ` : ''}
                                        {report.address?.province || ''}
                                    </div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </div>

                {/* Status History Section */}
                {report.statusHistory && report.statusHistory.length > 0 && (
                    <div className="report-section status-history">
                        <h3>
                            <img src={statusHistory} alt="report-status-icon" className="user-report-detail-icons" />
                            Status History
                        </h3>
                        <div className="timeline">
                            {report.statusHistory.map((s, i) => {
                                const sClass = normalizeStatus(s.status);
                                return (
                                    <div key={i} className="timeline-item">
                                        <div className="timeline-marker" />
                                        <div className="timeline-content">
                                            <span className={`status-label ${sClass}`}>
                                                {s.status}
                                            </span>
                                            {s.notes && <p className="status-notes">{s.notes}</p>}
                                            {s.resolvedPhotoUrl && (
                                                <div className="resolution-photo-container">
                                                    <img
                                                        src={s.resolvedPhotoUrl}
                                                        alt={`Resolution for ${s.status}`}
                                                        className="resolution-photo"
                                                        onClick={() => openLightbox(s.resolvedPhotoUrl)}
                                                    />
                                                    <div className="photo-caption">Resolution Photo</div>
                                                </div>
                                            )}
                                            <div className="status-meta">
                                                <span>
                                                    <img src={updatedBy} alt="updated-by-icon" className="user-report-detail-icons" />
                                                    {s.updatedBy || 'System'}
                                                </span>
                                                <span>
                                                    <img src={timestamp} alt="timestamp-icon" className="user-report-detail-icons" />
                                                    {s.timestamp ? new Date(s.timestamp).toLocaleString() : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox for images */}
            {lightboxImage && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={closeLightbox} aria-label="Close image preview">
                            ✕
                        </button>
                        <img src={lightboxImage} alt="Full size preview" className="lightbox-image" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserReportDetail;