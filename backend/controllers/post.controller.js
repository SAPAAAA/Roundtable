// src/controllers/post.controller.js

import postService from '#services/post.service.js'; // Assuming the service exists and handles logic/validation
import HTTP_STATUS from '#constants/httpStatus.js';
// Assuming custom errors are defined and exported from '#errors/AppError.js'
// We rely on a downstream centralized error handler to catch these.

class PostController {
    constructor(postService) {
        this.postService = postService; // Use dependency injection
    }

    /**
     * Handles GET /s/:subtableName/comments/:postId
     * Retrieves and returns post details as JSON.
     */
    getPostDetails = async (req, res, next) => {
        try {
            const {postId} = req.params;
            console.log(`[PostController.getPostDetails] Processing request for postId: ${postId}`);

            // Returns data on success or throws specific errors (BadRequest, NotFound, InternalServer) on failure.
            const viewData = await this.postService.getPostDetails(postId);

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
}

// Export an instance, injecting the service dependency
export default new PostController(postService);