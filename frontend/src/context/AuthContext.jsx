import { createContext, useState, useEffect } from "react";
import axios from "axios";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

const API_URL = "http://localhost:5000/api";

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const { data } = await axios.get("/auth/me");
            setUser(data);
        } catch (error) {
            localStorage.removeItem("token");
            delete axios.defaults.headers.common["Authorization"];
        } finally {
            setLoading(false);
        }
    };

    const login = (token, userData) => {
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
