import express from "express";
import Response from "../models/Response.js";
import Form from "../models/Form.js";
import { authMiddleware } from "../middleware/auth";
const router = express.Router();

router.get("/:formId", authMiddleware, async (req, res) => {
    try {
        const form = await Form.findById(req.params.formId);
        if (!form || form.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const responses = await Response.find({ formId: req.params.formId });

        const questionAnalytics = {};

        form.questions.forEach((question) => {
            questionAnalytics[question.questionKey] = {
                label: question.label,
                type: question.type,
                totalAnswers: 0,
                uniqueAnswers: new Set(),
                distribution: {},
            };
        });

        responses.forEach((response) => {
            Object.entries(response.answers).forEach(([key, value]) => {
                if (questionAnalytics[key]) {
                    questionAnalytics[key].totalAnswers++;

                    if (Array.isArray(value)) {
                        value.forEach((v) => {
                            questionAnalytics[key].uniqueAnswers.add(v);
                            questionAnalytics[key].distribution[v] =
                                (questionAnalytics[key].distribution[v] || 0) +
                                1;
                        });
                    } else {
                        questionAnalytics[key].uniqueAnswers.add(value);
                        questionAnalytics[key].distribution[value] =
                            (questionAnalytics[key].distribution[value] || 0) +
                            1;
                    }
                }
            });
        });

        Object.keys(questionAnalytics).forEach((key) => {
            questionAnalytics[key].uniqueAnswers = Array.from(
                questionAnalytics[key].uniqueAnswers
            );
        });

        res.json({
            formId: form._id,
            formTitle: form.title,
            totalResponses: responses.length,
            questionAnalytics,
        });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).json({ message: "Failed to fetch analytics" });
    }
});

export default router;
