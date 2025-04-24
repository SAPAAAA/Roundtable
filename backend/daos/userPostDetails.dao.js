/**
 * daos/userPostDetails.dao.js
 *
 * Data Access Object for interacting with the "UserPostDetails" database VIEW.
 * Provides methods to fetch detailed post information, including author and subtable details.
 */

import postgres from '#db/postgres.js'; // Assuming Knex instance is exported from here
import UserPostDetails from '../models/userPostDetails.model.js'; // Import the corresponding model

/**
 * @typedef {Object} GetPostsOptions
 * @property {string} [sortBy='postCreatedAt'] - Column from the VIEW to sort by (e.g., 'postCreatedAt', 'voteCount', 'commentCount'). Must be whitelisted.
 * @property {'asc' | 'desc'} [order='desc'] - Sort order ('asc' or 'desc'). Default is 'desc' for recency.
 * @property {boolean} [includeRemoved=false] - Whether to include posts marked as removed.
 * @property {number | null} [limit=25] - Maximum number of posts to return (for pagination). Null for no limit.
 * @property {number} [offset=0] - Number of posts to skip (for pagination).
 */

class UserPostDetailsDAO {

    /**
     * Fetches detailed post information for a single post by its ID from the VIEW.
     * @param {string} postId - The UUID of the post.
     * @returns {Promise<UserPostDetails | null>} - A promise resolving to a UserPostDetails instance or null if not found.
     * @throws {Error} Throws an error if the database query fails.
     */
    async getByPostId(postId) {
        if (!postId) {
            console.error('getByPostId called with null or undefined postId');
            return null;
        }
        try {
            const viewRow = await postgres('UserPostDetails') // Query the VIEW
                .where({postId: postId})
                .first(); // Expecting one or zero results

            if (!viewRow) {
                return null; // Post not found
            }
            // Convert the database row from the VIEW to a UserPostDetails model instance
            return UserPostDetails.fromDbRow(viewRow);
        } catch (error) {
            console.error(`Error fetching UserPostDetails by postId (${postId}):`, error);
            throw error; // Re-throw the error for upstream handling
        }
    }

    /**
     * Fetches a list of detailed posts belonging to a specific subtable from the VIEW.
     * @param {string} subtableId - The UUID of the subtable.
     * @param {GetPostsOptions} [options={}] - Options for sorting, filtering, and pagination.
     * @returns {Promise<UserPostDetails[]>} - A promise resolving to an array of UserPostDetails instances.
     * @throws {Error} Throws an error if the database query fails.
     */
    async getBySubtableId(subtableId, options = {}) {
        if (!subtableId) {
            console.error('getBySubtableId called with null or undefined subtableId');
            return [];
        }

        const {limit, offset, sortBy, order, includeRemoved} = this._prepareQueryOptions(options);

        try {
            let query = postgres('UserPostDetails')
                .select('*') // Select all columns from the VIEW
                .where({subtableId: subtableId});

            if (!includeRemoved) {
                query = query.andWhere({isRemoved: false}); // Default: exclude removed posts
            }

            query = query.orderBy(sortBy, order)
                .offset(offset);

            if (limit !== null) {
                query = query.limit(limit);
            }

            const viewRows = await query;

            if (!viewRows || viewRows.length === 0) {
                return []; // No posts found for this subtable
            }

            // Convert each row to a UserPostDetails model instance
            // Filter out any potential nulls if fromDbRow fails for some reason
            return viewRows.map(row => UserPostDetails.fromDbRow(row)).filter(details => details !== null);

        } catch (error) {
            console.error(`Error fetching UserPostDetails by subtableId (${subtableId}):`, error);
            throw error;
        }
    }

    /**
     * Fetches a list of detailed posts authored by a specific user from the VIEW.
     * @param {string} authorUserId - The UUID of the author (RegisteredUser).
     * @param {GetPostsOptions} [options={}] - Options for sorting, filtering, and pagination.
     * @returns {Promise<UserPostDetails[]>} - A promise resolving to an array of UserPostDetails instances.
     * @throws {Error} Throws an error if the database query fails.
     */
    async getByAuthorUserId(authorUserId, options = {}) {
        if (!authorUserId) {
            console.error('getByAuthorUserId called with null or undefined authorUserId');
            return [];
        }

        const {limit, offset, sortBy, order, includeRemoved} = this._prepareQueryOptions(options);

        try {
            let query = postgres('UserPostDetails')
                .select('*')
                .where({authorUserId: authorUserId}); // Filter by authorUserId from the VIEW

            if (!includeRemoved) {
                query = query.andWhere({isRemoved: false});
            }

            query = query.orderBy(sortBy, order)
                .offset(offset);

            if (limit !== null) {
                query = query.limit(limit);
            }


            const viewRows = await query;

            if (!viewRows || viewRows.length === 0) {
                return []; // No posts found for this author
            }

            return viewRows.map(row => UserPostDetails.fromDbRow(row)).filter(details => details !== null);

        } catch (error) {
            console.error(`Error fetching UserPostDetails by authorUserId (${authorUserId}):`, error);
            throw error;
        }
    }

    /**
     * Helper function to process and validate query options.
     * @private
     * @param {GetPostsOptions} options - Raw options object.
     * @returns {Required<GetPostsOptions>} - Processed and validated options with defaults applied.
     */
    _prepareQueryOptions(options = {}) {
        const defaults = {
            sortBy: 'postCreatedAt',
            order: 'desc',
            includeRemoved: false,
            limit: 25,
            offset: 0
        };
        const finalOptions = {...defaults, ...options};

        // --- Parameter validation/sanitization ---
        // Whitelist allowed sort columns from the VIEW
        const allowedSortColumns = ['postCreatedAt', 'voteCount', 'commentCount', 'title', 'authorUsername', 'subtableName'];
        const sortBy = allowedSortColumns.includes(finalOptions.sortBy) ? finalOptions.sortBy : defaults.sortBy;
        const order = finalOptions.order.toLowerCase() === 'asc' ? 'asc' : 'desc'; // Default to desc
        const limit = (finalOptions.limit !== null && Number.isInteger(finalOptions.limit) && finalOptions.limit > 0) ? finalOptions.limit : null; // Allow null for no limit
        const offset = (Number.isInteger(finalOptions.offset) && finalOptions.offset >= 0) ? finalOptions.offset : defaults.offset;
        const includeRemoved = typeof finalOptions.includeRemoved === 'boolean' ? finalOptions.includeRemoved : defaults.includeRemoved;


        return {sortBy, order, includeRemoved, limit, offset};
    }

}

// Export a singleton instance of the DAO
export default new UserPostDetailsDAO();