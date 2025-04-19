// services/post.service.js
import postDao from '#daos/post.dao.js';
import subtableDao from '#daos/subtable.dao.js';
import commentDao from '#daos/comment.dao.js';
import userProfileDao from '#daos/userProfile.dao.js'; // Assuming this exists
import HTTP_STATUS from '#constants/httpStatus.js'; // Assuming you have this

// Helper function for structuring comments (example: simple list)
function structureComments(comments) {
    // Structure comments into a hierarchical format
    const commentMap = {};
    comments.forEach(comment => {
        commentMap[comment.id] = {...comment, replies: []};
    });

    comments.forEach(comment => {
        if (comment.parentId) {
            commentMap[comment.parentId].replies.push(commentMap[comment.id]);
        }
    });

    return Object.values(commentMap);
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


        // 4. Get Comments (example: get all, sort by creation)
        const commentsRaw = await commentDao.getByPost(postId, {
            sortBy: 'createdAt',
            order: 'asc',
            includeRemoved: false
        });
        const comments = structureComments(commentsRaw);

        // 5. Get Author Profile (assuming userProfileDao.getByUserId exists)
        let authorProfile = null;
        if (post.authorUserId) {
            authorProfile = await userProfileDao.getByUserId(post.authorUserId);
        }

        // 6. Get Comment Author Profiles (optimize this in a real app - fetch all needed authors at once)

        // 7. Assemble the data package
        return {
            post: {
                ...post,
            },
            subtable: {name: subtable.name, description: subtable.description, iconUrl: subtable.iconUrl /* etc */},
            author: authorProfile ? {
                userId: authorProfile.userId,
                username: authorProfile.username,
                displayName: authorProfile.displayName /* etc */
            } : null,
            comments: comments, // Potentially with author info embedded
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