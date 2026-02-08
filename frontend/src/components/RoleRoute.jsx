import React, { useContext } from "react";
import { Navigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext.jsx";

function RoleRoute({ children, allowedRoles }) {
    const { isAuthenticated, role, loading } = useContext(AuthContext);

    // Wacht tot Context klaar is met laden
    if (loading) {
        return <div>Loading...</div>;
    }

    // Geen token dan terug naar login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Normaliseer de role - strip "ROLE_" prefix als aanwezig
    const normalizedRole = (role || "")
        .toString()
        .replace(/^ROLE_/, "")
        .toUpperCase();

    console.log("User role from Context:", role, "→ Normalized:", normalizedRole);

    // Check of de gebruiker een toegestane rol heeft
    const hasRole = allowedRoles.includes(normalizedRole);

    return hasRole ? children : <Navigate to="/403" replace />;
}

export default RoleRoute;


