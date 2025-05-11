import { sendApiRequest } from '#utils/apiClient';

class SearchService {
    /**
     * Search posts with the given query and filters
     * @param {Object} params - Search parameters
     * @param {string} params.query - Search query
     * @param {string} [params.sortBy='relevance'] - Sort by field (relevance, newest, votes)
     * @param {number} [params.limit=50] - Results limit
     * @returns {Promise<Object>} Search results
     */
    async searchPosts({ query, sortBy = 'relevance', limit = 50 }) {
        const params = new URLSearchParams({
            query,
            sortBy,
            limit: limit.toString()
        });

        return sendApiRequest(`/api/posts/search?${params.toString()}`);
    }

    /**
     * Search communities with the given query
     * @param {Object} params - Search parameters
     * @param {string} params.query - Search query
     * @param {number} [params.limit=5] - Results limit
     * @returns {Promise<Object>} Search results
     */
    async searchCommunities({ query, limit = 5 }) {
        const params = new URLSearchParams({
            query,
            limit: limit.toString()
        });

        return sendApiRequest(`/api/s/search?${params.toString()}`);
    }

    /**
     * Search users with the given query
     * @param {Object} params - Search parameters
     * @param {string} params.query - Search query
     * @param {number} [params.limit=5] - Results limit
     * @returns {Promise<Object>} Search results
     */
    async searchUsers({ query, limit = 5 }) {
        const params = new URLSearchParams({
            query,
            limit: limit.toString()
        });

        return sendApiRequest(`/api/users/search?${params.toString()}`);
    }
}

export default new SearchService(); 