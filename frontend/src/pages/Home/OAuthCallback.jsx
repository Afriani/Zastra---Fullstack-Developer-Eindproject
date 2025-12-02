import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

function OAuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        console.log("OAuthCallback mounted", { search: window.location.search, hash: window.location.hash });

        // Function to read token from URL query or hash
        const readToken = () => {
            const search = new URLSearchParams(window.location.search);
            let token = search.get("token") || search.get("access_token");

            if (!token && window.location.hash) {
                const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
                token = hashParams.get("token") || hashParams.get("access_token");
            }
            return token;
        };

        const token = readToken();

        if (!token) {
            console.warn("OAuthCallback: no token found in URL, redirecting to /login");
            navigate("/login", { replace: true });
            return;
        }

        // Save token and set axios default Authorization header
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("OAuth token saved and axios header set");

        // Decode token to extract role
        let role = "CITIZEN";
        try {
            const decoded = jwtDecode(token);
            console.log("Decoded JWT:", decoded);

            if (decoded.role) {
                role = decoded.role.toString().toUpperCase();
            } else if (decoded.userRole) {
                role = decoded.userRole.toString().toUpperCase();
            } else if (Array.isArray(decoded.authorities) && decoded.authorities.length > 0) {
                const authority = decoded.authorities[0];
                role = authority.replace("ROLE_", "").toUpperCase();
            } else if (Array.isArray(decoded.roles) && decoded.roles.length > 0) {
                role = decoded.roles[0].toString().toUpperCase();
            }

            console.log("Extracted role:", role);
        } catch (decodeErr) {
            console.warn("Failed to decode JWT in OAuthCallback:", decodeErr);
        }

        // Clean URL to remove token from address bar
        try {
            if (window.history && window.history.replaceState) {
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, cleanUrl);
            }
        } catch (replaceErr) {
            console.warn("Failed to clean URL after OAuth:", replaceErr);
        }

        // Navigate user based on role
        const navigateToRole = (userRole) => {
            console.log("Navigating for role:", userRole);
            if (userRole === "ADMIN" || userRole === "ROLE_ADMIN") {
                navigate("/admin", { replace: true });
            } else if (userRole === "OFFICER" || userRole === "ROLE_OFFICER") {
                navigate("/officer", { replace: true });
            } else {
                navigate("/user-dashboard", { replace: true });
            }
        };

        // Fetch user profile to confirm role and redirect accordingly
        axios.get("http://localhost:8080/api/users/profile")
            .then((response) => {
                console.log("Profile fetch successful:", response.data);
                const profileRole = (response.data.userRole || response.data.role || role).toString().toUpperCase();
                navigateToRole(profileRole);
            })
            .catch((fetchErr) => {
                console.warn("Profile fetch failed after OAuth:", fetchErr);
                navigateToRole(role);
            });

    }, [navigate]);

    return (
        <div style={{ padding: 20 }}>
            <h3>Logging you in…</h3>
            <p>If you are not redirected automatically, <button onClick={() => window.location.reload()}>reload</button></p>
        </div>
    );
}

export default OAuthCallback;


