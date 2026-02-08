import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.jsx"; // Pas pad aan indien nodig
import "../../css/HOME/oauthcallback.css";

function OAuthCallback() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // NIEUW: gebruik Context

    useEffect(() => {
        console.log("OAuthCallback mounted", {
            search: window.location.search,
            hash: window.location.hash
        });

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

        console.log("OAuth token found:", token.substring(0, 20) + "...");

        // Decode token to extract user info
        let userRole = "USER";
        let decodedUser = null;

        try {
            decodedUser = jwtDecode(token);
            console.log("Decoded JWT:", decodedUser);

            if (decodedUser.role) {
                userRole = decodedUser.role.toString().toUpperCase();
            } else if (decodedUser.userRole) {
                userRole = decodedUser.userRole.toString().toUpperCase();
            } else if (Array.isArray(decodedUser.authorities) && decodedUser.authorities.length > 0) {
                const authority = decodedUser.authorities[0];
                userRole = authority.replace("ROLE_", "").toUpperCase();
            } else if (Array.isArray(decodedUser.roles) && decodedUser.roles.length > 0) {
                userRole = decodedUser.roles[0].toString().toUpperCase();
            }

            console.log("Extracted role:", userRole);
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

        // Fetch user profile to get full user object
        axios.get("http://localhost:8080/api/users/profile", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((response) => {
                console.log("Profile fetch successful:", response.data);
                const user = response.data;

                // NIEUW: Gebruik de login functie uit Context
                login(token, user);

                // Navigate based on role
                const role = (user.userRole || user.role || userRole).toString().toUpperCase();

                if (role === "ADMIN" || role === "ROLE_ADMIN") {
                    navigate("/admin", { replace: true });
                } else if (role === "OFFICER" || role === "ROLE_OFFICER") {
                    navigate("/officer", { replace: true });
                } else {
                    navigate("/user-dashboard", { replace: true });
                }
            })
            .catch((fetchErr) => {
                console.warn("Profile fetch failed after OAuth:", fetchErr);

                // Fallback: gebruik decoded token data
                const fallbackUser = {
                    email: decodedUser?.sub || decodedUser?.email,
                    userRole: userRole,
                    ...decodedUser
                };

                // NIEUW: Gebruik de login functie uit Context (ook bij fallback)
                login(token, fallbackUser);

                // Navigate based on decoded role
                if (userRole === "ADMIN" || userRole === "ROLE_ADMIN") {
                    navigate("/admin", { replace: true });
                } else if (userRole === "OFFICER" || userRole === "ROLE_OFFICER") {
                    navigate("/officer", { replace: true });
                } else {
                    navigate("/user-dashboard", { replace: true });
                }
            });

    }, [navigate, login]); // NIEUW: voeg 'login' toe aan dependencies

    return (
        <div className="oauth-callback-container">
            <h3>Logging you in…</h3>
            <p>
                If you are not redirected automatically,{" "}
                <button type="button" onClick={() => window.location.reload()}>
                    reload
                </button>
            </p>
        </div>
    );
}

export default OAuthCallback;