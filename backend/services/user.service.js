import RegisteredUserDao from '#daos/registered-user.dao.js';

class UserService {
    constructor(userDao) {
        this.userDao = userDao;
    }

    /**
     * Searches users based on query parameters
     * @param {object} params - Search parameters
     * @param {string} params.query - Search query
     * @param {number} [params.limit=5] - Results limit
     * @returns {Promise<object>} Search results
     */
    async searchUsers({ query, limit = 5 }) {
        try {
            // Validate input
            if (!query) {
                throw new Error('Search query is required');
            }

            // Convert limit to number
            limit = parseInt(limit);

            // Validate numeric parameters
            if (isNaN(limit) || limit < 1) {
                throw new Error('Invalid limit');
            }

            // Get search results from DAO
            const results = await this.userDao.searchUsers(query, { limit });
            console.log('[UserService:searchUsers] Results:', results);

            return {
                success: true,
                data: results
            };
        } catch (error) {
            console.error('[UserService:searchUsers] Error:', error);
            throw error;
        }
    }
}

export default new UserService(RegisteredUserDao); 