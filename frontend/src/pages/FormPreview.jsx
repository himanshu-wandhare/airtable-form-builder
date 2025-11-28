import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import FormRenderer from "../components/FormViewer/FormRenderer";

export default function FormPreview() {
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const { formId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchForm();
    }, [formId]);

    const fetchForm = async () => {
        try {
            const { data } = await axios.get(`/forms/${formId}`);
            setForm(data);
        } catch (error) {
            toast.error("Failed to load form");
            navigate("/");
        } finally {
            setLoading(false);
        }
    };

    const handlePreviewSubmit = (answers) => {
        console.log("Preview submission:", answers);
        toast.success("This is preview mode - form not actually submitted");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 font-medium">
                    📋 Preview Mode - Submissions will not be saved
                </p>
            </div>

            <div className="bg-white rounded-lg shadow p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    {form.title}
                </h1>
                <FormRenderer
                    form={form}
                    onSubmit={handlePreviewSubmit}
                    submitting={false}
                />
            </div>

            <div className="mt-6 text-center">
                <button
                    onClick={() => navigate("/")}
                    className="text-indigo-600 hover:text-indigo-800"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
}
