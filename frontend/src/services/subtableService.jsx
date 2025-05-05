import {sendApiRequest} from "#utils/apiClient";

class SubtableService {
    async getSubtableDetails(subtableName) {
        const baseUrl = `/api/s/${subtableName}`;
        console.log('I\'m in the subtable service');
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
        console.log('123');
        const response = await sendApiRequest('/api/s/subscribed', {method: 'GET'});
        console.log('I\'m in the subtable service');
        if (!response.success) {
            throw new Error(`Failed to fetch subtables: ${response.status} ${response.statusText}`);
        }
        return response; // Return the whole response object
    }
    
}
export default new SubtableService();