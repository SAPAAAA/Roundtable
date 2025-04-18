// src/services/VoteService.js
import {sendApiRequest} from "#utils/apiClient";

class VoteService {
    constructor() {
        this.postsApiUrl = 'http://localhost:3000/api/posts';
    }

    /**
     * Builds the vote URL for a specific post.
     * @param {string|number} postId
     * @returns {string}
     */
    _getPostVoteUrl(postId) {
        return `${this.postsApiUrl}/${postId}/vote`;
    }

    /**
     * Builds the vote URL for a specific comment.
     * @param {string|number} postId
     * @param {string|number} commentId
     * @returns {string}
     */
    _getCommentVoteUrl(postId, commentId) {
        return `${this.postsApiUrl}/${postId}/comments/${commentId}/vote`;
    }

    /**
     * Casts or updates a vote on a post.
     * @param {string|number} postId
     * @param {object} voteData - e.g., { value: 1 } or { value: -1 } or { direction: "up" }
     * @returns {Promise<object>} Typically returns new vote status or count. Adjust based on your API response.
     */
    async voteOnPost(postId, voteData) {
        const url = this._getPostVoteUrl(postId);
        // POST is often used here to create or update the vote state for the user
        const response = await sendApiRequest(url, {method: 'POST', body: voteData});
        if (!response.ok) throw new Error(`Failed to vote on post ${postId}: ${response.status} ${response.statusText}`);
        // Check if API returns updated data or just success status
        // If it returns data (like new score): return await response.json();
        // If it returns 204 No Content or similar: return;
        // Let's assume it returns updated data for now:
        try {
            return await response.json(); // Or handle potential no-content response
        } catch (e) {
            if (response.status === 204) return; // Handle No Content case
            throw e; // Re-throw other parsing errors
        }
    }

    /**
     * Removes the current user's vote from a post.
     * @param {string|number} postId
     * @returns {Promise<void>}
     */
    async removeVoteFromPost(postId) {
        const url = this._getPostVoteUrl(postId);
        const response = await sendApiRequest(url, {method: 'DELETE'});
        if (!response.ok) throw new Error(`Failed to remove vote from post ${postId}: ${response.status} ${response.statusText}`);
        // No return needed for successful DELETE
    }

    /**
     * Casts or updates a vote on a comment.
     * @param {string|number} postId
     * @param {string|number} commentId
     * @param {object} voteData - e.g., { value: 1 } or { value: -1 }
     * @returns {Promise<object>} Adjust based on your API response.
     */
    async voteOnComment(postId, commentId, voteData) {
        const url = this._getCommentVoteUrl(postId, commentId);
        const response = await sendApiRequest(url, {method: 'POST', body: voteData});
        if (!response.ok) throw new Error(`Failed to vote on comment ${commentId}: ${response.status} ${response.statusText}`);
        try {
            return await response.json(); // Or handle potential no-content response
        } catch (e) {
            if (response.status === 204) return; // Handle No Content case
            throw e; // Re-throw other parsing errors
        }
    }

    /**
     * Removes the current user's vote from a comment.
     * @param {string|number} postId
     * @param {string|number} commentId
     * @returns {Promise<void>}
     */
    async removeVoteFromComment(postId, commentId) {
        const url = this._getCommentVoteUrl(postId, commentId);
        const response = await sendApiRequest(url, {method: 'DELETE'});
        if (!response.ok) throw new Error(`Failed to remove vote from comment ${commentId}: ${response.status} ${response.statusText}`);
        // No return needed for successful DELETE
    }
}

export default new VoteService();