import postgres from '#db/postgres.js';
import UserCommentDetails from '#models/userCommentDetails.model.js';

/**
 * @typedef {Object} GetCommentsOptions
 * @property {string} [sortBy='commentCreatedAt'] - Column to sort by (e.g., 'commentCreatedAt', 'voteCount'). Must be whitelisted.
 * @property {'asc' | 'desc'} [order='asc'] - Sort order ('asc' or 'desc').
 * @property {boolean} [includeRemoved=false] - Whether to include comments marked as removed.
 * @property {number} [limit] - Maximum number of comments to return (for pagination).
 * @property {number} [offset] - Number of comments to skip (for pagination).
 */

/**
 * DAO for interacting with the "UserCommentDetails" database VIEW.
 */
class UserCommentDetailsDao {

    /**
     * Fetches comments (with author details) for a specific post from the VIEW.
     * @param {string} postId - The UUID of the post.
     * @param {GetCommentsOptions} [options={}] - Options for sorting, filtering, and pagination.
     * @returns {Promise<UserCommentDetails[]>} - A promise resolving to an array of UserCommentDetails instances.
     */
    async getByPostId(postId, options = {}) {
        // --- Default options ---
        const defaults = {
            sortBy: 'commentCreatedAt',
            order: 'asc',
            includeRemoved: false,
            limit: null,
            offset: 0
        };
        const finalOptions = {...defaults, ...options};

        // --- Parameter validation/sanitization ---
        const allowedSortColumns = ['commentCreatedAt', 'voteCount']; // Whitelist for security
        const sortBy = allowedSortColumns.includes(finalOptions.sortBy) ? finalOptions.sortBy : defaults.sortBy;
        const order = finalOptions.order.toLowerCase() === 'desc' ? 'desc' : 'asc';

        // Use "UserCommentDetails" as the view name
        let query = postgres('UserCommentDetails')
            .select('*') // Select all columns from the view
            .where({postId: postId});

        // Apply filtering for removed comments
        if (!finalOptions.includeRemoved) {
            query = query.andWhere({isRemoved: false});
        }

        // Apply sorting
        query = query.orderBy(sortBy, order);

        // Apply pagination
        if (finalOptions.limit !== null && Number.isInteger(finalOptions.limit) && finalOptions.limit > 0) {
            query = query.limit(finalOptions.limit);
        }
        if (Number.isInteger(finalOptions.offset) && finalOptions.offset > 0) {
            query = query.offset(finalOptions.offset);
        }

        // --- Execute Query ---
        try {

            const rows = await query; // Execute the query

            // --- Map Results ---
            if (!rows || rows.length === 0) {
                return []; // No comments found
            }
            // Use the static method from the model class to map rows
            return rows.map(row => UserCommentDetails.fromDbRow(row)).filter(details => details !== null); // Filter out nulls if fromDbRow failed

        } catch (error) {
            console.error("Error fetching UserCommentDetails by Post ID:", error);
            // Optionally log query.toSQL() here as well in case of error
            throw new Error("Database error fetching comments."); // Or re-throw specific error
        }
    }

    /**
     * Fetches a single comment (with author details) by its ID from the VIEW.
     * @param {string} commentId - The UUID of the comment.
     * @returns {Promise<UserCommentDetails | null>} - A promise resolving to a UserCommentDetails instance or null if not found.
     */
    async getByCommentId(commentId) {
        const query = postgres('"UserCommentDetails"')
            .select('*')
            .where({commentId: commentId})
            .first(); // Use .first() to get a single object or undefined

        // --- Execute Query ---
        try {
            const row = await query; // Execute the query

            // --- Map Result ---
            if (!row) {
                return null; // Not found
            }

            // Map the row using the static method from the model
            return UserCommentDetails.fromDbRow(row);

        } catch (error) {
            console.error("Error fetching UserCommentDetails by Comment ID:", error);
            throw new Error("Database error fetching comment.");
        }
    }
}

export default new UserCommentDetailsDao();