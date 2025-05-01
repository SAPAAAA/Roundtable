// backend/services/notification.service.js (Conceptual)
import NotificationDAO from '#daos/notification.dao.js';
import Notification, {NotificationTypeEnum} from '#models/notification.model.js';
import UserPostDetailsDAO from "#daos/user-post-details.dao.js";
import UserProfileDAO from "#daos/user-profile.dao.js";
import postgres from "#db/postgres.js";
import EventBus from '#core/event-bus.js';
import {BadRequestError, InternalServerError} from "#errors/AppError.js"; // Import the WebSocket manager

class NotificationService {

    /**
     * Creates a DB notification and triggers a real-time WebSocket notification
     * when a comment is added.
     * @param {Comment} createdComment - The newly created comment object from the DAO.
     * @param {string} commenterUserId - The ID of the user who made the comment.
     */
    async notifyNewComment(createdComment, commenterUserId) {
        if (!createdComment || !commenterUserId) {
            console.error('[NotificationService] Missing comment or commenter ID.');
            return;
        }

        try {
            // 1. Get the Post to find the owner
            const post = await UserPostDetailsDAO.getByPostId(createdComment.postId);
            if (!post || !post.author) {
                console.log(`[NotificationService] Post (${createdComment.postId}) not found or has no author. No notification sent.`);
                return;
            }

            const postOwner = post.author;

            // 2. Don't notify if the commenter is the post owner
            if (commenterUserId === postOwner.userId) {
                console.log(`[NotificationService] User ${commenterUserId} commented on their own post. No notification sent.`);
                return;
            }

            // 3. Find the Principal ID of the commenter
            const commenterPrincipal = await UserProfileDAO.getByUserId(commenterUserId); // Needs implementation in PrincipalDAO
            if (!commenterPrincipal) {
                console.warn(`[NotificationService] Could not find principal for commenter userId ${commenterUserId}`);
                // Decide if you still want to send notification without triggeringPrincipalId
                // return;
            }
            const triggeringPrincipalId = commenterPrincipal ? commenterPrincipal.principalId : null;// Get accountId from principal


            // 4. Create the Notification DB Record
            return await postgres.transaction(async (trx) => {
                const notificationType = createdComment.parentCommentId ? NotificationTypeEnum.COMMENT_REPLY : NotificationTypeEnum.POST_REPLY;
                const sourceUrl = `/comments/${createdComment.postId}#comment-${createdComment.commentId}`;
                const notificationContent = `New ${notificationType === NotificationTypeEnum.COMMENT_REPLY ? 'reply' : 'comment'} on your post "${post.title.substring(0, 30)}..."`;

                const notification = new Notification(
                    null,                       // notificationId
                    postOwner.userId,               // recipientUserId (Directly use the post owner's userId)
                    triggeringPrincipalId,          // triggeringPrincipalId
                    notificationType,               // type
                    sourceUrl,                      // sourceUrl
                    notificationContent,            // content
                    false,                      // isRead
                    null                        // createdAt
                );

                const createdNotification = await NotificationDAO.create(notification, trx);
                console.log(`[NotificationService] DB Notification created: ${createdNotification.notificationId}`);

                // 5. Trigger the real-time WebSocket notification
                EventBus.emitEvent('notification.comment.created', {
                    userId: postOwner.userId,
                    notification: createdNotification,
                });

                return createdNotification;
            });
        } catch (error) {
            console.error(`[NotificationService] Error processing new comment notification for comment ${createdComment.commentId}:`, error);

        }
    }

    async getNotificationsForUser(userId, options = {}) {
        if (!userId) {
            throw new BadRequestError('User ID is required to fetch notifications.');
        }
        try {
            // Fetch notifications using the DAO
            const notifications = await NotificationDAO.getByRecipient(userId, options);

            // Get the total count for pagination
            const totalCount = await NotificationDAO.countByRecipient(userId, {isRead: options.isRead}); // Pass filters if needed

            console.log(`[NotificationService] Fetched ${notifications.length} notifications for userId ${userId}`);

            return {
                notifications,
                totalCount, // Include total count for pagination on the frontend
            };
        } catch (error) {
            console.error(`[NotificationService] Error fetching notifications for userId ${userId}:`, error);
            // Throw a generic server error, controller will handle HTTP status
            throw new InternalServerError('Failed to retrieve notifications.');
        }
    }

    async getUnreadCountForUser(userId) {
        if (!userId) {
            throw new BadRequestError('User ID is required to fetch unread count.');
        }
        try {
            // Fetch count using the DAO, filtering for unread
            const count = await NotificationDAO.countByRecipient(userId, {isRead: false});
            console.log(`[NotificationService] Unread count for userId ${userId}: ${count}`);
            return count;
        } catch (error) {
            console.error(`[NotificationService] Error fetching unread count for userId ${userId}:`, error);
            throw new InternalServerError('Failed to retrieve unread notification count.');
        }
    }
}


export default new NotificationService();