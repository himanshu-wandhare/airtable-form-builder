import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function BaseSelector({ selectedBase, onSelect }) {
    const [bases, setBases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBases();
    }, []);

    const fetchBases = async () => {
        try {
            const { data } = await axios.get("/forms/bases");
            setBases(data);
        } catch (error) {
            toast.error("Failed to fetch bases");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading bases...</div>;
    }

    return (
        <div className="space-y-2">
            {bases.map((base) => (
                <div
                    key={base.id}
                    onClick={() => onSelect(base)}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedBase?.id === base.id
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-gray-300 hover:border-indigo-400"
                    }`}
                >
                    <h3 className="font-semibold">{base.name}</h3>
                </div>
            ))}
        </div>
    );
}
