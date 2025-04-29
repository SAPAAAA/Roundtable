// models/notification.model.js

/**
 * @typedef {'comment_reply'|'post_reply'|'mention'|'message'|'moderator_invite'|'system_message'|'report_update'|'vote_post'|'vote_comment'} NotificationTypeEnum
 * Represents the type of a notification, mirroring the "NotificationType" ENUM in the database.
 */

/**
 * Represents a Notification sent to a user's account.
 */
class Notification {
    /**
     * Creates an instance of Notification.
     * @param {string | null} notificationId - The unique identifier (UUID), null if new.
     * @param {string} recipientAccountId - The UUID of the Account receiving the notification. Required.
     * @param {string | null} triggeringPrincipalId - The UUID of the Principal who triggered the notification (null if system/deleted user/etc.).
     * @param {NotificationTypeEnum} type - The type of the notification, corresponding to the "NotificationType" ENUM. Required.
     * @param {string | null} [sourceUrl=null] - Optional URL linking to the source of the notification (e.g., post, comment).
     * @param {string | null} [content=null] - Optional brief content preview or message text.
     * @param {boolean} [isRead=false] - Whether the recipient has marked the notification as read.
     * @param {Date | null} [createdAt=null] - Timestamp of creation (set by DB default).
     */
    constructor(notificationId, recipientAccountId, triggeringPrincipalId, type, sourceUrl = null, content = null, isRead = false, createdAt = null) {
        /** @type {string | null} */
        this.notificationId = notificationId;

        /** @type {string} */
        this.recipientAccountId = recipientAccountId;

        /** @type {string | null} */
        this.triggeringPrincipalId = triggeringPrincipalId;

        /** @type {NotificationTypeEnum} */
        this.type = type;

        /** @type {string | null} */
        this.sourceUrl = sourceUrl;

        /** @type {string | null} */
        this.content = content;

        /** @type {boolean} */
        this.isRead = isRead;

        /** @type {Date | null} */
        this.createdAt = createdAt;
    }

    /**
     * Converts a database row object into a Notification instance.
     * @param {Object} row - The database row object corresponding to the "Notification" table.
     * @returns {Notification | null} A Notification instance or null if no row provided.
     */
    static fromDbRow(row) {
        if (!row) return null;
        return new Notification(
            row.notificationId,
            row.recipientAccountId,
            row.triggeringPrincipalId,
            row.type, // Assumes the database driver returns the ENUM value as a string
            row.sourceUrl,
            row.content,
            row.isRead,
            row.createdAt ? new Date(row.createdAt) : null // Convert timestamp string to Date object
        );
    }
}

export default Notification;