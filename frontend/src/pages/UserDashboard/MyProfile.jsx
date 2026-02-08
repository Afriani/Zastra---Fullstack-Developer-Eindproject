import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/USER DASHBOARD/myprofile.css';

function MyProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [cacheBustedAvatarUrl, setCacheBustedAvatarUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No token found. Please log in.');
                    setLoading(false);
                    return;
                }

                const res = await axios.get('http://localhost:8080/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUser(res.data);
                setCacheBustedAvatarUrl(null); // Clear cache buster on fresh load
                console.log("✅ Profile loaded:", res.data);

            } catch (err) {
                console.error('Profile fetch error:', err);
                setError('Failed to load profile. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Greeting logic
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    const displayValue = (value) => value || 'Not provided';

    // Use cache-busted avatar URL state for stable image URL
    const getAvatarSrc = () => {
        if (avatarPreview) return avatarPreview;
        if (cacheBustedAvatarUrl) return cacheBustedAvatarUrl;
        if (user?.avatarUrl) return user.avatarUrl;
        return "https://placehold.co/120x120?text=No+Img";
    };

    // Cleanup of object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Only JPG, PNG, or WebP images are allowed.');
            return;
        }
        if (file.size > 5_000_000) {
            alert('File size exceeds 5MB limit.');
            return;
        }

        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleAvatarUpload = async () => {
        const fileInput = document.querySelector('input[type="file"]');
        const file = fileInput?.files[0];
        if (!file) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await axios.post('http://localhost:8080/api/media/avatar', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update user avatarUrl and set cache-busted URL for immediate refresh
            setUser((prev) => ({ ...prev, avatarUrl: res.data.url }));
            setCacheBustedAvatarUrl(res.data.url + '?t=' + new Date().getTime());
            setAvatarPreview(null);
            fileInput.value = ''; // reset input
        } catch (err) {
            console.error('Avatar upload error:', err);
            alert('Failed to upload avatar.');
        } finally {
            setUploading(false);
        }
    };

    // Handle input changes during editing
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setUser(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setUser(prev => ({ ...prev, [name]: value }));
        }
    };

    // Save changes to backend
    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
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

            await axios.put('http://localhost:8080/api/users/profile', payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert('✅ Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            console.error('Save error:', err);
            alert('❌ Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Toggle edit mode
    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing - reload original data and clear cache buster
            const fetchProfile = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get('http://localhost:8080/api/users/profile', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUser(res.data);
                    setCacheBustedAvatarUrl(null);
                } catch (err) {
                    console.error('Reload error:', err);
                }
            };
            fetchProfile();
        }
        setIsEditing(!isEditing);
    };

    if (loading) {
        return <div className="dashboard"><h2>Loading profile...</h2></div>;
    }
    if (error) {
        return <div className="dashboard"><h2>Profile</h2><p>{error}</p></div>;
    }
    if (!user) {
        return <div className="dashboard"><h2>Profile</h2><p>No profile found.</p></div>;
    }

    return (
        <div className="dashboard">

            <div className="main-content">
                <div className="profile-page">
                    <h2>Profile</h2>
                </div>

                <div className="cards-container">
                    <button className="edit-btn" onClick={handleEditToggle}>
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>

                    <div className="user-picture">
                        <div className="avatar-container">
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

                            {/* Visible Upload Button */}
                            <button
                                className="upload-user-avatar-btn"
                                onClick={() => document.querySelector('input[type="file"]').click()}
                                aria-label="Upload new avatar"
                            >
                                📷
                            </button>

                            {/* Hidden file input */}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="avatar-file-input"
                            />
                        </div>

                        <div>
                            <h3>{greeting}, {user.firstName || user.name}</h3>
                            <p>Joined since: {new Date(user.createdAt).toLocaleDateString()}</p>
                            {avatarPreview && (
                                <div className="avatar-preview-actions">
                                    <button onClick={handleAvatarUpload} disabled={uploading}>
                                        {uploading ? 'Uploading...' : 'Save Avatar'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile info cards */}
                    <div className="profile-card">
                        <h3>Account Info</h3>
                        <div className="account-info">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={displayValue(user.firstName)}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? 'editable' : ''}
                            />

                            <label>Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={user.lastName || ''}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? 'editable' : ''}
                            />

                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={user.email || ''}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? 'editable' : ''}
                            />

                            <label>Phone</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={user.phoneNumber || ''}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? 'editable' : ''}
                            />
                        </div>
                    </div>

                    <div className="profile-card">
                        <h3>Residential Address</h3>

                        <div className="residential-address">
                            <label>Street</label>
                            <input
                                type="text"
                                name="address.streetName"
                                value={user.address?.streetName || ''}
                                placeholder={!user.address ? 'Not provided yet' : ''}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? 'editable' : ''}
                            />

                            <label>House Number</label>
                            <input
                                type="text"
                                name="address.houseNumber"
                                value={user.address?.houseNumber || ''}
                                placeholder={!user.address ? 'Not provided yet' : ''}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? 'editable' : ''}
                            />

                            <label>Postcode</label>
                            <input
                                type="text"
                                name="address.postalCode"
                                value={user.address?.postalCode || ''}
                                placeholder={!user.address ? 'Not provided yet' : ''}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? 'editable' : ''}
                            />

                            <label>City</label>
                            <input
                                type="text"
                                name="address.city"
                                value={user.address?.city || ''}
                                placeholder={!user.address ? 'Not provided yet' : ''}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? 'editable' : ''}
                            />

                            <label>Province</label>
                            <input
                                type="text"
                                name="address.province"
                                value={user.address?.province || ''}
                                placeholder={!user.address ? 'Not provided yet' : ''}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? 'editable' : ''}
                            />
                        </div>

                        {isEditing && (
                            <button
                                className="save-btn"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyProfile;


