// src/controllers/post.controller.js

import postService from '#services/post.service.js';
import voteService from "#services/vote.service.js";
import HTTP_STATUS from '#constants/httpStatus.js';
// Assuming custom errors are defined and exported from '#errors/AppError.js'
// We rely on a downstream centralized error handler to catch these.

class PostController {
    constructor(postService, voteService) {
        this.postService = postService;
        this.voteService = voteService; // Assuming voteService is defined and injected
    }

    /**
     * Handles GET /s/:subtableName/comments/:postId
     * Retrieves and returns post details as JSON.
     */
    getPostDetails = async (req, res, next) => {
        try {
            const {postId} = req.params;
            const userId = req.session.userId;

            // Returns data on success or throws specific errors (BadRequest, NotFound, InternalServer) on failure.
            const viewData = await this.postService.getPostDetails(postId, userId);

            // --- Success Response ---
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                data: viewData // Send the data returned by the service
            });

        } catch (error) {
            // --- Error Handling ---
            // Log the error message at controller level for context
            console.error(`[PostController.getPostDetails] Error fetching details for postId ${req.params?.postId}:`, error.message);
            // Pass the error (BadRequestError, NotFoundError, InternalServerError, etc.)
            next(error);
        }
    };

    castVote = async (req, res, next) => {
        try {
            const {postId} = req.params;
            const {voteType} = req.body;
            const {userId} = req.session;

            console.log(`[PostController.castVote] Processing vote for postId: ${postId}, voteType: ${voteType}`);

            const result = await this.voteService.createVote(userId, postId, null, voteType);


            // --- Success Response ---
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result // Send the result of the vote casting
            });

        } catch (error) {
            // --- Error Handling ---
            console.error(`[PostController.castVote] Error casting vote for postId ${req.params?.postId}:`, error.message);
            next(error);
        }
    }
}

// Export an instance, injecting the service dependency
export default new PostController(postService, voteService);