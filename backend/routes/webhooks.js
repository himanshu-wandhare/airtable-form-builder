import express from "express";
import Response from "../models/Response.js";
import Form from "../models/Form.js";

const router = express.Router();

router.post("/airtable", async (req, res) => {
    try {
        const { base, webhook, timestamp } = req.body;

        res.status(200).send("OK");

        if (webhook && webhook.changedTablesById) {
            for (const tableId in webhook.changedTablesById) {
                const changes = webhook.changedTablesById[tableId];

                const form = await Form.findOne({
                    airtableBaseId: base.id,
                    airtableTableId: tableId,
                });

                if (!form) continue;

                if (changes.changedRecordsById) {
                    for (const recordId in changes.changedRecordsById) {
                        await Response.findOneAndUpdate(
                            { airtableRecordId: recordId },
                            { updatedAt: new Date() }
                        );
                    }
                }

                if (changes.destroyedRecordIds) {
                    for (const recordId of changes.destroyedRecordIds) {
                        await Response.findOneAndUpdate(
                            { airtableRecordId: recordId },
                            { deletedInAirtable: true }
                        );
                    }
                }
            }
        }
    } catch (error) {
        console.error("Webhook error:", error);
    }
});

export default router;
