import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!user) return null;

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <Link
                            to="/"
                            className="text-xl font-bold text-indigo-600"
                        >
                            Airtable Forms
                        </Link>
                        <Link
                            to="/"
                            className="text-gray-700 hover:text-indigo-600"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/create"
                            className="text-gray-700 hover:text-indigo-600"
                        >
                            Create Form
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700">{user.name}</span>
                        <button
                            onClick={handleLogout}
                            className="text-gray-700 hover:text-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
