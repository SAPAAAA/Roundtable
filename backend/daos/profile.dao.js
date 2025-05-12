import { postgresInstance } from '#db/postgres.js';

class ProfileDAO {
    async getUserProfileById(userId) {
        try {
            console.log('[ProfileDAO] Attempting to find profile with userId:', userId);
            
            // First check if the user exists
            const exists = await postgresInstance('UserProfile')
                .where({ userId })
                .count('*')
                .first();
                
            console.log('[ProfileDAO] Existence check result:', exists);

            if (parseInt(exists.count) === 0) {
                console.log('[ProfileDAO] No profile found for userId:', userId);
                return null;
            }

            const profile = await postgresInstance('UserProfile')
                .select(
                    'userId',
                    'username',
                    'displayName',
                    'avatar',
                    'banner',
                    'bio',
                    'location',
                    'gender',
                    'karma',
                    'isVerified',
                    'status',
                    'accountCreated',
                    'lastActive'
                )
                .where({ userId })
                .first();

            console.log('[ProfileDAO] Query result:', JSON.stringify(profile, null, 2));
            return profile;
        } catch (error) {
            console.error('[ProfileDAO] Database error:', {
                message: error.message,
                stack: error.stack,
                query: error.query // If available from postgres
            });
            throw error;
        }
    }

    async getPostsByUserId(userId) {
        try {
            console.log('[ProfileDAO] Fetching posts for userId:', userId);
            
            const posts = await postgresInstance('UserPostDetails')
                .select(
                    'postId',
                    'title',
                    'body',
                    'postCreatedAt as createdAt',
                    'voteCount as upvotes',
                    'subtableId',
                    'subtableName',
                    'subtableIcon',
                    'authorUserId',
                    'authorUsername',
                    'authorDisplayName',
                    'authorAvatar'
                )
                .where('authorUserId', userId)
                .orderBy('postCreatedAt', 'desc');

            console.log('[ProfileDAO] Posts fetched:', JSON.stringify(posts, null, 2));
            return posts;
            
        } catch (error) {
            console.error('[ProfileDAO] Error fetching posts:', {
                message: error.message,
                userId: userId,
                stack: error.stack,
                query: error.query
            });
            throw error;
        }
    }

    async getCommentsByUserId(userId) {
        try {
            console.log('[ProfileDAO] Fetching comments for userId:', userId);
            
            const comments = await postgresInstance('UserCommentDetails')
                .select([
                    'commentId',
                    'postId',
                    'body',
                    'commentCreatedAt as createdAt',
                    'voteCount',
                    'parentCommentId',
                    'isRemoved',
                    'authorUserId',
                    'authorUsername',
                    'authorDisplayName',
                    'authorAvatar'
                ])
                .where('authorUserId', userId)
                .orderBy('commentCreatedAt', 'desc');

            console.log('[ProfileDAO] Comments fetched:', comments);
            return comments;
            
        } catch (error) {
            console.error('[ProfileDAO] Error fetching comments:', {
                message: error.message,
                userId: userId,
                stack: error.stack,
                query: error.query
            });
            throw error;
        }
    }

    async getUpvotedPostsByUserId(userId) {
        try {
            console.log('[ProfileDAO] Fetching upvoted posts for userId:', userId);
            
            const upvotedPosts = await postgresInstance('UserVoteDetails as v')
                .select([
                    'p.postId',
                    'p.title',
                    'p.body',
                    'p.postCreatedAt as createdAt',
                    'p.voteCount as upvotes',
                    'p.subtableId',
                    'p.subtableName',
                    'p.subtableIcon',
                    'v.voteType',
                    'v.voteCreatedAt as votedAt'  // Changed from createdAt to voteCreatedAt
                ])
                .join('UserPostDetails as p', 'v.postId', 'p.postId')
                .where({
                    'v.voterUserId': userId,  // Changed from userId to voterUserId
                    'v.voteType': 'upvote'
                })
                .orderBy('v.voteCreatedAt', 'desc');  // Changed to voteCreatedAt

            console.log('[ProfileDAO] Upvoted posts fetched:', upvotedPosts);
            return upvotedPosts;
            
        } catch (error) {
            console.error('[ProfileDAO] Error fetching upvoted posts:', {
                message: error.message,
                userId: userId,
                stack: error.stack,
                query: error.query
            });
            throw error;
        }
    }

    async getUpvotedCommentsByUserId(userId){
        try {
            console.log('[ProfileDAO] Fetching upvoted comments for userId:', userId);
            
            const upvotedComments = await postgresInstance('UserVoteDetails as v')
                .select([
                    'c.commentId',
                    'c.postId',
                    'c.body',
                    'c.commentCreatedAt as createdAt',
                    'c.voteCount',
                    'c.parentCommentId',
                    'c.isRemoved',
                    'v.voteType',
                    'v.voteCreatedAt as votedAt'
                ])
                .join('UserCommentDetails as c', 'v.commentId', 'c.commentId')
                .where({
                    'v.voterUserId': userId,
                    'v.voteType': 'upvote'
                })
                .orderBy('v.voteCreatedAt', 'desc');

            console.log('[ProfileDAO] Upvoted comments fetched:', upvotedComments);
            return upvotedComments;
            
        } catch (error) {
            console.error('[ProfileDAO] Error fetching upvoted comments:', {
                message: error.message,
                userId: userId,
                stack: error.stack,
                query: error.query
            });
            throw error;
        }
    }

    async getDownvotedPostsByUserId(userId){
        try {
            console.log('[ProfileDAO] Fetching downvoted posts for userId:', userId);
            
            const downvotedPosts = await postgresInstance('UserVoteDetails as v')
                .select([
                    'p.postId',
                    'p.title',
                    'p.body',
                    'p.postCreatedAt as createdAt',
                    'p.voteCount as upvotes',
                    'p.subtableId',
                    'p.subtableName',
                    'p.subtableIcon',
                    'v.voteType',
                    'v.voteCreatedAt as votedAt'
                ])
                .join('UserPostDetails as p', 'v.postId', 'p.postId')
                .where({
                    'v.voterUserId': userId,
                    'v.voteType': 'downvote'
                })
                .orderBy('v.voteCreatedAt', 'desc');

            console.log('[ProfileDAO] Downvoted posts fetched:', downvotedPosts);
            return downvotedPosts;
            
        } catch (error) {
            console.error('[ProfileDAO] Error fetching downvoted posts:', {
                message: error.message,
                userId: userId,
                stack: error.stack,
                query: error.query
            });
            throw error;
        }
    }

    async getDownvotedCommentsByUserId(userId){
        try {
            console.log('[ProfileDAO] Fetching downvoted comments for userId:', userId);
            
            const downvotedComments = await postgresInstance('UserVoteDetails as v')
                .select([
                    'c.commentId',
                    'c.postId',
                    'c.body',
                    'c.commentCreatedAt as createdAt',
                    'c.voteCount',
                    'c.parentCommentId',
                    'c.isRemoved',
                    'v.voteType',
                    'v.voteCreatedAt as votedAt'
                ])
                .join('UserCommentDetails as c', 'v.commentId', 'c.commentId')
                .where({
                    'v.voterUserId': userId,
                    'v.voteType': 'downvote'
                })
                .orderBy('v.voteCreatedAt', 'desc');

            console.log('[ProfileDAO] Downvoted comments fetched:', downvotedComments);
            return downvotedComments;
            
        } catch (error) {
            console.error('[ProfileDAO] Error fetching downvoted comments:', {
                message: error.message,
                userId: userId,
                stack: error.stack,
                query: error.query
            });
            throw error;
        }
    }
}

export default new ProfileDAO();