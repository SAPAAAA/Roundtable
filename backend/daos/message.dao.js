// backend/daos/message.dao.js

import {postgresInstance} from '#db/postgres.js'; // Assuming Knex instance is exported
import Message from '#models/message.model.js';

/**
 * @typedef {Object} GetMessagesOptions
 * @property {number} [limit=50] - Max number of messages to return.
 * @property {number} [offset=0] - Number of messages to skip.
 * @property {'asc'|'desc'} [order='desc'] - Sort order by createdAt. Default is desc (newest first).
 * @property {boolean} [includeDeletedForSelf=false] - If true, includes messages the requesting user has deleted.
 * @property {string} [requestingUserId] - The ID of the user making the request (required if includeDeletedForSelf is true).
 */

/**
 * DAO for interacting with the base "Message" table.
 */
class MessageDAO {

    /**
     * Creates a new message record in the database.
     * @param {Message} message - The Message instance to create (messageId, createdAt are ignored).
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Message>} The newly created Message instance with DB-generated values.
     */
    async create(message, trx = null) {
        const queryBuilder = trx ?? postgresInstance;
        // Exclude fields managed by DB defaults or sequences
        const {
            messageId, createdAt, // Let DB handle these
            ...insertData
        } = message;

        // Basic validation before inserting
        if (!insertData.senderUserId || !insertData.recipientUserId || !insertData.body) {
            throw new Error('Missing required fields for message creation: senderUserId, recipientUserId, and body.');
        }

        try {
            const insertedRows = await queryBuilder('Message')
                .insert(insertData)
                .returning('*'); // Return all columns of the inserted row

            if (!Array.isArray(insertedRows) || insertedRows.length === 0) {
                console.error('Message creation failed or did not return expected data.', insertedRows);
                throw new Error('PostgresDB error during message creation: No data returned.');
            }
            // Convert the first returned row into a Message model instance
            return Message.fromDbRow(insertedRows[0]);
        } catch (error) {
            console.error('Error creating message:', error);
            // Check for foreign key violations etc. if needed
            // if (error.code === '23503') { ... }
            throw error; // Re-throw
        }
    }

    /**
     * Fetches a single message by its ID.
     * @param {string} messageId - The UUID of the message.
     * @returns {Promise<Message | null>} The Message instance or null if not found.
     */
    async getById(messageId) {
        if (!messageId) {
            console.error('[MessageDAO] getById called without messageId');
            return null;
        }
        try {
            const row = await postgresInstance('Message')
                .where({messageId})
                .first();
            return Message.fromDbRow(row);
        } catch (error) {
            console.error(`Error finding message by ID (${messageId}):`, error);
            throw error;
        }
    }

    /**
     * Fetches messages exchanged between two specific users, ordered by creation time.
     * Handles filtering based on soft delete flags from the requesting user's perspective.
     * @param {string} userId1 - The UUID of the first user.
     * @param {string} userId2 - The UUID of the second user.
     * @param {GetMessagesOptions} [options={}] - Options for pagination, sorting, and filtering.
     * @returns {Promise<Message[]>} - A promise resolving to an array of Message instances.
     */
    async getMessagesBetweenUsers(userId1, userId2, options = {}) {
        if (!userId1 || !userId2) {
            console.error('[MessageDAO] getMessagesBetweenUsers requires two user IDs.');
            return [];
        }

        const {limit = 50, offset = 0, order = 'desc', requestingUserId} = options;
        const validOrder = ['asc', 'desc'].includes(order.toLowerCase()) ? order.toLowerCase() : 'desc';

        // Ensure requestingUserId is provided if needed for filtering deleted messages
        // For simplicity here, we assume the caller is one of userId1 or userId2
        const effectiveRequestingUserId = requestingUserId || userId1; // Default to userId1 if not specified

        try {
            let query = postgresInstance('Message')
                .where(function () {
                    // Messages where user1 sent to user2 OR user2 sent to user1
                    this.where({senderUserId: userId1, recipientUserId: userId2})
                        .orWhere({senderUserId: userId2, recipientUserId: userId1});
                })
                // Filter out messages soft-deleted by the *requesting* user
                .andWhere(function () {
                    this.where(function () { // Where sender is the requester AND sender has not deleted
                        this.where('senderUserId', effectiveRequestingUserId).andWhere('senderDeleted', false);
                    }).orWhere(function () { // OR where recipient is the requester AND recipient has not deleted
                        this.where('recipientUserId', effectiveRequestingUserId).andWhere('recipientDeleted', false);
                    });
                })
                .orderBy('createdAt', validOrder)
                .limit(limit)
                .offset(offset);

            const rows = await query;

            if (!rows || rows.length === 0) {
                return [];
            }
            return rows.map(row => Message.fromDbRow(row)).filter(details => details !== null);

        } catch (error) {
            console.error(`Error fetching messages between users (${userId1}, ${userId2}):`, error);
            throw error;
        }
    }

    /**
     * Marks multiple messages as read for a specific recipient.
     * @param {string[]} messageIds - An array of message UUIDs to mark as read.
     * @param {string} recipientUserId - The UUID of the recipient whose messages are being marked.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<number>} The number of messages updated.
     */
    async markAsRead(messageIds, recipientUserId, trx = null) {
        if (!messageIds || messageIds.length === 0 || !recipientUserId) {
            return 0; // Nothing to update or invalid input
        }
        const queryBuilder = trx ?? postgresInstance;
        try {
            const updatedCount = await queryBuilder('Message')
                .whereIn('messageId', messageIds)
                .andWhere({recipientUserId: recipientUserId}) // Ensure only the recipient marks as read
                .andWhere({isRead: false}) // Only update if currently unread
                .update({isRead: true});

            console.log(`[MessageDAO] Marked ${updatedCount} messages as read for recipient ${recipientUserId}`);
            return updatedCount;
        } catch (error) {
            console.error(`Error marking messages as read for recipient (${recipientUserId}):`, error);
            throw error;
        }
    }

    /**
     * Soft deletes messages for a specific user (either sender or recipient).
     * @param {string[]} messageIds - An array of message UUIDs to mark as deleted.
     * @param {string} deletingUserId - The UUID of the user deleting the messages.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<{senderDeletedCount: number, recipientDeletedCount: number}>} Count of messages marked deleted for sender/recipient roles.
     */
    async markAsDeleted(messageIds, deletingUserId, trx = null) {
        if (!messageIds || messageIds.length === 0 || !deletingUserId) {
            return {senderDeletedCount: 0, recipientDeletedCount: 0};
        }
        const queryBuilder = trx ?? postgresInstance;
        let senderDeletedCount = 0;
        let recipientDeletedCount = 0;

        try {
            // Update messages where the deleting user is the sender
            senderDeletedCount = await queryBuilder('Message')
                .whereIn('messageId', messageIds)
                .andWhere({senderUserId: deletingUserId})
                .update({senderDeleted: true});

            // Update messages where the deleting user is the recipient
            recipientDeletedCount = await queryBuilder('Message')
                .whereIn('messageId', messageIds)
                .andWhere({recipientUserId: deletingUserId})
                .update({recipientDeleted: true});

            console.log(`[MessageDAO] Soft deleted ${senderDeletedCount} sent messages and ${recipientDeletedCount} received messages for user ${deletingUserId}`);
            return {senderDeletedCount, recipientDeletedCount};

        } catch (error) {
            console.error(`Error soft deleting messages for user (${deletingUserId}):`, error);
            throw error;
        }
    }

    /**
     * Permanently deletes a message by its ID. Use with caution.
     * @param {string} messageId - The UUID of the message to delete.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<number>} The number of rows deleted (0 or 1).
     */
    async hardDelete(messageId, trx = null) {
        if (!messageId) {
            console.warn('[MessageDAO] hardDelete called without messageId');
            return 0;
        }
        const queryBuilder = trx ?? postgresInstance;
        try {
            const deletedCount = await queryBuilder('Message')
                .where({messageId})
                .del(); // .delete() is also an alias

            console.log(`Attempted HARD deletion for messageId ${messageId}. Rows affected: ${deletedCount}`);
            return deletedCount;
        } catch (error) {
            console.error(`Error hard deleting message (${messageId}):`, error);
            throw error;
        }
    }

    async getUnreadMessages(senderUserId, recipientUserId) {
        if (!senderUserId || !recipientUserId) {
            console.error('[getUnreadMessages] Requires both senderUserId and recipientUserId.');
            return [];
        }

        try {
            return await postgresInstance('Message')
                .select('*')
                .where({
                    senderUserId,
                    recipientUserId,
                    isRead: false,
                    recipientDeleted: false // Ensure recipient hasn't deleted the
                    // message
                })
                .orderBy('createdAt', 'asc');
        } catch (error) {
            console.error(`Error fetching unread messages from ${senderUserId} to ${recipientUserId}:`, error);
            throw error;
        }
    }

    /**
     * @typedef {object} ConversationPartnerPreview
     * @property {string} partnerId - The UUID of the conversation partner.
     * @property {string | null} partnerDisplayName - The display name of the partner.
     * @property {number} unreadCount - The number of unread messages from this partner to the user.
     * @property {Date} lastMessageTime - The timestamp of the last message exchanged.
     * @property {string | null} lastMessageSnippet - The body text of the last message exchanged.
     */

    /**
     * @typedef {import('./dao').GetMessagesOptions} GetMessagesOptions
     */

    /**
     * Fetches a preview list of conversation partners for a given user,
     * including their display name, unread count, last interaction time,
     * and a snippet of the last message.
     *
     * @param {string} userId - The UUID of the user whose conversation partners to fetch.
     * @param {GetMessagesOptions} [options={}] - Options (limit, offset, order). Order applies to last interaction time.
     * @returns {Promise<ConversationPartnerPreview[]>} - An array of objects containing partner details, ordered by the most recent interaction.
     */
    async getConversationPartnersPreviewData(userId, options = {}) {
        if (!userId) {
            console.error('[getConversationPartnersPreviewData] Requires a userId.');
            return [];
        }

        // Default options and validation
        const {limit = 50, offset = 0, order = 'desc'} = options;
        const validOrder = ['asc', 'desc'].includes(order?.toLowerCase()) ? order.toLowerCase() : 'desc';

        try {
            // CTE 1: Find all distinct partners the user has interacted with
            const partnersCTE = 'PartnersCTE';
            const partnersQuery = postgresInstance('Message') // Changed knex to postgresInstance
                .select('senderUserId as partnerId')
                .where('recipientUserId', userId)
                .andWhere('senderDeleted', false) // User received, check if sender deleted
                .union((qb) => {
                    qb.select('recipientUserId as partnerId')
                        .from('Message')
                        .where('senderUserId', userId)
                        .andWhere('recipientDeleted', false); // User sent, check if recipient deleted
                }, true);

            // CTE 2: Find the latest message time for each partner interaction
            const latestInteractionCTE = 'LatestInteractionCTE';
            const latestInteractionQuery = postgresInstance('Message') // Changed knex to postgresInstance
                .select(postgresInstance.raw(`
                CASE
                    WHEN "senderUserId" = ? THEN "recipientUserId"
                    ELSE "senderUserId"
                END AS "partnerId"
            `, [userId])) // Changed knex.raw to postgresInstance.raw
                .max('createdAt as lastMessageTime')
                .where(function () {
                    this.where(function () { // Messages received by user
                        this.where('recipientUserId', userId)
                            .andWhere('senderDeleted', false);
                    }).orWhere(function () { // Messages sent by user
                        this.where('senderUserId', userId)
                            .andWhere('recipientDeleted', false);
                    });
                })
                .groupBy('partnerId');

            // Main Query
            const results = await postgresInstance // Changed knex to postgresInstance
                .with(partnersCTE, partnersQuery)
                .with(latestInteractionCTE, latestInteractionQuery)
                .select(
                    'pCTE.partnerId',
                    'prof.displayName as partnerDisplayName',
                    // Subquery for unread count
                    postgresInstance('Message as m_unread') // Changed knex to postgresInstance
                        .count('*')
                        .where('m_unread.senderUserId', postgresInstance.ref('pCTE.partnerId')) // Changed knex.ref to postgresInstance.ref
                        .andWhere('m_unread.recipientUserId', userId)               // To User
                        .andWhere('m_unread.isRead', false)
                        .andWhere('m_unread.recipientDeleted', false) // User hasn't deleted it
                        .as('unreadCount'),
                    'liCTE.lastMessageTime',
                    // Correlated Subquery for the last message snippet
                    postgresInstance('Message as m_snippet') // Changed knex to postgresInstance
                        .select('body')
                        .where(function () {
                            // Condition 1: User sent, Partner received
                            this.where('m_snippet.senderUserId', userId)
                                .andWhere('m_snippet.recipientUserId', postgresInstance.ref('pCTE.partnerId')) // Changed knex.ref to postgresInstance.ref
                                .andWhere('m_snippet.recipientDeleted', false) // Check if partner deleted it
                        })
                        .orWhere(function () {
                            // Condition 2: Partner sent, User received
                            this.where('m_snippet.senderUserId', postgresInstance.ref('pCTE.partnerId')) // Changed knex.ref to postgresInstance.ref
                                .andWhere('m_snippet.recipientUserId', userId)
                                .andWhere('m_snippet.senderDeleted', false) // Check if partner (sender) deleted it
                        })
                        .orderBy('m_snippet.createdAt', 'desc')
                        .limit(1)
                        .as('lastMessageSnippet') // Alias for the snippet column
                )
                .from(`${partnersCTE} as pCTE`)
                .innerJoin(`${latestInteractionCTE} as liCTE`, 'pCTE.partnerId', 'liCTE.partnerId')
                .leftJoin('RegisteredUser as ru', 'pCTE.partnerId', 'ru.userId')
                .leftJoin('Principal as p', 'ru.principalId', 'p.principalId')
                .leftJoin('Profile as prof', 'p.profileId', 'prof.profileId')
                .whereNotNull('pCTE.partnerId')
                .orderBy('liCTE.lastMessageTime', validOrder)
                .limit(limit)
                .offset(offset);

            // Ensure unreadCount is a number and lastMessageTime is a Date
            return results.map(row => ({
                ...row,
                unreadCount: parseInt(row.unreadCount, 10) || 0,
                lastMessageTime: new Date(row.lastMessageTime),
            }));

        } catch (error) {
            console.error(`Error fetching conversation partners preview for user (${userId}):`, error);
            return []; // Return empty array on error
        }
    }
}

export default new MessageDAO();