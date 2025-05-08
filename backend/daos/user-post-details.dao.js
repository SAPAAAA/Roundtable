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
     * Options for sorting, filtering, and pagination.
     * If `options.sortBy` is 'score', posts are scored and sorted by this custom score in the application.
     * Otherwise, sorting is performed by the database based on `options.sortBy` and `options.order`.
     *
     * @param {object} [options={}] - Options for querying.
     * @param {number} [options.limit] - Number of posts to return.
     * @param {number} [options.offset] - Number of posts to skip (for pagination).
     * @param {string} [options.sortBy='postCreatedAt'] - Column to sort by, or 'score' for custom scoring.
     * @param {string} [options.order='desc'] - Sort order ('asc' or 'desc').
     * @param {boolean} [options.includeRemoved=false] - Whether to include posts marked as removed.
     * @returns {Promise<UserPostDetails[]>} - A promise resolving to an array of formatted post objects.
     * @throws {Error} Throws database errors.
     */
    async getHomePosts(options = {}) {
        const isSortingByScore = options.sortBy === 'score';

        // Prepare query options, establishing defaults.
        // If sorting by 'score', default database sort can be by creation date or another sensible field.
        // The final sort order for 'score' will be handled in the application.
        const {
            limit,
            offset = 0, // Default offset to 0 if not provided
            sortBy: dbSortBy,
            order,
            includeRemoved
        } = this._prepareQueryOptions({ // Assuming this._prepareQueryOptions is defined in your class
            ...options,
            // If isSortingByScore is true, dbSortBy will use the fallback or default from _prepareQueryOptions
            // as the true sort happens later. If false, it uses the user's specified sortBy.
            sortBy: isSortingByScore ? (options.sortByFallback || 'postCreatedAt') : (options.sortBy || 'postCreatedAt'),
            order: options.order || 'desc',
            // limit is handled differently: if sorting by score, we fetch more initially.
        });

        try {
            let query = postgresInstance(this.viewName).select('*');

            if (!includeRemoved) {
                query = query.where('isRemoved', false);
            }

            // If not sorting by custom score, apply database-level sorting and pagination (if limit is provided)
            if (!isSortingByScore) {
                query = query.orderBy(dbSortBy, order).offset(offset);
                if (limit !== null && limit !== undefined) { // Ensure limit is explicitly set
                    query = query.limit(limit);
                }
            }
            // If sorting by score, we fetch all matching 'includeRemoved' status,
            // then score, sort, and paginate in the application layer.
            // This is necessary for accurate scoring across the entire relevant dataset.
            // For very large datasets, consider fetching a pre-filtered subset (e.g., recent posts)
            // before scoring to optimize performance.

            const viewRows = await query;
            let posts = viewRows.map(row => UserPostDetails.fromDbRow(row)).filter(post => post !== null);

            if (isSortingByScore) {
                const now = new Date();
                const scoredPosts = posts.map(post => {
                    // 1. Time Score (newer is higher)
                    const postDate = new Date(post.postCreatedAt);
                    // Handle invalid dates robustly
                    const ageInDays = (postDate && !isNaN(postDate.getTime())) ? (now - postDate) / (1000 * 60 * 60 * 24) : Infinity;
                    const timeScore = (postDate && !isNaN(postDate.getTime())) ? Math.max(0, 100 - ageInDays) : 0;

                    // 2. Vote Score (more votes is higher)
                    const voteScore = (post.voteCount || 0) * 10; // Default to 0 if voteCount is null/undefined

                    // 3. Comment Score (more comments is higher)
                    const commentScore = (post.commentCount || 0) * 5; // Default to 0 if commentCount is null/undefined

                    const totalScore = timeScore + voteScore + commentScore;

                    return {
                        ...post,
                        _score: totalScore
                    };
                });

                // Sort posts by the calculated score.
                // The 'order' option from input options can determine ascending/descending for the score.
                scoredPosts.sort((a, b) => {
                    return order === 'asc' ? a._score - b._score : b._score - a._score;
                });

                // Apply pagination (limit and offset) after scoring and sorting
                const startIndex = offset;
                const endIndex = (limit !== null && limit !== undefined) ? offset + limit : scoredPosts.length;
                const paginatedPosts = scoredPosts.slice(startIndex, endIndex);

                // Remove the _score property before returning
                return paginatedPosts.map(p => {
                    const {_score, ...cleanPost} = p;
                    return cleanPost;
                });
            } else {
                // If not sorting by score, posts are already sorted and paginated by the DB (if limit was applied).
                return posts;
            }

        } catch (error) {
            console.error(`[UserPostDetailsDAO] Error fetching home posts:`, error);
            throw error; // Re-throw the error for upstream handling
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