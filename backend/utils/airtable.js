import axios from "axios";

class AirtableService {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.baseUrl = "https://api.airtable.com/v0";
    }

    async getBases() {
        const response = await axios.get(
            "https://api.airtable.com/v0/meta/bases",
            {
                headers: { Authorization: `Bearer ${this.accessToken}` },
            }
        );
        return response.data.bases;
    }

    async getTables(baseId) {
        const response = await axios.get(
            `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
            {
                headers: { Authorization: `Bearer ${this.accessToken}` },
            }
        );
        return response.data.tables;
    }

    async getTableSchema(baseId, tableId) {
        const tables = await this.getTables(baseId);
        return tables.find((t) => t.id === tableId);
    }

    async createRecord(baseId, tableId, fields) {
        const response = await axios.post(
            `${this.baseUrl}/${baseId}/${tableId}`,
            { fields },
            { headers: { Authorization: `Bearer ${this.accessToken}` } }
        );
        return response.data;
    }

    async updateRecord(baseId, tableId, recordId, fields) {
        const response = await axios.patch(
            `${this.baseUrl}/${baseId}/${tableId}/${recordId}`,
            { fields },
            { headers: { Authorization: `Bearer ${this.accessToken}` } }
        );
        return response.data;
    }

    async deleteRecord(baseId, tableId, recordId) {
        const response = await axios.delete(
            `${this.baseUrl}/${baseId}/${tableId}/${recordId}`,
            { headers: { Authorization: `Bearer ${this.accessToken}` } }
        );
        return response.data;
    }

    filterSupportedFields(fields) {
        const supportedTypes = [
            "singleLineText",
            "multilineText",
            "singleSelect",
            "multipleSelects",
            "multipleAttachments",
        ];

        return fields.filter((field) => supportedTypes.includes(field.type));
    }
}

export default AirtableService;
