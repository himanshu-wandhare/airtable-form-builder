import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ConditionalLogic from "./ConditionalLogic";

export default function FieldSelector({
    baseId,
    tableId,
    selectedFields,
    onFieldsChange,
}) {
    const [availableFields, setAvailableFields] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (baseId && tableId) {
            fetchFields();
        }
    }, [baseId, tableId]);

    const fetchFields = async () => {
        try {
            const { data } = await axios.get(
                `/forms/bases/${baseId}/tables/${tableId}/schema`
            );
            setAvailableFields(data.fields);
        } catch (error) {
            toast.error("Failed to fetch fields");
        } finally {
            setLoading(false);
        }
    };

    const toggleField = (field) => {
        const exists = selectedFields.find((f) => f.id === field.id);
        if (exists) {
            onFieldsChange(selectedFields.filter((f) => f.id !== field.id));
        } else {
            onFieldsChange([
                ...selectedFields,
                { ...field, label: field.name, required: false },
            ]);
        }
    };

    const updateField = (fieldId, updates) => {
        onFieldsChange(
            selectedFields.map((f) =>
                f.id === fieldId ? { ...f, ...updates } : f
            )
        );
    };

    if (loading) {
        return <div className="text-center py-4">Loading fields...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Available Fields</h3>
                <div className="space-y-2">
                    {availableFields.map((field) => (
                        <label
                            key={field.id}
                            className="flex items-center space-x-3 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selectedFields.some(
                                    (f) => f.id === field.id
                                )}
                                onChange={() => toggleField(field)}
                                className="w-4 h-4"
                            />
                            <span>{field.name}</span>
                            <span className="text-sm text-gray-500">
                                ({field.type})
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {selectedFields.length > 0 && (
                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">
                        Configure Selected Fields
                    </h3>
                    <div className="space-y-4">
                        {selectedFields.map((field) => (
                            <div
                                key={field.id}
                                className="border rounded p-3 bg-gray-50"
                            >
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Question Label
                                        </label>
                                        <input
                                            type="text"
                                            value={field.label}
                                            onChange={(e) =>
                                                updateField(field.id, {
                                                    label: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border rounded"
                                        />
                                    </div>

                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={field.required}
                                            onChange={(e) =>
                                                updateField(field.id, {
                                                    required: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">
                                            Required field
                                        </span>
                                    </label>

                                    <ConditionalLogic
                                        field={field}
                                        allFields={selectedFields}
                                        onUpdate={(rules) =>
                                            updateField(field.id, {
                                                conditionalRules: rules,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
