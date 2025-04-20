// services/post.service.js
import postDao from '#daos/post.dao.js';
import subtableDao from '#daos/subtable.dao.js';
import userProfileDao from '#daos/userProfile.dao.js'; // Assuming this exists
import HTTP_STATUS from '#constants/httpStatus.js';
import userCommentDetailsDao from "#daos/userCommentDetails.dao.js"; // Assuming you have this

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
     * @param {string} [subtableName] - Optional: Validate if the post belongs to this subtable name.
     * @returns {Promise<object>} Object containing post, subtable, comments, author, etc.
     */
    async getPostDetails(postId, subtableName) {
        console.log(`Fetching post details for postId: ${postId}, subtableName: ${subtableName}`);
        // 1. Get the Post
        const post = await postDao.getById(postId);
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

        // 2. Get the Subtable
        const subtable = await subtableDao.getByName(subtableName);
        if (!subtable) {
            // Data inconsistency - should not happen if FK constraints are enforced
            console.error(`Data inconsistency: Post ${postId} references non-existent subtable ${post.subtableId}`);
            const error = new Error('Error retrieving subtable information.');
            error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
            throw error;
        }

        // 3. Optional Validation
        if (subtableName && subtable.name !== subtableName) {
            console.warn(`Post ${postId} (Subtable: ${subtable.name}) accessed via incorrect subtable URL (${subtableName})`);
            const error = new Error(`Post not found in subtable "${subtableName}".`);
            error.statusCode = HTTP_STATUS.NOT_FOUND; // Post doesn't belong here
            throw error;
        }


        // 4. Get Comments
        const commentsRaw = await userCommentDetailsDao.getByPostId(postId, {
            sortBy: 'createdAt',
            order: 'asc',
            includeRemoved: false
        });

        const comments = structureComments(commentsRaw);

        console.log("Comments fetched:", comments);

        // 5. Get Author Profile
        let authorProfile = null;
        if (post.authorUserId) {
            authorProfile = await userProfileDao.getByUserId(post.authorUserId);
        }

        // 7. Assemble the data package
        return {
            post: {
                ...post,
            },
            subtable: {
                ...subtable,
            },
            author: authorProfile ? {
                ...authorProfile,
            } : null,
            comments: comments,
        };
    }

    /**
     * Finds the subtable name associated with a given post ID.
     * @param {string} postId - The ID of the post.
     * @returns {Promise<string>} The name of the subtable.
     */
    async getSubtableNameForPost(postId) {
        const post = await postDao.getById(postId);
        if (!post) {
            const error = new Error('Post not found.');
            error.statusCode = HTTP_STATUS.NOT_FOUND;
            throw error;
        }
        // We don't need to check isRemoved here, as the redirect should work even for removed posts

        const subtable = await subtableDao.getById(post.subtableId);
        if (!subtable || !subtable.name) {
            console.error(`Data inconsistency: Post ${postId} references subtable ${post.subtableId} which has no name or doesn't exist.`);
            const error = new Error('Error resolving post location.');
            error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
            throw error;
        }

        return subtable.name;
    }
}

export default new PostService();