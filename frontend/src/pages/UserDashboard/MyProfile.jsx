import React, { useEffect, useState } from 'react';
import axiosInstance from "../../api/axiosInstance"; // ✅ replaced axios
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

    const fetchProfile = async () => {
        try {
            const res = await axiosInstance.get("/api/users/profile"); // ✅ backend auto-handles token
            setUser(res.data);
            setCacheBustedAvatarUrl(null);
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
    const greeting =
        hour < 12 ? "Good morning" :
            hour < 18 ? "Good afternoon" :
                "Good evening";

    const displayValue = (value) => value || "Not provided";

    const getAvatarSrc = () => {
        if (avatarPreview) return avatarPreview;
        if (cacheBustedAvatarUrl) return cacheBustedAvatarUrl;
        if (user?.avatarUrl) return user.avatarUrl;
        return "https://placehold.co/120x120?text=No+Img";
    };

    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
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

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            const res = await axiosInstance.post(
                "/api/media/avatar",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            setUser((prev) => ({ ...prev, avatarUrl: res.data.url }));
            setCacheBustedAvatarUrl(res.data.url + "?t=" + Date.now());
            setAvatarPreview(null);
            fileInput.value = "";
        } catch (err) {
            console.error("Avatar upload error:", err);
            alert("Failed to upload avatar.");
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith("address.")) {
            const addressField = name.split(".")[1];
            setUser((prev) => ({
                ...prev,
                address: { ...prev.address, [addressField]: value },
            }));
        } else {
            setUser((prev) => ({ ...prev, [name]: value }));
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
                province: user.address?.province,
            };

            await axiosInstance.put("/api/users/profile", payload); // ✅ auto-token

            alert("✅ Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            console.error("Save error:", err);
            alert("❌ Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            fetchProfile(); // Reset unsaved edits
        }
        setIsEditing(!isEditing);
    };

    if (loading) return <div className="dashboard"><h2>Loading profile...</h2></div>;
    if (error) return <div className="dashboard"><h2>Profile</h2><p>{error}</p></div>;
    if (!user) return <div className="dashboard"><h2>Profile</h2><p>No profile found.</p></div>;

    return (
        <div className="dashboard">

            <div className="main-content">
                <div className="profile-page">
                    <h2>Profile</h2>
                </div>

                <div className="cards-container">
                    <button className="edit-btn" onClick={handleEditToggle}>
                        {isEditing ? "Cancel" : "Edit Profile"}
                    </button>

                    <div className="user-picture">
                        <div className="avatar-container">
                            <img
                                key={getAvatarSrc()}
                                src={getAvatarSrc()}
                                alt="Profile"
                                className="avatar"
                            />

                            <button
                                className="upload-user-avatar-btn"
                                onClick={() => document.querySelector('input[type="file"]').click()}
                            >
                                📷
                            </button>

                            <input
                                type="file"
                                accept="image/*"
                                className="avatar-file-input"
                                onChange={handleAvatarChange}
                            />
                        </div>

                        <div>
                            <h3>{greeting}, {user.firstName}</h3>
                            <p>Joined since: {new Date(user.createdAt).toLocaleDateString()}</p>

                            {avatarPreview && (
                                <div className="avatar-preview-actions">
                                    <button onClick={handleAvatarUpload} disabled={uploading}>
                                        {uploading ? "Uploading..." : "Save Avatar"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="profile-card">
                        <h3>Account Info</h3>
                        <div className="account-info">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={user.firstName || ""}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? "editable" : ""}
                            />

                            <label>Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={user.lastName || ""}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? "editable" : ""}
                            />

                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={user.email || ""}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? "editable" : ""}
                            />

                            <label>Phone</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={user.phoneNumber || ""}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? "editable" : ""}
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
                                value={user.address?.streetName || ""}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? "editable" : ""}
                            />

                            <label>House Number</label>
                            <input
                                type="text"
                                name="address.houseNumber"
                                value={user.address?.houseNumber || ""}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? "editable" : ""}
                            />

                            <label>Postcode</label>
                            <input
                                type="text"
                                name="address.postalCode"
                                value={user.address?.postalCode || ""}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? "editable" : ""}
                            />

                            <label>City</label>
                            <input
                                type="text"
                                name="address.city"
                                value={user.address?.city || ""}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? "editable" : ""}
                            />

                            <label>Province</label>
                            <input
                                type="text"
                                name="address.province"
                                value={user.address?.province || ""}
                                readOnly={!isEditing}
                                onChange={handleInputChange}
                                className={isEditing ? "editable" : ""}
                            />
                        </div>

                        {isEditing && (
                            <button onClick={handleSave} className="save-btn" disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default MyProfile;