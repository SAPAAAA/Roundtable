import {Vote, VoteTypeEnum} from "#models/vote.model.js";
import {BadRequestError, NotFoundError} from "#errors/AppError.js";
import {postgresInstance} from "#db/postgres.js";
import VoteDAO from "#daos/vote.dao.js";

class VoteService {
    async createVote(voterUserId, postId, commentId = null, voteType) {
        // Validate voteType
        if (!Object.values(VoteTypeEnum).includes(voteType)) {
            throw new BadRequestError(`Invalid vote type: ${voteType}. Must be one of: ${Object.values(VoteTypeEnum).join(', ')}`);
        }

        // Check if both postId and commentId are provided
        if (!postId && !commentId) {
            throw new BadRequestError("Either postId or commentId is required to create a vote.");
        }

        // Create the vote
        let createdVote;
        try {
            createdVote = await postgresInstance.transaction(async (trx) => {
                const vote = new Vote(null, voterUserId, postId, commentId, voteType, null);
                return await VoteDAO.create(vote, trx);

            });
        } catch (error) {
            console.error("Error creating vote:", error);
            throw error;
        }

        // Check if the vote was created successfully
        if (!createdVote) {
            throw new Error("Failed to create vote.");
        }

        // Return the created vote
        return {
            message: "Vote created successfully.",
            vote: createdVote,
        };
    }

    async deleteVote(voteId) {
        // Check if voteId is provided
        if (!voteId) {
            throw new BadRequestError("VoteId is required to delete a vote.");
        }

        // Delete the vote
        let deletedVote;
        try {
            deletedVote = await postgresInstance.transaction(async (trx) => {
                return await VoteDAO.delete(voteId, trx);
            });
        } catch (error) {
            console.error("Error deleting vote:", error);
            throw error;
        }

        // Check if the vote was deleted successfully
        if (!deletedVote) {
            throw new NotFoundError(`Vote with ID ${voteId} not found.`);
        }

        // Return the result of deletion
        return {
            message: "Vote deleted successfully.",
            deletedCount: deletedVote,
        };
    }

    async updateVote(voteId, voteType) {
        // Validate voteType
        if (!Object.values(VoteTypeEnum).includes(voteType)) {
            throw new BadRequestError(`Invalid vote type: ${voteType}. Must be one of: ${Object.values(VoteTypeEnum).join(', ')}`);
        }

        // Check if voteId is provided
        if (!voteId) {
            throw new BadRequestError("VoteId is required to update a vote.");
        }

        // Update the vote
        let updatedVote;
        try {
            updatedVote = await postgresInstance.transaction(async (trx) => {
                return await VoteDAO.update(voteId, {voteType}, trx);
            });
        } catch (error) {
            console.error("Error updating vote:", error);
            throw error;
        }

        // Check if the vote was updated successfully
        if (!updatedVote) {
            throw new NotFoundError(`Vote with ID ${voteId} not found.`);
        }

        // Return the updated vote
        return {
            message: "Vote updated successfully.",
            vote: updatedVote,
        };
    }

    async checkVoteOwnership(voteId, userId) {
        // Check if voteId and userId are provided
        if (!voteId || !userId) {
            throw new BadRequestError("VoteId and userId are required to check vote ownership.");
        }

        // Check if the vote belongs to the user
        const vote = await VoteDAO.getById(voteId);
        console.log(`[VoteService.checkVoteOwnership] Vote found: ${vote}`);
        if (!vote) {
            throw new NotFoundError(`Vote with ID ${voteId} not found.`);
        }

        if (vote.voterUserId !== userId) {
            throw new BadRequestError(`User with ID ${userId} does not own the vote with ID ${voteId}.`);
        }

        return {
            message: "Vote ownership verified successfully.",
            vote,
        };
    }
}

export default new VoteService();