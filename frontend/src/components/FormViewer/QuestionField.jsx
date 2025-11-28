export default function QuestionField({ question, value, onChange, error }) {
    const renderField = () => {
        switch (question.type) {
            case "singleLineText":
                return (
                    <input
                        type="text"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        required={question.required}
                    />
                );

            case "multilineText":
                return (
                    <textarea
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        required={question.required}
                    />
                );

            case "singleSelect":
                return (
                    <select
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        required={question.required}
                    >
                        <option value="">Select an option</option>
                        {question.options?.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );

            case "multipleSelects":
                return (
                    <div className="space-y-2">
                        {question.options?.map((option) => (
                            <label
                                key={option}
                                className="flex items-center space-x-2"
                            >
                                <input
                                    type="checkbox"
                                    checked={(value || []).includes(option)}
                                    onChange={(e) => {
                                        const newValue = e.target.checked
                                            ? [...(value || []), option]
                                            : (value || []).filter(
                                                  (v) => v !== option
                                              );
                                        onChange(newValue);
                                    }}
                                    className="w-4 h-4"
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case "multipleAttachments":
                return (
                    <input
                        type="file"
                        multiple
                        onChange={(e) => {
                            const files = Array.from(e.target.files);
                            onChange(
                                files.map((f) => ({
                                    filename: f.name,
                                    url: URL.createObjectURL(f),
                                }))
                            );
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                        required={question.required}
                    />
                );

            default:
                return (
                    <div className="text-gray-500">Unsupported field type</div>
                );
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {question.label}
                {question.required && (
                    <span className="text-red-600 ml-1">*</span>
                )}
            </label>
            {renderField()}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
