// dao/vote.dao.js
import postgres from '#db/postgres.js'; // Assuming your postgres connection setup file
import Vote, {VoteTypeEnum} from '#models/vote.model.js'; // Import model and enum

class VoteDAO {

    /**
     * Creates a new vote record in the database.
     * @param {Vote} vote - The Vote object instance to create.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Vote | null>} The created Vote instance with DB-generated fields, or null on failure.
     */
    async create(vote, trx = null) {
        const queryBuilder = trx ? trx : postgres;
        // voteId and createdAt are handled by the DB.
        const {voteId, createdAt, ...insertData} = vote;

        // Ensure the voteType is valid before inserting
        if (!Vote.isValidVoteType(insertData.voteType)) {
            throw new Error(`Invalid voteType provided: ${insertData.voteType}`);
        }

        try {
            const insertedRows = await queryBuilder('Vote')
                .insert(insertData) // insertData now contains voteType:'upvote'/'downvote'
                .returning('*');

            if (!Array.isArray(insertedRows) || insertedRows.length === 0) {
                console.error('Vote creation failed or did not return expected data.', insertedRows);
                throw new Error('Database error during vote creation: No data returned.');
            }
            return Vote.fromDbRow(insertedRows[0]);
        } catch (error) {
            console.error('Error creating vote:', error);
            // Handle specific DB errors like unique constraint violations if needed
            // if (error.code === '23505') { // PostgreSQL unique violation
            //     throw new Error('User has already voted on this item.');
            // }
            throw error;
        }
    }

    /**
     * Finds a specific vote by its ID.
     * @param {string} voteId - The UUID of the vote to find.
     * @returns {Promise<Vote | null>} The found Vote instance, or null if not found.
     */
    async getById(voteId) {
        try {
            const voteRow = await postgres('Vote').where({voteId}).first();
            // fromDbRow now correctly handles voteType
            return voteRow ? Vote.fromDbRow(voteRow) : null;
        } catch (error) {
            console.error('Error finding vote by ID:', error);
            throw error;
        }
    }

    /**
     * Finds a vote by a specific user on a specific post.
     * @param {string} voterUserId - The UUID of the user.
     * @param {string} postId - The UUID of the post.
     * @returns {Promise<Vote | null>} The found Vote instance, or null if not found.
     */
    async findByUserAndPost(voterUserId, postId) {
        try {
            const voteRow = await postgres('Vote')
                .where({
                    voterUserId: voterUserId,
                    postId: postId
                })
                .first();
            // fromDbRow now correctly handles voteType
            return voteRow ? Vote.fromDbRow(voteRow) : null;
        } catch (error) {
            console.error('Error finding vote by user and post:', error);
            throw error;
        }
    }

    /**
     * Finds a vote by a specific user on a specific comment.
     * @param {string} voterUserId - The UUID of the user.
     * @param {string} commentId - The UUID of the comment.
     * @returns {Promise<Vote | null>} The found Vote instance, or null if not found.
     */
    async findByUserAndComment(voterUserId, commentId) {
        try {
            const voteRow = await postgres('Vote')
                .where({
                    voterUserId: voterUserId,
                    commentId: commentId
                })
                .first();
            // fromDbRow now correctly handles voteType
            return voteRow ? Vote.fromDbRow(voteRow) : null;
        } catch (error) {
            console.error('Error finding vote by user and comment:', error);
            throw error;
        }
    }

    /**
     * Finds all votes associated with a specific post ID.
     * @param {string} postId - The UUID of the post.
     * @returns {Promise<Vote[]>} An array of Vote instances.
     */
    async findVotesByPostId(postId) {
        try {
            const voteRows = await postgres('Vote').where({postId});
            // fromDbRow now correctly handles voteType
            return voteRows.map(row => Vote.fromDbRow(row));
        } catch (error) {
            console.error('Error finding votes by post ID:', error);
            throw error;
        }
    }

    /**
     * Finds all votes associated with a specific comment ID.
     * @param {string} commentId - The UUID of the comment.
     * @returns {Promise<Vote[]>} An array of Vote instances.
     */
    async findVotesByCommentId(commentId) {
        try {
            const voteRows = await postgres('Vote').where({commentId});
            // fromDbRow now correctly handles voteType
            return voteRows.map(row => Vote.fromDbRow(row));
        } catch (error) {
            console.error('Error finding votes by comment ID:', error);
            throw error;
        }
    }


    /**
     * Updates an existing vote, typically to change its type (upvote/downvote).
     * @param {string} voteId - The UUID of the vote to update.
     * @param {{ voteType: typeof VoteTypeEnum[keyof typeof VoteTypeEnum] }} updates - An object containing the new voteType.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Vote | null>} The updated Vote instance, or null if not found or update failed.
     */
    async update(voteId, updates, trx = null) {
        const queryBuilder = trx ? trx : postgres;

        // Validate the provided voteType
        if (!updates || !Vote.isValidVoteType(updates.voteType)) {
            throw new Error(`Invalid update voteType provided: ${updates?.voteType}`);
        }

        // Only allow updating the 'voteType' field
        const allowedUpdates = {voteType: updates.voteType};

        try {
            const updatedRows = await queryBuilder('Vote')
                .where({voteId})
                .update(allowedUpdates) // Update with the new voteType
                .returning('*');

            if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
                return null; // Indicate vote not found or update failed
            }
            // fromDbRow now correctly handles voteType
            return Vote.fromDbRow(updatedRows[0]);
        } catch (error) {
            console.error('Error updating vote:', error);
            throw error;
        }
    }

    /**
     * Deletes a vote from the database by its ID.
     * @param {string} voteId - The UUID of the vote to delete.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<number>} The number of rows deleted (should be 1 if successful, 0 if not found).
     */
    async delete(voteId, trx = null) {
        const queryBuilder = trx ? trx : postgres;
        try {
            const deletedCount = await queryBuilder('Vote')
                .where({voteId})
                .del();
            return deletedCount;
        } catch (error) {
            console.error('Error deleting vote:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export default new VoteDAO();
