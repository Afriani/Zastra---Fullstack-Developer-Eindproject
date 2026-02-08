import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/USER DASHBOARD/announcementdetail.css';

const AnnouncementDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `http://localhost:8080/api/announcements/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setAnnouncement(response.data);
            } catch (error) {
                if (error.response?.status === 404) {
                    setError('Announcement not found or has been deleted.');
                } else {
                    console.error('Failed to fetch announcement:', error);
                    setError('Failed to load announcement.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncement();
    }, [id]);

    if (loading) return <div className="loading">Loading announcement...</div>;

    if (error) return <div className="error">{error}</div>;

    if (!announcement) return <div className="error">Announcement not found</div>;

    return (
        <div className="announcement-detail-page">
            <button onClick={() => navigate('/dashboard')} className="back-button">
                ← Back to Dashboard
            </button>

            <div className="announcement-card">
                <h1>{announcement.title}</h1>
                <p className="announcement-meta">
                    Posted on {new Date(announcement.createdAt).toLocaleString()}
                </p>
                {announcement.isUrgent && (
                    <span className="urgent-badge">Urgent</span>
                )}
                <div className="announcement-content">
                    {announcement.content}
                </div>
            </div>
        </div>
    );
};

export default AnnouncementDetail;