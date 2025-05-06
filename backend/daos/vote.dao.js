// backend/daos/vote.dao.js
import {postgresInstance} from '#db/postgres.js';
import Vote, {VoteTypeEnum} from '#models/vote.model.js';
import {BadRequestError, ConflictError} from "#errors/AppError.js"; // Import for specific errors

class VoteDAO {

    /**
     * Creates a new vote record in the database.
     * @param {Vote} vote - The Vote object instance to create.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Vote>} The created Vote instance with DB-generated fields.
     * @throws {BadRequestError} If voteType is invalid.
     * @throws {ConflictError} If a unique constraint (e.g., user already voted) is violated.
     * @throws {Error} For other database errors.
     */
    async create(vote, trx = null) {
        const queryBuilder = trx || postgresInstance;
        const {voteId, createdAt, ...insertData} = vote;

        // DAO can perform basic model validation if needed, though service layer often handles this
        if (!Vote.isValidVoteType(insertData.voteType)) {
            // Throwing BadRequestError here aligns if DAO does input validation
            throw new BadRequestError(`Invalid voteType provided to DAO: ${insertData.voteType}`);
        }

        try {
            const insertedRows = await queryBuilder('Vote')
                .insert(insertData)
                .returning('*');

            if (!insertedRows || insertedRows.length === 0) {
                throw new Error('Vote creation in DAO failed: No data returned from insert.');
            }
            return Vote.fromDbRow(insertedRows[0]);
        } catch (error) {
            console.error('[VoteDAO] Error creating vote:', error);
            if (error.code === '23505') { // PostgreSQL unique violation (adjust constraint name if needed)
                throw new ConflictError('User has already voted on this item.'); // More specific error
            }
            throw error; // Re-throw other DB errors
        }
    }

    /**
     * Finds a specific vote by its ID.
     * @param {string} voteId - The UUID of the vote to find.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Vote | null>} The found Vote instance, or null if not found.
     * @throws {Error} For database errors.
     */
    async getById(voteId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            const voteRow = await queryBuilder('Vote').where({voteId}).first();
            return Vote.fromDbRow(voteRow); // Handles null row
        } catch (error) {
            console.error(`[VoteDAO] Error finding vote by ID (${voteId}):`, error);
            throw error;
        }
    }

    /**
     * Finds a vote by a specific user on a specific post.
     * @param {string} voterUserId - The UUID of the user.
     * @param {string} postId - The UUID of the post.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Vote | null>} The found Vote instance, or null if not found.
     * @throws {Error} For database errors.
     */
    async getByUserAndPost(voterUserId, postId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            const voteRow = await queryBuilder('Vote')
                .where({voterUserId: voterUserId, postId: postId})
                .first();
            return Vote.fromDbRow(voteRow);
        } catch (error) {
            console.error(`[VoteDAO] Error finding vote by user (${voterUserId}) and post (${postId}):`, error);
            throw error;
        }
    }

    /**
     * Finds a vote by a specific user on a specific comment.
     * @param {string} voterUserId - The UUID of the user.
     * @param {string} commentId - The UUID of the comment.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Vote | null>} The found Vote instance, or null if not found.
     * @throws {Error} For database errors.
     */
    async getByUserAndComment(voterUserId, commentId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            const voteRow = await queryBuilder('Vote')
                .where({voterUserId: voterUserId, commentId: commentId})
                .first();
            return Vote.fromDbRow(voteRow);
        } catch (error) {
            console.error(`[VoteDAO] Error finding vote by user (${voterUserId}) and comment (${commentId}):`, error);
            throw error;
        }
    }

    // --- Methods for finding multiple votes (if needed by services) ---

    /**
     * Finds all votes associated with a specific post ID.
     * @param {string} postId - The UUID of the post.
     * @returns {Promise<Vote[]>} An array of Vote instances.
     * @throws {Error} For database errors.
     */
    async getVotesByPostId(postId) {
        try {
            const voteRows = await postgresInstance('Vote').where({postId});
            return voteRows.map(row => Vote.fromDbRow(row));
        } catch (error) {
            console.error(`[VoteDAO] Error finding votes by post ID (${postId}):`, error);
            throw error;
        }
    }

    /**
     * Finds all votes associated with a specific comment ID.
     * @param {string} commentId - The UUID of the comment.
     * @returns {Promise<Vote[]>} An array of Vote instances.
     * @throws {Error} For database errors.
     */
    async getVotesByCommentId(commentId) {
        try {
            const voteRows = await postgresInstance('Vote').where({commentId});
            return voteRows.map(row => Vote.fromDbRow(row));
        } catch (error) {
            console.error(`[VoteDAO] Error finding votes by comment ID (${commentId}):`, error);
            throw error;
        }
    }


    /**
     * Updates an existing vote, typically to change its type (upvote/downvote).
     * @param {string} voteId - The UUID of the vote to update.
     * @param {{ voteType: typeof VoteTypeEnum[keyof typeof VoteTypeEnum] }} updates - An object containing the new voteType.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Vote | null>} The updated Vote instance, or null if not found or update failed.
     * @throws {BadRequestError} If voteType is invalid.
     * @throws {Error} For other database errors.
     */
    async update(voteId, updates, trx = null) {
        const queryBuilder = trx || postgresInstance;

        if (!updates || !Vote.isValidVoteType(updates.voteType)) {
            throw new BadRequestError(`Invalid update voteType provided to DAO: ${updates?.voteType}`);
        }
        // Only allow updating specific fields like 'voteType'
        const allowedUpdates = {voteType: updates.voteType};

        try {
            const updatedRows = await queryBuilder('Vote')
                .where({voteId})
                .update(allowedUpdates)
                .returning('*');

            if (!updatedRows || updatedRows.length === 0) {
                return null; // Indicate vote not found or update failed
            }
            return Vote.fromDbRow(updatedRows[0]);
        } catch (error) {
            console.error(`[VoteDAO] Error updating vote (${voteId}):`, error);
            throw error;
        }
    }

    /**
     * Deletes a vote from the database by its ID.
     * @param {string} voteId - The UUID of the vote to delete.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<number>} The number of rows deleted (should be 1 if successful, 0 if not found).
     * @throws {Error} For database errors.
     */
    async delete(voteId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            return await queryBuilder('Vote')
                .where({voteId})
                .del();
        } catch (error) {
            console.error(`[VoteDAO] Error deleting vote (${voteId}):`, error);
            throw error;
        }
    }
}

export default new VoteDAO();