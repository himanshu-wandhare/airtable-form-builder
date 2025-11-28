import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import ResponseStats from "../components/ResponseStats";

export default function ViewResponses() {
    const [responses, setResponses] = useState([]);
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const { formId } = useParams();

    useEffect(() => {
        fetchData();
    }, [formId]);

    const fetchData = async () => {
        try {
            const [formRes, responsesRes] = await Promise.all([
                axios.get(`/forms/${formId}`),
                axios.get(`/responses/${formId}`),
            ]);
            setForm(formRes.data);
            setResponses(responsesRes.data);
        } catch (error) {
            toast.error("Failed to fetch responses");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    const handleDelete = async (responseId) => {
        if (window.confirm("Are you sure you want to delete this response?")) {
            try {
                await axios.delete(`/responses/single/${responseId}`);
                toast.success("Response deleted successfully");
                setResponses(responses.filter((r) => r._id !== responseId));
            } catch (error) {
                toast.error("Failed to delete response");
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
            <div className="mb-8">
                <Link
                    to="/"
                    className="text-indigo-600 hover:text-indigo-800 mb-2 inline-block"
                >
                    ← Back to Dashboard
                </Link>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {form?.title}
                        </h1>
                        <p className="text-gray-600 mt-1">Form Responses</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link
                            to={`/analytics/${formId}`}
                            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                        >
                            📊 Analytics
                        </Link>
                        <Link
                            to={`/forms/${formId}/export`}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                            📥 Export
                        </Link>
                    </div>
                </div>
            </div>

            <ResponseStats responses={responses} form={form} />

            {responses.length === 0 ? (
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                    </svg>
                    <p className="text-gray-600 text-lg mt-4">
                        No responses yet
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        Share your form to start collecting responses
                    </p>
                    <button
                        onClick={() => {
                            const shareUrl = `${window.location.origin}/form/${formId}`;
                            navigator.clipboard.writeText(shareUrl);
                            toast.success("Form link copied to clipboard!");
                        }}
                        className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                    >
                        📋 Copy Form Link
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Submission ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Answers Preview
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {responses.map((response) => (
                                <tr
                                    key={response._id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                        {response._id.slice(-8)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(response.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                response.deletedInAirtable
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-green-100 text-green-800"
                                            }`}
                                        >
                                            {response.deletedInAirtable
                                                ? "Deleted"
                                                : "Active"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="max-w-md truncate">
                                            {Object.entries(response.answers)
                                                .slice(0, 2)
                                                .map(([key, value]) => (
                                                    <span
                                                        key={key}
                                                        className="mr-3"
                                                    >
                                                        <strong>{key}:</strong>{" "}
                                                        {JSON.stringify(
                                                            value
                                                        ).slice(0, 30)}
                                                        {JSON.stringify(value)
                                                            .length > 30
                                                            ? "..."
                                                            : ""}
                                                    </span>
                                                ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            to={`/forms/${formId}/responses/${response._id}`}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(response._id)
                                            }
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
