import {sendApiRequest} from "#utils/apiClient";

class SubtableService {
    async getSubtableDetailsByName(subtableName) {
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

        // Create a FormData object
        const formData = new FormData();
        formData.append('name', subtableData.name);
        formData.append('description', subtableData.description);

        // Only append files if they exist and have a size (i.e., a file was selected)
        if (subtableData.iconFile && subtableData.iconFile.size > 0) {
            formData.append('iconFile', subtableData.iconFile, subtableData.iconFile.name);
        }
        if (subtableData.bannerFile && subtableData.bannerFile.size > 0) {
            formData.append('bannerFile', subtableData.bannerFile, subtableData.bannerFile.name);
        }
        const response = await sendApiRequest(baseUrl, {
            headers: {'Content-Type': 'multipart/form-data'},
            method: 'POST',
            body: formData
        });
        if (!response.success) {
            throw new Error(`Failed to create subtable: ${response.status} ${response.statusText}`);
        }
        return response; // Return the whole response object
    }
    
}
export default new SubtableService();