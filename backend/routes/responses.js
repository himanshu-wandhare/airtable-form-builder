import express from "express";
import Response from "../models/Response.js";
import Form from "../models/Form.js";
import AirtableService from "../utils/airtable.js";
import { shouldShowQuestion } from "../utils/conditionalLogic.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/:formId", async (req, res) => {
    try {
        const form = await Form.findById(req.params.formId).populate("owner");
        if (!form) {
            return res.status(404).json({ message: "Form not found" });
        }

        if (!form.isActive) {
            return res.status(403).json({
                message: "This form is no longer accepting responses",
            });
        }

        const { answers } = req.body;

        // Validate required fields and conditional logic
        for (const question of form.questions) {
            const shouldShow = shouldShowQuestion(
                question.conditionalRules,
                answers
            );

            if (
                shouldShow &&
                question.required &&
                !answers[question.questionKey]
            ) {
                return res.status(400).json({
                    message: `${question.label} is required`,
                });
            }

            if (
                shouldShow &&
                question.type === "singleSelect" &&
                answers[question.questionKey]
            ) {
                if (!question.options.includes(answers[question.questionKey])) {
                    return res.status(400).json({
                        message: `Invalid option for ${question.label}`,
                    });
                }
            }

            if (
                shouldShow &&
                question.type === "multipleSelects" &&
                answers[question.questionKey]
            ) {
                const invalidOptions = answers[question.questionKey].filter(
                    (opt) => !question.options.includes(opt)
                );
                if (invalidOptions.length > 0) {
                    return res.status(400).json({
                        message: `Invalid options for ${
                            question.label
                        }: ${invalidOptions.join(", ")}`,
                    });
                }
            }
        }

        const airtableFields = {};
        for (const question of form.questions) {
            if (answers[question.questionKey] !== undefined) {
                airtableFields[question.airtableFieldId] =
                    answers[question.questionKey];
            }
        }

        const airtable = new AirtableService(form.owner.accessToken);
        const airtableRecord = await airtable.createRecord(
            form.airtableBaseId,
            form.airtableTableId,
            airtableFields
        );

        const response = new Response({
            formId: form._id,
            airtableRecordId: airtableRecord.id,
            answers: answers,
        });
        await response.save();

        res.status(201).json({
            message: "Response submitted successfully",
            responseId: response._id,
        });
    } catch (error) {
        console.error("Error submitting response:", error);
        res.status(500).json({
            message: "Failed to submit response",
            error: error.message,
        });
    }
});

router.get("/:formId", authMiddleware, async (req, res) => {
    try {
        const form = await Form.findById(req.params.formId);
        if (!form) {
            return res.status(404).json({ message: "Form not found" });
        }

        if (form.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const responses = await Response.find({
            formId: req.params.formId,
        }).sort("-createdAt");

        res.json(responses);
    } catch (error) {
        console.error("Error fetching responses:", error);
        res.status(500).json({ message: "Failed to fetch responses" });
    }
});

router.get("/single/:responseId", authMiddleware, async (req, res) => {
    try {
        const response = await Response.findById(req.params.responseId);
        if (!response) {
            return res.status(404).json({ message: "Response not found" });
        }

        const form = await Form.findById(response.formId);
        if (!form || form.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        res.json(response);
    } catch (error) {
        console.error("Error fetching response:", error);
        res.status(500).json({ message: "Failed to fetch response" });
    }
});

router.delete("/single/:responseId", authMiddleware, async (req, res) => {
    try {
        const response = await Response.findById(req.params.responseId);
        if (!response) {
            return res.status(404).json({ message: "Response not found" });
        }

        const form = await Form.findById(response.formId).populate("owner");
        if (!form || form.owner._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const airtable = new AirtableService(form.owner.accessToken);
        try {
            await airtable.deleteRecord(
                form.airtableBaseId,
                form.airtableTableId,
                response.airtableRecordId
            );
        } catch (error) {
            console.error("Error deleting from Airtable:", error);
        }

        await Response.findByIdAndDelete(req.params.responseId);

        res.json({ message: "Response deleted successfully" });
    } catch (error) {
        console.error("Error deleting response:", error);
        res.status(500).json({ message: "Failed to delete response" });
    }
});

router.get("/:formId/stats", authMiddleware, async (req, res) => {
    try {
        const form = await Form.findById(req.params.formId);
        if (!form || form.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const responses = await Response.find({ formId: req.params.formId });

        const stats = {
            total: responses.length,
            active: responses.filter((r) => !r.deletedInAirtable).length,
            deleted: responses.filter((r) => r.deletedInAirtable).length,
            byDate: {},
        };

        responses.forEach((response) => {
            const date = new Date(response.createdAt)
                .toISOString()
                .split("T")[0];
            stats.byDate[date] = (stats.byDate[date] || 0) + 1;
        });

        res.json(stats);
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "Failed to fetch statistics" });
    }
});

export default router;
