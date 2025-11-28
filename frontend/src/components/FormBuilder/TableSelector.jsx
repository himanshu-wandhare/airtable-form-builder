import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function TableSelector({ baseId, selectedTable, onSelect }) {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (baseId) {
            fetchTables();
        }
    }, [baseId]);

    const fetchTables = async () => {
        try {
            const { data } = await axios.get(`/forms/bases/${baseId}/tables`);
            setTables(data);
        } catch (error) {
            toast.error("Failed to fetch tables");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading tables...</div>;
    }

    return (
        <div className="space-y-2">
            {tables.map((table) => (
                <div
                    key={table.id}
                    onClick={() => onSelect(table)}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedTable?.id === table.id
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-gray-300 hover:border-indigo-400"
                    }`}
                >
                    <h3 className="font-semibold">{table.name}</h3>
                </div>
            ))}
        </div>
    );
}
