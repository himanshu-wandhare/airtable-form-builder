import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function Login() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    const handleLogin = async () => {
        try {
            const { data } = await axios.get("/auth/airtable");
            window.location.href = data.authUrl;
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Airtable Form Builder
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Create dynamic forms connected to your Airtable bases
                    </p>
                </div>
                <button
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Login with Airtable
                </button>
            </div>
        </div>
    );
}
