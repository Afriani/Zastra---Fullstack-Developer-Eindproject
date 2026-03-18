import '../../css/HOME/login.css';

// Frontend packages
import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";

// Backend packages
import { jwtDecode } from "jwt-decode";
import axiosInstance from '../../api/axiosInstance'; // ✅ use shared axios instance

// Context import
import { AuthContext } from '../../context/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || ''; // ✅ for OAuth redirects

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        let tempErrors = {};

        // Simple validation
        if (!email) tempErrors.email = 'Email is required';

        if (!password) {
            tempErrors.password = 'Password is required';
        } else if (password.length < 6) {
            tempErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(tempErrors);
        if (Object.keys(tempErrors).length > 0) return;

        setLoading(true);
        setMessage('');
        setErrors({});

        try {
            console.log('Attempting login with:', { email, password: '***' });

            // ✅ Uses axiosInstance; no localhost, no manual base URL
            const response = await axiosInstance.post(
                '/api/auth/login',
                { email, password },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log('Login response:', response.data);

            if (response.data.success && response.data.data && response.data.data.token) {
                const token = response.data.data.token;

                // ✅ SAVE TOKEN FIRST so interceptor can attach it to the next request
                localStorage.setItem("token", token);

                // Optional: decode token for debugging
                try {
                    const decoded = jwtDecode(token);
                    console.log("Decoded JWT:", decoded);
                } catch (decodeErr) {
                    console.warn("Could not decode JWT:", decodeErr);
                }

                // ✅ Get user profile — token is now in localStorage, interceptor will attach it
                const profileResp = await axiosInstance.get('/api/users/profile');

                console.log("Profile response:", profileResp.data);

                const user = profileResp.data;

                // Check email verification
                if (!user.emailVerified) {
                    setErrors({ general: "Please verify your email before logging in." });
                    localStorage.removeItem("token");
                    return;
                }

                // Get role from user object
                const role = (user.userRole || user.role || "").toString().toUpperCase();
                console.log("User role detected:", role);

                // Use AuthContext login
                login(token, user);

                // Navigate based on role
                setTimeout(() => {
                    if (role === "ADMIN" || role === "ROLE_ADMIN") {
                        navigate("/admin");
                    } else if (role === "OFFICER" || role === "ROLE_OFFICER") {
                        navigate("/officer");
                    } else if (
                        role === "USER" || role === "ROLE_USER" ||
                        role === "CITIZEN" || role === "ROLE_CITIZEN"
                    ) {
                        navigate("/user-dashboard");
                    } else {
                        console.log("Unknown role, defaulting to user dashboard");
                        navigate("/user-dashboard");
                    }
                }, 1000);

            } else {
                setErrors({
                    general: response.data.message || "Login failed. Please try again."
                });
            }

        } catch (err) {
            console.error("Login error:", err);

            if (err.response) {
                const errorData = err.response.data;

                if (err.response.status === 401) {
                    setErrors({ general: "Invalid email or password" });
                } else if (err.response.status === 403) {
                    setErrors({ general: "Account not verified. Please check your email." });
                } else if (errorData.message) {
                    setErrors({ general: errorData.message });
                } else {
                    setErrors({ general: "Login failed. Please try again." });
                }
            } else if (err.request) {
                setErrors({ general: "Network error. Please check if the server is running." });
            } else {
                setErrors({ general: "An unexpected error occurred" });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // ✅ use API_BASE_URL instead of localhost
        window.location.href = `${API_BASE_URL}/api/auth/google`;
    };

    const handleFacebookLogin = () => {
        // ✅ use API_BASE_URL instead of localhost
        window.location.href = `${API_BASE_URL}/api/auth/facebook`;
    };

    return (
        <>
            <div className="login">
                <h2>Log In</h2>
                <p className={"Login-subtext"}>
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </div>

            <div className="login-container">
                {message && (
                    <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                {error === "facebook_no_user" && (
                    <div className="message error">
                        No account found with your Facebook email. Please register first or use another login method.
                    </div>
                )}

                {errors.general && (
                    <div className="message error">
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleLogin} className="login-form">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={errors.email ? 'error' : ''}
                        disabled={loading}
                    />
                    {errors.email && <p className="error-text">{errors.email}</p>}

                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className={errors.password ? 'error' : ''}
                        disabled={loading}
                    />
                    {errors.password && <p className="error-text">{errors.password}</p>}

                    <div className="login-options">
                        <label>
                            <input type="checkbox" disabled={loading} /> Remember Me
                        </label>
                        <a href="/forgot-password" className="forgot-link">Forgot Password?</a>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading && <div className="spinner"></div>}
                        <span className="button-text">
                            {loading ? 'Logging in...' : 'Login'}
                        </span>
                    </button>
                </form>

                <div className="login-divider-vertical">
                    <div className="line-vertical"></div>
                    <span>OR</span>
                    <div className="line-vertical"></div>
                </div>

                <div className="social-login">
                    <button
                        className="google-btn"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        Login with Google
                    </button>

                    <button
                        className="facebook-btn"
                        onClick={handleFacebookLogin}
                        disabled={loading}
                    >
                        Login with Facebook
                    </button>
                </div>
            </div>
        </>
    );
}

export default Login;