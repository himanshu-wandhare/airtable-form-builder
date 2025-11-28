import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
    {
        formId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Form",
            required: true,
        },
        airtableRecordId: {
            type: String,
            required: true,
        },
        answers: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
        },
        deletedInAirtable: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Response", responseSchema);
