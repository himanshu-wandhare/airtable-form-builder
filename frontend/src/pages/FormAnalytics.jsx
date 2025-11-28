import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function FormAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const { formId } = useParams();

    const fetchAnalytics = async () => {
        try {
            const { data } = await axios.get(`/analytics/${formId}`);
            setAnalytics(data);
        } catch (error) {
            toast.error("Failed to fetch analytics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [formId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link
                to="/"
                className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
            >
                ← Back to Dashboard
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {analytics.formTitle}
                </h1>
                <p className="text-gray-600 mt-2">Analytics & Insights</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Overview</h2>
                <div className="text-3xl font-bold text-indigo-600">
                    {analytics.totalResponses} Total Responses
                </div>
            </div>

            <div className="space-y-6">
                {Object.entries(analytics.questionAnalytics).map(
                    ([key, data]) => (
                        <div
                            key={key}
                            className="bg-white rounded-lg shadow p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {data.label}
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <div className="text-sm text-gray-600">
                                        Total Answers
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {data.totalAnswers}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">
                                        Unique Answers
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {data.uniqueAnswers.length}
                                    </div>
                                </div>
                            </div>

                            {(data.type === "singleSelect" ||
                                data.type === "multipleSelects") && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Distribution
                                    </h4>
                                    <div className="space-y-2">
                                        {Object.entries(data.distribution)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([value, count]) => {
                                                const percentage = (
                                                    (count /
                                                        data.totalAnswers) *
                                                    100
                                                ).toFixed(1);
                                                return (
                                                    <div
                                                        key={value}
                                                        className="flex items-center"
                                                    >
                                                        <div className="w-32 text-sm text-gray-600 truncate">
                                                            {value}
                                                        </div>
                                                        <div className="flex-1 mx-4">
                                                            <div className="bg-gray-200 rounded-full h-4">
                                                                <div
                                                                    className="bg-indigo-600 h-4 rounded-full"
                                                                    style={{
                                                                        width: `${percentage}%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                        <div className="w-20 text-sm text-gray-600 text-right">
                                                            {count} (
                                                            {percentage}%)
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            {data.type === "singleLineText" &&
                                data.uniqueAnswers.length <= 10 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                                            Sample Answers
                                        </h4>
                                        <ul className="list-disc list-inside text-sm text-gray-600">
                                            {data.uniqueAnswers
                                                .slice(0, 5)
                                                .map((answer, idx) => (
                                                    <li key={idx}>{answer}</li>
                                                ))}
                                        </ul>
                                    </div>
                                )}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
