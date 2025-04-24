import CommentDao from "#daos/comment.dao.js";
import Comment from "#models/comment.model.js";
import postgres from "#db/postgres.js";

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
                return await CommentDao.create(comment, trx);
            });
        } catch (error) {
            console.error("Error creating comment:", error);
            throw error;
        }
    }
}

export default new CommentService();