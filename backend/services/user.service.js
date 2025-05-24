import RegisteredUserDao from '#daos/registered-user.dao.js';
import UserProfileDao from '#daos/user-profile.dao.js';
import {BadRequestError} from "#errors/AppError.js";

class UserService {
    constructor(registeredUserDao, userProfileDao) {
        this.registeredUserDao = registeredUserDao;
        this.userProfileDao = userProfileDao;
    }

    /**
     * Searches users based on q parameters
     * @param {object} params - Search parameters
     * @param {string} params.q - Search q
     * @param {number} [params.limit=5] - Results limit
     * @returns {Promise<object>} Search results
     */
    async searchUsers({q, limit = 5}) {
        try {
            // Validate input
            if (!q) {
                throw new BadRequestError('Missing search query');
            }

            // Convert limit to number
            limit = parseInt(limit);

            // Validate numeric parameters
            if (isNaN(limit) || limit < 1) {
                throw new BadRequestError('Invalid limit parameter');
            }

            // Get search results from DAO
            const results = await this.registeredUserDao.searchUsers(q, {limit});

            return {
                users: results
            };
        } catch (error) {
            console.error('[UserService:searchUsers] Error:', error);
            throw error;
        }
    }

    async getUserProfile(username) {
        try {
            // Validate input
            if (!username) {
                throw new BadRequestError('Missing user ID');
            }

            // Get user profile from DAO
            const userProfile = await this.userProfileDao.getByUsername(username);

            return {
                user: userProfile
            };
        } catch (error) {
            console.error('[UserService:getUserProfile] Error:', error);
            throw error;
        }
    }
}

export default new UserService(RegisteredUserDao, UserProfileDao);