import {sendApiRequest} from "#utils/apiClient";

class SubtableService {
    async getSubtableDetails(subtableName) {
        const baseUrl = `/api/s/${subtableName}`;
        const response = await sendApiRequest(baseUrl, {method: 'GET'});
        if (!response.success) {
            throw new Error(`Failed to fetch subtable details for ${subtableName}: ${response.status} ${response.statusText}`);
        }
        return response; // Return the whole response object
    }

    async getSubtablePosts(subtableName) {
        const baseUrl = `/api/s/${subtableName}/posts`;
        const response = await sendApiRequest(baseUrl, {method: 'GET'});
        if (!response.success) {
            throw new Error(`Failed to fetch subtable details for ${subtableName}: ${response.status} ${response.statusText}`);
        }
        return response;
    }

    async getSubscribedSubtables() {
        const baseUrl = `/api/s/subscribed`;
        const response = await sendApiRequest(baseUrl, {method: 'GET'});
        if (!response.success) {
            throw new Error(`Failed to fetch subtables: ${response.status} ${response.statusText}`);
        }
        return response; // Return the whole response object
    }

    async createSubtable(subtableData) {
        const baseUrl = '/api/s/';
        const response = await sendApiRequest(baseUrl, {
            method: 'POST',
            body: subtableData // FormData will be handled correctly by sendApiRequest now
        });
        if (!response.success) {
            throw new Error(`Failed to create subtable: ${response.status} ${response.statusText}`);
        }
        return response; // Return the whole response object
    }
    
}
export default new SubtableService();