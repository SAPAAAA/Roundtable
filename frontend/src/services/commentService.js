// src/services/CommentService.js
import {sendApiRequest} from "#utils/apiClient";

class CommentService {
    constructor() {
        this.postsApiUrl = 'http://localhost:3000/api/posts';
    }

    /**
     * Builds the base URL for comments related to a specific post.
     * @param {string|number} postId
     * @returns {string} The comments base URL for the post.
     */
    _getCommentsUrl(postId) {
        return `${this.postsApiUrl}/${postId}/comments`;
    }

    /**
     * Builds the URL for a specific comment.
     * @param {string|number} postId
     * @param {string|number} commentId
     * @returns {string} The URL for the specific comment.
     */
    _getSpecificCommentUrl(postId, commentId) {
        return `${this.postsApiUrl}/${postId}/comments/${commentId}`;
    }

    /**
     * Fetches comments for a specific post.
     * @param {string|number} postId
     * @param {object} [queryParams] - Optional query params for pagination, sorting.
     * @returns {Promise<Array<object>>}
     */
    async getCommentsForPost(postId, queryParams = {}) {
        const baseUrl = this._getCommentsUrl(postId);
        const url = new URL(baseUrl);
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });
        const response = await sendApiRequest(url.toString(), {method: 'GET'});
        if (!response.ok) throw new Error(`Failed to fetch comments for post ${postId}: ${response.status} ${response.statusText}`);
        return await response.json();
    }

    /**
     * Creates a comment on a specific post.
     * @param {string|number} postId
     * @param {object} commentData - Data for the new comment (e.g., { text: '...', authorId: '...' }).
     * @returns {Promise<object>} The created comment.
     */
    async createComment(postId, commentData) {
        const url = this._getCommentsUrl(postId);
        const response = await sendApiRequest(url, {method: 'POST', body: commentData});
        if (!response.ok) throw new Error(`Failed to create comment for post ${postId}: ${response.status} ${response.statusText}`);
        return await response.json();
    }

    /**
     * Partially updates a specific comment.
     * @param {string|number} postId
     * @param {string|number} commentId
     * @param {object} commentUpdateData - Fields to update.
     * @returns {Promise<object>} The updated comment.
     */
    async updateComment(postId, commentId, commentUpdateData) {
        const url = this._getSpecificCommentUrl(postId, commentId);
        const response = await sendApiRequest(url, {method: 'PATCH', body: commentUpdateData});
        if (!response.ok) throw new Error(`Failed to update comment ${commentId}: ${response.status} ${response.statusText}`);
        return await response.json();
    }

    /**
     * Deletes a specific comment.
     * @param {string|number} postId
     * @param {string|number} commentId
     * @returns {Promise<void>}
     */
    async deleteComment(postId, commentId) {
        const url = this._getSpecificCommentUrl(postId, commentId);
        const response = await sendApiRequest(url, {method: 'DELETE'});
        if (!response.ok) throw new Error(`Failed to delete comment ${commentId}: ${response.status} ${response.statusText}`);
        // No return needed for successful DELETE
    }

    /** Fetches a single specific comment */
    async getComment(postId, commentId) {
        const url = this._getSpecificCommentUrl(postId, commentId);
        const response = await sendApiRequest(url, {method: 'GET'});
        if (!response.ok) throw new Error(`Failed to fetch comment ${commentId}: ${response.status} ${response.statusText}`);
        return await response.json();
    }
}

export default new CommentService();