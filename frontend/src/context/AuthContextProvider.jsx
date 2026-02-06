// src/context/AuthContextProvider.jsx
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext.jsx"; // Importeer de context uit het andere bestand

function AuthContextProvider({ children }) {
    const [auth, setAuth] = useState({
        isAuthenticated: false,
        user: null,
        role: null,
        token: null,
        loading: true,
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem("token");
                    setAuth({ isAuthenticated: false, user: null, role: null, token: null, loading: false });
                    return;
                }
                setAuth({
                    isAuthenticated: true,
                    user: decoded,
                    role: decoded.role || decoded.authorities?.[0],
                    token,
                    loading: false,
                });
            } catch (error) {
                console.error("Auth error:", error);
                localStorage.removeItem("token");
                setAuth({ isAuthenticated: false, user: null, role: null, token: null, loading: false });
            }
        } else {
            setAuth(prev => ({ ...prev, loading: false }));
        }
    }, []);

    function login(token, user) {
        localStorage.setItem("token", token);
        setAuth({
            isAuthenticated: true,
            user,
            role: user.userRole || user.role,
            token,
            loading: false,
        });
    }

    function logout() {
        localStorage.removeItem("token");
        setAuth({ isAuthenticated: false, user: null, role: null, token: null, loading: false });
    }

    const contextValue = {
        ...auth,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {!auth.loading && children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;