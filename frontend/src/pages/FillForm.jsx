import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import FormRenderer from "../components/FormViewer/FormRenderer";

export default function FillForm() {
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { formId } = useParams();

    useEffect(() => {
        fetchForm();
    }, [formId]);

    const fetchForm = async () => {
        try {
            const { data } = await axios.get(`/forms/${formId}`);
            setForm(data);
        } catch (error) {
            toast.error("Failed to load form");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (answers) => {
        setSubmitting(true);
        try {
            await axios.post(`/responses/${formId}`, { answers });
            toast.success("Form submitted successfully!");
            setSubmitted(true);
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to submit form"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="bg-white rounded-lg shadow p-8">
                    <div className="text-green-600 text-6xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Thank you for your submission!
                    </h2>
                    <p className="text-gray-600">
                        Your response has been recorded successfully.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    {form.title}
                </h1>
                <FormRenderer
                    form={form}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                />
            </div>
        </div>
    );
}
