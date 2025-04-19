// src/services/CommentService.js
import {sendApiRequest} from "#utils/apiClient";

class CommentService {
    /**
     * Generates the URL for fetching comments based on subtable name and post ID.
     * @param subtableName
     * @param postId
     * @returns {string}
     * @private
     */
    _getCommentsUrl(subtableName, postId) {
        return `http://localhost:5000/api/s/${subtableName}/comments/${postId}`;
    }

    /**
     * Fetches comments for a specific post.
     * @param {string} subtableName
     * @param {string|number} postId
     * @returns {Promise<Array<object>>}
     */
    async getCommentsForPost(subtableName, postId) {
        const baseUrl = this._getCommentsUrl(subtableName, postId);
        const url = new URL(baseUrl);

        const response = await sendApiRequest(url.toString(), {method: 'GET'});
        if (!response.success) throw new Error(`Failed to fetch comments for post ${postId}: ${response.status} ${response.statusText}`);
        return response.data;
    }
}

export default new CommentService();