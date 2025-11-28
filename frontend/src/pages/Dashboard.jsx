import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import FormCard from "../components/FormCard";

export default function Dashboard() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const { data } = await axios.get("/forms");
            setForms(data);
        } catch (error) {
            toast.error("Failed to fetch forms");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (
            window.confirm(
                "Are you sure you want to delete this form? All responses will be kept but the form will be removed."
            )
        ) {
            try {
                await axios.delete(`/forms/${id}`);
                toast.success("Form deleted successfully");
                setForms(forms.filter((f) => f._id !== id));
            } catch (error) {
                toast.error("Failed to delete form");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Forms
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage your Airtable-connected forms
                    </p>
                </div>
                <Link
                    to="/create"
                    className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
                >
                    + Create New Form
                </Link>
            </div>

            {forms.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p className="text-gray-600 text-lg mb-4 mt-4">
                        You haven't created any forms yet.
                    </p>
                    <Link
                        to="/create"
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 inline-block"
                    >
                        Create Your First Form
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map((form) => (
                        <FormCard
                            key={form._id}
                            form={form}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
