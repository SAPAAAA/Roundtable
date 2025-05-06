// backend/daos/user-post-details.dao.js
import {postgresInstance} from '#db/postgres.js';
import UserPostDetails from '#models/user-post-details.model.js';

/**
 * @typedef {Object} GetPostsOptions
 * @property {string} [sortBy='postCreatedAt'] - Column from the VIEW to sort by (e.g., 'postCreatedAt', 'voteCount', 'commentCount'). Must be whitelisted.
 * @property {'asc' | 'desc'} [order='desc'] - Sort order ('asc' or 'desc'). Default is 'desc' for recency.
 * @property {boolean} [includeRemoved=false] - Whether to include posts marked as removed.
 * @property {number | null} [limit=25] - Maximum number of posts to return (for pagination). Null for no limit.
 * @property {number} [offset=0] - Number of posts to skip (for pagination).
 */

class UserPostDetailsDAO {
    constructor() {
        this.viewName = 'UserPostDetails'; // IMPORTANT: Replace with your actual VIEW name
    }
    /**
     * Fetches detailed post information for a single post by its ID from the VIEW.
     * @param {string} postId - The UUID of the post.
     * @returns {Promise<UserPostDetails | null>} - A promise resolving to a UserPostDetails instance or null if not found.
     * @throws {Error} Throws database errors.
     */
    async getByPostId(postId) {
        if (!postId) return null;
        try {
            const viewRow = await postgresInstance(this.viewName)
                .where({postId: postId})
                .first();
            return UserPostDetails.fromDbRow(viewRow);
        } catch (error) {
            console.error(`[UserPostDetailsDAO] Error fetching by postId (${postId}):`, error);
            throw error;
        }
    }

    /**
     * Fetches a list of detailed posts belonging to a specific subtable from the VIEW.
     * @param {string} subtableId - The UUID of the subtable.
     * @param {GetPostsOptions} [options={}] - Options for sorting, filtering, and pagination.
     * @returns {Promise<UserPostDetails[]>} - A promise resolving to an array of UserPostDetails instances.
     * @throws {Error} Throws database errors.
     */
    async getBySubtableId(subtableId, options = {}) {
        if (!subtableId) {
            console.warn('[UserPostDetailsDAO] getBySubtableId called without subtableId.');
            return [];
        }

        const {limit, offset, sortBy, order, includeRemoved} = this._prepareQueryOptions(options);

        try {
            let query = postgresInstance(this.viewName)
                .select('*')
                .where({subtableId: subtableId});

            if (!includeRemoved) {
                query = query.andWhere({isRemoved: false});
            }

            query = query.orderBy(sortBy, order).offset(offset);

            if (limit !== null) {
                query = query.limit(limit);
            }

            const viewRows = await query;
            return viewRows.map(row => UserPostDetails.fromDbRow(row)).filter(details => details !== null);

        } catch (error) {
            console.error(`[UserPostDetailsDAO] Error fetching by subtableId (${subtableId}):`, error);
            throw error;
        }
    }

    /**
     * Fetches a list of detailed posts authored by a specific user from the VIEW.
     * @param {string} authorUserId - The UUID of the author (RegisteredUser).
     * @param {GetPostsOptions} [options={}] - Options for sorting, filtering, and pagination.
     * @returns {Promise<UserPostDetails[]>} - A promise resolving to an array of UserPostDetails instances.
     * @throws {Error} Throws database errors.
     */
    async getByAuthorUserId(authorUserId, options = {}) {
        if (!authorUserId) {
            console.warn('[UserPostDetailsDAO] getByAuthorUserId called without authorUserId.');
            return [];
        }

        const {limit, offset, sortBy, order, includeRemoved} = this._prepareQueryOptions(options);

        try {
            let query = postgresInstance(this.viewName)
                .select('*')
                .where({authorUserId: authorUserId});

            if (!includeRemoved) {
                query = query.andWhere({isRemoved: false});
            }

            query = query.orderBy(sortBy, order).offset(offset);

            if (limit !== null) {
                query = query.limit(limit);
            }

            const viewRows = await query;
            return viewRows.map(row => UserPostDetails.fromDbRow(row)).filter(details => details !== null);

        } catch (error) {
            console.error(`[UserPostDetailsDAO] Error fetching by authorUserId (${authorUserId}):`, error);
            throw error;
        }
    }

    /**
     * Fetches a list of posts for the home page from the VIEW.
     * @param {GetPostsOptions} [options={}] - Options for sorting, filtering, and pagination.
     * @returns {Promise<UserPostDetails[]>} - A promise resolving to an array of formatted post objects.
     * @throws {Error} Throws database errors.
     */
    async getHomePosts(options = {}) {
        const {limit, offset, sortBy, order, includeRemoved} = this._prepareQueryOptions({
            ...options,
            sortBy: options.sortBy || 'postCreatedAt', // Ensure default if needed
            order: options.order || 'desc',
        });

        try {
            let query = postgresInstance(this.viewName)
                .select('*')

            if (!includeRemoved) {
                query = query.where('isRemoved', false);
            }

            query = query.orderBy(sortBy, order).offset(offset);

            if (limit !== null) {
                query = query.limit(limit);
            }

            const viewRows = await query;
            return viewRows.map(row => UserPostDetails.fromDbRow(row)).filter(post => post !== null);

        } catch (error) {
            console.error(`[UserPostDetailsDAO] Error fetching home posts:`, error);
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
            sortBy: 'postCreatedAt', // Default sort column
            order: 'desc',           // Default sort order
            includeRemoved: false,
            limit: 25,
            offset: 0
        };
        const finalOptions = {...defaults, ...options};

        // Whitelist allowed sort columns from the VIEW
        const allowedSortColumns = ['postCreatedAt', 'voteCount', 'commentCount', 'title', 'authorUsername', 'subtableName'];
        const sortBy = allowedSortColumns.includes(finalOptions.sortBy) ? finalOptions.sortBy : defaults.sortBy;

        const order = finalOptions.order?.toLowerCase() === 'asc' ? 'asc' : 'desc'; // Default to desc

        // Ensure limit is a positive integer or null
        const limit = (finalOptions.limit !== null && Number.isInteger(Number(finalOptions.limit)) && Number(finalOptions.limit) > 0)
            ? Number(finalOptions.limit)
            : null;

        // Ensure offset is a non-negative integer
        const offset = (Number.isInteger(Number(finalOptions.offset)) && Number(finalOptions.offset) >= 0)
            ? Number(finalOptions.offset)
            : defaults.offset;

        const includeRemoved = typeof finalOptions.includeRemoved === 'boolean' ? finalOptions.includeRemoved : defaults.includeRemoved;

        return {sortBy, order, includeRemoved, limit, offset};
    }
}

export default new UserPostDetailsDAO();