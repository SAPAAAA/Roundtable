// services/post.service.js
import HTTP_STATUS from '#constants/httpStatus.js';
import userCommentDetailsDao from "#daos/userCommentDetails.dao.js";
import userPostDetailsDao from "#daos/userPostDetails.dao.js"; // Assuming you have this

// Helper function for structuring comments
function structureComments(comments) {
    // --- Input Validation ---
    if (!Array.isArray(comments)) {
        console.error("Input must be an array of comments.");
        return [];
    }

    const commentMap = {}; // Stores comments by their ID for quick lookup
    const structuredComments = []; // Stores the final top-level comments

    // --- Step 1: Initialize map and add 'replies' array to each comment ---
    comments.forEach(comment => {
        // Create a copy to avoid modifying the original objects directly
        const commentCopy = {...comment};
        commentCopy.replies = []; // Initialize the array for replies
        commentMap[commentCopy.commentId] = commentCopy;
    });

    // --- Step 2: Link comments to their parents ---
    Object.values(commentMap).forEach(comment => {
        const parentCommentId = comment.parentCommentId;

        // Check if it's a reply (has a valid parentId that exists in the map)
        if (parentCommentId !== null && parentCommentId !== undefined && commentMap[parentCommentId]) {
            // Find the parent in the map
            const parent = commentMap[parentCommentId];
            // Add the current comment to the parent's 'replies' array
            parent.replies.push(comment);
        } else {
            // Only add if it doesn't have a parentId or its parent wasn't found in the map
            if (parentCommentId === null || parentCommentId === undefined || !commentMap[parentCommentId]) {
                structuredComments.push(comment);
            }
            if (parentCommentId !== null && parentCommentId !== undefined && !commentMap[parentCommentId]) {
                console.warn(`Orphan comment found: ID ${comment.commentId} references non-existent parent ID ${parentCommentId}. Treating as top-level.`);
            }
        }
    });

    return structuredComments;
}
class PostService {

    /**
     * Retrieves all necessary data for the detailed post view.
     * @param {string} postId - The ID of the post.
     * @returns {Promise<object>} Object containing post, subtable, comments, author, etc.
     */
    async getPostDetails(postId) {
        console.log(`Fetching post details for postId: ${postId}`);
        // 1. Get the Post details
        const post = await userPostDetailsDao.getByPostId(postId);
        console.log("Post details:", post);
        if (!post) {
            const error = new Error('Post not found.');
            error.statusCode = HTTP_STATUS.NOT_FOUND;
            throw error;
        }
        // Hide removed posts unless specifically requested by mods/admins
        if (post.isRemoved) {
            const error = new Error('Post has been removed.');
            error.statusCode = HTTP_STATUS.NOT_FOUND; // Or GONE (410)
            throw error;
        }

        // 3. Get Comments
        const commentsRaw = await userCommentDetailsDao.getByPostId(postId, {
            sortBy: 'createdAt',
            order: 'asc',
            includeRemoved: false
        });

        const comments = structureComments(commentsRaw);

        // Assemble the data package
        return {
            post: {
                // Remove the author and subtable from the post object
                ...post,
                author: undefined,
                subtable: undefined,
            },
            subtable: post.subtable ? {
                ...post.subtable,
            } : null,
            author: post.author ? {
                ...post.author,
            } : null,
            comments: comments,
        };
    }
}

export default new PostService();