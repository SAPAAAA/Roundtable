// backend/daos/user-message-details.dao.js
import {postgresInstance} from '#db/postgres.js';
import UserMessageDetails from '#models/user-message-details.model.js';

/**
 * @typedef {Object} GetDetailedMessagesOptions
 * @property {number} [limit=50] - Max number of messages to return.
 * @property {number} [offset=0] - Number of messages to skip.
 * @property {'asc'|'desc'} [order='desc'] - Sort order by messageCreatedAt. Default is desc (newest first).
 * @property {string} [requestingUserId] - The ID of the user making the request (used for filtering deleted).
 */

/**
 * DAO for interacting with the "UserMessageDetails" database object (VIEW or similar).
 */
class UserMessageDetailsDAO {
    constructor() {
        this.viewName = 'UserMessageDetails'; // <-- IMPORTANT: Replace with your actual VIEW name
    }
    /**
     * Fetches a single detailed message by its ID from the database object.
     * @param {string} messageId - The UUID of the message.
     * @returns {Promise<UserMessageDetails | null>} - A promise resolving to a UserMessageDetails instance or null if not found.
     * @throws {Error} For database errors.
     */
    async getByMessageId(messageId) {
        if (!messageId) {
            console.warn('[UserMessageDetailsDAO] getByMessageId called without messageId');
            return null;
        }
        try {
            const viewRow = await postgresInstance(this.viewName) // Query the VIEW/object
                .where({messageId: messageId})
                .first();
            return UserMessageDetails.fromDbRow(viewRow);
        } catch (error) {
            console.error(`[UserMessageDetailsDAO] Error fetching by messageId (${messageId}):`, error);
            throw error;
        }
    }

    /**
     * Fetches detailed messages exchanged between two specific users.
     * Filters messages based on the requesting user's perspective (deleted flags).
     * @param {string} userId1 - The UUID of the first user.
     * @param {string} userId2 - The UUID of the second user.
     * @param {GetDetailedMessagesOptions} [options={}] - Options for pagination and filtering. Requires requestingUserId.
     * @returns {Promise<UserMessageDetails[]>} - A promise resolving to an array of UserMessageDetails instances.
     * @throws {Error} For database errors.
     * @throws {Error} If requestingUserId is missing in options.
     */
    async getMessagesBetweenUsers(userId1, userId2, options = {}) {
        if (!userId1 || !userId2) {
            console.error('[UserMessageDetailsDAO] getMessagesBetweenUsers requires two user IDs.');
            return []; // Or throw? Service validates.
        }
        const {limit = 50, offset = 0, order = 'desc', requestingUserId} = options;
        if (!requestingUserId) {
            // This DAO method requires knowing who is asking to filter correctly
            throw new Error('[UserMessageDetailsDAO] requestingUserId is required in options for getMessagesBetweenUsers.');
        }

        const validOrder = ['asc', 'desc'].includes(order?.toLowerCase()) ? order.toLowerCase() : 'desc';

        try {
            // Query the VIEW, filtering based on participants and deleted status from requester's perspective
            let query = postgresInstance(this.viewName)
                .where(function () {
                    // Messages involving both users
                    this.where(builder => builder.where('senderUserId', userId1).andWhere('recipientUserId', userId2))
                        .orWhere(builder => builder.where('senderUserId', userId2).andWhere('recipientUserId', userId1));
                })
                .andWhere(function () {
                    // Filter based on deleted status for the requesting user
                    this.where(function () { // Messages where requester is sender AND they haven't deleted it
                        this.where('senderUserId', requestingUserId).andWhere('senderDeleted', false);
                    }).orWhere(function () { // Messages where requester is recipient AND they haven't deleted it
                        this.where('recipientUserId', requestingUserId).andWhere('recipientDeleted', false);
                    });
                })
                .orderBy('messageCreatedAt', validOrder) // Order by time
                .limit(limit)
                .offset(offset);

            const viewRows = await query;

            return viewRows.map(row => UserMessageDetails.fromDbRow(row)).filter(details => details !== null);

        } catch (error) {
            console.error(`[UserMessageDetailsDAO] Error fetching messages between users (${userId1}, ${userId2}):`, error);
            throw error;
        }
    }
}

export default new UserMessageDetailsDAO();