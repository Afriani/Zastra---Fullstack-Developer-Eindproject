// src/pages/OfficerDashboard/OfficerProfile.jsx
import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance'; // ✅ replaced axios

import '../../css/OFFICER DASHBOARD/officerprofile.css';

// Icon
import cameraIcon from "../../assets/pictures/user-report-detail/images.png";

function OfficerProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [cacheBustedAvatarUrl, setCacheBustedAvatarUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const fileInputRef = useRef(null);

    // Reusable fetch profile function
    const fetchProfile = async () => {
        try {
            // ✅ No localhost, no manual auth header
            const res = await axiosInstance.get('/api/users/profile');
            setUser(res.data);
            setCacheBustedAvatarUrl(null);
            console.log("Profile loaded:", res.data);
        } catch (err) {
            console.error('Profile fetch error:', err);
            setError('Failed to load profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Greeting logic
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    const displayValue = (value) => value || '';

    const getAvatarSrc = () => {
        if (avatarPreview) return avatarPreview;
        if (cacheBustedAvatarUrl) return cacheBustedAvatarUrl;
        if (user?.avatarUrl) return user.avatarUrl;
        return "https://placehold.co/120x120?text=No+Img";
    };

    // Cleanup object URL on unmount
    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Only JPG, PNG, or WebP images are allowed.');
            e.target.value = '';
            return;
        }
        if (file.size > 5_000_000) {
            alert('File size exceeds 5MB limit.');
            e.target.value = '';
            return;
        }

        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleAvatarUpload = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) { alert('No file selected.'); return; }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            // ✅ No localhost, no manual auth header (Content-Type set automatically for FormData)
            const res = await axiosInstance.post('/api/media/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setUser((prev) => ({ ...prev, avatarUrl: res.data.url }));
            setCacheBustedAvatarUrl(res.data.url + '?t=' + new Date().getTime());
            setAvatarPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            alert('Avatar uploaded successfully.');
        } catch (err) {
            console.error('Avatar upload error:', err);
            alert('Failed to upload avatar.');
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setUser(prev => ({
                ...prev,
                address: { ...(prev?.address || {}), [addressField]: value }
            }));
        } else {
            setUser(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                postalCode: user.address?.postalCode,
                streetName: user.address?.streetName,
                houseNumber: user.address?.houseNumber,
                city: user.address?.city,
                province: user.address?.province
            };

            // ✅ No localhost, no manual auth header
            await axiosInstance.put('/api/users/profile', payload);
            alert('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel — reload original data
            setLoading(true);
            fetchProfile().then(() => {
                setAvatarPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            });
        }
        setIsEditing(!isEditing);
    };

    if (loading) return <div className="dashboard"><h2>Loading profile...</h2></div>;
    if (error) return <div className="dashboard"><h2>Profile</h2><p>{error}</p></div>;
    if (!user) return <div className="dashboard"><h2>Profile</h2><p>No profile found.</p></div>;

    return (
        <div className="dashboard">
            <div className="main-content">
                <div className="officer-profile-page">
                    <h2>Profile</h2>
                </div>

                <div className="cards-container">
                    <div className="officer-picture">
                        <button className="edit-btn" onClick={handleEditToggle}>
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>

                        <div className="avatar-container" aria-hidden={false}>
                            <img
                                key={getAvatarSrc()}
                                src={getAvatarSrc()}
                                alt="Profile"
                                className="avatar"
                                onLoad={() => console.log("Avatar loaded:", getAvatarSrc())}
                                onError={(e) => {
                                    console.warn("Avatar failed, fallback to placeholder:", e.target.src);
                                    e.target.src = "https://placehold.co/120x120?text=No+Img";
                                }}
                            />

                            <button
                                type="button"
                                className="upload-officer-avatar-btn"
                                onClick={() => fileInputRef.current?.click()}
                                aria-label="Upload new avatar"
                                title="Upload new avatar"
                            >
                                <img src={cameraIcon} alt="camera-icon" className="officer-profile-icons" />️
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="avatar-file-input-hidden"
                            />
                        </div>

                        <div>
                            <h3>{greeting}, {user.firstName || user.name}</h3>
                            <p>Joined since: {new Date(user.createdAt).toLocaleDateString()}</p>

                            {avatarPreview && (
                                <div className="save-avatar-container">
                                    <button
                                        className="save-avatar-btn"
                                        onClick={handleAvatarUpload}
                                        disabled={uploading}
                                    >
                                        {uploading ? 'Uploading...' : 'Save Avatar'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="profile-card">
                        <h3>Account Info</h3>
                        <div className="account-info">
                            <label>First Name</label>
                            <input type="text" name="firstName" value={displayValue(user.firstName)}
                                   readOnly={!isEditing} onChange={handleInputChange}
                                   className={isEditing ? 'editable' : ''} />

                            <label>Last Name</label>
                            <input type="text" name="lastName" value={user.lastName || ''}
                                   readOnly={!isEditing} onChange={handleInputChange}
                                   className={isEditing ? 'editable' : ''} />

                            <label>Email</label>
                            <input type="email" name="email" value={user.email || ''}
                                   readOnly={!isEditing} onChange={handleInputChange}
                                   className={isEditing ? 'editable' : ''} />

                            <label>Phone</label>
                            <input type="tel" name="phoneNumber" value={user.phoneNumber || ''}
                                   readOnly={!isEditing} onChange={handleInputChange}
                                   className={isEditing ? 'editable' : ''} />
                        </div>
                    </div>

                    {/* Residential Address */}
                    <div className="profile-card">
                        <h3>Residential Address</h3>
                        <div className="residential-address">
                            <label>Street</label>
                            <input type="text" name="address.streetName" value={user.address?.streetName || ''}
                                   readOnly={!isEditing} onChange={handleInputChange}
                                   className={isEditing ? 'editable' : ''} />

                            <label>House Number</label>
                            <input type="text" name="address.houseNumber" value={user.address?.houseNumber || ''}
                                   readOnly={!isEditing} onChange={handleInputChange}
                                   className={isEditing ? 'editable' : ''} />

                            <label>Postcode</label>
                            <input type="text" name="address.postalCode" value={user.address?.postalCode || ''}
                                   readOnly={!isEditing} onChange={handleInputChange}
                                   className={isEditing ? 'editable' : ''} />

                            <label>City</label>
                            <input type="text" name="address.city" value={user.address?.city || ''}
                                   readOnly={!isEditing} onChange={handleInputChange}
                                   className={isEditing ? 'editable' : ''} />

                            <label>Province</label>
                            <input type="text" name="address.province" value={user.address?.province || ''}
                                   readOnly={!isEditing} onChange={handleInputChange}
                                   className={isEditing ? 'editable' : ''} />
                        </div>

                        {isEditing && (
                            <button className="save-btn" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OfficerProfile;