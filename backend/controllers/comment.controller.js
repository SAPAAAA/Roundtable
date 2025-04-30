import commentService from '#services/comment.service.js';
import voteService from '#services/vote.service.js';
import notificationService from '#services/notification.service.js';


class CommentController {
    constructor(commentService, voteService, notificationService) {
        this.commentService = commentService;
        this.voteService = voteService;
        this.notificationService = notificationService;
    }

    addComment = async (req, res) => {
        try {
            const {postId} = req.params;
            const {body} = req.body;
            const {userId} = req.session;
            console.log("Comment Data:", req.body);
            console.log("Post ID:", postId);
            console.log("User ID:", userId);
            const newComment = await this.commentService.createComment(postId, userId, body);
            if (!newComment) {
                return res.status(400).json({error: 'Failed to create comment'});
            }
            await this.notificationService.notifyNewComment(newComment, userId);
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

    replyToComment = async (req, res) => {
        try {
            const {commentId} = req.params;
            const {body} = req.body;
            const {userId} = req.session;
            console.log("Reply Data:", req.body);
            console.log("Parent ID:", commentId);
            console.log("User ID:", userId);
            const newReply = await this.commentService.createReply(commentId, userId, body);
            await this.notificationService.notifyNewComment(newReply, userId);
            if (!newReply) {
                return res.status(400).json({error: 'Failed to create reply'});
            }
            res.status(201).json({
                message: 'Reply created successfully',
                data: {
                    comment: {...newReply},
                },
                success: true,
            });
        } catch (error) {
            res.status(500).json({error: 'Failed to create reply'});
            console.error("Error creating reply:", error);
        }
    }

    castVote = async (req, res) => {
        try {
            const {commentId} = req.params;
            const {voteType} = req.body;
            const {userId} = req.session;
            console.log("Vote Data:", req.body);
            console.log("Comment ID:", commentId);
            console.log("User ID:", userId);
            const result = await this.voteService.createVote(userId, null, commentId, voteType);

            if (!result) {
                return res.status(400).json({error: 'Failed to cast vote'});
            }
            res.status(201).json({
                message: result.message,
                data: {
                    vote: result.vote,
                },
                success: true,
            });
        } catch (error) {
            res.status(500).json({error: 'Failed to cast vote'});
            console.error("Error casting vote:", error);
        }
    }
}

export default new CommentController(commentService, voteService, notificationService);