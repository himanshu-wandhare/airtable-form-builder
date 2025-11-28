import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        airtableUserId: {
            type: String,
            required: true,
            unique: true,
        },
        email: String,
        name: String,
        accessToken: {
            type: String,
            required: true,
        },
        refreshToken: String,
        tokenExpiresAt: Date,
        lastLogin: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);
export default mongoose.model("User", userSchema);
