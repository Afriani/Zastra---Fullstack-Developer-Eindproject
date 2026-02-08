import '../../css/HOME/register.css'

import {useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import axios from 'axios';

function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [avatarPreview, setAvatarPreview] = useState(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nationalId: '',
        firstName: '',
        lastName: '',
        dobDay: '',
        dobMonth: '',
        dobYear: '',
        postalCode: '',
        streetName: '',
        houseNumber: '',
        city: '',
        province: '',
        phoneNumber: '',
        gender: '',
        profilePicture: null
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}));
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setErrors(prev => ({...prev, profilePicture: 'Only JPG, PNG, or WebP images are allowed.'}));
            return;
        }
        if (file.size > 5_000_000) {
            setErrors(prev => ({...prev, profilePicture: 'File size exceeds 5MB limit.'}));
            return;
        }

        setErrors(prev => ({...prev, profilePicture: ''}));
        setFormData(prev => ({...prev, profilePicture: file}));
        setAvatarPreview(URL.createObjectURL(file));
    };

    const removeAvatar = () => {
        setFormData(prev => ({...prev, profilePicture: null}));
        setAvatarPreview(null);
        setErrors(prev => ({...prev, profilePicture: ''}));
        const fileInput = document.querySelector('input[name="profilePicture"]');
        if (fileInput) fileInput.value = '';
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (!formData.nationalId) newErrors.nationalId = 'National ID is required';
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.dobDay || !formData.dobMonth || !formData.dobYear) {
            newErrors.dateOfBirth = 'Complete date of birth is required';
        }
        if (!formData.postalCode) newErrors.postalCode = 'Postal code is required';
        if (!formData.streetName) newErrors.streetName = 'Street name is required';
        if (!formData.houseNumber) newErrors.houseNumber = 'House number is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.province) newErrors.province = 'Province is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setMessage('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setMessage('');
        setErrors({});

        try {
            const dateOfBirth = `${formData.dobYear}-${formData.dobMonth.padStart(2, '0')}-${formData.dobDay.padStart(2, '0')}`;
            const genderNormalized = formData.gender.trim();

            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                gender: genderNormalized,
                dateOfBirth,
                nationalId: formData.nationalId,
                postalCode: formData.postalCode,
                streetName: formData.streetName,
                houseNumber: formData.houseNumber,
                city: formData.city,
                province: formData.province
            };

            await axios.post('http://localhost:8080/api/auth/register', payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (formData.profilePicture) {
                try {
                    const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
                        email: formData.email,
                        password: formData.password
                    });
                    const token = loginResponse.data.accessToken;

                    const avatarFormData = new FormData();
                    avatarFormData.append('file', formData.profilePicture);

                    await axios.post('http://localhost:8080/api/media/avatar', avatarFormData, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    setMessage('Registration successful! Profile picture uploaded. Redirecting...');
                } catch {
                    setMessage('Registration ok, but avatar upload failed. Upload later from profile.');
                }
            } else {
                setMessage('Registration successful! Redirecting...');
            }

            setTimeout(() => navigate('/login'), 3000);

        } catch (err) {
            if (err.response) {
                const errorData = err.response.data;
                if (errorData.errors) {
                    setErrors(errorData.errors);
                    setMessage('Please fix the validation errors below');
                } else {
                    setMessage(errorData.message || 'Registration failed');
                }
            } else if (err.request) {
                setMessage('Network error. Please check if the server is running.');
            } else {
                setMessage('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="register">
                <h2>Create your account</h2>
                <p className="register-subtext">Already have an account? <Link to="/login">Log In</Link></p>
            </div>

            <div className="register-container">
                {message && (
                    <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="register-form">

                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="email address"
                        className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}

                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="password"
                        className={errors.password ? 'error' : ''}
                    />
                    {errors.password && <span className="error-text">{errors.password}</span>}

                    <label>Official ID Number</label>
                    <input
                        type="text"
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleChange}
                        required
                        placeholder="National ID (16 digits for Citizen, OFI... for Officer, ADM... for Admin)"
                        className={errors.nationalId ? 'error' : ''}
                    />
                    {errors.nationalId && <span className="error-text">{errors.nationalId}</span>}
                    <small>Tip: Use 16 digits for Citizen, OFI+10digits for Officer, ADM+10digits for Admin</small>

                    {/* Profile Picture Upload */}
                    <label>Profile Picture (Optional)</label>
                    <div className="avatar-upload-section">
                        {avatarPreview ? (
                            <div className="avatar-preview">
                                <img
                                    src={avatarPreview}
                                    alt="Profile Preview"
                                    className="preview-image" />
                                <button
                                    type="button"
                                    onClick={removeAvatar}
                                    className="remove-avatar-btn">
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="avatar-placeholder">
                                <span>No image selected</span>
                                <small>JPG, PNG, or WebP (max 5MB)</small>
                            </div>
                        )}
                        <input
                            type="file"
                            name="profilePicture"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleAvatarChange}
                            className={errors.profilePicture ? 'error' : ''}
                        />
                        {errors.profilePicture && <span className="error-text">{errors.profilePicture}</span>}
                    </div>

                    <label>Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className={errors.gender ? 'error' : ''}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    {errors.gender && <span className="error-text">{errors.gender}</span>}

                    <label>Name</label>
                    <div className="name-group">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className={errors.firstName ? 'error' : ''}
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className={errors.lastName ? 'error' : ''}
                        />
                    </div>
                    {(errors.firstName || errors.lastName) && (
                        <span className="error-text">{errors.firstName || errors.lastName}</span>
                    )}

                    <label>Date of Birth</label>
                    <div className="dob-group">
                        <input
                            type="text"
                            name="dobDay"
                            placeholder="DD"
                            value={formData.dobDay}
                            onChange={handleChange}
                            required
                            maxLength="2"
                            className={errors.dateOfBirth ? 'error' : ''}
                        />
                        <input
                            type="text"
                            name="dobMonth"
                            placeholder="MM"
                            value={formData.dobMonth}
                            onChange={handleChange}
                            required
                            maxLength="2"
                            className={errors.dateOfBirth ? 'error' : ''}
                        />
                        <input
                            type="text"
                            name="dobYear"
                            placeholder="YYYY"
                            value={formData.dobYear}
                            onChange={handleChange}
                            required
                            maxLength="4"
                            className={errors.dateOfBirth ? 'error' : ''}
                        />
                    </div>
                    {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}

                    <label>Address</label>
                    <div className="address-group">
                        <input
                            type="text"
                            name="postalCode"
                            placeholder="Postal Code"
                            value={formData.postalCode}
                            onChange={handleChange}
                            required
                            className={errors.postalCode ? 'error' : ''}
                        />
                        <input
                            type="text"
                            name="streetName"
                            placeholder="Street Name"
                            value={formData.streetName}
                            onChange={handleChange}
                            required
                            className={errors.streetName ? 'error' : ''}
                        />
                        <input
                            type="text"
                            name="houseNumber"
                            placeholder="House Number"
                            value={formData.houseNumber}
                            onChange={handleChange}
                            required
                            className={errors.houseNumber ? 'error' : ''}
                        />
                    </div>
                    {(errors.postalCode || errors.streetName || errors.houseNumber) && (
                        <span className="error-text">
                            {errors.postalCode || errors.streetName || errors.houseNumber}
                        </span>
                    )}

                    <div className="city-province-group">
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            className={errors.city ? 'error' : ''}
                        />
                        <input
                            type="text"
                            name="province"
                            placeholder="Province"
                            value={formData.province}
                            onChange={handleChange}
                            required
                            className={errors.province ? 'error' : ''}
                        />
                    </div>
                    {(errors.city || errors.province) && (
                        <span className="error-text">
                            {errors.city || errors.province}
                        </span>
                    )}

                    <label>Telephone Number</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        placeholder="phone number (e.g., +31612345678)"
                        className={errors.phoneNumber ? 'error' : ''}
                    />
                    {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}

                    <button type="submit" disabled={loading}>
                        {loading && <div className="spinner"></div>}
                        <span className="button-text">
                            {loading ? 'Registering...' : 'Register'}
                        </span>
                    </button>

                </form>
            </div>
        </>
    );
}

export default Register;



