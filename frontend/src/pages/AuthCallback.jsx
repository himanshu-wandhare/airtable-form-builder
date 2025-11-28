import { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleCallback = async (code, state) => {
        try {
            const { data } = await axios.post("/auth/callback", {
                code,
                state,
            });
            login(data.token, data.user);
            toast.success("Logged in successfully!");
            navigate("/");
        } catch (error) {
            toast.error("Authentication failed");
            navigate("/login");
        }
    };

    useEffect(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        if (!code) return;

        handleCallback(code, state);
    }, []);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Authenticating...</p>
            </div>
        </div>
    );
}
