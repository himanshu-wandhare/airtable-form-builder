export default function ResponseStats({ responses }) {
    const totalResponses = responses.length;
    const activeResponses = responses.filter(
        (r) => !r.deletedInAirtable
    ).length;
    const deletedResponses = responses.filter(
        (r) => r.deletedInAirtable
    ).length;

    const oldestResponse =
        responses.length > 0
            ? new Date(responses[responses.length - 1].createdAt)
            : new Date();
    const daysSinceFirst = Math.max(
        1,
        // eslint-disable-next-line react-hooks/purity
        Math.floor((Date.now() - oldestResponse) / (1000 * 60 * 60 * 24))
    );
    const responsesPerDay = (totalResponses / daysSinceFirst).toFixed(1);
    const _ = responses.slice(0, 5);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">
                    Total Responses
                </div>
                <div className="text-3xl font-bold text-gray-900">
                    {totalResponses}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Active</div>
                <div className="text-3xl font-bold text-green-600">
                    {activeResponses}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Deleted</div>
                <div className="text-3xl font-bold text-red-600">
                    {deletedResponses}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Avg per Day</div>
                <div className="text-3xl font-bold text-indigo-600">
                    {responsesPerDay}
                </div>
            </div>
        </div>
    );
}
