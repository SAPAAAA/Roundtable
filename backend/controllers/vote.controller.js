import HTTP_STATUS from "#constants/httpStatus.js";
import voteService from "#services/vote.service.js";

class VoteController {
    constructor(voteService) {
        this.voteService = voteService;
    }

    // Function to check if the existing vote belongs to the user
    checkVoteOwnership = async (req, res, next) => {
        const {voteId} = req.params;
        const userId = req.session.userId;

        try {
            const result = await this.voteService.checkVoteOwnership(voteId, userId);
            if (!result && !result.vote) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({message: 'Vote not found'});
            }
            if (result.vote.voterUserId !== userId) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({message: 'You do not have permission to access this vote'});
            }
            next();
        } catch (error) {
            console.error('Error checking vote ownership:', error);
            res.status(500).json({message: 'Internal server error'});
        }

    }

    updateVote = async (req, res, next) => {
        const {voteId} = req.params;
        const {voteType} = req.body;

        try {
            const result = await this.voteService.updateVote(voteId, voteType);
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result.vote,
                message: result.message
            });
        } catch (error) {
            console.error('Error updating vote:', error);
            next(error);
        }
    }

    deleteVote = async (req, res, next) => {
        const {voteId} = req.params;

        try {
            const result = await this.voteService.deleteVote(voteId);
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result.deletedCount,
                message: result.message
            });
        } catch (error) {
            console.error('Error deleting vote:', error);
            next(error);
        }
    }
}

export default new VoteController(voteService);