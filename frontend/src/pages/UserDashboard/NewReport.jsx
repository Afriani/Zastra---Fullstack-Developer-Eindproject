import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../api/axiosInstance";   // ✅ replaced axios
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

// Fix Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
});

// Map click sets coords
function LocationPicker({ setCoords, disableFollow }) {
    useMapEvents({
        click(e) {
            disableFollow();
            setCoords(e.latlng);
        }
    });
    return null;
}

// Recenter if follow==true
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

    const [coords, setCoords] = useState({ lat: -6.2383, lng: 106.9756 });
    const [images, setImages] = useState([]);
    const [video, setVideo] = useState(null);

    const [follow, setFollow] = useState(false);
    const watchIdRef = useRef(null);

    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const reverseTimeoutRef = useRef(null);

    // Watch GPS only when enabled
    useEffect(() => {
        if (!navigator.geolocation) return;

        if (follow) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => {
                    console.warn("GPS error", err);
                    if (err.code === 1) {
                        alert("Location permission denied.");
                        setFollow(false);
                    }
                },
                { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
            );
        } else if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [follow]);

    // Fetch categories (no localhost, no token manually)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axiosInstance.get("/api/reports/categories");
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

    // Reverse geocode with debounce
    useEffect(() => {
        if (reverseTimeoutRef.current) clearTimeout(reverseTimeoutRef.current);

        reverseTimeoutRef.current = setTimeout(() => {
            reverseGeocode(coords.lat, coords.lng);
        }, 600);

        return () => clearTimeout(reverseTimeoutRef.current);
    }, [coords]);

    const reverseGeocode = async (lat, lon) => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;
            const res = await fetch(url, { headers: { Accept: "application/json" } });
            if (!res.ok) return;

            const data = await res.json();
            const addr = data.address || {};

            setAddress({
                postalCode: addr.postcode || "",
                streetName: addr.road || addr.neighbourhood || "",
                houseNumber: addr.house_number || "",
                city: addr.city || addr.town || addr.village || "",
                province: addr.state || "",
            });
        } catch (err) {
            console.error("Reverse geocode error:", err);
        }
    };

    const formatCategoryName = (cat) =>
        cat.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleAddressChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
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

    // Submit report
    const handleSubmit = async (e) => {
        e.preventDefault();

        const reportData = {
            title: form.title,
            description: form.description,
            category: form.category,
            latitude: coords.lat,
            longitude: coords.lng,
            address: { ...address },
        };

        const formData = new FormData();
        formData.append("report", new Blob([JSON.stringify(reportData)], { type: "application/json" }));
        images.forEach((img) => formData.append("images", img));
        if (video) formData.append("video", video);

        try {
            // ✅ No localhost, no headers: axiosInstance handles token + base URL
            const res = await axiosInstance.post("/api/reports", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("Report submitted successfully!");

            // Reset fields
            setForm({ title: "", description: "", category: "OTHER" });
            setAddress({ postalCode: "", streetName: "", houseNumber: "", city: "", province: "" });
            setImages([]);
            setVideo(null);
            setCoords({ lat: -6.2383, lng: 106.9756 });
            setFollow(false);

        } catch (err) {
            console.error("Submit error:", err);
            alert("Failed to submit report.");
        }
    };

    return (
        <div className="dashboard">
            <div className="main-content">
                <h2>Submit New Report</h2>

                <form onSubmit={handleSubmit} className="report-form">
                    <label>Title</label>
                    <input type="text" name="title" value={form.title} onChange={handleChange} required />

                    <label>Description</label>
                    <textarea name="description" rows="4" value={form.description} onChange={handleChange} required />

                    <label>Category</label>
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        disabled={categoriesLoading}
                        required
                    >
                        {categoriesLoading
                            ? <option>Loading...</option>
                            : categories.map((c) => (
                                <option key={c} value={c}>{formatCategoryName(c)}</option>
                            ))}
                    </select>

                    <h3>Address (Auto-filled)</h3>
                    <div className="address-group">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Postal Code</label>
                                <input type="text" name="postalCode" value={address.postalCode} onChange={handleAddressChange} />
                            </div>
                            <div className="form-group">
                                <label>House Number</label>
                                <input type="text" name="houseNumber" value={address.houseNumber} onChange={handleAddressChange} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Street Name</label>
                                <input type="text" name="streetName" value={address.streetName} onChange={handleAddressChange} />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" name="city" value={address.city} onChange={handleAddressChange} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group full-width">
                                <label>Province</label>
                                <input type="text" name="province" value={address.province} onChange={handleAddressChange} />
                            </div>
                        </div>
                    </div>

                    <div className="map-control-row">
                        <h3 className="map-title">Pick Location on Map</h3>

                        <label className="follow-toggle">
                            <input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} />
                            Follow my location
                        </label>
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

                    <label>Upload Video (max 1)</label>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} />

                    <button type="submit" className="btn-submit" disabled={categoriesLoading}>
                        {categoriesLoading ? "Loading..." : "Submit Report"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default NewReport;