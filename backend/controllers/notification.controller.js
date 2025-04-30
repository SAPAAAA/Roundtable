import HTTP_STATUS from "#constants/httpStatus.js";
import notificationService from "#services/notification.service.js";
import {InternalServerError} from "#errors/AppError.js";

class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }

    getUserNotifications = async (req, res, next) => {
        const {userId} = req.session;

        // Parse query parameters for pagination/filtering (optional)
        const {limit = 25, offset = 0, isRead} = req.query;
        const options = {
            limit: parseInt(limit, 10) || 25,
            offset: parseInt(offset, 10) || 0,
            isRead: isRead === undefined ? undefined : isRead === 'true',
        };


        if (!userId) {
            // This shouldn't happen if isAuthenticated middleware is used, but belt-and-suspenders
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        try {
            console.log(`[NotificationController] Fetching notifications for userId: ${userId} with options:`, options);
            const result = await this.notificationService.getNotificationsForUser(userId, options);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result,
            });

        } catch (error) {
            console.error(`[NotificationController] Error fetching notifications for userId ${userId}:`, error);
            // Pass error to central error handler if you have one, or handle here
            if (error instanceof InternalServerError) {
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: error.message || 'Failed to fetch notifications.'
                });
            }
            // Fallback for other unexpected errors
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An unexpected error occurred while fetching notifications.'
            });
        }
    }

    getUnreadNotificationCount = async (req, res, next) => {
        const {userId} = req.session;

        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        try {
            console.log(`[NotificationController] Fetching unread count for userId: ${userId}`);
            // Call service layer to get the count
            const count = await this.notificationService.getUnreadCountForUser(userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: {
                    unreadCount: count,
                },
            });

        } catch (error) {
            console.error(`[NotificationController] Error fetching unread count for userId ${userId}:`, error);
            // Use appropriate error status codes
            const statusCode = error instanceof BadRequestError
                ? HTTP_STATUS.BAD_REQUEST
                : HTTP_STATUS.INTERNAL_SERVER_ERROR;

            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch unread notification count.'
            });
        }
    }
}

export default new NotificationController(notificationService);