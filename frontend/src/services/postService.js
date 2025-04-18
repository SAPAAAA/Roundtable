import {sendApiRequest} from "#utils/apiClient";

class PostService {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api/posts';
    }

    /**
     * Fetches a list of posts, optionally filtered by query parameters.
     * @param {object} [queryParams] - Optional key-value pairs for query parameters (e.g., { userId: 'abc', page: 2, limit: 10 }).
     * @returns {Promise<Array<object>>} A promise that resolves to an array of posts.
     */
    async getPosts(queryParams = {}) {
        const url = new URL(this.apiUrl);
        // Append query parameters to the URL
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) { // Ensure value is provided
                url.searchParams.append(key, String(value)); // Convert value to string
            }
        });

        const response = await sendApiRequest(url.toString(), {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
        }
        // GET requests usually return JSON, even an empty array []
        return await response.json();
    }

    /**
     * Creates a new post.
     * @param {object} postData - The data for the new post (e.g., { title: '...', content: '...', authorId: '...' }).
     * @returns {Promise<object>} A promise that resolves to the created post data (usually includes the new ID).
     */
    async createPost(postData) {
        // sendApiRequest should handle setting 'Content-Type': 'application/json'
        // and JSON.stringify(postData) for the body
        const response = await sendApiRequest(this.apiUrl, {
            method: 'POST',
            body: postData,
        });
        if (!response.ok) {
            // Provide more context in error if possible (e.g., validation errors from response body)
            throw new Error(`Failed to create post: ${response.status} ${response.statusText}`);
        }
        // POST usually returns the created resource as JSON
        return await response.json();
    }

    /**
     * Partially updates an existing post.
     * @param {string|number} postId - The ID of the post to update.
     * @param {object} postUpdateData - An object containing only the fields to be updated.
     * @returns {Promise<object>} A promise that resolves to the updated post data.
     */
    async updatePost(postId, postUpdateData) {
        // sendApiRequest should handle setting 'Content-Type': 'application/json'
        // and JSON.stringify(postUpdateData) for the body
        const response = await sendApiRequest(`${this.apiUrl}/${postId}`, {
            method: 'PATCH', // Use PATCH for partial updates (more efficient than PUT)
            body: postUpdateData,
        });
        if (!response.ok) {
            throw new Error(`Failed to update post: ${response.status} ${response.statusText}`);
        }
        // PATCH/PUT usually returns the updated resource as JSON
        return await response.json();
    }

    /**
     * Deletes a specific post.
     * @param {string|number} postId - The ID of the post to delete.
     * @returns {Promise<void>} A promise that resolves when deletion is successful.
     */
    async deletePost(postId) {
        const response = await sendApiRequest(`${this.apiUrl}/${postId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            // Handle potential errors, e.g., post not found (404) or permissions (403)
            throw new Error(`Failed to delete post: ${response.status} ${response.statusText}`);
        }
        // DELETE requests often return 204 No Content.
        // Avoid calling response.json() as it will likely fail if the body is empty.
        // Simply returning indicates success.
        return;
    }

    /**
     * Fetches a specific post by its ID.
     * @param {string|number} postId - The ID of the post to fetch.
     * @returns {Promise<object>} A promise that resolves to the post data.
     */
    async getPostById(postId) {
        const response = await sendApiRequest(`${this.apiUrl}/${postId}`, {
            method: 'GET',
        });
        if (!response.ok) {
            // Specifically check for 404 if you want to handle "Not Found" differently
            throw new Error(`Failed to fetch post: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }

    /**
     * Fetches posts filtered by a specific user ID using query parameters.
     * @param {string|number} userId - The ID of the user whose posts to fetch.
     * @returns {Promise<Array<object>>} A promise that resolves to an array of posts by the user.
     */
    async getPostsByUserId(userId) {
        // Use the getPosts method with query parameters for consistency
        return this.getPosts({userId: userId});
    }

    // --- Placeholder for Comment related methods ---
    // These might live in a separate CommentService or here if closely tied

    /**
     * Fetches comments for a specific post.
     * @param {string|number} postId - The ID of the post.
     * @param {object} [queryParams] - Optional query params for pagination etc.
     * @returns {Promise<Array<object>>}
     */
    async getCommentsForPost(postId, queryParams = {}) {
        const url = new URL(`${this.apiUrl}/${postId}/comments`);
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });
        // ... implementation using sendApiRequest ...
        // Remember error handling and response parsing
        throw new Error("getCommentsForPost not implemented yet"); // Placeholder
    }

    /**
     * Creates a comment for a specific post.
     * @param {string|number} postId - The ID of the post.
     * @param {object} commentData - The data for the new comment.
     * @returns {Promise<object>}
     */
    async createComment(postId, commentData) {
        const url = `${this.apiUrl}/${postId}/comments`;
        // ... implementation using sendApiRequest (method: 'POST', body: commentData) ...
        throw new Error("createComment not implemented yet"); // Placeholder
    }

    // --- Placeholder for Vote related methods ---

    /**
     * Casts or updates a vote on a specific post.
     * @param {string|number} postId - The ID of the post.
     * @param {object} voteData - Data indicating vote direction (e.g., { value: 1 } or { direction: 'up' }).
     * @returns {Promise<object>} Usually returns the updated vote count or status.
     */
    async voteOnPost(postId, voteData) {
        const url = `${this.apiUrl}/${postId}/vote`;
        // ... implementation using sendApiRequest (method: 'POST', body: voteData) ...
        // Handle response appropriately (might be updated vote count or just success status)
        throw new Error("voteOnPost not implemented yet"); // Placeholder
    }

    /**
     * Removes the current user's vote from a specific post.
     * @param {string|number} postId - The ID of the post.
     * @returns {Promise<void>}
     */
    async removeVoteFromPost(postId) {
        const url = `${this.apiUrl}/${postId}/vote`;
        // ... implementation using sendApiRequest (method: 'DELETE') ...
        // Handle 204 No Content response properly
        throw new Error("removeVoteFromPost not implemented yet"); // Placeholder
    }

    // Similar methods would exist for getting/creating/updating/deleting specific comments
    // and voting on comments (e.g., voteOnComment(postId, commentId, voteData))
}

// Export a singleton instance - ensures only one instance of the service is used throughout the app.
export default new PostService();