import '../../css/HOME/resetpassword.css';

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    useEffect(() => {
        if (!token) {
            setError('Invalid password reset link.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/auth/reset-password', { token, newPassword: password });
            setMessage(response.data.message || 'Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return <p className="error">Invalid password reset link.</p>;
    }

    return (
        <div className="reset-password-container">
            <h2>Reset Password</h2>
            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
            {!message && (
                <form onSubmit={handleSubmit}>
                    <label htmlFor="new-password">New Password:</label>
                    <input
                        id="new-password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                    />
                    <label htmlFor="confirm-password">Confirm Password:</label>
                    <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default ResetPassword;