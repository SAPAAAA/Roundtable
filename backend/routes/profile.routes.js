import express from 'express';
import ProfileController from '#controllers/profile.controller.js';
import { isAuthenticated } from "#middlewares/auth.mdw.js";

const router = express.Router();

//router.get('/:userId', isAuthenticated, ProfileController.getProfileDetails);

router.get('/:userId', isAuthenticated, async (req, res, next) => {
    try {
        console.log('[Profile Routes] Incoming request params:', req.params);
        
        const userId = req.params.userId;
        const [profileData, postsData, commentsData, upvotedPosts, upvotedComments, downvotedPosts, downvotedComments] = await Promise.all([
            ProfileController.profileService.getProfileDetails(userId),
            ProfileController.profileService.getPostsByUserId(userId),
            ProfileController.profileService.getCommentsByUserId(userId),
            ProfileController.profileService.getUpvotedPostsByUserId(userId),
            ProfileController.profileService.getUpvotedCommentsByUserId(userId),
            ProfileController.profileService.getDownvotedPostsByUserId(userId),
            ProfileController.profileService.getDownvotedCommentsByUserId(userId)
        ]);

        res.status(200).json({
            success: true,
            data: {
                profile: profileData,
                posts: postsData,
                comments: commentsData,
                upvotedPosts: upvotedPosts,
                upvotedComments: upvotedComments,
                downvotedPosts: downvotedPosts,
                downvotedComments: downvotedComments
            }
        });
    } catch (error) {
        console.error('[Profile Routes] Error:', error);
        next(error);
    }
});

export default router;