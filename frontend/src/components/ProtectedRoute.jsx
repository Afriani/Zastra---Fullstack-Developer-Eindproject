import React from "react";

import { Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

// Wrapper to check if a user is logged in
function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = jwtDecode(token);

        // ✅ Check expiration (exp is in seconds, convert to ms)
        if (decoded.exp * 1000 < Date.now()) {
            // Token expired
            localStorage.removeItem("token");
            return <Navigate to="/login" replace />;
        }

        // ✅ Valid token → allow rendering
        return children;

    } catch (err) {
        console.error("❌ Invalid token:", err);
        localStorage.removeItem("token");
        return <Navigate to="/login" replace />;
    }
}

export default ProtectedRoute;