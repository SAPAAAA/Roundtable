// src/services/CommentService.js
import {sendApiRequest} from "#utils/apiClient";

class CommentService {

    async addComment(postId, body) {
        try {
            console.log("Adding comment:", postId, body);
            const response = await sendApiRequest(`/api/posts/${postId}/comments`,
                {
                    method: 'POST',
                    body: {
                        body: body,
                    }
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