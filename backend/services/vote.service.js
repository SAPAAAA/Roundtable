// backend/services/vote.service.js
import Vote from "#models/vote.model.js";
import {AppError, BadRequestError, ForbiddenError, InternalServerError, NotFoundError} from "#errors/AppError.js";
import {postgresInstance} from "#db/postgres.js";
import VoteDAO from "#daos/vote.dao.js"; // Import the DAO

class VoteService {
    /**
     * Constructor for VoteService.
     * Accepts the VoteDAO as a dependency.
     * @param {VoteDAO} voteDao - Data Access Object for votes.
     */
    constructor(voteDao) {
        this.voteDao = voteDao;
    }

    /**
     * Creates or updates a vote. If a vote by the user on the item exists, it updates the type.
     * If the existing vote type is the same as the new one, it deletes the vote (toggle off).
     * If no vote exists, it creates a new one.
     *
     * @param {string} voterUserId - The ID of the user casting the vote.
     * @param {string|null} postId - The ID of the post being voted on.
     * @param {string|null} commentId - The ID of the comment being voted on.
     * @param {string} voteType - The type of vote ('upvote' or 'downvote').
     * @returns {Promise<object>} Object containing a success message and the final state (created vote, updated vote, or null if deleted).
     * @throws {BadRequestError} If validation fails (missing IDs, invalid type).
     * @throws {NotFoundError} If the post/comment to be voted on doesn't exist (add checks if needed).
     * @throws {InternalServerError} If the database operation fails unexpectedly.
     */
    async castVote(voterUserId, postId, commentId, voteType) {
        // --- Input Validation ---
        if (!voterUserId) {
            throw new BadRequestError("Voter User ID is required.");
        }
        if (!postId && !commentId) {
            throw new BadRequestError("Either postId or commentId must be provided.");
        }
        if (postId && commentId) {
            throw new BadRequestError("Cannot vote on both a post and a comment simultaneously.");
        }
        if (!Vote.isValidVoteType(voteType)) {
            throw new BadRequestError(`Invalid vote type: ${voteType}. Must be 'upvote' or 'downvote'.`);
        }
        // Optional: Add checks here to ensure the postId or commentId actually exists using PostDAO/CommentDAO if necessary.

        let resultMessage = '';
        let resultVote = null;
        let status = 'created'; // Can be 'created', 'updated', 'deleted'

        try {
            await postgresInstance.transaction(async (trx) => {
                // --- Check for Existing Vote ---
                let existingVote = null;
                if (postId) {
                    existingVote = await this.voteDao.getByUserAndPost(voterUserId, postId, trx);
                } else { // commentId must be present due to earlier validation
                    existingVote = await this.voteDao.getByUserAndComment(voterUserId, commentId, trx);
                }

                if (existingVote) {
                    // --- Vote Exists: Update or Delete ---
                    if (existingVote.voteType === voteType) {
                        // Same vote type - toggle off (delete)
                        const deletedCount = await this.voteDao.delete(existingVote.voteId, trx);
                        if (deletedCount > 0) {
                            resultMessage = "Vote removed successfully.";
                            status = 'deleted';
                            // resultVote remains null
                        } else {
                            // Should not happen if findByUserAnd... found it, indicates inconsistency
                            throw new InternalServerError("Failed to remove existing vote.");
                        }
                    } else {
                        // Different vote type - update
                        const updatedVote = await this.voteDao.update(existingVote.voteId, {voteType}, trx);
                        if (updatedVote) {
                            resultMessage = "Vote updated successfully.";
                            resultVote = updatedVote;
                            status = 'updated';
                        } else {
                            // Should not happen if findByUserAnd... found it, indicates inconsistency
                            throw new InternalServerError("Failed to update existing vote.");
                        }
                    }
                } else {
                    // --- Vote Doesn't Exist: Create ---
                    const vote = new Vote(null, voterUserId, postId, commentId, voteType);
                    const createdVote = await this.voteDao.create(vote, trx);
                    if (createdVote) {
                        resultMessage = "Vote cast successfully.";
                        resultVote = createdVote;
                        status = 'created';
                    } else {
                        // Should be caught by DAO error, but safety check
                        throw new InternalServerError("Failed to create new vote record.");
                    }
                }
            }); // End transaction

            return {
                message: resultMessage,
                vote: resultVote,
                status: status
            };

        } catch (error) {
            // Re-throw known application errors
            if (error instanceof AppError) {
                throw error;
            }
            // Wrap unexpected errors
            console.error(`[VoteService:castVote] Error for user ${voterUserId} on ${postId ? `post ${postId}` : `comment ${commentId}`}:`, error);
            throw new InternalServerError("An error occurred while casting the vote.");
        }
    }


    /**
     * Checks if a given user is the owner of a specific vote.
     * @param {string} voteId - The ID of the vote.
     * @param {string} userId - The ID of the user to check ownership against.
     * @returns {Promise<Vote>} The vote object if ownership is verified.
     * @throws {BadRequestError} If voteId or userId is not provided.
     * @throws {NotFoundError} If the vote does not exist.
     * @throws {ForbiddenError} If the user does not own the vote.
     * @throws {InternalServerError} For unexpected errors during data retrieval.
     */
    async checkVoteOwnership(voteId, userId) {
        if (!voteId || !userId) {
            throw new BadRequestError("Vote ID and User ID are required to check vote ownership.");
        }

        try {
            const vote = await this.voteDao.getById(voteId);
            if (!vote) {
                throw new NotFoundError(`Vote with ID ${voteId} not found.`);
            }

            if (vote.voterUserId !== userId) {
                throw new ForbiddenError('You do not have permission to modify this vote.');
            }

            return vote; // Return the vote object on success

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error(`[VoteService:checkVoteOwnership] Error for vote ${voteId}, user ${userId}:`, error);
            throw new InternalServerError("An error occurred while checking vote ownership.");
        }
    }

    /**
     * Updates the type of an existing vote after verifying ownership.
     * @param {string} voteId - The ID of the vote to update.
     * @param {string} userId - The ID of the user requesting the update (for ownership check).
     * @param {string} voteType - The new vote type.
     * @returns {Promise<Vote>} The updated vote object.
     * @throws {BadRequestError} If validation fails.
     * @throws {NotFoundError} If the vote does not exist.
     * @throws {ForbiddenError} If the user does not own the vote.
     * @throws {InternalServerError} If the database operation fails unexpectedly.
     */
    async updateVote(voteId, userId, voteType) {
        // --- Input Validation ---
        if (!voteId || !userId || !voteType) {
            throw new BadRequestError("Vote ID, User ID, and Vote Type are required.");
        }
        if (!Vote.isValidVoteType(voteType)) {
            throw new BadRequestError(`Invalid vote type: ${voteType}. Must be 'upvote' or 'downvote'.`);
        }

        try {
            // --- Check Ownership first ---
            // This implicitly checks if the vote exists as well
            await this.checkVoteOwnership(voteId, userId); // Throws NotFoundError or ForbiddenError if applicable

            // --- Update Vote ---
            // Note: Using a transaction isn't strictly necessary here if checkVoteOwnership
            // already confirmed existence, but can be added for consistency.
            const updatedVote = await this.voteDao.update(voteId, {voteType});

            if (!updatedVote) {
                // This might happen if the vote was deleted between checkVoteOwnership and update,
                // though unlikely without transaction locking. Treat as internal error or NotFound.
                throw new InternalServerError(`Failed to update vote ${voteId} after ownership check.`);
                // Alternatively: throw new NotFoundError(`Vote with ID ${voteId} could not be updated.`);
            }

            return updatedVote;

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error(`[VoteService:updateVote] Error for vote ${voteId}:`, error);
            throw new InternalServerError("An error occurred while updating the vote.");
        }
    }

    /**
     * Deletes a specific vote by its ID after verifying ownership.
     * @param {string} voteId - The ID of the vote to delete.
     * @param {string} userId - The ID of the user requesting the deletion (for ownership check).
     * @returns {Promise<boolean>} True if deletion was successful.
     * @throws {BadRequestError} If voteId or userId is not provided.
     * @throws {NotFoundError} If the vote does not exist.
     * @throws {ForbiddenError} If the user does not own the vote.
     * @throws {InternalServerError} If the database operation fails unexpectedly.
     */
    async deleteVote(voteId, userId) {
        if (!voteId || !userId) {
            throw new BadRequestError("Vote ID and User ID are required to delete a vote.");
        }

        try {
            // --- Check Ownership first ---
            await this.checkVoteOwnership(voteId, userId);

            // --- Delete Vote ---
            const deletedCount = await this.voteDao.delete(voteId);

            if (deletedCount === 0) {
                // Vote existed during check but couldn't be deleted? Inconsistency.
                throw new InternalServerError(`Failed to delete vote ${voteId} after ownership check.`);
                // Alternatively: throw new NotFoundError(`Vote with ID ${voteId} could not be deleted.`);
            }

            return true; // Indicate successful deletion

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error(`[VoteService:deleteVote] Error for vote ${voteId}:`, error);
            throw new InternalServerError("An error occurred while deleting the vote.");
        }
    }

}

export default new VoteService(VoteDAO); // Inject DAO