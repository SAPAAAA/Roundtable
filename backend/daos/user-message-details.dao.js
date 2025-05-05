// backend/daos/user-message-details.dao.js

import {postgresInstance} from '#db/postgres.js'; // Assuming Knex instance is exported
import UserMessageDetails from '#models/user-message-details.model.js';

/**
 * @typedef {Object} GetMessagesOptions
 * @property {number} [limit=50] - Max number of messages to return.
 * @property {number} [offset=0] - Number of messages to skip.
 * @property {'asc'|'desc'} [order='desc'] - Sort order by messageCreatedAt. Default is desc (newest first).
 * @property {boolean} [includeDeletedForSelf=false] - If true, includes messages the requesting user has deleted.
 * @property {string} [requestingUserId] - The ID of the user making the request (required if includeDeletedForSelf is true).
 */

/**
 * DAO for interacting with the "UserMessageDetails" database VIEW.
 */
class UserMessageDetailsDAO {

    /**
     * Fetches a single detailed message by its ID from the VIEW.
     * @param {string} messageId - The UUID of the message.
     * @returns {Promise<UserMessageDetails | null>} - A promise resolving to a UserMessageDetails instance or null if not found.
     */
    async getByMessageId(messageId) {
        if (!messageId) {
            console.error('[UserMessageDetailsDAO] getByMessageId called without messageId');
            return null;
        }
        try {
            const viewRow = await postgresInstance('UserMessageDetails') // Query the VIEW
                .where({messageId: messageId})
                .first(); // Expecting one or zero results

            if (!viewRow) {
                return null; // Message not found
            }
            return UserMessageDetails.fromDbRow(viewRow);
        } catch (error) {
            console.error(`Error fetching UserMessageDetails by messageId (${messageId}):`, error);
            throw error; // Re-throw the error for upstream handling
        }
    }

    /**
     * Fetches messages exchanged between two specific users.
     * @param {string} userId1 - The UUID of the first user.
     * @param {string} userId2 - The UUID of the second user.
     * @param {GetMessagesOptions} [options={}] - Options for pagination and filtering.
     * @returns {Promise<UserMessageDetails[]>} - A promise resolving to an array of UserMessageDetails instances.
     */
    async getLatestMessagesBetweenUsers(userId1, userId2, options = {}) {
        if (!userId1 || !userId2) {
            console.error('[UserMessageDetailsDAO] getLatestMessagesBetweenUsers requires two user IDs.');
            return [];
        }

        const {limit = 100, offset = 0} = options;

        try {
            let query = postgresInstance('UserMessageDetails')
                .where(function () {
                    this.where({senderUserId: userId1, recipientUserId: userId2})
                        .orWhere({senderUserId: userId2, recipientUserId: userId1});
                })
                // Basic filtering: exclude messages deleted by *both* users
                .andWhere({senderDeleted: false})
                .andWhere({recipientDeleted: false})
                .orderBy('messageCreatedAt', 'desc') // Fetch latest messages first
                .limit(limit)
                .offset(offset);

            const viewRows = await query;

            if (!viewRows || viewRows.length === 0) {
                return [];
            }

            // Reverse the order to return messages in ascending order
            return viewRows
                .map(row => UserMessageDetails.fromDbRow(row))
                .filter(details => details !== null)
                .reverse();

        } catch (error) {
            console.error(`Error fetching latest UserMessageDetails between users (${userId1}, ${userId2}):`, error);
            throw error;
        }
    }
}

export default new UserMessageDetailsDAO();