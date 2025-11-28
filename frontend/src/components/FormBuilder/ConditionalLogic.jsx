import { useState } from "react";

export default function ConditionalLogic({ field, allFields, onUpdate }) {
    const [showRules, setShowRules] = useState(false);
    const [rules, setRules] = useState(
        field.conditionalRules || { logic: "AND", conditions: [] }
    );

    const addCondition = () => {
        setRules({
            ...rules,
            conditions: [
                ...rules.conditions,
                { questionKey: "", operator: "equals", value: "" },
            ],
        });
    };

    const updateCondition = (index, updates) => {
        const newConditions = [...rules.conditions];
        newConditions[index] = { ...newConditions[index], ...updates };
        const newRules = { ...rules, conditions: newConditions };
        setRules(newRules);
        onUpdate(newRules.conditions.length > 0 ? newRules : null);
    };

    const removeCondition = (index) => {
        const newConditions = rules.conditions.filter((_, i) => i !== index);
        const newRules = { ...rules, conditions: newConditions };
        setRules(newRules);
        onUpdate(newRules.conditions.length > 0 ? newRules : null);
    };

    const otherFields = allFields.filter((f) => f.id !== field.id);

    if (!showRules) {
        return (
            <button
                type="button"
                onClick={() => setShowRules(true)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
            >
                + Add conditional logic
            </button>
        );
    }

    return (
        <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Conditional Logic</span>
                <button
                    type="button"
                    onClick={() => {
                        setShowRules(false);
                        setRules({ logic: "AND", conditions: [] });
                        onUpdate(null);
                    }}
                    className="text-xs text-red-600 hover:text-red-800"
                >
                    Remove all
                </button>
            </div>

            <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                    <span>Show this field if</span>
                    <select
                        value={rules.logic}
                        onChange={(e) => {
                            const newRules = {
                                ...rules,
                                logic: e.target.value,
                            };
                            setRules(newRules);
                            onUpdate(newRules);
                        }}
                        className="px-2 py-1 border rounded text-xs"
                    >
                        <option value="AND">ALL</option>
                        <option value="OR">ANY</option>
                    </select>
                    <span>conditions are met:</span>
                </div>

                {rules.conditions.map((condition, index) => (
                    <div
                        key={index}
                        className="flex items-center space-x-2 text-sm"
                    >
                        <select
                            value={condition.questionKey}
                            onChange={(e) =>
                                updateCondition(index, {
                                    questionKey: e.target.value,
                                })
                            }
                            className="flex-1 px-2 py-1 border rounded text-xs"
                        >
                            <option value="">Select field</option>
                            {otherFields.map((f) => (
                                <option
                                    key={f.id}
                                    value={`q${allFields.indexOf(f) + 1}`}
                                >
                                    {f.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={condition.operator}
                            onChange={(e) =>
                                updateCondition(index, {
                                    operator: e.target.value,
                                })
                            }
                            className="px-2 py-1 border rounded text-xs"
                        >
                            <option value="equals">equals</option>
                            <option value="notEquals">not equals</option>
                            <option value="contains">contains</option>
                        </select>

                        <input
                            type="text"
                            value={condition.value}
                            onChange={(e) =>
                                updateCondition(index, {
                                    value: e.target.value,
                                })
                            }
                            placeholder="value"
                            className="flex-1 px-2 py-1 border rounded text-xs"
                        />

                        <button
                            type="button"
                            onClick={() => removeCondition(index)}
                            className="text-red-600 hover:text-red-800"
                        >
                            ×
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addCondition}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                    + Add condition
                </button>
            </div>
        </div>
    );
}
