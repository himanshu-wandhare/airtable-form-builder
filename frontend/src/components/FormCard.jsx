import { Link } from "react-router-dom";

export default function FormCard({ form, onDelete }) {
    const shareUrl = `${window.location.origin}/form/${form._id}`;

    const copyShareLink = () => {
        navigator.clipboard.writeText(shareUrl);
        // You could add a toast notification here
        alert("Share link copied to clipboard!");
    };

    return (
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                    {form.title}
                </h3>
                <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        form.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                >
                    {form.isActive ? "Active" : "Inactive"}
                </span>
            </div>

            <div className="text-sm text-gray-600 mb-4">
                <p>{form.questions.length} questions</p>
                <p>Created {new Date(form.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <Link
                        to={`/form/${form._id}`}
                        className="text-center bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
                    >
                        View Form
                    </Link>
                    <Link
                        to={`/preview/${form._id}`}
                        className="text-center bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                        Preview
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Link
                        to={`/forms/${form._id}/responses`}
                        className="text-center bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 text-sm"
                    >
                        Responses
                    </Link>
                    <Link
                        to={`/edit/${form._id}`}
                        className="text-center bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 text-sm"
                    >
                        Edit
                    </Link>
                </div>

                <button
                    onClick={copyShareLink}
                    className="w-full bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 text-sm"
                >
                    📋 Copy Share Link
                </button>

                <button
                    onClick={() => onDelete(form._id)}
                    className="w-full bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-sm"
                >
                    Delete Form
                </button>
            </div>
        </div>
    );
}
