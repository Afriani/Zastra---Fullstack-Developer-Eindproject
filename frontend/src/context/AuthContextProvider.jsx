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
        const savedUser = localStorage.getItem("user");

        if (token) {
            try {
                const decoded = jwtDecode(token);

                // Check of token verlopen is
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setAuth({ isAuthenticated: false, user: null, role: null, token: null, loading: false });
                    return;
                }

                // Gebruik opgeslagen user of decodeer token
                const user = savedUser ? JSON.parse(savedUser) : decoded;

                setAuth({
                    isAuthenticated: true,
                    user,
                    role: user.userRole || user.role || decoded.role || decoded.authorities?.[0],
                    token,
                    loading: false,
                });
            } catch (error) {
                console.error("Auth error:", error);
                localStorage.removeItem("token");
                localStorage.removeItem("user"); // <<<< NIEUW
                setAuth({ isAuthenticated: false, user: null, role: null, token: null, loading: false });
            }
        } else {
            setAuth(prev => ({ ...prev, loading: false }));
        }

        console.log("Auth loaded from localStorage:", { token, user: savedUser ? JSON.parse(savedUser) : null });

    }, []);

    function login(token, user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
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
        localStorage.removeItem("user");
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



