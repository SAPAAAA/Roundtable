import commentService from '#services/comment.service.js';

class CommentController {
    constructor(commentService) {
        this.commentService = commentService;
    }

    addComment = async (req, res) => {
        try {
            const {postId} = req.params;
            const {body} = req.body;
            const userId = req.session.userId;
            console.log("Comment Data:", req.body);
            console.log("Post ID:", postId);
            console.log("User ID:", userId);
            const newComment = await this.commentService.createComment(postId, userId, body);
            if (!newComment) {
                return res.status(400).json({error: 'Failed to create comment'});
            }
            res.status(201).json({
                message: 'Comment created successfully',
                data: {
                    comment: {...newComment},
                },
                success: true,
            });
        } catch (error) {
            res.status(500).json({error: 'Failed to create comment'});
            console.error("Error creating comment:", error);
        }
    }
}

export default new CommentController(commentService);