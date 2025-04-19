// src/services/PostService.js
import {sendApiRequest} from "#utils/apiClient";

class PostService {
    /**
     * Fetches comments for a specific post.
     * @param {string} subtableName
     * @param {string|number} postId
     * @returns {Promise<Array<object>>}
     */
    async getPostDetails(subtableName, postId) {
        const baseUrl = `/api/s/${subtableName}/comments/${postId}`

        const response = await sendApiRequest(baseUrl, {method: 'GET'});
        if (!response.success) throw new Error(`Failed to fetch comments for post ${postId}: ${response.status} ${response.statusText}`);
        return response.data;
    }
}

export default new PostService();