// src/services/CommentService.js
import {sendApiRequest} from "#utils/apiClient";

class CommentService {

    async addComment(postId, subtableName, body, parentCommentId) {
        try {
            const response = await sendApiRequest(`/api/s/${subtableName}/comments/${postId}`, 'POST',
                {
                    body: {body, parentCommentId}
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error adding comment:", error);
            throw error;
        }
    }
}

export default new CommentService();