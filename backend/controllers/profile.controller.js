import HTTP_STATUS from '#constants/httpStatus.js';
import profileService from "../services/profile.service.js";

class ProfileController {
    constructor() {
        this.profileService = profileService;
        this.getProfileDetails = this.getProfileDetails.bind(this);
    }

    async getProfileDetails(req, res, next) {
        try {
            const { userId } = req.params;
            
            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(userId)) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Invalid userId format. Must be a UUID.'
                });
            }

            console.log('Fetching profile details for userId:', userId);
            const profileData = await this.profileService.getProfileDetails(userId);
            console.log('[Profile Controller] Retrieved profile data:', profileData);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                data: profileData
            });
        } catch (error) {
            console.error('[ProfileController.getProfileDetails] Error:', error.message);
            next(error);
        }
    }

    async getPostsByUserId(req, res, next) {
        try {
            const { userId } = req.params;
            console.log('[ProfileController] Getting posts for userId:', userId);

            const posts = await this.profileService.getPostsByUserId(userId);
            
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                data: posts
            });
        } catch (error) {
            console.error('[ProfileController] Error:', error);
            next(error);
        }
    }

    async getCommentsByUserId(req, res, next) {
        try {
            const { userId } = req.params;
            console.log('[ProfileController] Getting comments for userId:', userId);

            const comments = await this.profileService.getCommentsByUserId(userId);
            
            return res.status(200).json({
                success: true,
                data: {
                    comments: comments
                }
            });
        } catch (error) {
            console.error('[ProfileController] Error:', error);
            next(error);
        }
    }

    async getUpvotedPosts(req, res, next) {
        try {
            const { userId } = req.params;
            console.log('[ProfileController] Getting upvoted posts for userId:', userId);

            const upvotedPosts = await this.profileService.getUpvotedPostsByUserId(userId);
            
            return res.status(200).json({
                success: true,
                data: {
                    upvotedPosts: upvotedPosts
                }
            });
        } catch (error) {
            console.error('[ProfileController] Error:', error);
            next(error);
        }
    }

    async getUpvotedComments(req, res, next) {
        try {
            const { userId } = req.params;
            console.log('[ProfileController] Getting upvoted comments for userId:', userId);

            const upvotedComments = await this.profileService.getUpvoteCommentsByUserId(userId);
            
            return res.status(200).json({
                success: true,
                data: {
                    upvotedComments: upvotedComments
                }
            });
        } catch (error) {
            console.error('[ProfileController] Error:', error);
            next(error);
        }
    }

    async getDownvotedPosts(req, res, next) {
        try {
            const { userId } = req.params;
            console.log('[ProfileController] Getting downvoted posts for userId:', userId);

            const downvotedPosts = await this.profileService.getDownvotedPostsByUserId(userId);
            
            return res.status(200).json({
                success: true,
                data: {
                    downvotedPosts: downvotedPosts
                }
            });
        } catch (error) {
            console.error('[ProfileController] Error:', error);
            next(error);
        }
    }

    async getDownvotedComments(req, res, next) {
        try {
            const { userId } = req.params;
            console.log('[ProfileController] Getting downvoted comments for userId:', userId);

            const downvotedComments = await this.profileService.getDownvotedCommentsByUserId(userId);
            
            return res.status(200).json({
                success: true,
                data: {
                    downvotedComments: downvotedComments
                }
            });
        } catch (error) {
            console.error('[ProfileController] Error:', error);
            next(error);
        }
    }
}

export default new ProfileController();