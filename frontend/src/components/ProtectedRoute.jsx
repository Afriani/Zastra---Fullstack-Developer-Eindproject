import React, { useContext } from "react";
import { Navigate } from "react-router-dom";

// Pad controleren!
import { AuthContext } from "../context/AuthContext.jsx";

function ProtectedRoute({ children }) {
    // HAAL STATUS UIT CONTEXT I.P.V. LOCALSTORAGE
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;


