import { sendApiRequest } from '#utils/apiUtils';

class SearchService {
    /**
     * Search posts with the given query and filters
     * @param {Object} params - Search parameters
     * @param {string} params.query - Search query
     * @param {string} [params.subtableId] - Optional subtable ID to filter by
     * @param {string} [params.sortBy='relevance'] - Sort by field (relevance, newest, votes)
     * @param {number} [params.page=1] - Page number
     * @param {number} [params.limit=10] - Results per page
     * @returns {Promise<Object>} Search results
     */
    async searchPosts({ query, subtableId, sortBy = 'relevance', limit = 50 }) {
        try {
            const params = new URLSearchParams({
                query,
                sortBy,
                limit
            });

            if (subtableId) {
                params.append('subtableId', subtableId);
            }

            const response = await sendApiRequest(`/posts/search?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error searching posts:', error);
            throw error;
        }
    }
    /**
     * Search communities with the given query
     * @param {Object} params - Search parameters
     * @param {string} params.query - Search query
     * @param {number} [params.limit=5] - Results limit
     * @returns {Promise<Object>} Search results
     */
    async searchCommunities({ query, limit = 5 }) {
        try {
            const params = new URLSearchParams({
                query,
                limit
            });

            // const response = await axios.get(`/subtables/search?${params.toString()}`);
            const response = await sendApiRequest(`/subtables/search?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error searching communities:', error);
            throw error;
        }
    }

    /**
     * Search users with the given query
     * @param {Object} params - Search parameters
     * @param {string} params.query - Search query
     * @param {number} [params.limit=5] - Results limit
     * @returns {Promise<Object>} Search results
     */
    async searchUsers({ query, limit = 5 }) {
        try {
            const params = new URLSearchParams({
                query,
                limit
            });

            const response = await sendApiRequest(`/users/search?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    }
}

export default new SearchService(); 