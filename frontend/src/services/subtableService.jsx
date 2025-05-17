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
    async getSubtableMedia(mediaId,subtableName) {
        const baseUrl = `/api/s/${subtableName}/${mediaId}`;
        console.log('Fetching subtable media with ID:', mediaId);
        const response = await sendApiRequest(baseUrl, {method: 'GET'});
        if (!response.success) {
            throw new Error(`Failed to fetch subtable details for ${mediaId}: ${response.status} ${response.statusText}`);
        }
        return response; // Return the whole response object
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
        console.log('Creating subtable with data:', subtableData);
        for (let pair of subtableData.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }
        const response = await fetch(baseUrl, {
            method:'POST',
            body: subtableData,
            headers: {
                'Accept': 'application/json',
                // 'Content-Type': 'multipart/form-data' // Do not set this header when using FormData
            },
            credentials: 'include',

        })

        //const response = await sendApiRequest(baseUrl, {method: 'POST', body: subtableData});

        if (!response.ok) {
            console.error('Error creating subtable:', response.status, response.statusText);
            throw new Error(`Failed to create subtable: ${response.status} ${response.statusText}`);
        }
        return response
    }
    
}
export default new SubtableService();