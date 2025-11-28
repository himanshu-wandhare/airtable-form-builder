import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import FieldSelector from "../components/FormBuilder/FieldSelector";

export default function EditForm() {
    const [form, setForm] = useState(null);
    const [title, setTitle] = useState("");
    const [selectedFields, setSelectedFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { formId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchForm();
    }, [formId]);

    const fetchForm = async () => {
        try {
            const { data } = await axios.get(`/forms/${formId}`);
            setForm(data);
            setTitle(data.title);
            setSelectedFields(
                data.questions.map((q) => ({
                    id: q.airtableFieldId,
                    name: q.label,
                    type: q.type,
                    label: q.label,
                    required: q.required,
                    options: q.options,
                    conditionalRules: q.conditionalRules,
                }))
            );
        } catch (error) {
            toast.error("Failed to fetch form");
            navigate("/");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Please enter a form title");
            return;
        }

        if (selectedFields.length === 0) {
            toast.error("Please select at least one field");
            return;
        }

        setSaving(true);

        try {
            const formData = {
                title,
                questions: selectedFields.map((field, index) => ({
                    questionKey: `q${index + 1}`,
                    airtableFieldId: field.id,
                    label: field.label || field.name,
                    type: field.type,
                    required: field.required || false,
                    options: field.options || [],
                    conditionalRules: field.conditionalRules || null,
                })),
            };

            await axios.put(`/forms/${formId}`, formData);
            toast.success("Form updated successfully!");
            navigate("/");
        } catch (error) {
            toast.error("Failed to update form");
            console.error(error);
        } finally {
            setSaving(false);
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Form</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
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
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold mb-4">Form Fields</h3>
                    <FieldSelector
                        baseId={form?.airtableBaseId}
                        tableId={form?.airtableTableId}
                        selectedFields={selectedFields}
                        onFieldsChange={setSelectedFields}
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
