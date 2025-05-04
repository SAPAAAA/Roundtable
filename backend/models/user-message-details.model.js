// backend/models/user-message-details.model.js

import UserProfile from '#models/user-profile.model.js'; // Adjust path as needed

/**
 * @typedef {'direct' | 'system' | 'moderator_communication' | 'admin_communication'} MessageType
 * Represents the type category of the message.
 */

/**
 * Represents detailed information about a message, including sender and recipient profiles.
 * Mirrors the "UserMessageDetails" VIEW in the database.
 */
class UserMessageDetails {
    /**
     * Creates an instance of UserMessageDetails.
     * @param {string} messageId - The unique identifier for the message.
     * @param {string | null} parentMessageId - UUID of the message being replied to, null if not a reply.
     * @param {string} body - The content of the message.
     * @param {MessageType} messageType - The type category of the message.
     * @param {Date | null} messageCreatedAt - Timestamp when the message was created.
     * @param {boolean} isRead - Flag indicating if the recipient has read the message.
     * @param {boolean} senderDeleted - Flag indicating if the sender has deleted the message.
     * @param {boolean} recipientDeleted - Flag indicating if the recipient has deleted the message.
     * @param {UserProfile | null} senderProfile - The UserProfile object for the sender (null if sender was deleted or system message).
     * @param {UserProfile | null} recipientProfile - The UserProfile object for the recipient (null if recipient was deleted).
     */
    constructor(
        messageId, parentMessageId, body, messageType, // Added parentMessageId, messageType
        messageCreatedAt, isRead, senderDeleted, recipientDeleted,
        senderProfile, recipientProfile
    ) {
        /** @type {string} */
        this.messageId = messageId;
        /** @type {string | null} */
        this.parentMessageId = parentMessageId; // Added
        /** @type {string} */
        this.body = body;
        /** @type {MessageType} */
        this.messageType = messageType; // Added
        /** @type {Date | null} */
        this.messageCreatedAt = messageCreatedAt ? new Date(messageCreatedAt) : null;
        /** @type {boolean} */
        this.isRead = isRead;
        /** @type {boolean} */
        this.senderDeleted = senderDeleted;
        /** @type {boolean} */
        this.recipientDeleted = recipientDeleted;
        /** @type {UserProfile | null} */
        this.senderProfile = senderProfile;
        /** @type {UserProfile | null} */
        this.recipientProfile = recipientProfile;
    }

    /**
     * Converts a database row (from the UserMessageDetails VIEW) to a UserMessageDetails instance.
     * Assumes the row object keys match the column names/aliases defined in the VIEW.
     * @param {Object | null} row - The database row object or null.
     * @returns {UserMessageDetails | null} The UserMessageDetails instance or null if no row/required data is provided.
     */
    static fromDbRow(row) {
        if (!row) return null;

        // Basic check for core message fields - add messageType
        if (!row.messageId || !row.body || row.messageCreatedAt === undefined || !row.messageType) {
            console.error("Missing required message fields in database row for UserMessageDetails:", row);
            return null;
        }

        // --- Extract and Create Sender UserProfile ---
        const senderData = {
            userId: row.senderUserId,
            principalId: row.senderPrincipalId,
            username: row.senderUsername,
            displayName: row.senderDisplayName,
            avatar: row.senderAvatar,
            karma: row.senderKarma,
            isVerified: row.senderIsVerified,
            status: row.senderStatus,
            // You might add other fields here if UserProfile model expects them
            // and if they are included in the UserProfile view used by UserMessageDetails view
            accountCreated: row.senderAccountCreated, // Example if added
        };
        const senderProfile = UserProfile.fromDbRow(senderData.userId ? senderData : null);

        // --- Extract and Create Recipient UserProfile ---
        const recipientData = {
            userId: row.recipientUserId,
            principalId: row.recipientPrincipalId,
            username: row.recipientUsername,
            displayName: row.recipientDisplayName,
            avatar: row.recipientAvatar,
            karma: row.recipientKarma,
            isVerified: row.recipientIsVerified,
            status: row.recipientStatus,
            accountCreated: row.recipientAccountCreated, // Example if added
        };
        const recipientProfile = UserProfile.fromDbRow(recipientData.userId ? recipientData : null);

        // --- Create UserMessageDetails Instance ---
        return new UserMessageDetails(
            row.messageId,
            row.parentMessageId, // Added mapping
            row.body,
            row.messageType,     // Added mapping
            row.messageCreatedAt,
            row.isRead ?? false,
            row.senderDeleted ?? false,
            row.recipientDeleted ?? false,
            senderProfile,
            recipientProfile
        );
    }
}

export default UserMessageDetails;