import React from "react";
import { Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

// Wrapper that checks token role before rendering
function RoleRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");

    if (!token) {
        // 🚫 No token => go back to login
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = jwtDecode(token);

        // 🚀 Extract roles from JWT (default empty array if none)
        const roles = decoded.roles || [];

        // ✅ Normalize roles: strip "ROLE_" prefix if present
        const normalizedRoles = roles.map(r =>
            r.startsWith("ROLE_") ? r.substring(5) : r
        );

        console.log("User roles:", roles, "→ Normalized:", normalizedRoles);

        // ✅ Check if user has an allowed role
        const hasRole = normalizedRoles.some(role =>
            allowedRoles.includes(role)
        );

        return hasRole ? children : <Navigate to="/403" replace />;
    } catch (err) {
        console.error("❌ Error decoding token", err);
        return <Navigate to="/login" replace />;
    }
}

export default RoleRoute;