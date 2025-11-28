import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import BaseSelector from "../components/FormBuilder/BaseSelector";
import TableSelector from "../components/FormBuilder/TableSelector";
import FieldSelector from "../components/FormBuilder/FieldSelector";

export default function CreateForm() {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState("");
    const [selectedBase, setSelectedBase] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedFields, setSelectedFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("Please enter a form title");
            return;
        }

        if (selectedFields.length === 0) {
            toast.error("Please select at least one field");
            return;
        }

        setLoading(true);

        try {
            const formData = {
                title,
                airtableBaseId: selectedBase.id,
                airtableTableId: selectedTable.id,
                questions: selectedFields.map((field, index) => ({
                    questionKey: `q${index + 1}`,
                    airtableFieldId: field.id,
                    label: field.label || field.name,
                    type: field.type,
                    required: field.required || false,
                    options: field.options?.choices?.map((c) => c.name) || [],
                    conditionalRules: field.conditionalRules || null,
                })),
            };

            const { _ } = await axios.post("/forms", formData);
            toast.success("Form created successfully!");
            navigate("/");
        } catch (error) {
            toast.error("Failed to create form");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Create New Form
            </h1>

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    step >= s
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-300 text-gray-600"
                                }`}
                            >
                                {s}
                            </div>
                            {s < 4 && (
                                <div
                                    className={`flex-1 h-1 mx-2 ${
                                        step > s
                                            ? "bg-indigo-600"
                                            : "bg-gray-300"
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-sm">
                    <span>Form Details</span>
                    <span>Select Base</span>
                    <span>Select Table</span>
                    <span>Configure Fields</span>
                </div>
            </div>

            {step === 1 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Form Details</h2>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Form Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                        placeholder="Enter form title"
                    />
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setStep(2)}
                            disabled={!title.trim()}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Select Airtable Base
                    </h2>
                    <BaseSelector
                        selectedBase={selectedBase}
                        onSelect={setSelectedBase}
                    />
                    <div className="mt-6 flex justify-between">
                        <button
                            onClick={() => setStep(1)}
                            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            disabled={!selectedBase}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Select Table</h2>
                    <TableSelector
                        baseId={selectedBase?.id}
                        selectedTable={selectedTable}
                        onSelect={setSelectedTable}
                    />
                    <div className="mt-6 flex justify-between">
                        <button
                            onClick={() => setStep(2)}
                            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => setStep(4)}
                            disabled={!selectedTable}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Configure Form Fields
                    </h2>
                    <FieldSelector
                        baseId={selectedBase?.id}
                        tableId={selectedTable?.id}
                        selectedFields={selectedFields}
                        onFieldsChange={setSelectedFields}
                    />
                    <div className="mt-6 flex justify-between">
                        <button
                            onClick={() => setStep(3)}
                            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || selectedFields.length === 0}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Form"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
