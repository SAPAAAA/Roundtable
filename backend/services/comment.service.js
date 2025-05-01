import CommentDAO from "#daos/comment.dao.js";
import Comment from "#models/comment.model.js";
import postgres from "#db/postgres.js";
import {BadRequestError} from "#errors/AppError.js";

class CommentService {
    async createComment(postId, userId, body) {
        if (!postId || !body) {
            console.error("Post ID and body are required to create a comment.");
            throw new Error("Post ID and body are required to create a comment.");
        }

        if (!userId) {
            console.error("User ID is required to create a comment.");
            throw new Error("User ID is required to create a comment.");
        }

        console.log("Creating comment with Post ID:", postId, "User ID:", userId, "Body:", body);

        try {
            return await postgres.transaction(async (trx) => {
                const comment = new Comment(null, postId, userId, null, body);
                console.log("Creating comment:", comment);
                return await CommentDAO.create(comment, trx);
            });
        } catch (error) {
            console.error("Error creating comment:", error);
            throw error;
        }
    }

    async createReply(commentId, userId, body) {
        if (!commentId || !body) {
            console.error("Comment ID and body are required to create a reply.");
            throw new Error("Comment ID and body are required to create a reply.");
        }

        if (!userId) {
            console.error("User ID is required to create a reply.");
            throw new Error("User ID is required to create a reply.");
        }

        console.log("Creating reply with Comment ID:", commentId, "User ID:", userId, "Body:", body);

        // Check if the commentId is valid
        const parentComment = await CommentDAO.getById(commentId);
        if (!parentComment) {
            console.error("Parent comment not found.");
            throw new BadRequestError("Parent comment not found.");
        }

        try {
            return await postgres.transaction(async (trx) => {
                const reply = new Comment(null, parentComment.postId, userId, commentId, body);
                console.log("Creating reply:", reply);
                return await CommentDAO.create(reply, trx);
            });
        } catch (error) {
            console.error("Error creating reply:", error);
            throw error;
        }
    }
}

export default new CommentService();