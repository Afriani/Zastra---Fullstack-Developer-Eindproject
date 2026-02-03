import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../../css/USER DASHBOARD/newreport.css";

// Fix marker issue in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
});

// Component: listens for map clicks to set coords (and disables follow)
function LocationPicker({ setCoords, disableFollow }) {
    useMapEvents({
        click(e) {
            disableFollow(); // stop following when user manually clicks
            setCoords(e.latlng);
        }
    });
    return null;
}

// Component: recenters map when coords change and follow===true
function Recenter({ coords, follow }) {
    const map = useMap();
    useEffect(() => {
        if (follow && coords) {
            map.setView([coords.lat, coords.lng], map.getZoom(), { animate: true });
        }
    }, [coords, follow, map]);
    return null;
}

function NewReport() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "OTHER",
    });

    const [address, setAddress] = useState({
        postalCode: "",
        streetName: "",
        houseNumber: "",
        city: "",
        province: "",
    });

    // DEFAULT CENTER: Bekasi (Indonesia)
    const [coords, setCoords] = useState({ lat: -6.2383, lng: 106.9756 });
    const [images, setImages] = useState([]);
    const [video, setVideo] = useState(null);

    // Follow user's device location - start as FALSE (Option B)
    const [follow, setFollow] = useState(false);
    const watchIdRef = useRef(null);

    // categories
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // reverse geocode debounce
    const reverseTimeoutRef = useRef(null);

    // Option B: Only watch position when 'follow' is true
    useEffect(() => {
        if (!navigator.geolocation) return;

        if (follow) {
            // Start watching only when user checks the box
            watchIdRef.current = navigator.geolocation.watchPosition(
                (pos) => {
                    setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                (err) => {
                    console.warn("watchPosition error", err);
                    // Optional: alert user if they denied permission
                    if (err.code === 1) {
                        alert("Location access denied. Please enable it in your browser.");
                        setFollow(false);
                    }
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 5000,
                    timeout: 10000,
                }
            );
        } else {
            // Stop watching when unchecked
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        }

        // cleanup on unmount
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        };
    }, [follow]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:8080/api/reports/categories", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCategories(res.data);
            } catch (err) {
                console.error("Failed to load categories:", err);
                setCategories([
                    "ROAD_DAMAGE", "LITTER", "BROKEN_STREETLIGHT", "GRAFFITI",
                    "DAMAGED_SIGN", "FALLEN_TREE", "POTHOLE", "BROKEN_BENCH",
                    "DAMAGED_PLAYGROUND", "ILLEGAL_DUMPING", "OTHER"
                ]);
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Debounced reverse-geocode whenever coords change
    useEffect(() => {
        // clear pending timeout
        if (reverseTimeoutRef.current) {
            clearTimeout(reverseTimeoutRef.current);
        }

        // schedule reverse geocode after a short delay
        reverseTimeoutRef.current = setTimeout(() => {
            reverseGeocode(coords.lat, coords.lng);
        }, 600); // 600ms debounce

        return () => {
            if (reverseTimeoutRef.current) {
                clearTimeout(reverseTimeoutRef.current);
            }
        };
    }, [coords]);

    // Reverse geocoding using OpenStreetMap Nominatim (public service).
    // Note: Nominatim is rate-limited for heavy usage. Consider adding server-side proxy or paid service for production.
    const reverseGeocode = async (lat, lon) => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;
            const res = await fetch(url, {
                headers: {
                    "Accept": "application/json"
                }
            });
            if (!res.ok) {
                console.warn("Reverse geocode failed:", res.status);
                return;
            }
            const data = await res.json();
            const addr = data.address || {};

            // Map nominatim fields to our AddressDto
            setAddress((prev) => ({
                postalCode: addr.postcode || prev.postalCode || "",
                streetName: addr.road || addr.pedestrian || addr.cycleway || addr.path || addr.neighbourhood || addr.suburb || "",
                houseNumber: addr.house_number || prev.houseNumber || "",
                city: addr.city || addr.town || addr.village || addr.county || "",
                province: addr.state || addr.region || "",
            }));
        } catch (err) {
            console.error("Reverse geocode error:", err);
        }
    };

    // Helpers
    const formatCategoryName = (category) => {
        return category
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
        // If user manually edits address, stop following to avoid overwriting
        if (follow) setFollow(false);
    };

    const handleImageUpload = (e) => {
        if (e.target.files.length > 3) {
            alert("Maximum 3 images allowed.");
            return;
        }
        setImages([...e.target.files]);
    };

    const handleVideoUpload = (e) => {
        if (e.target.files.length > 1) {
            alert("Only 1 video allowed.");
            return;
        }
        setVideo(e.target.files[0]);
    };

    const disableFollow = () => setFollow(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const reportData = {
            title: form.title,
            description: form.description,
            category: form.category,
            latitude: coords.lat,
            longitude: coords.lng,
            address: {
                postalCode: address.postalCode,
                streetName: address.streetName,
                houseNumber: address.houseNumber,
                city: address.city,
                province: address.province,
            },
        };

        const formData = new FormData();
        formData.append("report", new Blob([JSON.stringify(reportData)], { type: "application/json" }));
        images.forEach((img) => formData.append("images", img));
        if (video) {
            formData.append("video", video);
        }

        try {
            const res = await axios.post("http://localhost:8080/api/reports", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Report submitted successfully!");
            console.log(res.data);

            // Reset form after successful submission
            setForm({
                title: "",
                description: "",
                category: "OTHER",
            });
            setAddress({
                postalCode: "",
                streetName: "",
                houseNumber: "",
                city: "",
                province: "",
            });
            setImages([]);
            setVideo(null);
            // Reset to Bekasi after submission
            setCoords({ lat: -6.2383, lng: 106.9756 });
            setFollow(false);
        } catch (err) {
            console.error("Error submitting report:", err);
            alert("Failed to submit report.");
        }
    };

    return (
        <div className="dashboard">

            <div className="main-content">
                <h2>Submit New Report</h2>

                <form onSubmit={handleSubmit} className="report-form">
                    <label>Title</label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />

                    <label>Description</label>
                    <textarea
                        name="description"
                        rows="4"
                        value={form.description}
                        onChange={handleChange}
                        required
                    ></textarea>

                    <label>Category</label>
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        disabled={categoriesLoading}
                        required
                    >
                        {categoriesLoading ? (
                            <option>Loading categories...</option>
                        ) : (
                            categories.map((category) => (
                                <option key={category} value={category}>
                                    {formatCategoryName(category)}
                                </option>
                            ))
                        )}
                    </select>

                    {/* Address fields (auto-filled from reverse geocode) */}
                    <h3>Address (auto-filled from map)</h3>
                    <div className="address-group">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Postal Code</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={address.postalCode}
                                    onChange={handleAddressChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>House Number</label>
                                <input
                                    type="text"
                                    name="houseNumber"
                                    value={address.houseNumber}
                                    onChange={handleAddressChange}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Street Name</label>
                                <input
                                    type="text"
                                    name="streetName"
                                    value={address.streetName}
                                    onChange={handleAddressChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={address.city}
                                    onChange={handleAddressChange}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label>Province / State</label>
                                <input
                                    type="text"
                                    name="province"
                                    value={address.province}
                                    onChange={handleAddressChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="map-control-row">
                        <h3 className="map-title">Pick Location on Map</h3>
                        <div className="map-control-right">
                            <label className="follow-toggle">
                                <input
                                    type="checkbox"
                                    checked={follow}
                                    onChange={(e) => setFollow(e.target.checked)}
                                />{" "}
                                Follow my location
                            </label>
                        </div>
                    </div>

                    <MapContainer center={[coords.lat, coords.lng]} zoom={15}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[coords.lat, coords.lng]} />
                        <LocationPicker setCoords={setCoords} disableFollow={disableFollow} />
                        <Recenter coords={coords} follow={follow} />
                    </MapContainer>

                    <p><strong>Selected:</strong> {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>

                    <label>Upload Images (max 3)</label>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
                    {images.length > 0 && (
                        <p className="file-info">{images.length} image(s) selected</p>
                    )}

                    <label>Upload Video (max 1, ≤ 90min)</label>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} />
                    {video && (
                        <p className="file-info">Video selected: {video.name}</p>
                    )}

                    <button type="submit" className="btn-submit" disabled={categoriesLoading}>
                        {categoriesLoading ? "Loading..." : "Submit Report"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default NewReport;