// services/post.service.js
import HTTP_STATUS from '#constants/httpStatus.js';
import userCommentDetailsDao from "#daos/userCommentDetails.dao.js";
import userPostDetailsDao from "#daos/userPostDetails.dao.js";
import voteDAO from '#daos/vote.dao.js'; // Import the VoteDAO

/**
 * Helper function for structuring comments and adding user vote status.
 * @param {Array<UserCommentDetails>} commentsRaw - The raw array of comment details from the DAO.
 * @returns {Array<object>} - The structured array of comments with replies and userVote status.
 */
function structureComments(commentsRaw) {
    // --- Input Validation ---
    if (!Array.isArray(commentsRaw)) {
        console.error("Input must be an array of comments.");
        return [];
    }

    const commentMap = {}; // Stores comments by their ID for quick lookup
    const structuredComments = []; // Stores the final top-level comments

    // --- Step 1: Initialize map, add 'replies' array ---
    commentsRaw.forEach(comment => {
        // Create a copy to avoid modifying the original objects directly
        const commentCopy = {...comment};
        commentCopy.replies = []; // Initialize the array for replies
        commentMap[commentCopy.commentId] = commentCopy;
    });

    // --- Step 2: Link comments to their parents ---
    Object.values(commentMap).forEach(comment => {
        const parentCommentId = comment.parentCommentId;

        // Check if it's a reply (has a valid parentCommentId that exists in the map)
        if (parentCommentId !== null && parentCommentId !== undefined && commentMap[parentCommentId]) {
            // Find the parent in the map
            const parent = commentMap[parentCommentId];
            // Add the current comment to the parent's 'replies' array
            parent.replies.push(comment);
        } else {
            // Only add if it doesn't have a parentCommentId or its parent wasn't found in the map
            if (parentCommentId === null || parentCommentId === undefined || !commentMap[parentCommentId]) {
                structuredComments.push(comment);
            }
        }
    });


    return structuredComments;
}
class PostService {

    /**
     * Retrieves all necessary data for the detailed post view, including user vote status.
     * @param {string} postId - The ID of the post.
     * @param {string | null} [userId=null] - The ID of the user requesting the post details (optional).
     * @returns {Promise<object>} Object containing post, subtable, comments, author, vote status, etc.
     */
    async getPostDetails(postId, userId = null) {
        console.log(`Fetching post details for postId: ${postId}, userId: ${userId}`);

        // 1. Get the Post details (includes author and subtable info via the view)
        const postDetails = await userPostDetailsDao.getByPostId(postId);
        if (!postDetails) {
            const error = new Error('Post not found.');
            error.statusCode = HTTP_STATUS.NOT_FOUND;
            throw error;
        }

        // 2. Check if post is removed (handle permissions later if needed)
        if (postDetails.isRemoved) {
            const error = new Error('Post has been removed.');
            error.statusCode = HTTP_STATUS.NOT_FOUND; // Or GONE (410)
            throw error;
        }

        // 3. Get Raw Comments
        let commentsRaw = await userCommentDetailsDao.getByPostId(postId, {
            sortBy: 'createdAt', // Or 'voteCount' etc.
            order: 'asc',        // Or 'desc'
            includeRemoved: false // Typically hide removed comments
        });

        // 4. Get user vote status on the post (if userId is provided)
        let postUserVote = null;
        if (userId) {
            const vote = await voteDAO.findByUserAndPost(userId, postId);
            postUserVote = vote ? vote : null;
            console.log(`User ${userId} vote status on post ${postId}: ${postUserVote}`);
        }

        // 5. Get user vote status on the comments
        if (userId) {
            // Map through comments and fetch user vote status for each
            commentsRaw = await Promise.all(
                commentsRaw.map(async (comment) => {
                    const vote = await voteDAO.findByUserAndComment(userId, comment.commentId);
                    return {
                        ...comment,
                        userVote: vote ? vote : null // Add userVote status to each comment
                    };
                })
            ); // Update commentsRaw with the new array
        }

        // 6. Structure comments and add vote status
        const commentsStructured = structureComments(commentsRaw);

        // 7. Assemble the data package
        // Separate post data from author and subtable for clarity
        const {author, subtable, ...postData} = postDetails;

        return {
            post: {
                ...postData, // Spread the rest of the post properties
                userVote: postUserVote, // Add the user's vote status for the post
            },
            subtable: subtable ? {...subtable} : null, // Include subtable details
            author: author ? {...author} : null,     // Include author details
            comments: commentsStructured,              // Include structured comments with vote status
        };
    }
}

export default new PostService();
