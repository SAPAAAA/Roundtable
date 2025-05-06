// backend/daos/message.dao.js
import {postgresInstance} from '#db/postgres.js';
import Message from '#models/message.model.js';

/**
 * @typedef {import('../models/message.model.js').MessageTypeEnum} MessageTypeEnum
 */

/**
 * @typedef {Object} GetMessagesOptions
 * @property {number} [limit=50] - Max number of messages to return.
 * @property {number} [offset=0] - Number of messages to skip.
 * @property {'asc'|'desc'} [order='desc'] - Sort order by createdAt. Default is desc (newest first).
 */

/**
 * @typedef {object} ConversationPartnerPreview
 * @property {string} partnerId - The UUID of the conversation partner.
 * @property {string | null} partnerDisplayName - The display name of the partner.
 * @property {string | null} partnerUsername - The username of the partner. // Added
 * @property {string | null} partnerAvatar - The avatar URL of the partner. // Added
 * @property {number} unreadCount - The number of unread messages from this partner to the user.
 * @property {Date} lastMessageTime - The timestamp of the last message exchanged.
 * @property {string | null} lastMessageSnippet - The body text of the last message exchanged.
 * @property {boolean} lastMessageIsRead - If the last message was read by the requesting user. // Added
 * @property {string | null} lastMessageSenderId - Who sent the last message. // Added
 */


/**
 * DAO for interacting with the base "Message" table.
 */
class MessageDAO {
    constructor() {
        this.tableName = 'Message';
    }

    /**
     * Creates a new message record in the database.
     * @param {Message} message - The Message instance to create (messageId, createdAt are ignored).
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Message>} The newly created Message instance with DB-generated values.
     * @throws {Error} For database errors (e.g., constraint violations).
     */
    async create(message, trx = null) {
        const queryBuilder = trx || postgresInstance;
        const {messageId, createdAt, ...insertData} = message;

        if (!insertData.senderUserId || !insertData.recipientUserId || !insertData.body) {
            throw new Error('[MessageDAO] Missing required fields: senderUserId, recipientUserId, body.');
        }

        try {
            const insertedRows = await queryBuilder(this.tableName)
                .insert(insertData)
                .returning('*');

            if (!insertedRows || insertedRows.length === 0) {
                throw new Error('Message creation in DAO failed: No data returned.');
            }
            return Message.fromDbRow(insertedRows[0]);
        } catch (error) {
            console.error('[MessageDAO] Error creating message:', error);
            // Handle FK violations specifically if needed
            // if (error.code === '23503') { ... }
            throw error;
        }
    }

    /**
     * Fetches a single message by its ID.
     * @param {string} messageId - The UUID of the message.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Message | null>} The Message instance or null if not found.
     * @throws {Error} For database errors.
     */
    async getById(messageId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        if (!messageId) {
            console.warn('[MessageDAO] getById called without messageId');
            return null;
        }
        try {
            const row = await queryBuilder(this.tableName)
                .where({messageId})
                .first();
            return Message.fromDbRow(row);
        } catch (error) {
            console.error(`[MessageDAO] Error finding message by ID (${messageId}):`, error);
            throw error;
        }
    }

    /**
     * Fetches unread messages sent *by* senderUserId *to* recipientUserId.
     * @param {string} senderUserId - The UUID of the message sender.
     * @param {string} recipientUserId - The UUID of the message recipient.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Message[]>} An array of unread Message instances.
     * @throws {Error} For database errors.
     */
    async getUnreadMessages(senderUserId, recipientUserId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        if (!senderUserId || !recipientUserId) {
            console.error('[MessageDAO:getUnreadMessages] Requires both senderUserId and recipientUserId.');
            return []; // Or throw BadRequestError? Service layer should validate.
        }

        try {
            const rows = await queryBuilder(this.tableName)
                .select('*')
                .where({
                    senderUserId: senderUserId,
                    recipientUserId: recipientUserId,
                    isRead: false,
                    recipientDeleted: false // Important: Don't fetch if recipient deleted it
                })
                .orderBy('createdAt', 'asc'); // Typically process reads in order
            return rows.map(Message.fromDbRow);
        } catch (error) {
            console.error(`[MessageDAO] Error fetching unread messages from ${senderUserId} to ${recipientUserId}:`, error);
            throw error;
        }
    }

    /**
     * Marks multiple messages as read for a specific recipient.
     * @param {string[]} messageIds - An array of message UUIDs to mark as read.
     * @param {string} recipientUserId - The UUID of the recipient whose messages are being marked.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<number>} The number of messages updated.
     * @throws {Error} For database errors.
     */
    async markAsRead(messageIds, recipientUserId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        if (!messageIds || messageIds.length === 0 || !recipientUserId) {
            return 0;
        }
        try {
            return await queryBuilder(this.tableName)
                .whereIn('messageId', messageIds)
                .andWhere({recipientUserId: recipientUserId}) // Crucial: Only recipient can mark as read
                .andWhere({isRead: false}) // Only update unread messages
                .update({isRead: true});
        } catch (error) {
            console.error(`[MessageDAO] Error marking messages as read for recipient (${recipientUserId}):`, error);
            throw error;
        }
    }

    /**
     * Soft deletes messages for a specific user (either sender or recipient).
     * @param {string[]} messageIds - An array of message UUIDs to mark as deleted.
     * @param {string} deletingUserId - The UUID of the user deleting the messages.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<{senderDeletedCount: number, recipientDeletedCount: number}>} Count of messages marked deleted for sender/recipient roles.
     * @throws {Error} For database errors.
     */
    async markAsDeleted(messageIds, deletingUserId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        if (!messageIds || messageIds.length === 0 || !deletingUserId) {
            return {senderDeletedCount: 0, recipientDeletedCount: 0};
        }

        let senderDeletedCount = 0;
        let recipientDeletedCount = 0;

        try {
            // Use transaction if provided, otherwise run updates independently
            const db = trx || postgresInstance;

            // Update messages where the deleting user is the sender
            senderDeletedCount = await db(this.tableName)
                .whereIn('messageId', messageIds)
                .andWhere({senderUserId: deletingUserId})
                // Optional: .andWhere({ senderDeleted: false }) // Only update if not already deleted
                .update({senderDeleted: true});

            // Update messages where the deleting user is the recipient
            recipientDeletedCount = await db(this.tableName)
                .whereIn('messageId', messageIds)
                .andWhere({recipientUserId: deletingUserId})
                // Optional: .andWhere({ recipientDeleted: false })
                .update({recipientDeleted: true});

            return {senderDeletedCount, recipientDeletedCount};

        } catch (error) {
            console.error(`[MessageDAO] Error soft deleting messages for user (${deletingUserId}):`, error);
            throw error;
        }
    }

    /**
     * Fetches a preview list of conversation partners for a given user,
     * including their display name, unread count, last interaction time,
     * and a snippet of the last message.
     * This implementation uses CTEs and subqueries directly without relying on a dedicated VIEW.
     *
     * @param {string} userId - The UUID of the user whose conversation partners to fetch.
     * @param {GetMessagesOptions} [options={}] - Options (limit, offset, order). Order applies to last interaction time.
     * @returns {Promise<ConversationPartnerPreview[]>} - An array of objects containing partner details, ordered by the most recent interaction.
     * @throws {Error} For database errors.
     */
    async getConversationPartnersPreviewData(userId, options = {}) { // Restored original implementation
        if (!userId) {
            console.warn('[MessageDAO:getConversationPartnersPreviewData] Requires a userId.');
            return [];
        }

        const {limit = 50, offset = 0, order = 'desc'} = options;
        const validOrder = ['asc', 'desc'].includes(order?.toLowerCase()) ? order.toLowerCase() : 'desc';

        try {
            // CTE 1: Find all distinct partners the user has interacted with, excluding self-deleted messages
            const partnersCTE = 'PartnersCTE';
            const partnersQuery = postgresInstance('Message')
                .distinct('senderUserId as partnerId') // Partners who sent messages TO the user
                .where('recipientUserId', userId)
                .andWhere('recipientDeleted', false) // User hasn't deleted the received message
                .union((qb) => { // Combine with partners the user sent messages TO
                    qb.distinct('recipientUserId as partnerId')
                        .from('Message')
                        .where('senderUserId', userId)
                        .andWhere('senderDeleted', false); // User hasn't deleted the sent message
                }, true); // true for UNION (distinct)

            // CTE 2: Find the latest relevant message time for each partner interaction visible to the user
            const latestInteractionCTE = 'LatestInteractionCTE';
            const latestInteractionQuery = postgresInstance('Message')
                .select(postgresInstance.raw(`
                    CASE
                        WHEN "senderUserId" = ? THEN "recipientUserId"
                        ELSE "senderUserId"
                    END AS "partnerId"
                `, [userId]))
                .max('createdAt as lastMessageTime')
                .where(function () {
                    // Messages involving the user where the message is not deleted by the user
                    this.where(function () { // Messages received by user
                        this.where('recipientUserId', userId).andWhere('recipientDeleted', false)
                    }).orWhere(function () { // Messages sent by user
                        this.where('senderUserId', userId).andWhere('senderDeleted', false)
                    })
                })
                .groupBy('partnerId');

            // Main Query joining CTEs and tables
            const results = await postgresInstance
                .with(partnersCTE, partnersQuery)
                .with(latestInteractionCTE, latestInteractionQuery)
                .select(
                    'pCTE.partnerId',
                    'prof.displayName as partnerDisplayName',
                    'acc.username as partnerUsername', // Get username from Account
                    'prof.avatar as partnerAvatar', // Get avatar from Profile
                    // Subquery for unread count (messages FROM partner TO user, unread, not deleted by user)
                    postgresInstance('Message as m_unread')
                        .count('*')
                        .where('m_unread.senderUserId', postgresInstance.ref('pCTE.partnerId'))
                        .andWhere('m_unread.recipientUserId', userId)
                        .andWhere('m_unread.isRead', false)
                        .andWhere('m_unread.recipientDeleted', false) // User hasn't deleted it
                        .as('unreadCount'),
                    'liCTE.lastMessageTime',
                    // Correlated Subquery for the last message details (body, sender, read status)
                    // Finds the latest message visible to the user between them and the partner
                    postgresInstance('Message as m_snippet')
                        .select(postgresInstance.raw(`json_build_object(
                            'body', body,
                            'senderId', "senderUserId",
                            'isRead', "isRead"
                        )::text`)) // Cast to text to avoid object type issues in main select
                        .where(function () {
                            // Messages between user and partner
                            this.where(builder => builder.where('m_snippet.senderUserId', userId).andWhere('m_snippet.recipientUserId', postgresInstance.ref('pCTE.partnerId')))
                                .orWhere(builder => builder.where('m_snippet.senderUserId', postgresInstance.ref('pCTE.partnerId')).andWhere('m_snippet.recipientUserId', userId));
                        })
                        .andWhere(function () {
                            // Filter based on user's deletion status
                            this.where(function () {
                                this.where('m_snippet.senderUserId', userId).andWhere('m_snippet.senderDeleted', false)
                            })
                                .orWhere(function () {
                                    this.where('m_snippet.recipientUserId', userId).andWhere('m_snippet.recipientDeleted', false)
                                });
                        })
                        .orderBy('m_snippet.createdAt', 'desc')
                        .limit(1)
                        .as('lastMessageDetailsJson') // Get details as JSON string
                )
                .from(`${partnersCTE} as pCTE`)
                .innerJoin(`${latestInteractionCTE} as liCTE`, 'pCTE.partnerId', 'liCTE.partnerId')
                // Join to get partner profile info
                .leftJoin('RegisteredUser as ru', 'pCTE.partnerId', 'ru.userId')
                .leftJoin('Principal as p', 'ru.principalId', 'p.principalId')
                .leftJoin('Profile as prof', 'p.profileId', 'prof.profileId')
                .leftJoin('Account as acc', 'p.accountId', 'acc.accountId') // Join Account for username
                .whereNotNull('pCTE.partnerId') // Ensure partnerId is valid
                .orderBy('liCTE.lastMessageTime', validOrder)
                .limit(limit)
                .offset(offset);

            // Process results: parse JSON snippet, ensure types
            return results.map(row => {
                let lastMessageSnippet = null;
                let lastMessageIsRead = false;
                let lastMessageSenderId = null;
                try {
                    if (row.lastMessageDetailsJson) {
                        const details = JSON.parse(row.lastMessageDetailsJson);
                        lastMessageSnippet = details.body;
                        lastMessageIsRead = !!details.isRead;
                        lastMessageSenderId = details.senderId;
                    }
                } catch (e) {
                    console.error("Error parsing last message details JSON:", e)
                }

                return {
                    partnerId: row.partnerId,
                    partnerDisplayName: row.partnerDisplayName,
                    partnerUsername: row.partnerUsername, // Added
                    partnerAvatar: row.partnerAvatar, // Added
                    unreadCount: parseInt(row.unreadCount, 10) || 0,
                    lastMessageTime: new Date(row.lastMessageTime),
                    lastMessageSnippet: lastMessageSnippet,
                    lastMessageIsRead: lastMessageIsRead, // Added
                    lastMessageSenderId: lastMessageSenderId // Added
                };
            });

        } catch (error) {
            console.error(`[MessageDAO] Error fetching conversation partners preview for user (${userId}):`, error);
            throw error; // Re-throw for service layer
        }
    }
}

export default new MessageDAO();