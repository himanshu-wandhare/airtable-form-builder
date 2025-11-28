import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ExportResponses() {
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
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const exportToJSON = () => {
        const dataStr = JSON.stringify(responses, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${form.title}_responses_${Date.now()}.json`;
        link.click();
        toast.success("JSON file downloaded!");
    };

    const exportToCSV = () => {
        if (responses.length === 0) {
            toast.error("No responses to export");
            return;
        }

        const allKeys = new Set();
        responses.forEach((response) => {
            Object.keys(response.answers).forEach((key) => allKeys.add(key));
        });

        const headers = [
            "Response ID",
            "Created At",
            "Airtable Record ID",
            ...Array.from(allKeys),
        ];

        const rows = responses.map((response) => {
            const row = [
                response._id,
                new Date(response.createdAt).toISOString(),
                response.airtableRecordId,
            ];

            allKeys.forEach((key) => {
                const value = response.answers[key];
                if (Array.isArray(value)) {
                    row.push(value.join(", "));
                } else if (typeof value === "object") {
                    row.push(JSON.stringify(value));
                } else {
                    row.push(value || "");
                }
            });

            return row;
        });

        const csvContent = [
            headers.join(","),
            ...rows.map((row) =>
                row
                    .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
                    .join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${form.title}_responses_${Date.now()}.csv`;
        link.click();
        toast.success("CSV file downloaded!");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link
                to={`/forms/${formId}/responses`}
                className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
            >
                ← Back to Responses
            </Link>

            <div className="bg-white rounded-lg shadow p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Export Responses
                </h1>

                <div className="mb-6">
                    <p className="text-gray-600">
                        Export {responses.length} response
                        {responses.length !== 1 ? "s" : ""} from "{form.title}"
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={exportToJSON}
                        disabled={responses.length === 0}
                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg
                            className="w-12 h-12 text-indigo-600 mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <span className="text-lg font-semibold text-gray-900">
                            Export as JSON
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                            Machine-readable format
                        </span>
                    </button>

                    <button
                        onClick={exportToCSV}
                        disabled={responses.length === 0}
                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg
                            className="w-12 h-12 text-green-600 mb-3"
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
                        <span className="text-lg font-semibold text-gray-900">
                            Export as CSV
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                            Spreadsheet-compatible
                        </span>
                    </button>
                </div>

                {responses.length === 0 && (
                    <div className="mt-6 text-center text-gray-500">
                        No responses available to export
                    </div>
                )}
            </div>
        </div>
    );
}
