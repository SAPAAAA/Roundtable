// services/vote.service.js

// --- Imports ---
import {Vote, VoteTypeEnum} from "#models/vote.model.js";
import {BadRequestError, ForbiddenError, InternalServerError, NotFoundError} from "#errors/AppError.js"; // Keep necessary error imports
import {postgresInstance} from "#db/postgres.js";
import VoteDAO from "#daos/vote.dao.js"; // Import the DAO to be injected

class VoteService {
    /**
     * Constructor for VoteService.
     * Accepts the VoteDAO as a dependency.
     * @param {object} voteDao - Data Access Object for votes.
     */
    constructor(voteDao) {
        // Store the injected DAO instance for use in methods
        this.voteDao = voteDao;
    }

    // --- Original Method Bodies (with this.voteDao) ---

    /**
     * Creates a new vote.
     * @param {string} voterUserId - The ID of the user creating the vote.
     * @param {string|null} postId - The ID of the post being voted on.
     * @param {string|null} [commentId=null] - The ID of the comment being voted on.
     * @param {string} voteType - The type of vote (e.g., 'upvote', 'downvote').
     * @returns {Promise<object>} Object containing a success message and the created vote.
     * @throws {BadRequestError} If validation fails.
     * @throws {InternalServerError} If the database operation fails unexpectedly.
     */
    async createVote(voterUserId, postId, commentId = null, voteType) {
        // Validate voteType
        if (!Object.values(VoteTypeEnum).includes(voteType)) {
            throw new BadRequestError(`Invalid vote type: ${voteType}. Must be one of: ${Object.values(VoteTypeEnum).join(', ')}`);
        }

        // Check if either postId or commentId is provided (adjust if both are allowed)
        if (!postId && !commentId) {
            throw new BadRequestError("Either postId or commentId is required to create a vote.");
        }
        // Optional: Add validation if both postId and commentId are provided simultaneously, if that's invalid.
        // if (postId && commentId) {
        //     throw new BadRequestError("Cannot vote on both a post and a comment simultaneously.");
        // }
        if (!voterUserId) {
            throw new BadRequestError("voterUserId is required.");
        }


        // Create the vote within a transaction
        let createdVote;
        try {
            createdVote = await postgresInstance.transaction(async (trx) => {
                // Note: Original code didn't explicitly check for existing votes here.
                // Consider adding findByUserAndPost/Comment check if duplicates aren't allowed.
                const vote = new Vote(null, voterUserId, postId, commentId, voteType); // createdAt/updatedAt handled by DB/DAO
                // Use the injected DAO instance
                return await this.voteDao.create(vote, trx);
            });
        } catch (error) {
            // Re-throw known errors, wrap unknown ones
            if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof ForbiddenError) {
                throw error;
            }
            console.error("Error creating vote:", error);
            // Use InternalServerError for unexpected issues
            throw new InternalServerError("An error occurred while creating the vote.");
        }

        // Check if the vote was created successfully (transaction should throw if DAO fails)
        // This check might be redundant if the transaction guarantees an error on failure.
        if (!createdVote) {
            // This might indicate an unexpected issue if the transaction didn't throw.
            throw new InternalServerError("Failed to create vote, but no transaction error was caught.");
        }

        // Return the original success message and created vote
        return {
            message: "Vote created successfully.",
            vote: createdVote,
        };
    }

    /**
     * Deletes a specific vote by its ID.
     * @param {string} voteId - The ID of the vote to delete.
     * @returns {Promise<object>} Object containing a success message and the count of deleted records.
     * @throws {BadRequestError} If voteId is not provided.
     * @throws {NotFoundError} If the vote does not exist or couldn't be deleted.
     * @throws {InternalServerError} If the database operation fails unexpectedly.
     */
    async deleteVote(voteId) {
        // Check if voteId is provided
        if (!voteId) {
            throw new BadRequestError("Vote ID is required to delete a vote.");
        }

        // Delete the vote within a transaction
        let deletedCount; // Changed variable name for clarity
        try {
            deletedCount = await postgresInstance.transaction(async (trx) => {
                // Optional: Fetch first to ensure it exists before deleting for a clearer NotFoundError.
                // const voteExists = await this.voteDao.getById(voteId, trx);
                // if (!voteExists) {
                //     throw new NotFoundError(`Vote with ID ${voteId} not found.`);
                // }
                // Use the injected DAO instance
                return await this.voteDao.delete(voteId, trx); // Assumes delete returns count
            });
        } catch (error) {
            if (error instanceof BadRequestError || error instanceof NotFoundError) {
                throw error;
            }
            console.error(`Error deleting vote ${voteId}:`, error);
            throw new InternalServerError("An error occurred while deleting the vote.");
        }

        // Check if the vote was deleted successfully (delete might return 0 if not found)
        if (deletedCount === 0) { // Check if DAO returned 0 deleted rows
            throw new NotFoundError(`Vote with ID ${voteId} not found or already deleted.`);
        }

        // Return the original success message and deletion result
        return {
            message: "Vote deleted successfully.",
            deletedCount: deletedCount, // Return the count
        };
    }

    /**
     * Updates the type of an existing vote.
     * @param {string} voteId - The ID of the vote to update.
     * @param {string} voteType - The new vote type.
     * @returns {Promise<object>} Object containing a success message and the updated vote.
     * @throws {BadRequestError} If validation fails.
     * @throws {NotFoundError} If the vote does not exist or couldn't be updated.
     * @throws {InternalServerError} If the database operation fails unexpectedly.
     */
    async updateVote(voteId, voteType) {
        // Validate voteType
        if (!Object.values(VoteTypeEnum).includes(voteType)) {
            throw new BadRequestError(`Invalid vote type: ${voteType}. Must be one of: ${Object.values(VoteTypeEnum).join(', ')}`);
        }

        // Check if voteId is provided
        if (!voteId) {
            throw new BadRequestError("Vote ID is required to update a vote.");
        }

        // Update the vote within a transaction
        let updatedVote;
        try {
            updatedVote = await postgresInstance.transaction(async (trx) => {
                // Use the injected DAO instance
                // DAO.update should ideally return the updated object or null/undefined if not found
                return await this.voteDao.update(voteId, {voteType}, trx);
            });
        } catch (error) {
            if (error instanceof BadRequestError || error instanceof NotFoundError) {
                throw error;
            }
            console.error(`Error updating vote ${voteId}:`, error);
            throw new InternalServerError("An error occurred while updating the vote.");
        }

        // Check if the vote was updated successfully (update might return null/undefined if not found)
        if (!updatedVote) {
            throw new NotFoundError(`Vote with ID ${voteId} not found or could not be updated.`);
        }

        // Return the original success message and updated vote
        return {
            message: "Vote updated successfully.",
            vote: updatedVote,
        };
    }

    /**
     * Checks if a given user is the owner of a specific vote.
     * @param {string} voteId - The ID of the vote.
     * @param {string} userId - The ID of the user to check ownership against.
     * @returns {Promise<object>} Object containing a success message and the vote object if ownership verified.
     * @throws {BadRequestError} If voteId or userId is not provided.
     * @throws {NotFoundError} If the vote does not exist.
     * @throws {ForbiddenError} If the user does not own the vote.
     * @throws {InternalServerError} For unexpected errors during data retrieval.
     */
    async checkVoteOwnership(voteId, userId) {
        // Check if voteId and userId are provided
        if (!voteId || !userId) {
            throw new BadRequestError("Vote ID and User ID are required to check vote ownership.");
        }

        try {
            // Use the injected DAO instance
            const vote = await this.voteDao.getById(voteId);
            // console.log(`[VoteService.checkVoteOwnership] Vote found: ${JSON.stringify(vote)}`); // Use JSON.stringify for objects
            if (!vote) {
                throw new NotFoundError(`Vote with ID ${voteId} not found.`);
            }

            if (vote.voterUserId !== userId) {
                // Throw ForbiddenError for authorization failure
                throw new ForbiddenError(`User ${userId} does not own vote ${voteId}.`);
            }

            // Return the original success message and vote object
            return {
                message: "Vote ownership verified successfully.",
                vote, // Return the vote object itself
            };

        } catch (error) {
            if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof ForbiddenError) {
                throw error;
            }
            console.error(`Error checking ownership for vote ${voteId} and user ${userId}:`, error);
            throw new InternalServerError("An error occurred while checking vote ownership.");
        }
    }
}

export default new VoteService(VoteDAO);
