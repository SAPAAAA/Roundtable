// controllers/post.controller.js
import postService from '#services/post.service.js';
import HTTP_STATUS from '#constants/httpStatus.js';

class PostController {

    // Handler for GET /s/:subtableName/comments/:postId
    getPostDetails = async (req, res, next) => {
        try {
            const {subtableName, postId} = req.params;
            console.log(`Fetching post details for subtable: ${subtableName}, postId: ${postId}`);

            if (!postId) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: 'Invalid Post ID.'});
            }
            if (!subtableName) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: 'Invalid Subtable name.'});
            }


            const viewData = await postService.getPostDetails(postId, subtableName);

            return res.status(HTTP_STATUS.OK).json({success: true, data: viewData});

        } catch (error) {
            // Pass error to the centralized error handler
            next(error);
        }
    };

    // Handler for GET /comments/:postId
    redirectToCanonicalPostUrl = async (req, res, next) => {
        try {
            const {postId} = req.params;

            // Input validation
            if (!postId) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: 'Invalid Post ID format.'});
            }

            const subtableName = await postService.getSubtableNameForPost(postId);

            // Construct the canonical URL
            const targetUrl = `/s/${subtableName}/comments/${postId}`;

            // Issue a permanent redirect
            return res.redirect(targetUrl);

        } catch (error) {
            if (error.statusCode === HTTP_STATUS.NOT_FOUND) {
                return res.status(HTTP_STATUS.NOT_FOUND).send('Post not found.'); // Or render a 404 page
            }
            next(error);
        }
    };
}

export default new PostController();