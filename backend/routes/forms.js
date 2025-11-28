import express from "express";
import Form from "../models/Form.js";
import AirtableService from "../utils/airtable.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/bases", authMiddleware, async (req, res) => {
    try {
        const airtable = new AirtableService(req.user.accessToken);
        const bases = await airtable.getBases();
        res.json(bases);
    } catch (error) {
        console.error("Error fetching bases:", error);
        res.status(500).json({ message: "Failed to fetch bases" });
    }
});

router.get("/bases/:baseId/tables", authMiddleware, async (req, res) => {
    try {
        const airtable = new AirtableService(req.user.accessToken);
        const tables = await airtable.getTables(req.params.baseId);
        res.json(tables);
    } catch (error) {
        console.error("Error fetching tables:", error);
        res.status(500).json({ message: "Failed to fetch tables" });
    }
});

router.get(
    "/bases/:baseId/tables/:tableId/schema",
    authMiddleware,
    async (req, res) => {
        try {
            const airtable = new AirtableService(req.user.accessToken);
            const schema = await airtable.getTableSchema(
                req.params.baseId,
                req.params.tableId
            );
            const supportedFields = airtable.filterSupportedFields(
                schema.fields
            );
            res.json({ ...schema, fields: supportedFields });
        } catch (error) {
            console.error("Error fetching schema:", error);
            res.status(500).json({ message: "Failed to fetch schema" });
        }
    }
);

router.post("/", authMiddleware, async (req, res) => {
    try {
        const form = new Form({
            ...req.body,
            owner: req.user._id,
        });
        await form.save();
        res.status(201).json(form);
    } catch (error) {
        console.error("Error creating form:", error);
        res.status(500).json({ message: "Failed to create form" });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const forms = await Form.find({ owner: req.user._id }).sort(
            "-createdAt"
        );
        res.json(forms);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch forms" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) {
            return res.status(404).json({ message: "Form not found" });
        }
        res.json(form);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch form" });
    }
});

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const form = await Form.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            req.body,
            { new: true }
        );
        if (!form) {
            return res.status(404).json({ message: "Form not found" });
        }
        res.json(form);
    } catch (error) {
        res.status(500).json({ message: "Failed to update form" });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const form = await Form.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id,
        });
        if (!form) {
            return res.status(404).json({ message: "Form not found" });
        }
        res.json({ message: "Form deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete form" });
    }
});
export default router;
