import profileDAO from '#daos/profile.dao.js';
import HTTP_STATUS from '#constants/httpStatus.js';

class ProfileService {
    async getProfileDetails(userId) {
        try {
            const profileData = await profileDAO.getUserProfileById(userId);
            
            if (!profileData) {
                const error = new Error('Profile not found');
                error.statusCode = HTTP_STATUS.NOT_FOUND;
                throw error;
            }

            return profileData;
        } catch (error) {
            console.error('[ProfileService] Error:', error.message);
            throw error;
        }
    }

    async getPostsByUserId(userId) {
        try {
            console.log('[ProfileService] Getting posts for userId:', userId);
            
            const posts = await profileDAO.getPostsByUserId(userId);
            
            if (!posts || posts.length === 0) {
                console.log('[ProfileService] No posts found for userId:', userId);
                return [];
            }

            // Transform posts data to match frontend expectations
            const transformedPosts = posts.map(post => ({
                post: {
                    postId: post.postId,
                    title: post.title,
                    content: post.content,
                    createdAt: post.createdAt,
                    upvotes: post.upvotes
                },
                subtable: {
                    subtableId: post.subtableId,
                    name: post.subtableName,
                    icon: post.subtableIcon
                }
            }));

            console.log('[ProfileService] Transformed posts:', transformedPosts);
            return transformedPosts;

        } catch (error) {
            console.error('[ProfileService] Error fetching posts:', error);
            error.statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
            throw error;
        }
    }
    async getCommentsByUserId(userId) {
        try {
            console.log('[ProfileService] Getting comments for userId:', userId);
            
            const comments = await profileDAO.getCommentsByUserId(userId);
            
            if (!comments || comments.length === 0) {
                console.log('[ProfileService] No comments found for userId:', userId);
                return [];
            }

            // Transform comments to include proper structure
            const transformedComments = comments.map(comment => ({
                commentId: comment.commentId,
                postId: comment.postId,
                body: comment.body,
                createdAt: comment.createdAt,
                voteCount: comment.voteCount,
                parentCommentId: comment.parentCommentId,
                isRemoved: comment.isRemoved,
                author: {
                    userId: comment.authorUserId,
                    username: comment.authorUsername,
                    displayName: comment.authorDisplayName,
                    avatar: comment.authorAvatar
                }
            }));

            console.log('[ProfileService] Transformed comments:', transformedComments);
            return transformedComments;

        } catch (error) {
            console.error('[ProfileService] Error:', error.message);
            throw error;
        }
    }

    async getUpvotedPostsByUserId(userId) {
        try {
            console.log('[ProfileService] Getting upvoted posts for userId:', userId);
            
            const posts = await profileDAO.getUpvotedPostsByUserId(userId);
            
            if (!posts || posts.length === 0) {
                return [];
            }

            return posts.map(post => ({
                post: {
                    postId: post.postId,
                    title: post.title,
                    body: post.body,
                    createdAt: post.createdAt,
                    upvotes: post.upvotes
                },
                subtable: {
                    subtableId: post.subtableId,
                    name: post.subtableName,
                    icon: post.subtableIcon
                },
                votedAt: post.votedAt,
                type: 'post'
            }));

        } catch (error) {
            console.error('[ProfileService] Error:', error.message);
            throw error;
        }
    }

    async getUpvotedCommentsByUserId(userId) {
        try {
            console.log('[ProfileService] Getting upvoted comments for userId:', userId);
            
            const comments = await profileDAO.getUpvotedCommentsByUserId(userId);
            
            if (!comments || comments.length === 0) {
                return [];
            }

            return comments.map(comment => ({
                commentId: comment.commentId,
                postId: comment.postId,
                body: comment.body,
                commentCreatedAt: comment.createdAt,
                voteCount: comment.voteCount || 0,
                parentCommentId: comment.parentCommentId,
                isRemoved: comment.isRemoved || false,
                author: {
                    userId: comment.authorUserId,
                    username: comment.authorUsername,
                    displayName: comment.authorDisplayName,
                    avatar: comment.authorAvatar
                }
            }));
        }
        catch (error) {
            console.error('[ProfileService] Error:', error.message);
            throw error;
        }
    }

    async getDownvotedPostsByUserId(userId) {
        try {
            console.log('[ProfileService] Getting downvoted posts for userId:', userId);
            
            const posts = await profileDAO.getDownvotedPostsByUserId(userId);
            
            if (!posts || posts.length === 0) {
                return [];
            }

            return posts.map(post => ({
                post: {
                    postId: post.postId,
                    title: post.title,
                    body: post.body,
                    createdAt: post.createdAt,
                    upvotes: post.upvotes
                },
                subtable: {
                    subtableId: post.subtableId,
                    name: post.subtableName,
                    icon: post.subtableIcon
                },
                votedAt: post.votedAt,
                type: 'post'
            }));

        } catch (error) {
            console.error('[ProfileService] Error:', error.message);
            throw error;
        }
    }

    async getDownvotedCommentsByUserId(userId) {
        try {
            console.log('[ProfileService] Getting downvoted comments for userId:', userId);
            
            const comments = await profileDAO.getDownvotedCommentsByUserId(userId);
            
            if (!comments || comments.length === 0) {
                return [];
            }

            return comments.map(comment => ({
                commentId: comment.commentId,
                postId: comment.postId,
                body: comment.body,
                commentCreatedAt: comment.createdAt,
                voteCount: comment.voteCount || 0,
                parentCommentId: comment.parentCommentId,
                isRemoved: comment.isRemoved || false,
                author: {
                    userId: comment.authorUserId,
                    username: comment.authorUsername,
                    displayName: comment.authorDisplayName,
                    avatar: comment.authorAvatar
                }
            }));
        }
        catch (error) {
            console.error('[ProfileService] Error:', error.message);
            throw error;
        }
    }
}
export default new ProfileService();