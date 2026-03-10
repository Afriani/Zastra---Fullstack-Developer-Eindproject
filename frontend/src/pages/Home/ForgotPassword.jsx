import '../../css/HOME/forgotpassword.css';

import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance'; // ✅ replaced axios

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            // ✅ No localhost, no raw axios
            await axiosInstance.post('/api/auth/forgot-password', { email });

            setMessage(
                'If this email is registered, a password reset link has been sent.'
            );
        } catch (err) {
            console.error(err);
            setError('Failed to send reset email. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <h2 className="forgot-password-title">Forgot Password</h2>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
        </div>
    );
}

export default ForgotPassword;