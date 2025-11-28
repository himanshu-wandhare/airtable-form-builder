import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ViewSingleResponse() {
    const [response, setResponse] = useState(null);
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const { formId, responseId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [formId, responseId]);

    const fetchData = async () => {
        try {
            const [formRes, responseRes] = await Promise.all([
                axios.get(`/forms/${formId}`),
                axios.get(`/responses/${responseId}`),
            ]);
            setForm(formRes.data);
            setResponse(responseRes.data);
        } catch (error) {
            toast.error("Failed to fetch response");
            navigate(`/forms/${formId}/responses`);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    const getQuestionLabel = (questionKey) => {
        const question = form?.questions.find(
            (q) => q.questionKey === questionKey
        );
        return question?.label || questionKey;
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
                <div className="border-b pb-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Response Details
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>ID: {response._id}</span>
                        <span>•</span>
                        <span>Submitted: {formatDate(response.createdAt)}</span>
                        {response.updatedAt !== response.createdAt && (
                            <>
                                <span>•</span>
                                <span>
                                    Updated: {formatDate(response.updatedAt)}
                                </span>
                            </>
                        )}
                    </div>
                    {response.deletedInAirtable && (
                        <div className="mt-2">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Deleted in Airtable
                            </span>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Answers
                    </h2>
                    {Object.entries(response.answers).map(([key, value]) => (
                        <div key={key} className="border-b pb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {getQuestionLabel(key)}
                            </label>
                            <div className="text-gray-900">
                                {Array.isArray(value) ? (
                                    <ul className="list-disc list-inside">
                                        {value.map((item, idx) => (
                                            <li key={idx}>
                                                {typeof item === "object"
                                                    ? JSON.stringify(item)
                                                    : item}
                                            </li>
                                        ))}
                                    </ul>
                                ) : typeof value === "object" ? (
                                    <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                                        {JSON.stringify(value, null, 2)}
                                    </pre>
                                ) : (
                                    <p className="whitespace-pre-wrap">
                                        {value}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Airtable Record ID
                    </h3>
                    <code className="text-sm bg-gray-100 px-3 py-1 rounded">
                        {response.airtableRecordId}
                    </code>
                </div>
            </div>
        </div>
    );
}
