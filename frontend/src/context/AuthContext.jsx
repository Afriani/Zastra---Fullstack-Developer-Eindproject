import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext(null);

function AuthContextProvider({ children }) {
    const [auth, setAuth] = useState({
        isAuthenticated: false,
        user: null,
        role: null,
        token: null,
        loading: true,
    });

    // Run once when app loads
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                const decoded = jwtDecode(token);

                setAuth({
                    isAuthenticated: true,
                    user: decoded,
                    role: decoded.role || decoded.authorities?.[0],
                    token,
                    loading: false,
                });
            } catch {
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
        setAuth({
            isAuthenticated: false,
            user: null,
            role: null,
            token: null,
            loading: false,
        });
    }

    return (
        <AuthContext.Provider value={{ ...auth, login, logout }}>
            {!auth.loading && children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;