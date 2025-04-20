// daos/userProfile.dao.js

import postgres from '#db/postgres.js'; // Assuming Knex instance is exported from here
import UserProfile from '#models/userProfile.model.js'; // Import the UserProfile model

/**
 * @class UserProfileDAO
 * @description Data Access Object for interacting with the UserProfile VIEW.
 * Provides methods to fetch combined user account and profile data.
 */
class UserProfileDAO {

    /**
     * Fetches a user profile by their RegisteredUser ID.
     * @param {string} userId - The UUID of the RegisteredUser.
     * @returns {Promise<UserProfile | null>} A promise that resolves to a UserProfile instance or null if not found.
     * @throws {Error} Throws an error if the database query fails.
     */
    async getByUserId(userId) {
        if (!userId) {
            console.error('getByUserId called with null or undefined userId');
            return null;
        }
        try {
            // Query the 'UserProfile' VIEW using the userId column
            const profileRow = await postgres('UserProfile') // Use the VIEW name
                .where({userId: userId}) // Filter by userId
                .first(); // Expecting one or zero results

            if (!profileRow) {
                return null; // User profile not found for this userId
            }
            // Convert the database row to a UserProfile model instance
            return UserProfile.fromDbRow(profileRow);
        } catch (error) {
            console.error(`Error fetching user profile by userId (${userId}):`, error);
            // Re-throw the error to be handled by the caller
            throw error;
        }
    }

    /**
     * Fetches a user profile by their username.
     * Note: Usernames should be unique based on the Account schema.
     * @param {string} username - The username string.
     * @returns {Promise<UserProfile | null>} A promise that resolves to a UserProfile instance or null if not found.
     * @throws {Error} Throws an error if the database query fails.
     */
    async getByUsername(username) {
        if (!username) {
            console.error('getByUsername called with null or undefined username');
            return null;
        }
        try {
            // Query the 'UserProfile' VIEW using the username column
            const profileRow = await postgres('UserProfile')
                .where({username: username}) // Filter by username
                .first();

            if (!profileRow) {
                return null; // User profile not found for this username
            }
            return UserProfile.fromDbRow(profileRow);
        } catch (error) {
            console.error(`Error fetching user profile by username (${username}):`, error);
            throw error;
        }
    }

    /**
     * Fetches a user profile by their principalId.
     * @param {string} principalId - The principalId string.
     * @returns {Promise<UserProfile | null>} A promise that resolves to a UserProfile instance or null if not found.
     * @throws {Error} Throws an error if the database query fails.
     */
    async getByPrincipalId(principalId) {
        if (!principalId) {
            console.error('getByPrincipalId called with null or undefined principalId');
            return null;
        }
        try {
            // Query the 'UserProfile' VIEW using the principalId column
            const profileRow = await postgres('UserProfile')
                .where({principalId: principalId}) // Filter by principalId
                .first();

            if (!profileRow) {
                return null; // User profile not found for this principalId
            }
            return UserProfile.fromDbRow(profileRow);
        } catch (error) {
            console.error(`Error fetching user profile by principalId (${principalId}):`, error);
            throw error;
        }
    }
}

// Export a singleton instance of the DAO
export default new UserProfileDAO();
