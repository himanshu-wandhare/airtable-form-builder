import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";

const router = express.Router();

function base64UrlEncode(buffer) {
    return buffer
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

function generateCodeVerifier() {
    return base64UrlEncode(crypto.randomBytes(32));
}

function generateCodeChallenge(codeVerifier) {
    return base64UrlEncode(
        crypto.createHash("sha256").update(codeVerifier).digest()
    );
}

router.get("/airtable", (req, res) => {
    const state = crypto.randomBytes(16).toString("hex");

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    res.cookie("oauth_state", state, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
    });
    res.cookie("code_verifier", codeVerifier, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
    });

    const authUrl =
        `https://airtable.com/oauth2/v1/authorize?` +
        `client_id=${process.env.AIRTABLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(
            process.env.AIRTABLE_REDIRECT_URI
        )}` +
        `&response_type=code` +
        `&state=${state}` +
        `&code_challenge=${codeChallenge}` +
        `&code_challenge_method=S256` +
        `&scope=data.records:read data.records:write schema.bases:read webhook:manage`;

    res.json({ authUrl });
});

router.post("/callback", async (req, res) => {
    try {
        const { code, state } = req.body;

        const storedState = req.cookies.oauth_state;
        const codeVerifier = req.cookies.code_verifier;

        if (!state || state !== storedState) {
            return res.status(400).json({ message: "Invalid state" });
        }

        res.clearCookie("oauth_state");
        res.clearCookie("code_verifier");

        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_uri", process.env.AIRTABLE_REDIRECT_URI);
        params.append("client_id", process.env.AIRTABLE_CLIENT_ID);
        params.append("code_verifier", codeVerifier);

        const tokenResponse = await axios.post(
            "https://airtable.com/oauth2/v1/token",
            params.toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        const userResponse = await axios.get(
            "https://api.airtable.com/v0/meta/whoami",
            {
                headers: { Authorization: `Bearer ${access_token}` },
            }
        );

        const airtableUser = userResponse.data;

        let user = await User.findOne({ airtableUserId: airtableUser.id });

        if (user) {
            user.accessToken = access_token;
            user.refreshToken = refresh_token;
            user.tokenExpiresAt = new Date(Date.now() + expires_in * 1000);
            user.lastLogin = new Date();
        } else {
            user = new User({
                airtableUserId: airtableUser.id,
                email: airtableUser.email,
                name: airtableUser.name || airtableUser.email,
                accessToken: access_token,
                refreshToken: refresh_token,
                tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
            });
        }

        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error("OAuth error:", error.response?.data || error);
        res.status(500).json({ message: "Authentication failed" });
    }
});

router.get("/me", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select(
            "-accessToken -refreshToken"
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

export default router;
